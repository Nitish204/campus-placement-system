# app.py - Campus Placement Management System, JSON API backend
#
# Rewritten from the original server-rendered (Jinja templates + session
# cookies) app into a JSON API consumed by a separate Next.js frontend,
# matching the Waypost project's architecture. Session-cookie auth is
# replaced with JWT bearer tokens - this also closes the CSRF gap the
# original had for free, since CSRF specifically exploits ambient cookie
# auth, not explicit Authorization headers.
#
# Three real bugs fixed from the original during this rewrite:
#   1. SECRET_KEY was hardcoded in source (sitting in a public repo,
#      meaning anyone could forge a signed session/token). Now required
#      from the environment, with a loud warning (not a silent insecure
#      fallback) if missing.
#   2. Deleting a user threw an unhandled IntegrityError on Postgres (or
#      silently orphaned rows on SQLite) because dependent rows
#      (profile, applications, notifications, placements) were never
#      cleaned up first. delete_user() now removes dependents in the
#      correct order before removing the user.
#   3. A deleted-but-still-"logged-in" user caused an unhandled
#      AttributeError (None.role) on their next request under the old
#      session-based auth. Under JWT, this is structurally fixed: every
#      request re-looks-up the user from the DB, and a missing user
#      cleanly returns 401 instead of crashing.
import os
import uuid
import logging
from datetime import datetime, timedelta
from functools import wraps

import jwt
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from sqlalchemy import func, desc, case

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    logger.warning(
        "[security] SECRET_KEY not set in environment - using an insecure "
        "generated fallback that changes on every restart (this will log "
        "everyone out on every deploy). Set SECRET_KEY in your environment "
        "before treating this as production."
    )
    SECRET_KEY = uuid.uuid4().hex
app.config["SECRET_KEY"] = SECRET_KEY

database_url = os.environ.get("DATABASE_URL")
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = database_url or "sqlite:///campus_placement.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config["UPLOAD_FOLDER"] = os.path.join(BASE_DIR, "uploads")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16MB max file
os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

_allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "").strip()
allowed_origins = [o.strip() for o in _allowed_origins_env.split(",") if o.strip()] or ["*"]
if allowed_origins == ["*"]:
    logger.warning(
        "[security] ALLOWED_ORIGINS not set - CORS is wide open. Set it to "
        "your deployed frontend URL before treating this as production."
    )
CORS(app, origins=allowed_origins, supports_credentials=False)

db = SQLAlchemy(app)

JWT_EXP_HOURS = 24 * 7  # 7 days


# ------------------------- Database Models -------------------------
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class StudentProfile(db.Model):
    __tablename__ = "student_profiles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True)
    full_name = db.Column(db.String(100), nullable=False)
    roll_number = db.Column(db.String(50), unique=True)
    branch = db.Column(db.String(50))
    cgpa = db.Column(db.Float)
    passing_year = db.Column(db.Integer)
    phone = db.Column(db.String(15))
    skills = db.Column(db.Text)
    resume_text = db.Column(db.Text)

    user = db.relationship("User", backref=db.backref("student_profile", uselist=False), uselist=False)
    applications = db.relationship("JobApplication", backref="student", lazy=True)


class CompanyProfile(db.Model):
    __tablename__ = "company_profiles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True)
    company_name = db.Column(db.String(100), nullable=False)
    industry = db.Column(db.String(50))
    description = db.Column(db.Text)
    website = db.Column(db.String(200))
    location = db.Column(db.String(100))
    approval_status = db.Column(db.String(20), default="pending")

    user = db.relationship("User", backref=db.backref("company_profile", uselist=False), uselist=False)
    jobs = db.relationship("JobPost", backref="company", lazy=True)


class JobPost(db.Model):
    __tablename__ = "job_posts"
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey("company_profiles.id"))
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    required_skills = db.Column(db.Text)
    location = db.Column(db.String(100))
    salary_range = db.Column(db.String(50))
    last_date = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    applications = db.relationship("JobApplication", backref="job", lazy=True)


class JobApplication(db.Model):
    __tablename__ = "job_applications"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id"))
    job_id = db.Column(db.Integer, db.ForeignKey("job_posts.id"))
    applied_date = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default="Applied")
    screening_score = db.Column(db.Float, default=0.0)
    remarks = db.Column(db.Text)


class PlacementRecord(db.Model):
    __tablename__ = "placement_records"
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student_profiles.id"))
    job_id = db.Column(db.Integer, db.ForeignKey("job_posts.id"))
    company_id = db.Column(db.Integer, db.ForeignKey("company_profiles.id"))
    package = db.Column(db.String(50))
    joining_date = db.Column(db.Date)
    placed_date = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship("StudentProfile")
    job = db.relationship("JobPost")
    company = db.relationship("CompanyProfile")


class Notification(db.Model):
    __tablename__ = "notifications"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message = db.Column(db.String(255), nullable=False)
    link = db.Column(db.String(255))
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", backref="notifications")


# ------------------------- Serialization helpers -------------------------
def serialize_student(s: StudentProfile):
    return {
        "id": s.id, "full_name": s.full_name, "roll_number": s.roll_number,
        "branch": s.branch, "cgpa": s.cgpa, "passing_year": s.passing_year,
        "phone": s.phone, "skills": s.skills, "has_resume": bool(s.resume_text),
        "email": s.user.email if s.user else None,
    }


def serialize_company(c: CompanyProfile):
    return {
        "id": c.id, "company_name": c.company_name, "industry": c.industry,
        "description": c.description, "website": c.website, "location": c.location,
        "approval_status": c.approval_status,
        "email": c.user.email if c.user else None,
    }


def serialize_job(j: JobPost, include_company=True):
    d = {
        "id": j.id, "title": j.title, "description": j.description,
        "required_skills": j.required_skills, "location": j.location,
        "salary_range": j.salary_range,
        "last_date": j.last_date.isoformat() if j.last_date else None,
        "created_at": j.created_at.isoformat() if j.created_at else None,
        "is_active": j.is_active, "application_count": len(j.applications),
    }
    if include_company and j.company:
        d["company_name"] = j.company.company_name
        d["company_id"] = j.company.id
    return d


def serialize_application(a: JobApplication):
    return {
        "id": a.id, "job_id": a.job_id, "student_id": a.student_id,
        "status": a.status, "screening_score": a.screening_score,
        "remarks": a.remarks,
        "applied_date": a.applied_date.isoformat() if a.applied_date else None,
        "job_title": a.job.title if a.job else None,
        "company_name": a.job.company.company_name if a.job and a.job.company else None,
        "student_name": a.student.full_name if a.student else None,
        "student_email": a.student.user.email if a.student and a.student.user else None,
        "student_branch": a.student.branch if a.student else None,
        "student_cgpa": a.student.cgpa if a.student else None,
    }


def serialize_notification(n: Notification):
    return {
        "id": n.id, "message": n.message, "link": n.link, "is_read": n.is_read,
        "created_at": n.created_at.isoformat() if n.created_at else None,
    }


def serialize_placement(p: PlacementRecord):
    return {
        "id": p.id,
        "student_name": p.student.full_name if p.student else None,
        "job_title": p.job.title if p.job else None,
        "company_name": p.company.company_name if p.company else None,
        "package": p.package,
        "joining_date": p.joining_date.isoformat() if p.joining_date else None,
        "placed_date": p.placed_date.isoformat() if p.placed_date else None,
    }


# ------------------------- Auth helpers (JWT) -------------------------
def create_token(user: User) -> str:
    payload = {
        "user_id": user.id, "role": user.role, "email": user.email,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXP_HOURS),
    }
    return jwt.encode(payload, app.config["SECRET_KEY"], algorithm="HS256")


def get_current_user():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    token = auth[7:]
    try:
        payload = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    return User.query.get(payload.get("user_id"))


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Authentication required. Please log in again."}), 401
        request.current_user = user
        return f(*args, **kwargs)
    return decorated


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            user = get_current_user()
            if not user:
                return jsonify({"error": "Authentication required. Please log in again."}), 401
            if user.role not in roles:
                return jsonify({"error": "You do not have permission to access this."}), 403
            request.current_user = user
            return f(*args, **kwargs)
        return decorated
    return decorator


# ------------------------- Resume / screening helpers -------------------------
def extract_text_from_resume(file):
    filename = file.filename
    ext = filename.rsplit(".", 1)[1].lower() if "." in filename else ""
    text = ""
    if ext == "txt":
        text = file.read().decode("utf-8", errors="ignore")
    elif ext == "pdf":
        try:
            import PyPDF2
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        except ImportError:
            text = "PDF processing requires PyPDF2."
        except Exception as e:
            text = f"Error reading PDF: {str(e)}"
    else:
        text = "Unsupported file format. Please upload TXT or PDF."
    return text.lower()


def calculate_screening_score(resume_text, job_skills, job_description=""):
    if not resume_text or not job_skills:
        return 0.0

    resume_text_l = resume_text.lower()
    skills_list = [s.strip().lower() for s in job_skills.split(",") if s.strip()]
    if not skills_list:
        return 100.0

    matched = sum(1 for skill in skills_list if skill in resume_text_l)
    coverage_score = (matched / len(skills_list)) * 100

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        job_text = (job_description or "") + " " + job_skills
        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf = vectorizer.fit_transform([resume_text, job_text])
        similarity_score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0] * 100
        final_score = (coverage_score * 0.6) + (similarity_score * 0.4)
        return round(min(final_score, 100.0), 1)
    except ImportError:
        return round(coverage_score, 1)


def notify(user_id, message, link=None):
    n = Notification(user_id=user_id, message=message, link=link)
    db.session.add(n)


# ------------------------- Auth routes -------------------------
@app.route("/api/auth/register/student", methods=["POST"])
def register_student():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    user = User(email=email, role="student")
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    cgpa = data.get("cgpa")
    passing_year = data.get("passing_year")
    student = StudentProfile(
        user_id=user.id,
        full_name=data.get("full_name"),
        roll_number=data.get("roll_number"),
        branch=data.get("branch"),
        cgpa=float(cgpa) if cgpa not in (None, "") else None,
        passing_year=int(passing_year) if passing_year not in (None, "") else None,
        phone=data.get("phone"),
        skills=data.get("skills"),
    )
    db.session.add(student)
    db.session.commit()

    token = create_token(user)
    return jsonify({"access_token": token, "role": user.role}), 201


@app.route("/api/auth/register/company", methods=["POST"])
def register_company():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    user = User(email=email, role="company")
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    company = CompanyProfile(
        user_id=user.id,
        company_name=data.get("company_name"),
        industry=data.get("industry"),
        description=data.get("description"),
        website=data.get("website"),
        location=data.get("location"),
        approval_status="pending",
    )
    db.session.add(company)
    db.session.commit()

    admins = User.query.filter_by(role="admin").all()
    for admin_user in admins:
        notify(admin_user.id, f'New company registered: {company.company_name} (pending approval)', "/admin/companies")
    db.session.commit()

    token = create_token(user)
    return jsonify({"access_token": token, "role": user.role, "pending_approval": True}), 201


@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json(force=True)
    email = data.get("email")
    password = data.get("password")
    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Incorrect email or password."}), 401

    token = create_token(user)
    return jsonify({"access_token": token, "role": user.role})


@app.route("/api/auth/me")
@login_required
def me():
    user = request.current_user
    d = {"id": user.id, "email": user.email, "role": user.role}
    if user.role == "student" and user.student_profile:
        d["profile"] = serialize_student(user.student_profile)
    elif user.role == "company" and user.company_profile:
        d["profile"] = serialize_company(user.company_profile)
    return jsonify(d)


# ------------------------- Student routes -------------------------
@app.route("/api/student/dashboard")
@role_required("student")
def student_dashboard():
    student = StudentProfile.query.filter_by(user_id=request.current_user.id).first()
    applications = JobApplication.query.filter_by(student_id=student.id).all()

    applied_job_ids = [a.job_id for a in applications]
    query = JobPost.query.filter(JobPost.is_active == True)  # noqa: E712
    if applied_job_ids:
        query = query.filter(JobPost.id.notin_(applied_job_ids))
    active_jobs = query.order_by(desc(JobPost.created_at)).all()

    return jsonify({
        "student": serialize_student(student),
        "applications": [serialize_application(a) for a in applications],
        "active_jobs": [serialize_job(j) for j in active_jobs],
        "stats": {
            "total_applications": len(applications),
            "shortlisted": sum(1 for a in applications if a.status == "Shortlisted"),
            "placed": sum(1 for a in applications if a.status == "Placed"),
        },
    })


@app.route("/api/student/upload_resume", methods=["POST"])
@role_required("student")
def upload_resume():
    student = StudentProfile.query.filter_by(user_id=request.current_user.id).first()
    if "resume" not in request.files or request.files["resume"].filename == "":
        return jsonify({"error": "No file selected."}), 400

    file = request.files["resume"]
    allowed_ext = {"pdf", "txt"}
    ext = file.filename.rsplit(".", 1)[1].lower() if "." in file.filename else ""
    if ext not in allowed_ext:
        return jsonify({"error": "Only PDF or TXT resumes are supported."}), 400

    try:
        os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
        filename = secure_filename(f"{student.id}_{uuid.uuid4().hex}_{file.filename}")
        filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(filepath)

        file.seek(0)
        extracted_text = extract_text_from_resume(file)
        student.resume_text = extracted_text
        db.session.commit()

        return jsonify({"message": "Resume uploaded and processed successfully.", "has_resume": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Could not process resume: {str(e)}"}), 500


@app.route("/api/student/apply/<int:job_id>", methods=["POST"])
@role_required("student")
def apply_job(job_id):
    student = StudentProfile.query.filter_by(user_id=request.current_user.id).first()
    job = JobPost.query.get_or_404(job_id)

    existing = JobApplication.query.filter_by(student_id=student.id, job_id=job_id).first()
    if existing:
        return jsonify({"error": "You have already applied for this job."}), 409

    score = calculate_screening_score(student.resume_text or "", job.required_skills or "", job.description or "")
    application = JobApplication(student_id=student.id, job_id=job_id, screening_score=score, status="Applied")
    db.session.add(application)
    db.session.commit()

    return jsonify({"message": f"Applied successfully. Screening score: {score:.1f}%", "application": serialize_application(application)}), 201


@app.route("/api/student/withdraw/<int:app_id>", methods=["POST"])
@role_required("student")
def withdraw_application(app_id):
    application = JobApplication.query.get_or_404(app_id)
    student = StudentProfile.query.filter_by(user_id=request.current_user.id).first()

    if application.student_id != student.id:
        return jsonify({"error": "Unauthorized."}), 403
    if application.status != "Applied":
        return jsonify({"error": "Cannot withdraw an application at this stage."}), 400

    db.session.delete(application)
    db.session.commit()
    return jsonify({"message": "Application withdrawn successfully."})


# ------------------------- Company routes -------------------------
@app.route("/api/company/dashboard")
@role_required("company")
def company_dashboard():
    company = CompanyProfile.query.filter_by(user_id=request.current_user.id).first()
    if company.approval_status != "approved":
        return jsonify({"pending": True, "company": serialize_company(company)})

    jobs = JobPost.query.filter_by(company_id=company.id).order_by(desc(JobPost.created_at)).all()
    return jsonify({
        "pending": False,
        "company": serialize_company(company),
        "jobs": [serialize_job(j, include_company=False) for j in jobs],
        "stats": {
            "total_jobs": len(jobs),
            "total_applications": sum(len(j.applications) for j in jobs),
        },
    })


@app.route("/api/company/post_job", methods=["POST"])
@role_required("company")
def post_job():
    company = CompanyProfile.query.filter_by(user_id=request.current_user.id).first()
    if company.approval_status != "approved":
        return jsonify({"error": "Your company must be approved by an admin before you can post jobs."}), 403

    data = request.get_json(force=True)
    last_date_str = data.get("last_date")
    last_date = datetime.strptime(last_date_str, "%Y-%m-%d").date() if last_date_str else None

    job = JobPost(
        company_id=company.id, title=data.get("title"), description=data.get("description"),
        required_skills=data.get("required_skills"), location=data.get("location"),
        salary_range=data.get("salary_range"), last_date=last_date,
    )
    db.session.add(job)
    db.session.commit()
    return jsonify({"message": "Job posted successfully.", "job": serialize_job(job, include_company=False)}), 201


@app.route("/api/company/job/<int:job_id>/applications")
@role_required("company")
def view_applications(job_id):
    company = CompanyProfile.query.filter_by(user_id=request.current_user.id).first()
    job = JobPost.query.filter_by(id=job_id, company_id=company.id).first_or_404()
    apps = sorted(job.applications, key=lambda a: a.screening_score or 0, reverse=True)
    return jsonify({"job": serialize_job(job, include_company=False), "applications": [serialize_application(a) for a in apps]})


@app.route("/api/company/application/<int:app_id>/update", methods=["POST"])
@role_required("company")
def update_application_status(app_id):
    application = JobApplication.query.get_or_404(app_id)
    company = CompanyProfile.query.filter_by(user_id=request.current_user.id).first()

    if application.job.company_id != company.id:
        return jsonify({"error": "Unauthorized."}), 403

    data = request.get_json(force=True)
    new_status = data.get("status")
    remarks = data.get("remarks", "")

    if new_status not in ["Shortlisted", "Rejected", "Placed"]:
        return jsonify({"error": "Invalid status."}), 400

    application.status = new_status
    application.remarks = remarks
    db.session.commit()

    notify(
        application.student.user_id,
        f'Your application for "{application.job.title}" at {application.job.company.company_name} is now {new_status}',
        "/dashboard",
    )
    db.session.commit()

    if new_status == "Placed":
        existing = PlacementRecord.query.filter_by(student_id=application.student_id, job_id=application.job_id).first()
        if not existing:
            placement = PlacementRecord(
                student_id=application.student_id, job_id=application.job_id, company_id=company.id,
                package=application.job.salary_range, joining_date=datetime.now().date(),
            )
            db.session.add(placement)
            db.session.commit()

    return jsonify({"message": f"Application status updated to {new_status}.", "application": serialize_application(application)})


@app.route("/api/company/run_screening/<int:job_id>", methods=["POST"])
@role_required("company")
def run_screening(job_id):
    company = CompanyProfile.query.filter_by(user_id=request.current_user.id).first()
    job = JobPost.query.filter_by(id=job_id, company_id=company.id).first_or_404()

    for application in job.applications:
        score = calculate_screening_score(
            application.student.resume_text or "", job.required_skills or "", job.description or ""
        )
        application.screening_score = score

    db.session.commit()
    return jsonify({"message": f"Screening scores updated for {len(job.applications)} applicants."})


# ------------------------- Notifications -------------------------
@app.route("/api/notifications")
@login_required
def notifications():
    all_notifs = Notification.query.filter_by(user_id=request.current_user.id).order_by(desc(Notification.created_at)).all()
    return jsonify({"notifications": [serialize_notification(n) for n in all_notifs]})


@app.route("/api/notifications/<int:notif_id>/open", methods=["POST"])
@login_required
def open_notification(notif_id):
    notif = Notification.query.get_or_404(notif_id)
    if notif.user_id != request.current_user.id:
        return jsonify({"error": "Unauthorized."}), 403
    notif.is_read = True
    db.session.commit()
    return jsonify({"link": notif.link})


@app.route("/api/notifications/mark_all_read", methods=["POST"])
@login_required
def mark_all_notifications_read():
    Notification.query.filter_by(user_id=request.current_user.id, is_read=False).update({"is_read": True})
    db.session.commit()
    return jsonify({"message": "All notifications marked as read."})


# ------------------------- Admin routes -------------------------
@app.route("/api/admin/dashboard")
@role_required("admin")
def admin_dashboard():
    total_students = StudentProfile.query.count()
    total_companies = CompanyProfile.query.count()
    total_jobs = JobPost.query.count()
    total_applications = JobApplication.query.count()
    pending_companies_count = CompanyProfile.query.filter_by(approval_status="pending").count()

    placed_count = PlacementRecord.query.count()
    student_count = total_students if total_students > 0 else 1
    placement_percentage = (placed_count / student_count) * 100

    branch_stats = (
        db.session.query(StudentProfile.branch, func.count(PlacementRecord.id).label("placed_count"))
        .outerjoin(PlacementRecord, StudentProfile.id == PlacementRecord.student_id)
        .group_by(StudentProfile.branch)
        .all()
    )
    recent_placements = PlacementRecord.query.order_by(desc(PlacementRecord.placed_date)).limit(10).all()
    company_stats = (
        db.session.query(CompanyProfile.company_name, func.count(PlacementRecord.id).label("hired_count"))
        .join(PlacementRecord, CompanyProfile.id == PlacementRecord.company_id)
        .group_by(CompanyProfile.company_name)
        .order_by(desc("hired_count"))
        .limit(5)
        .all()
    )

    return jsonify({
        "stats": {
            "total_students": total_students, "total_companies": total_companies,
            "total_jobs": total_jobs, "total_applications": total_applications,
            "placement_percentage": round(placement_percentage, 1), "placed_count": placed_count,
            "pending_companies_count": pending_companies_count,
        },
        "branch_chart": {
            "labels": [s[0] or "Unknown" for s in branch_stats],
            "data": [s[1] for s in branch_stats],
        },
        "recent_placements": [serialize_placement(p) for p in recent_placements],
        "top_companies": [{"company_name": c[0], "hired_count": c[1]} for c in company_stats],
    })


@app.route("/api/admin/students")
@role_required("admin")
def admin_students():
    students = StudentProfile.query.all()
    return jsonify({"students": [serialize_student(s) for s in students]})


@app.route("/api/admin/companies")
@role_required("admin")
def admin_companies():
    companies = CompanyProfile.query.order_by(
        case((CompanyProfile.approval_status == "pending", 0), else_=1)
    ).all()
    return jsonify({"companies": [serialize_company(c) for c in companies]})


@app.route("/api/admin/company/<int:company_id>/approve", methods=["POST"])
@role_required("admin")
def approve_company(company_id):
    company = CompanyProfile.query.get_or_404(company_id)
    company.approval_status = "approved"
    notify(company.user_id, f'Your company "{company.company_name}" has been approved! You can now post jobs.', "/dashboard")
    db.session.commit()
    return jsonify({"message": f"{company.company_name} approved."})


@app.route("/api/admin/company/<int:company_id>/reject", methods=["POST"])
@role_required("admin")
def reject_company(company_id):
    company = CompanyProfile.query.get_or_404(company_id)
    company.approval_status = "rejected"
    notify(company.user_id, f'Your company "{company.company_name}" registration was not approved.', None)
    db.session.commit()
    return jsonify({"message": f"{company.company_name} rejected."})


@app.route("/api/admin/jobs")
@role_required("admin")
def admin_jobs():
    jobs = JobPost.query.order_by(desc(JobPost.created_at)).all()
    return jsonify({"jobs": [serialize_job(j) for j in jobs]})


@app.route("/api/admin/placements")
@role_required("admin")
def admin_placements():
    placements = PlacementRecord.query.order_by(desc(PlacementRecord.placed_date)).all()
    return jsonify({"placements": [serialize_placement(p) for p in placements]})


@app.route("/api/admin/delete_user/<int:user_id>", methods=["POST"])
@role_required("admin")
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.role == "admin":
        return jsonify({"error": "Cannot delete an admin user."}), 400

    Notification.query.filter_by(user_id=user.id).delete()

    if user.role == "student" and user.student_profile:
        student = user.student_profile
        JobApplication.query.filter_by(student_id=student.id).delete()
        PlacementRecord.query.filter_by(student_id=student.id).delete()
        db.session.delete(student)

    elif user.role == "company" and user.company_profile:
        company = user.company_profile
        job_ids = [j.id for j in JobPost.query.filter_by(company_id=company.id).all()]
        if job_ids:
            JobApplication.query.filter(JobApplication.job_id.in_(job_ids)).delete(synchronize_session=False)
            PlacementRecord.query.filter(PlacementRecord.job_id.in_(job_ids)).delete(synchronize_session=False)
        JobPost.query.filter_by(company_id=company.id).delete()
        db.session.delete(company)

    email = user.email
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {email} deleted successfully."})


@app.route("/uploads/<path:filename>")
@login_required
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


# ------------------------- DB init / migrations / demo data -------------------------
def run_migrations():
    from sqlalchemy import inspect, text
    inspector = inspect(db.engine)
    existing_tables = inspector.get_table_names()

    if "company_profiles" in existing_tables:
        cols = [c["name"] for c in inspector.get_columns("company_profiles")]
        if "approval_status" not in cols:
            with db.engine.begin() as conn:
                conn.execute(text("ALTER TABLE company_profiles ADD COLUMN approval_status VARCHAR(20) DEFAULT 'pending'"))
                conn.execute(text("UPDATE company_profiles SET approval_status = 'approved' WHERE approval_status IS NULL OR approval_status = 'pending'"))
            logger.info("Migrated: company_profiles.approval_status added (existing companies grandfathered as approved)")


def seed_demo_data():
    if StudentProfile.query.count() > 0:
        return

    demo_students = [
        ("aarav.sharma@demo.com", "student123", "Aarav Sharma", "CS2024001", "Computer Science", 8.7, 2025, "9876543210", "Python, React, Node.js, MongoDB, AWS"),
        ("diya.patel@demo.com", "student123", "Diya Patel", "CS2024002", "Computer Science", 9.1, 2025, "9876543211", "Java, Spring Boot, SQL, Docker, Kubernetes"),
        ("kabir.mehta@demo.com", "student123", "Kabir Mehta", "EC2024015", "Electronics", 7.9, 2025, "9876543212", "C++, Embedded Systems, VLSI, MATLAB"),
        ("ishita.rao@demo.com", "student123", "Ishita Rao", "IT2024008", "Information Technology", 8.3, 2026, "9876543213", "Python, Machine Learning, TensorFlow, Data Analysis"),
        ("vihaan.gupta@demo.com", "student123", "Vihaan Gupta", "ME2024022", "Mechanical Engineering", 7.5, 2025, "9876543214", "AutoCAD, SolidWorks, Thermodynamics"),
        ("ananya.iyer@demo.com", "student123", "Ananya Iyer", "CS2024030", "Computer Science", 9.4, 2026, "9876543215", "JavaScript, TypeScript, React, GraphQL, PostgreSQL"),
    ]
    student_profiles = []
    for email, pw, name, roll, branch, cgpa, year, phone, skills in demo_students:
        u = User(email=email, role="student")
        u.set_password(pw)
        db.session.add(u)
        db.session.flush()
        sp = StudentProfile(
            user_id=u.id, full_name=name, roll_number=roll, branch=branch, cgpa=cgpa,
            passing_year=year, phone=phone, skills=skills,
            resume_text=skills.lower().replace(",", " "),
        )
        db.session.add(sp)
        student_profiles.append(sp)
    db.session.flush()

    demo_companies = [
        ("hr@techsolutions.demo", "company123", "Tech Solutions Inc.", "Information Technology", "Leading IT services and consulting company.", "www.techsolutions.example", "Bangalore", "approved"),
        ("careers@finflow.demo", "company123", "FinFlow Systems", "Fintech", "Building the next generation of payment infrastructure.", "www.finflow.example", "Mumbai", "approved"),
        ("jobs@nimbuslabs.demo", "company123", "Nimbus Labs", "Cloud Computing", "Cloud-native platform engineering studio.", "www.nimbuslabs.example", "Hyderabad", "approved"),
        ("talent@greenwave.demo", "company123", "GreenWave Energy", "Renewable Energy", "Solar and wind infrastructure for a sustainable grid.", "www.greenwave.example", "Pune", "pending"),
    ]
    company_profiles = []
    for email, pw, name, industry, desc_, website, location, status in demo_companies:
        u = User(email=email, role="company")
        u.set_password(pw)
        db.session.add(u)
        db.session.flush()
        cp = CompanyProfile(
            user_id=u.id, company_name=name, industry=industry, description=desc_,
            website=website, location=location, approval_status=status,
        )
        db.session.add(cp)
        company_profiles.append(cp)
    db.session.flush()

    approved_companies = [c for c in company_profiles if c.approval_status == "approved"]
    demo_jobs = [
        (approved_companies[0], "Software Engineer Intern", "Build and ship features across our core platform alongside senior engineers.", "Python, React, SQL", "Bangalore", "6-9 LPA", 45),
        (approved_companies[0], "DevOps Engineer", "Own our CI/CD pipelines and cloud infrastructure on AWS.", "AWS, Docker, Kubernetes, Terraform", "Bangalore", "10-14 LPA", 30),
        (approved_companies[1], "Backend Developer", "Design and scale payment processing services handling millions of transactions.", "Java, Spring Boot, PostgreSQL", "Mumbai", "12-16 LPA", 60),
        (approved_companies[1], "Data Analyst", "Turn transaction data into product and risk insights.", "Python, SQL, Data Analysis, Machine Learning", "Mumbai", "8-11 LPA", 40),
        (approved_companies[2], "Full Stack Developer", "Ship customer-facing features across our cloud dashboard.", "React, Node.js, TypeScript, MongoDB", "Hyderabad", "9-13 LPA", 50),
        (approved_companies[2], "Cloud Infrastructure Intern", "Support our platform team building internal developer tooling.", "AWS, Kubernetes, Python", "Hyderabad", "5-7 LPA", 25),
    ]
    job_posts = []
    for company, title, desc_, skills, location, salary, days_left in demo_jobs:
        j = JobPost(
            company_id=company.id, title=title, description=desc_, required_skills=skills,
            location=location, salary_range=salary,
            last_date=(datetime.utcnow() + timedelta(days=days_left)).date(), is_active=True,
        )
        db.session.add(j)
        job_posts.append(j)
    db.session.flush()

    sample_applications = [
        (student_profiles[0], job_posts[0], "Shortlisted"),
        (student_profiles[0], job_posts[4], "Applied"),
        (student_profiles[1], job_posts[2], "Placed"),
        (student_profiles[1], job_posts[1], "Applied"),
        (student_profiles[3], job_posts[3], "Shortlisted"),
        (student_profiles[3], job_posts[0], "Rejected"),
        (student_profiles[5], job_posts[4], "Placed"),
        (student_profiles[5], job_posts[2], "Applied"),
        (student_profiles[2], job_posts[5], "Applied"),
    ]
    for student, job, status in sample_applications:
        score = calculate_screening_score(student.resume_text or "", job.required_skills or "", job.description or "")
        application = JobApplication(student_id=student.id, job_id=job.id, status=status, screening_score=score)
        db.session.add(application)
        db.session.flush()
        if status == "Placed":
            db.session.add(PlacementRecord(
                student_id=student.id, job_id=job.id, company_id=job.company_id,
                package=job.salary_range, joining_date=datetime.utcnow().date(),
            ))

    db.session.commit()
    logger.info("Demo data seeded: %d students, %d companies, %d jobs", len(student_profiles), len(company_profiles), len(job_posts))


def init_db():
    with app.app_context():
        db.create_all()
        run_migrations()

        admin = User.query.filter_by(role="admin").first()
        if not admin:
            admin = User(email="admin@campus.com", role="admin")
            admin.set_password(os.environ.get("DEFAULT_ADMIN_PASSWORD", "admin123"))
            db.session.add(admin)
            db.session.commit()
            logger.info("Admin user created: admin@campus.com")

        seed_demo_data()


with app.app_context():
    init_db()

if __name__ == "__main__":
    app.run(debug=True)

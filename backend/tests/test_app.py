"""
Test suite for the Campus Placement backend.

Covers the actual bugs found and fixed during a senior-level audit of
this codebase, not just happy-path smoke tests - each test here maps to
a real defect that was silently present before:

  - test_delete_user_cascade_*    -> the IntegrityError crash on delete
  - test_pagination_*             -> unbounded list endpoints
  - test_logout_everywhere_*      -> tokens that couldn't be revoked
  - test_register_*_invalid_*     -> missing input validation
  - test_upload_resume_rejects_fake_*  -> extension-only file validation
  - test_post_job_invalid_date    -> unhandled ValueError -> 500

Run with: pytest tests/ -v
"""
import os
import pytest

os.environ.setdefault("SECRET_KEY", "test-secret-for-pytest")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:3000")
os.environ.setdefault("DEFAULT_ADMIN_PASSWORD", "admintest123")

import app as app_module


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Fresh in-memory SQLite DB per test - no shared state between
    tests, no dependency on the real Postgres/Neon database. Demo data
    seeding is disabled here so test assertions can rely on exact counts
    (e.g. "exactly 5 students") instead of accounting for the 6 demo
    students + 4 demo companies that seed_demo_data() would otherwise add."""
    monkeypatch.setenv("DATABASE_URL", f"sqlite:///{tmp_path}/test.db")
    monkeypatch.setattr(app_module, "seed_demo_data", lambda: None)
    app_module.app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{tmp_path}/test.db"
    app_module.app.config["TESTING"] = True

    with app_module.app.app_context():
        app_module.db.drop_all()
        app_module.init_db()

    with app_module.app.test_client() as c:
        yield c


def register_student(client, email="student@test.com", **overrides):
    data = {
        "email": email, "password": "testpass123", "full_name": "Test Student",
        "roll_number": "TS001", "branch": "Computer Science", "cgpa": 8.0,
        "passing_year": 2026, "phone": "9999999999", "skills": "Python",
    }
    data.update(overrides)
    return client.post("/api/auth/register/student", json=data)


def register_company(client, email="company@test.com", **overrides):
    data = {
        "email": email, "password": "testpass123", "company_name": "Test Co",
        "industry": "IT", "description": "A test company", "website": "test.com", "location": "Remote",
    }
    data.update(overrides)
    return client.post("/api/auth/register/company", json=data)


def login(client, email, password="testpass123"):
    res = client.post("/api/auth/login", json={"email": email, "password": password})
    return res.get_json()["access_token"] if res.status_code == 200 else None


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ------------------------- Auth basics -------------------------

def test_admin_login_works_with_configured_password(client):
    res = client.post("/api/auth/login", json={"email": "admin@campus.com", "password": "admintest123"})
    assert res.status_code == 200
    assert "access_token" in res.get_json()


def test_login_wrong_password_rejected(client):
    register_student(client)
    res = client.post("/api/auth/login", json={"email": "student@test.com", "password": "wrongpassword"})
    assert res.status_code == 401


def test_protected_route_rejects_no_token(client):
    res = client.get("/api/student/dashboard")
    assert res.status_code == 401


def test_protected_route_rejects_wrong_role(client):
    register_company(client)
    token = login(client, "company@test.com")
    res = client.get("/api/student/dashboard", headers=auth_headers(token))
    assert res.status_code == 403


# ------------------------- Input validation (the fix for issue #2) -------------------------

def test_register_student_invalid_email_rejected(client):
    res = register_student(client, email="not-an-email")
    assert res.status_code == 400
    assert "details" in res.get_json()


def test_register_student_short_password_rejected(client):
    res = register_student(client, password="short")
    assert res.status_code == 400


def test_register_student_cgpa_out_of_range_rejected(client):
    res = register_student(client, cgpa=15)
    assert res.status_code == 400


def test_register_student_valid_input_succeeds(client):
    res = register_student(client)
    assert res.status_code == 201
    assert "access_token" in res.get_json()


def test_post_job_invalid_date_format_returns_clean_400(client):
    """Regression test for the exact bug found this session: a malformed
    last_date used to throw an unhandled ValueError -> 500."""
    register_company(client)
    admin_token = login(client, "admin@campus.com", "admintest123")
    # Approve the company so it's allowed to post
    companies = client.get("/api/admin/companies", headers=auth_headers(admin_token)).get_json()["companies"]
    company_id = companies[0]["id"]
    client.post(f"/api/admin/company/{company_id}/approve", headers=auth_headers(admin_token))

    company_token = login(client, "company@test.com")
    res = client.post("/api/company/post_job", headers=auth_headers(company_token), json={
        "title": "Test Job", "description": "Test description", "last_date": "09/15/2026",
    })
    assert res.status_code == 400
    assert "YYYY-MM-DD" in res.get_json()["error"]


# ------------------------- Cascade delete (the fix for issue #3 in the original audit) -------------------------

def test_delete_student_with_applications_does_not_crash(client):
    """Regression test for the original bug: deleting a user with
    dependent rows (applications, placements, notifications) threw an
    unhandled IntegrityError on Postgres."""
    register_student(client)
    register_company(client)

    admin_token = login(client, "admin@campus.com", "admintest123")
    companies = client.get("/api/admin/companies", headers=auth_headers(admin_token)).get_json()["companies"]
    client.post(f"/api/admin/company/{companies[0]['id']}/approve", headers=auth_headers(admin_token))

    company_token = login(client, "company@test.com")
    job_res = client.post("/api/company/post_job", headers=auth_headers(company_token), json={
        "title": "Job", "description": "Desc",
    })
    job_id = job_res.get_json()["job"]["id"]

    student_token = login(client, "student@test.com")
    client.post(f"/api/student/apply/{job_id}", headers=auth_headers(student_token))

    students = client.get("/api/admin/students", headers=auth_headers(admin_token)).get_json()["students"]
    student_user_id = None
    with app_module.app.app_context():
        sp = app_module.StudentProfile.query.filter_by(roll_number="TS001").first()
        student_user_id = sp.user_id

    res = client.post(f"/api/admin/delete_user/{student_user_id}", headers=auth_headers(admin_token))
    assert res.status_code == 200  # this used to be an unhandled 500


# ------------------------- Pagination (the fix for issue #8) -------------------------

def test_pagination_returns_different_items_per_page(client):
    for i in range(5):
        register_student(client, email=f"student{i}@test.com", roll_number=f"R{i}")

    admin_token = login(client, "admin@campus.com", "admintest123")
    page1 = client.get("/api/admin/students?per_page=2&page=1", headers=auth_headers(admin_token)).get_json()
    page2 = client.get("/api/admin/students?per_page=2&page=2", headers=auth_headers(admin_token)).get_json()

    assert len(page1["students"]) == 2
    assert len(page2["students"]) == 2
    ids_page1 = {s["id"] for s in page1["students"]}
    ids_page2 = {s["id"] for s in page2["students"]}
    assert ids_page1.isdisjoint(ids_page2)  # no overlap between pages
    assert page1["pagination"]["total"] == 5


def test_pagination_past_last_page_returns_empty_not_error(client):
    register_student(client)
    admin_token = login(client, "admin@campus.com", "admintest123")
    res = client.get("/api/admin/students?page=999", headers=auth_headers(admin_token))
    assert res.status_code == 200
    assert res.get_json()["students"] == []


def test_pagination_invalid_per_page_falls_back_gracefully(client):
    register_student(client)
    admin_token = login(client, "admin@campus.com", "admintest123")
    res = client.get("/api/admin/students?per_page=not-a-number", headers=auth_headers(admin_token))
    assert res.status_code == 200  # must not 500 on bad input


# ------------------------- JWT revocation (the fix for issue #9) -------------------------

def test_logout_everywhere_invalidates_the_token_used_to_call_it(client):
    register_student(client)
    token = login(client, "student@test.com")

    assert client.get("/api/auth/me", headers=auth_headers(token)).status_code == 200

    revoke_res = client.post("/api/auth/logout_everywhere", headers=auth_headers(token))
    assert revoke_res.status_code == 200

    # The exact same token must now be rejected
    assert client.get("/api/auth/me", headers=auth_headers(token)).status_code == 401


def test_fresh_login_works_after_logout_everywhere(client):
    register_student(client)
    old_token = login(client, "student@test.com")
    client.post("/api/auth/logout_everywhere", headers=auth_headers(old_token))

    new_token = login(client, "student@test.com")
    assert client.get("/api/auth/me", headers=auth_headers(new_token)).status_code == 200


# ------------------------- File upload validation (the fix for issue #6) -------------------------

def test_upload_resume_rejects_fake_pdf(client):
    """Regression test: a plain-text file renamed to .pdf used to pass
    the old extension-only check."""
    from io import BytesIO
    register_student(client)
    token = login(client, "student@test.com")

    fake_pdf = (BytesIO(b"This is not really a PDF"), "resume.pdf")
    res = client.post(
        "/api/student/upload_resume", headers=auth_headers(token),
        data={"resume": fake_pdf}, content_type="multipart/form-data",
    )
    assert res.status_code == 400


def test_upload_resume_accepts_real_pdf(client):
    from io import BytesIO
    register_student(client)
    token = login(client, "student@test.com")

    real_pdf = (BytesIO(b"%PDF-1.4\nreal pdf header for testing"), "resume.pdf")
    res = client.post(
        "/api/student/upload_resume", headers=auth_headers(token),
        data={"resume": real_pdf}, content_type="multipart/form-data",
    )
    assert res.status_code == 200


# ------------------------- N+1 fix correctness (issue #3, second half) -------------------------

def test_application_counts_are_correct_after_n1_fix(client):
    """Regression test: the N+1 fix batches application counts via a
    GROUP BY query - this confirms the batched counts are still
    numerically correct, not just fast."""
    register_student(client, email="s1@test.com", roll_number="R1")
    register_student(client, email="s2@test.com", roll_number="R2")
    register_company(client)

    admin_token = login(client, "admin@campus.com", "admintest123")
    companies = client.get("/api/admin/companies", headers=auth_headers(admin_token)).get_json()["companies"]
    client.post(f"/api/admin/company/{companies[0]['id']}/approve", headers=auth_headers(admin_token))

    company_token = login(client, "company@test.com")
    job_res = client.post("/api/company/post_job", headers=auth_headers(company_token), json={"title": "Job", "description": "Desc"})
    job_id = job_res.get_json()["job"]["id"]

    for email in ["s1@test.com", "s2@test.com"]:
        student_token = login(client, email)
        client.post(f"/api/student/apply/{job_id}", headers=auth_headers(student_token))

    jobs = client.get("/api/admin/jobs", headers=auth_headers(admin_token)).get_json()["jobs"]
    job = next(j for j in jobs if j["id"] == job_id)
    assert job["application_count"] == 2

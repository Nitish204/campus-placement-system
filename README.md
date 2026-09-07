<div align="center">

# 🎓 Campus Placement Management System

### A premium, glassmorphic placement portal connecting students, recruiters, and placement cells — in one workflow.

<br/>

<a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/></a>
<a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask&logoColor=white" alt="Flask"/></a>
<a href="https://www.sqlalchemy.org/"><img src="https://img.shields.io/badge/SQLAlchemy-3.1-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white" alt="SQLAlchemy"/></a>
<a href="https://www.sqlite.org/"><img src="https://img.shields.io/badge/SQLite-Dev_DB-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite"/></a>
<a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-Prod_DB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/></a>
<br/>
<a href="https://getbootstrap.com/"><img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap"/></a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/></a>
<a href="https://www.chartjs.org/"><img src="https://img.shields.io/badge/Chart.js-Analytics-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" alt="Chart.js"/></a>
<a href="https://werkzeug.palletsprojects.com/"><img src="https://img.shields.io/badge/Werkzeug-Security-000000?style=for-the-badge&logo=python&logoColor=white" alt="Werkzeug"/></a>
<a href="https://pypi.org/project/PyPDF2/"><img src="https://img.shields.io/badge/PyPDF2-Resume_Parsing-EC1C24?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="PyPDF2"/></a>
<br/>
<a href="https://gunicorn.org/"><img src="https://img.shields.io/badge/Gunicorn-WSGI-499848?style=for-the-badge&logo=gunicorn&logoColor=white" alt="Gunicorn"/></a>
<a href="https://render.com/"><img src="https://img.shields.io/badge/Render-Deploy-46E3B7?style=for-the-badge&logo=render&logoColor=white" alt="Render"/></a>
<a href="https://railway.app/"><img src="https://img.shields.io/badge/Railway-Deploy-0B0D0E?style=for-the-badge&logo=railway&logoColor=white" alt="Railway"/></a>

<br/><br/>

<img src="https://img.shields.io/badge/status-active-success?style=flat-square" alt="status"/>
<img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="license"/>
<img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs welcome"/>

</div>

<br/>

<div align="center">
  <em>Dark glassmorphic UI · animated robot onboarding · AI-assisted resume screening · real-time placement analytics</em>
</div>

<br/>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Preview](#-preview)
- [Feature Breakdown](#-feature-breakdown)
- [Tech Stack Deep Dive](#-tech-stack-deep-dive)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Default Accounts](#-default-accounts-seeded-on-first-run)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

**Campus Placement Management System** is a full-stack recruitment platform built for colleges and universities to run their placement season end-to-end — from student registration and resume upload, to job posting, applicant screening, and final placement analytics — without spreadsheets or email chains.

It ships with three purpose-built portals:

| Portal | Who it's for | Core job |
|---|---|---|
| 🎓 **Student Portal** | Candidates | Build a profile, upload a resume, apply to jobs, track status |
| 🏢 **Company Portal** | Recruiters | Post roles, screen applicants, manage the pipeline |
| 🛡️ **Admin Portal** | Placement Cell | Oversight, analytics, and moderation across the whole system |

The interface uses a custom dark **glassmorphism design system** — animated gradient backgrounds, blurred glass cards, and a bouncy animated robot mascot that reacts to what you type on the login and registration screens.

---

## 🎬 Preview

> Replace these with real screenshots or a GIF walkthrough once deployed — recommended: login screen, student dashboard, admin analytics.

| Login | Student Dashboard | Admin Analytics |
|---|---|---|
| `assets/preview-login.png` | `assets/preview-student.png` | `assets/preview-admin.png` |

---

## ✨ Feature Breakdown

### 🎓 Student Portal
- Self-service registration with academic profile (branch, CGPA, passing year, skills)
- Resume upload (`PDF` / `TXT`) with automatic text extraction on upload
- Live feed of active job postings with one-click apply
- Personal application tracker with status pipeline: `Applied → Shortlisted → Placed / Rejected`
- Per-application **AI screening score**, visible to the student
- Withdraw an application at any point before it's actioned

### 🏢 Company Portal
- Company profile with industry, description, website, and location
- Post job openings with required skills, salary range, location, and deadline
- Dedicated applicant view per job with student profile, CGPA, and score
- **One-click AI resume screening** — matches resume text against required skills and generates a percentage score
- Update applicant status and attach remarks; marking a candidate **Placed** auto-generates a placement record

### 🛡️ Admin Portal
- Global overview: total students, companies, jobs, and applications at a glance
- Interactive branch-wise placement chart (Chart.js)
- Top hiring companies leaderboard
- Recent placements feed with package and joining details
- Full user management across students, companies, jobs, and placement records, including account deletion

### 🔐 Security & Access Control
- Passwords hashed with **Werkzeug's PBKDF2**-based hashing — never stored in plaintext
- Role-based route protection (`student` / `company` / `admin`) via decorators
- Server-side session management with Flask's signed sessions
- File upload size capped at 16MB, extension-validated resume parsing

### 🎨 Premium UI/UX
- Dark glassmorphism design system with animated gradient background, floating blurred blobs, and a twinkling starfield
- Playful, character-driven intro animation with an interactive robot mascot on login/registration
- Consistent glass cards, gradient buttons, and dark-mode data tables across every screen
- Fully responsive layout, built on a customized Bootstrap 5 grid

---

## 🛠️ Tech Stack Deep Dive

<table>
<tr>
<td valign="top" width="50%">

**Backend**

<a href="https://www.python.org/"><img src="https://img.shields.io/badge/Python_3.11-3776AB?style=flat-square&logo=python&logoColor=white"/></a>
<a href="https://flask.palletsprojects.com/"><img src="https://img.shields.io/badge/Flask_3.0-000000?style=flat-square&logo=flask&logoColor=white"/></a>
<a href="https://www.sqlalchemy.org/"><img src="https://img.shields.io/badge/Flask--SQLAlchemy-D71F00?style=flat-square&logo=sqlalchemy&logoColor=white"/></a>
<a href="https://werkzeug.palletsprojects.com/"><img src="https://img.shields.io/badge/Werkzeug-000000?style=flat-square&logo=python&logoColor=white"/></a>
<a href="https://pypi.org/project/PyPDF2/"><img src="https://img.shields.io/badge/PyPDF2-EC1C24?style=flat-square&logo=adobeacrobatreader&logoColor=white"/></a>

- Flask application factory pattern with blueprint-ready route structure
- SQLAlchemy ORM models for `User`, `StudentProfile`, `CompanyProfile`, `JobPost`, `JobApplication`, `PlacementRecord`
- Werkzeug `generate_password_hash` / `check_password_hash` for credential security
- Custom keyword-matching engine for resume-to-job screening scores

</td>
<td valign="top" width="50%">

**Data & Infra**

<a href="https://www.sqlite.org/"><img src="https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white"/></a>
<a href="https://www.postgresql.org/"><img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"/></a>
<a href="https://gunicorn.org/"><img src="https://img.shields.io/badge/Gunicorn-499848?style=flat-square&logo=gunicorn&logoColor=white"/></a>
<a href="https://render.com/"><img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white"/></a>
<a href="https://railway.app/"><img src="https://img.shields.io/badge/Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white"/></a>

- SQLite for zero-config local development
- PostgreSQL-ready via `DATABASE_URL` (auto-normalizes Heroku-style `postgres://` URIs)
- `psycopg2-binary` driver for production Postgres connections
- Gunicorn WSGI server for production deployment
- Deployable to Render, Railway, or any PaaS supporting a `Procfile`

</td>
</tr>
<tr>
<td valign="top" width="50%">

**Frontend**

<a href="https://getbootstrap.com/"><img src="https://img.shields.io/badge/Bootstrap_5-7952B3?style=flat-square&logo=bootstrap&logoColor=white"/></a>
<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/></a>
<a href="https://www.chartjs.org/"><img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white"/></a>
<a href="https://fontawesome.com/"><img src="https://img.shields.io/badge/Font_Awesome-538DD7?style=flat-square&logo=fontawesome&logoColor=white"/></a>
<a href="https://fonts.google.com/"><img src="https://img.shields.io/badge/Google_Fonts-4285F4?style=flat-square&logo=googlefonts&logoColor=white"/></a>

- Jinja2 server-rendered templates extending a single `base.html` design system
- Hand-built dark glassmorphism CSS layer (custom properties, blur, gradient animation)
- SVG + vanilla JS interactive robot mascot with real-time eye-tracking and blink cycles
- Chart.js for branch-wise and company-wise placement analytics

</td>
<td valign="top" width="50%">

**Tooling**

<a href="https://pypi.org/project/python-dotenv/"><img src="https://img.shields.io/badge/python--dotenv-ECD53F?style=flat-square&logo=python&logoColor=black"/></a>
<a href="https://git-scm.com/"><img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white"/></a>
<a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/></a>

- `python-dotenv` for local environment variable management
- Environment-driven configuration (`DATABASE_URL`, `SECRET_KEY`)
- Runtime pinned via `runtime.txt` for consistent deploys

</td>
</tr>
</table>

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Browser (Client)                       │
│   Jinja2 templates · Bootstrap 5 · Chart.js · Vanilla JS       │
└───────────────────────────────┬────────────────────────────────┘
                                 │ HTTP (session cookies)
┌───────────────────────────────▼────────────────────────────────┐
│                        Flask Application                        │
│  ┌───────────────┐  ┌────────────────┐  ┌────────────────────┐ │
│  │  Auth & RBAC   │  │  Route Handlers │  │  Resume Screening  │ │
│  │  (Werkzeug +   │  │  (student /     │  │  Engine (keyword   │ │
│  │   sessions)    │  │  company /admin)│  │  match scoring)    │ │
│  └───────────────┘  └────────────────┘  └────────────────────┘ │
└───────────────────────────────┬────────────────────────────────┘
                                 │ SQLAlchemy ORM
┌───────────────────────────────▼────────────────────────────────┐
│                  SQLite (dev) / PostgreSQL (prod)                │
│   users · student_profiles · company_profiles · job_posts        │
│   job_applications · placement_records                           │
└────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

| Table | Key Fields | Relationships |
|---|---|---|
| `users` | `email`, `password_hash`, `role` | 1–1 with `student_profiles` / `company_profiles` |
| `student_profiles` | `full_name`, `roll_number`, `branch`, `cgpa`, `resume_text` | 1–N with `job_applications` |
| `company_profiles` | `company_name`, `industry`, `location` | 1–N with `job_posts` |
| `job_posts` | `title`, `required_skills`, `salary_range`, `last_date` | 1–N with `job_applications` |
| `job_applications` | `status`, `screening_score`, `remarks` | N–1 with `student_profiles`, `job_posts` |
| `placement_records` | `package`, `joining_date` | N–1 with `student_profiles`, `company_profiles`, `job_posts` |

---

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- `pip`

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/placement-management-system.git
cd placement-management-system

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the app
python app.py
```

The app will be live at **`http://127.0.0.1:5000`**, with a SQLite database and demo data auto-seeded on first run.

---

## 🔑 Environment Variables

| Variable | Required | Description | Default |
|---|---|---|---|
| `DATABASE_URL` | No | PostgreSQL connection string for production. Falls back to SQLite if unset. `postgres://` URIs are auto-converted to `postgresql://`. | `sqlite:///campus_placement.db` |
| `SECRET_KEY` | Recommended for production | Flask session signing key. | Hardcoded dev key — **override before deploying** |

Create a `.env` file locally for these (loaded via `python-dotenv`):

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SECRET_KEY=replace-with-a-long-random-string
```

---

## 📁 Project Structure

```
placement-management-system/
├── app.py                     # Application entry point, models, routes
├── requirements.txt           # Python dependencies
├── Procfile.txt                # Gunicorn start command for deployment
├── runtime.txt                 # Pinned Python runtime version
├── campus_placement.db         # SQLite database (dev only)
└── templates/
    ├── base.html                # Design system: glass UI, animated background
    ├── index.html                # Landing page
    ├── login.html                 # Robot-mascot login
    ├── register_student.html      # Student sign-up
    ├── register_company.html      # Company sign-up
    ├── student_dashboard.html     # Student portal
    ├── company_dashboard.html     # Company portal
    ├── post_job.html               # Job posting form
    ├── view_applications.html      # Applicant screening view
    ├── admin_dashboard.html        # Admin analytics
    ├── admin_students.html         # Student management
    ├── admin_companies.html        # Company management
    ├── admin_jobs.html              # Job post management
    └── admin_placements.html        # Placement records
```

---

## ☁️ Deployment

This project ships deploy-ready for **Render** and **Railway**.

1. Push your repository to GitHub.
2. Create a new **Web Service** on Render (or a project on Railway) and connect the repo.
3. Set the start command from `Procfile.txt`:
   ```
   web: gunicorn app:app
   ```
4. Add a PostgreSQL database add-on and set `DATABASE_URL` in the environment settings.
5. Set a strong `SECRET_KEY` in the environment settings.
6. Deploy — the app auto-creates tables and seed data on first boot.

---

## 🗺️ Roadmap

- [ ] Replace keyword-match screening with an embedding-based resume/job relevance model
- [ ] Email notifications on status changes (Shortlisted / Placed / Rejected)
- [ ] Bulk student onboarding via CSV import
- [ ] Company-side analytics dashboard (funnel conversion, time-to-hire)
- [ ] Two-factor authentication for admin accounts
- [ ] REST API layer for a future mobile client

---

## 🤝 Contributing

Contributions are welcome. To propose a change:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

<div align="center">

<br/>

Built with 💜 for smoother placement seasons.

</div>

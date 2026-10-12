"""Security regression tests: cookie sessions, brute-force limits, upload
handling, demo-data seeding, deadlines, headers and CORS."""
import os
from datetime import date, timedelta
from io import BytesIO

import pytest

os.environ.setdefault("SECRET_KEY", "test-secret-for-pytest")
os.environ.setdefault("ALLOWED_ORIGINS", "http://localhost:3000")
os.environ.setdefault("DEFAULT_ADMIN_PASSWORD", "admintest123")

import app as app_module
from tests.test_app import (  # noqa: E402  (shared fixtures/helpers)
    client, register_student, register_company, login, auth_headers,
)

# Captured at import, before the shared fixture replaces it with a no-op.
REAL_SEED = app_module.seed_demo_data


@pytest.fixture
def limits_on(client):
    app_module.app.config["RATELIMIT_OFF"] = False
    app_module.limiter.reset()
    yield
    app_module.limiter.reset()
    app_module.app.config["RATELIMIT_OFF"] = True


# ------------------------- cookie session -------------------------

def test_login_sets_httponly_cookie_and_authenticates_without_header(client):
    register_student(client)
    res = client.post("/api/auth/login", json={"email": "student@test.com", "password": "testpass123"})
    assert res.status_code == 200
    cookie = res.headers.get("Set-Cookie", "").lower()
    assert "campus_session=" in cookie and "httponly" in cookie and "samesite=lax" in cookie
    assert client.get("/api/auth/me").status_code == 200  # cookie jar only, no Authorization


def test_register_also_sets_cookie(client):
    res = register_student(client)
    assert "campus_session=" in res.headers.get("Set-Cookie", "")
    assert client.get("/api/auth/me").status_code == 200


def test_bearer_header_still_works_without_cookie(client):
    register_student(client)
    token = login(client, "student@test.com")
    client.delete_cookie("campus_session")
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers=auth_headers(token)).status_code == 200


def test_logout_clears_cookie(client):
    register_student(client)
    assert client.get("/api/auth/me").status_code == 200
    assert client.post("/api/auth/logout").status_code == 200
    assert client.get("/api/auth/me").status_code == 401


def test_logout_everywhere_revokes_cookie_session(client):
    register_student(client)
    assert client.post("/api/auth/logout_everywhere").status_code == 200
    assert client.get("/api/auth/me").status_code == 401


def test_register_cannot_choose_role(client):
    res = client.post("/api/auth/register/student", json={
        "email": "evil@test.com", "password": "testpass123", "full_name": "Evil", "role": "admin",
    })
    assert res.status_code == 201 and res.get_json()["role"] == "student"


# ------------------------- brute-force limits -------------------------

def test_login_rate_limited_per_ip(client, limits_on):
    register_student(client)
    codes = [
        client.post("/api/auth/login", json={"email": f"u{i}@test.com", "password": "x"}).status_code
        for i in range(12)
    ]
    assert codes[:10] == [401] * 10
    assert 429 in codes[10:]
    assert "Too many attempts" in client.post(
        "/api/auth/login", json={"email": "u99@test.com", "password": "x"}).get_json()["error"]


def test_login_rate_limited_per_account_even_across_ips(client, limits_on):
    register_student(client)
    statuses = []
    for i in range(18):  # a different IP every time, same target account
        r = client.post("/api/auth/login", json={"email": "student@test.com", "password": "bad"},
                        headers={"X-Forwarded-For": f"10.0.0.{i}"})
        statuses.append(r.status_code)
    assert statuses[:15] == [401] * 15
    assert statuses[15:] == [429] * 3
    # and the real owner is locked out of that account until the window passes
    assert client.post("/api/auth/login", json={"email": "student@test.com", "password": "testpass123"},
                       headers={"X-Forwarded-For": "10.9.9.9"}).status_code == 429


def test_register_rate_limited(client, limits_on):
    codes = [register_student(client, email=f"s{i}@test.com", roll_number=f"R{i}").status_code for i in range(7)]
    assert codes[:5] == [201] * 5 and 429 in codes[5:]


# ------------------------- uploads -------------------------

def _pdf_bytes():
    from PyPDF2 import PdfWriter
    buf = BytesIO(); w = PdfWriter(); w.add_blank_page(width=100, height=100); w.write(buf)
    return buf.getvalue()


def test_corrupt_pdf_with_valid_header_is_rejected_not_stored(client):
    register_student(client)
    res = client.post("/api/student/upload_resume",
                      data={"resume": (BytesIO(b"%PDF-1.4\nnot really a pdf"), "resume.pdf")},
                      content_type="multipart/form-data")
    assert res.status_code == 400
    assert "could not be read" in res.get_json()["error"].lower()
    me = client.get("/api/auth/me").get_json()
    assert "error reading pdf" not in str(me).lower()


def test_resume_is_not_written_to_disk_and_uploads_route_is_gone(client):
    register_student(client)
    res = client.post("/api/student/upload_resume",
                      data={"resume": (BytesIO(_pdf_bytes()), "resume.pdf")},
                      content_type="multipart/form-data")
    assert res.status_code == 200
    assert "UPLOAD_FOLDER" not in app_module.app.config
    assert client.get("/uploads/anything.pdf").status_code == 404


def test_upload_larger_than_5mb_is_rejected(client):
    register_student(client)
    big = BytesIO(b"%PDF-1.4\n" + b"a" * (5 * 1024 * 1024 + 10))
    res = client.post("/api/student/upload_resume", data={"resume": (big, "big.pdf")},
                      content_type="multipart/form-data")
    assert res.status_code == 413


# ------------------------- demo data / deadline / headers -------------------------

def test_demo_seed_is_off_by_default_and_opt_in(client, monkeypatch):
    monkeypatch.delenv("SEED_DEMO_DATA", raising=False)
    with app_module.app.app_context():
        REAL_SEED()
        assert app_module.StudentProfile.query.count() == 0
        monkeypatch.setenv("SEED_DEMO_DATA", "true")
        REAL_SEED()
        assert app_module.StudentProfile.query.count() > 0


def _approved_company_job(client, last_date):
    register_company(client, email="co@test.com")
    with app_module.app.app_context():
        c = app_module.CompanyProfile.query.first()
        c.approval_status = "approved"
        app_module.db.session.commit()
    token = login(client, "co@test.com")
    r = client.post("/api/company/post_job", headers=auth_headers(token),
                    json={"title": "Dev", "description": "Build things", "last_date": last_date})
    assert r.status_code == 201
    return r.get_json()["job"]["id"]


def test_cannot_apply_after_deadline_but_can_before(client):
    past = (date.today() - timedelta(days=1)).isoformat()
    future = (date.today() + timedelta(days=5)).isoformat()
    closed = _approved_company_job(client, past)
    open_ = None
    r = client.post("/api/company/post_job", headers=auth_headers(login(client, "co@test.com")),
                    json={"title": "Open", "description": "Open role", "last_date": future})
    open_ = r.get_json()["job"]["id"]
    client.delete_cookie("campus_session")
    register_student(client)
    assert client.post(f"/api/student/apply/{closed}").status_code == 400
    assert client.post(f"/api/student/apply/{open_}").status_code == 201


def test_security_headers_and_cors_not_wildcard(client):
    r = client.get("/health")
    assert r.headers["X-Content-Type-Options"] == "nosniff"
    assert r.headers["X-Frame-Options"] == "DENY"
    assert "frame-ancestors 'none'" in r.headers["Content-Security-Policy"]
    r = client.options("/api/auth/login", headers={
        "Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert r.headers.get("Access-Control-Allow-Origin") not in ("*", "https://evil.example")
    assert client.get("/api/auth/me").headers["Cache-Control"] == "no-store"

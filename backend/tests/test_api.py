def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


# ── Public reads need no login ──────────────────────────────────────────────
def test_public_lists_are_open(client):
    for path in ["projects", "skills", "experience", "education", "certifications"]:
        res = client.get(f"/api/{path}/")
        assert res.status_code == 200, path
        assert res.json() == []


def test_profile_404_when_empty(client):
    assert client.get("/api/profile/").status_code == 404


# ── Full create / read / update / delete ────────────────────────────────────
def test_project_crud(client):
    created = client.post(
        "/api/projects/",
        json={"title": "Test Project", "description": "d", "tech": ["Python"]}
    )
    assert created.status_code == 200
    pid = created.json()["id"]

    listed = client.get("/api/projects/").json()
    assert [p["title"] for p in listed] == ["Test Project"]

    updated = client.put(
        f"/api/projects/{pid}",
        json={"title": "Renamed", "description": "d", "tech": ["Python"]}
    )
    assert updated.json()["title"] == "Renamed"

    assert client.delete(f"/api/projects/{pid}").status_code == 200
    assert client.get("/api/projects/").json() == []


def test_update_missing_project_returns_404(client):
    res = client.put("/api/projects/99999", json={"title": "x"})
    assert res.status_code == 404


def test_profile_create_and_read(client):
    res = client.put("/api/profile/", json={"name": "Test Person", "titles": ["Dev"]})
    assert res.status_code == 200
    assert client.get("/api/profile/").json()["name"] == "Test Person"


# ── Contact form validation ─────────────────────────────────────────────────
def test_contact_rejects_bad_email(client):
    res = client.post("/api/contact/", json={"name": "A", "email": "not-an-email", "message": "hi"})
    assert res.status_code == 422


def test_contact_rejects_empty_message(client):
    res = client.post("/api/contact/", json={"name": "A", "email": "a@b.com", "message": "   "})
    assert res.status_code == 422


# ── Resume upload checks ────────────────────────────────────────────────────
def test_resume_rejects_fake_pdf(client):
    res = client.post(
        "/api/resume/upload",
        files={"file": ("cv.pdf", b"this is not a pdf", "application/pdf")}
    )
    assert res.status_code == 400


def test_admin_key_blocks_writes_when_set(client, monkeypatch):
    import main
    monkeypatch.setattr(main, "ADMIN_KEY", "secret123")
    body = {"title": "x", "description": "d", "tech_stack": [], "sort_order": 0}
    assert client.post("/api/projects/", json=body).status_code == 401
    assert client.post("/api/projects/", json=body, headers={"X-Admin-Key": "wrong"}).status_code == 401
    assert client.get("/api/projects/").status_code == 200          # reads stay public
    # public contact form is not blocked by the key (fails on validation, not 401)
    assert client.post("/api/contact/", json={}).status_code != 401


def test_resume_upload_download_roundtrip(client):
    pdf = b"%PDF-1.4 fake but starts right"
    assert client.get("/api/resume/exists").json() == {"exists": False}
    r = client.post("/api/resume/upload", files={"file": ("cv.pdf", pdf, "application/pdf")})
    assert r.status_code == 200
    assert client.get("/api/resume/exists").json() == {"exists": True}
    assert client.get("/api/resume/download").content == pdf


def test_401_still_carries_cors_headers(client, monkeypatch):
    """Browser must be able to read the 401, otherwise the admin can't ask for the key."""
    import main
    monkeypatch.setattr(main, "ADMIN_KEY", "secret123")
    origin = main.ALLOWED_ORIGINS[0]
    r = client.put("/api/profile/", json={}, headers={"Origin": origin})
    assert r.status_code == 401
    assert r.headers.get("access-control-allow-origin") == origin

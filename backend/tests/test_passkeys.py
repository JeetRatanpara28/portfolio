"""Write protection + passkey (Touch ID / Face ID) flow, using a software authenticator."""
import base64
import hashlib
import json
import os

import cbor2
import pytest
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec

from core.config import ALLOWED_ORIGINS
from core import tokens

ORIGIN = ALLOWED_ORIGINS[0]
RP_ID = ORIGIN.split("://")[1].split(":")[0]
KEY = "test-admin-key-123"
BODY = {"title": "x", "description": "d", "tech_stack": [], "sort_order": 0}


def b64(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def unb64(s):
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


class SoftAuthenticator:
    """Behaves like Touch ID: holds a private key, signs challenges."""

    def __init__(self):
        self.priv = ec.generate_private_key(ec.SECP256R1())
        self.cred_id = os.urandom(16)
        self.count = 0

    def _client(self, typ, challenge):
        return json.dumps({"type": typ, "challenge": challenge, "origin": ORIGIN}).encode()

    def register(self, options):
        client = self._client("webauthn.create", options["challenge"])
        n = self.priv.public_key().public_numbers()
        cose = cbor2.dumps({1: 2, 3: -7, -1: 1, -2: n.x.to_bytes(32, "big"), -3: n.y.to_bytes(32, "big")})
        auth = (hashlib.sha256(RP_ID.encode()).digest() + bytes([0x45]) + (0).to_bytes(4, "big")
                + bytes(16) + len(self.cred_id).to_bytes(2, "big") + self.cred_id + cose)
        att = cbor2.dumps({"fmt": "none", "attStmt": {}, "authData": auth})
        return {"id": b64(self.cred_id), "rawId": b64(self.cred_id), "type": "public-key",
                "response": {"clientDataJSON": b64(client), "attestationObject": b64(att)},
                "clientExtensionResults": {}}

    def assert_(self, options):
        client = self._client("webauthn.get", options["challenge"])
        self.count += 1
        auth = hashlib.sha256(RP_ID.encode()).digest() + bytes([0x05]) + self.count.to_bytes(4, "big")
        sig = self.priv.sign(auth + hashlib.sha256(client).digest(), ec.ECDSA(hashes.SHA256()))
        return {"id": b64(self.cred_id), "rawId": b64(self.cred_id), "type": "public-key",
                "response": {"clientDataJSON": b64(client), "authenticatorData": b64(auth),
                             "signature": b64(sig), "userHandle": None},
                "clientExtensionResults": {}}


@pytest.fixture()
def locked(monkeypatch):
    monkeypatch.setenv("ADMIN_KEY", KEY)


H = {"Origin": ORIGIN}


def test_writes_rejected_without_credentials(client, locked):
    assert client.post("/api/projects/", json=BODY).status_code == 401
    assert client.post("/api/projects/", json=BODY, headers={"X-Admin-Key": "wrong"}).status_code == 401
    assert client.post("/api/projects/", json=BODY, headers={"X-Admin-Token": "garbage"}).status_code == 401
    assert client.get("/api/projects/").status_code == 200                 # reads stay public
    assert client.post("/api/contact/", json={}).status_code != 401        # contact form stays public


def test_admin_key_still_works_for_scripts(client, locked):
    assert client.post("/api/projects/", json=BODY, headers={"X-Admin-Key": KEY}).status_code == 200


def test_401_carries_cors_headers(client, locked):
    r = client.put("/api/profile/", json={}, headers=H)
    assert r.status_code == 401 and r.headers["access-control-allow-origin"] == ORIGIN


def test_token_wrong_kind_and_expiry(client, locked):
    assert tokens.verify(tokens.sign("auth", {}, 60), "write") is None     # wrong kind
    assert tokens.verify(tokens.sign("write", {}, -1), "write") is None    # expired
    forged = tokens.sign("write", {}, 60)[:-3] + "AAA"
    assert tokens.verify(forged, "write") is None                          # tampered


def test_adding_a_device_needs_admin_key(client, locked):
    assert client.post("/api/webauthn/register/options", headers=H).status_code == 401


def test_origin_must_be_allowed(client, locked):
    r = client.post("/api/webauthn/register/options", headers={"Origin": "https://evil.example", "X-Admin-Key": KEY})
    assert r.status_code == 400


def test_full_passkey_flow(client, locked):
    assert client.post("/api/webauthn/auth/options", headers=H).status_code == 409   # nothing registered yet
    dev = SoftAuthenticator()

    # add this device (needs the admin key once)
    r = client.post("/api/webauthn/register/options", headers={**H, "X-Admin-Key": KEY})
    assert r.status_code == 200, r.text
    opts = r.json()
    r = client.post("/api/webauthn/register/verify", headers={**H, "X-Admin-Key": KEY},
                    json={"credential": dev.register(opts["options"]), "state": opts["state"], "label": "Test Mac"})
    assert r.status_code == 200, r.text
    assert client.get("/api/webauthn/status").json() == {"enabled": True, "devices": 1}

    # a save: biometric check -> token -> write
    o = client.post("/api/webauthn/auth/options", headers=H).json()
    r = client.post("/api/webauthn/auth/verify", headers=H,
                    json={"credential": dev.assert_(o["options"]), "state": o["state"]})
    assert r.status_code == 200, r.text
    token = r.json()["token"]
    assert client.post("/api/projects/", json=BODY, headers={"X-Admin-Token": token}).status_code == 200

    # a different device's signature (stolen state, wrong key) is rejected
    o = client.post("/api/webauthn/auth/options", headers=H).json()
    attacker = SoftAuthenticator()
    attacker.cred_id = dev.cred_id          # pretend to be the same credential
    r = client.post("/api/webauthn/auth/verify", headers=H,
                    json={"credential": attacker.assert_(o["options"]), "state": o["state"]})
    assert r.status_code == 401

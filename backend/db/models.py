from sqlalchemy import Column, Integer, String, Text, Boolean, ARRAY, ForeignKey
from db.database import Base

class Profile(Base):
    __tablename__ = "profile"

    id       = Column(Integer, primary_key=True, index=True)
    name     = Column(String(100), nullable=False)
    location = Column(String(200))
    email    = Column(String(200))
    github   = Column(String(200))
    linkedin = Column(String(200))
    twitter  = Column(String(200))
    bio        = Column(Text)
    status     = Column(String(100), default="Open to work")
    titles     = Column(ARRAY(String))
    resume_url = Column(String(500))

class SkillGroup(Base):
    __tablename__ = "skill_groups"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    color      = Column(String(20), default="#64DCFF")
    sort_order = Column(Integer, default=0)

class Skill(Base):
    __tablename__ = "skills"

    id         = Column(Integer, primary_key=True, index=True)
    group_id   = Column(Integer, ForeignKey("skill_groups.id", ondelete="CASCADE"), nullable=False)
    name       = Column(String(100), nullable=False)
    level      = Column(Integer)
    sort_order = Column(Integer, default=0)

class Project(Base):
    __tablename__ = "projects"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    description = Column(Text)
    tech        = Column(ARRAY(String))
    github_url  = Column(String(500))
    live_url    = Column(String(500))
    accent      = Column(String(20), default="#64DCFF")
    label       = Column(String(50))
    featured    = Column(Boolean, default=False)
    sort_order  = Column(Integer, default=0)

class Experience(Base):
    __tablename__ = "experience"

    id          = Column(Integer, primary_key=True, index=True)
    company     = Column(String(200), nullable=False)
    role        = Column(String(200), nullable=False)
    start_date  = Column(String(50))
    end_date    = Column(String(50))
    current     = Column(Boolean, default=False)
    location    = Column(String(200))
    description = Column(Text)
    sort_order  = Column(Integer, default=0)

class Education(Base):
    __tablename__ = "education"

    id             = Column(Integer, primary_key=True, index=True)
    degree         = Column(String(200), nullable=False)
    institution    = Column(String(200), nullable=False)
    field_of_study = Column(String(200))
    location       = Column(String(200))
    start_date     = Column(String(50))
    end_date       = Column(String(50))
    grade          = Column(String(50))
    current        = Column(Boolean, default=False)
    sort_order     = Column(Integer, default=0)

class Certification(Base):
    __tablename__ = "certifications"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(200), nullable=False)
    issuer         = Column(String(200))
    issued_date    = Column(String(50))
    expiry_date    = Column(String(50))
    credential_id  = Column(String(200))
    credential_url = Column(String(500))
    pdf_url        = Column(String(500))
    sort_order     = Column(Integer, default=0)

class AdminUser(Base):
    __tablename__ = "admin_users"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(200), nullable=False, unique=True)
    password_hash = Column(String(500), nullable=False)


class WebAuthnCredential(Base):
    __tablename__ = "webauthn_credentials"

    id            = Column(Integer, primary_key=True, index=True)
    username      = Column(String(200), nullable=False, index=True)
    credential_id = Column(String(500), nullable=False, unique=True)
    public_key    = Column(String(2000), nullable=False)
    sign_count    = Column(Integer, default=0)
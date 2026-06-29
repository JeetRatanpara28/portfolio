"""
Seeds remaining skills, experience, education, and certifications.
Run once while the backend is running:
  python3 seed_all.py
"""
import urllib.request, json

BASE = "http://localhost:8000/api"

def post(path, data):
    body = json.dumps(data).encode()
    req = urllib.request.Request(
        f"{BASE}{path}",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read())

def run(label, path, items, key="name"):
    print(f"\n── {label} ──")
    for item in items:
        try:
            result = post(path, item)
            print(f"  ✓ {result.get(key, result.get('id', '?'))}")
        except Exception as e:
            print(f"  ✗ {item.get(key, '?')}: {e}")

# ── SKILLS (remaining 4 groups) ──────────────────────────────
# group_id 1 = Frontend (already done)
# group_id 2 = Backend
# group_id 3 = Database & Infra
# group_id 4 = IoT & Hardware
# group_id 5 = AI & ML

backend_skills = [
    {"group_id": 2, "name": "Python / FastAPI",   "level": 88, "sort_order": 1},
    {"group_id": 2, "name": "Node.js / Express",  "level": 82, "sort_order": 2},
    {"group_id": 2, "name": "REST API Design",     "level": 85, "sort_order": 3},
    {"group_id": 2, "name": "Elixir / Phoenix",    "level": 65, "sort_order": 4},
    {"group_id": 2, "name": "ASP.NET Core",        "level": 60, "sort_order": 5},
]

db_infra_skills = [
    {"group_id": 3, "name": "PostgreSQL",          "level": 82, "sort_order": 1},
    {"group_id": 3, "name": "Docker / Compose",    "level": 85, "sort_order": 2},
    {"group_id": 3, "name": "GitHub Actions CI/CD","level": 80, "sort_order": 3},
    {"group_id": 3, "name": "AWS (EC2 / S3 / ECR)","level": 72, "sort_order": 4},
    {"group_id": 3, "name": "Kubernetes",          "level": 65, "sort_order": 5},
]

iot_skills = [
    {"group_id": 4, "name": "Arduino / C++",       "level": 80, "sort_order": 1},
    {"group_id": 4, "name": "ESP8266 / WiFi",      "level": 78, "sort_order": 2},
    {"group_id": 4, "name": "Sensor Integration",  "level": 75, "sort_order": 3},
    {"group_id": 4, "name": "Serial Communication","level": 72, "sort_order": 4},
    {"group_id": 4, "name": "Hardware Debugging",  "level": 70, "sort_order": 5},
]

ai_ml_skills = [
    {"group_id": 5, "name": "Scikit-learn",        "level": 78, "sort_order": 1},
    {"group_id": 5, "name": "TensorFlow / Keras",  "level": 75, "sort_order": 2},
    {"group_id": 5, "name": "XGBoost",             "level": 72, "sort_order": 3},
    {"group_id": 5, "name": "CNN / Deep Learning", "level": 68, "sort_order": 4},
    {"group_id": 5, "name": "Data Preprocessing",  "level": 80, "sort_order": 5},
]

run("Backend Skills",      "/skills/", backend_skills)
run("DB & Infra Skills",   "/skills/", db_infra_skills)
run("IoT & Hardware Skills","/skills/", iot_skills)
run("AI & ML Skills",      "/skills/", ai_ml_skills)

# ── EXPERIENCE ───────────────────────────────────────────────
experience = [
    {
        "company":     "BrainyBeam Info-Tech Pvt. Ltd",
        "role":        "MERN Stack Developer (Internship)",
        "start_date":  "05/2024",
        "end_date":    "06/2024",
        "location":    "Ahmedabad, India",
        "description": "Internship focused on React JS — created dynamic, visually appealing user interfaces and collaborated with a team on responsive design and front-end development techniques.",
        "sort_order":  1
    },
    {
        "company":     "Cygner Technolabs Pvt. Ltd.",
        "role":        "Frontend Developer (Training)",
        "start_date":  "05/2023",
        "end_date":    "06/2023",
        "location":    "Rajkot, India",
        "description": "Web development training on the 'Knot' project using PHP, CSS, and jQuery — focused on enhancing visual appeal and functionality through effective styling and interactive UI elements.",
        "sort_order":  2
    },
]
run("Experience", "/experience/", experience, key="company")

# ── EDUCATION ────────────────────────────────────────────────
education = [
    {
        "degree":      "MSc Information Technology",
        "institution": "Epitech Paris",
        "location":    "Paris, France",
        "start_date":  "09/2025",
        "end_date":    "",
        "grade":       "",
        "current":     True,
        "sort_order":  1
    },
    {
        "degree":      "Bachelor of Technology (Computer Engineering)",
        "institution": "Marwadi University",
        "location":    "Rajkot, India",
        "start_date":  "07/2021",
        "end_date":    "04/2025",
        "grade":       "6.62 CGPA",
        "current":     False,
        "sort_order":  2
    },
    {
        "degree":      "12th Grade (GSEB)",
        "institution": "Premier School",
        "location":    "Rajkot, India",
        "start_date":  "06/2020",
        "end_date":    "05/2021",
        "grade":       "83%",
        "current":     False,
        "sort_order":  3
    },
    {
        "degree":      "10th Grade (GSEB)",
        "institution": "Atmiya School",
        "location":    "Rajkot, India",
        "start_date":  "06/2018",
        "end_date":    "05/2019",
        "grade":       "73.6%",
        "current":     False,
        "sort_order":  4
    },
]
run("Education", "/education/", education, key="institution")

# ── CERTIFICATIONS ───────────────────────────────────────────
certifications = [
    {"name": "CISCO CCNAv7: Introduction to Networks",              "pdf_url": "", "sort_order": 1},
    {"name": "CISCO CCNAv7: Switching, Routing & Wireless Essentials","pdf_url": "", "sort_order": 2},
    {"name": "CISCO Operating System",                              "pdf_url": "", "sort_order": 3},
    {"name": "Programming for Everybody (Getting Started with Python)","pdf_url": "", "sort_order": 4},
    {"name": "Python Data Structures",                              "pdf_url": "", "sort_order": 5},
    {"name": "AWS Academy Cloud Foundations",                       "pdf_url": "", "sort_order": 6},
]
run("Certifications", "/certifications/", certifications)

print("\n✅ All done!")

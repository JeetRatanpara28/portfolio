"""
Run this once while the backend is running:
  python3 seed_projects.py
"""
import urllib.request, json

BASE = "http://localhost:8000/api/projects/"

projects = [
  {
    "title": "AgriSense AI",
    "description": "Team project (4 people): AI advisory platform for smallholder farmers, with pest risk assessment, irrigation recommendations and crop advice served through FastAPI. My part: the Next.js admin site, the AI chatbot integration (Hugging Face), and the DevOps: Docker images, a GitHub Actions CI/CD pipeline, and deployment on AWS (EC2, ECR, RDS PostgreSQL). The ML models (Random Forest, XGBoost) were built by my teammates.",
    "tech": ["Next.js", "FastAPI", "PostgreSQL", "Docker", "GitHub Actions", "AWS EC2", "AWS ECR", "AWS RDS", "Hugging Face"],
    "github_url": "https://github.com/Tejaswini3107/agrisenseai.git",
    "live_url": "",
    "accent": "#A78BFA",
    "label": "Ongoing",
    "featured": True,
    "sort_order": 1
  },
  {
    "title": "CIA — Linux Infrastructure Security Audit",
    "description": "Epitech team project (3 people, May 2026). We audited 4 Linux CentOS servers, found 11 vulnerabilities, ranked them by risk and fixed them: access rights, updates, unnecessary services and server hardening. We documented every fix and set up a CI/CD pipeline so that updates and fixes are deployed in a controlled way.",
    "tech": ["Linux", "CentOS", "Bash", "Security Audit", "Hardening", "Vulnerability Management", "CI/CD", "Docker", "GitHub Actions"],
    "github_url": "https://github.com/JeetRatanpara28/cia-epitech.git",
    "live_url": "",
    "accent": "#64DCFF",
    "label": "SECURITY",
    "featured": True,
    "sort_order": 2
  },
  {
    "title": "MarchéGo — Farmers Market E-Commerce",
    "description": "Full-stack e-commerce platform for local farmers markets. FastAPI backend with JWT auth, role-based access, QR/barcode scanning with Open Food Facts API for Nutri-Score classification, and PayPal sandbox payments. React 18 admin dashboard with Recharts analytics. Flutter mobile app for iOS & Android. Deployed on Railway and AWS EC2 with GitHub Actions CI/CD.",
    "tech": ["Python", "FastAPI", "React 18", "Flutter", "PostgreSQL", "Docker", "GitHub Actions", "Railway", "AWS EC2", "Tailwind CSS"],
    "github_url": "https://gitlab.com/TejuReddyy/marchego.git",
    "live_url": "",
    "accent": "#FB923C",
    "label": "Featured",
    "featured": True,
    "sort_order": 3
  },
  {
    "title": "Zoidberg 2.0 — Pneumonia Detection",
    "description": "ML pipeline for binary and 3-class pneumonia detection on 5,216 chest X-ray images. Benchmarked 5 architectures — best: SVM ROC-AUC 0.9952. CNN with TensorFlow/Keras for Normal/Bacteria/Virus classification. PCA to 100 components retaining 87.88% variance. Exported all models as Joblib/Keras files with a reusable inference pipeline.",
    "tech": ["Python", "Scikit-learn", "TensorFlow", "Keras", "Pandas", "NumPy", "PCA", "SVM", "CNN", "Joblib"],
    "github_url": "https://github.com/JeetRatanpara28/Zoidberg2.0.git",
    "live_url": "",
    "accent": "#EC4899",
    "label": "AI/ML",
    "featured": False,
    "sort_order": 4
  },
  {
    "title": "Cleaning Gotham — IoT Waste Management",
    "description": "End-to-end IoT smart waste management system. Full pipeline: ultrasonic, LDR and water sensors → ESP8266 WiFi → HTTP REST API → PostgreSQL → real-time dashboard. Debugged ESP8266 power instability with capacitor filtering. .NET ASP.NET Core REST API on Railway. Unity AR mobile frontend with ArUco markers for augmented reality bin visualisation.",
    "tech": ["Arduino UNO", "ESP8266", "Python", "ASP.NET Core", "PostgreSQL", "Railway", "Unity AR", "REST API"],
    "github_url": "https://github.com/Tejaswini3107/KM.git",
    "live_url": "",
    "accent": "#F59E0B",
    "label": "IoT",
    "featured": False,
    "sort_order": 5
  },
  {
    "title": "Time Manager — Employee Tracking",
    "description": "Full-stack monorepo with Phoenix/Elixir REST API featuring JWT auth and role-based access (employee/manager/general_manager). Vue 3 frontend with clock in/out, break management, analytics and CSV export. React 18 + TypeScript prototype with Recharts data visualisation. Wrapped Vue build into Cordova iOS mobile app for cross-platform deployment.",
    "tech": ["React 18", "TypeScript", "Vue 3", "Elixir", "Phoenix", "PostgreSQL", "JWT", "Docker", "Cordova iOS"],
    "github_url": "https://github.com/JeetRatanpara28/time-manager.git",
    "live_url": "",
    "accent": "#8B5CF6",
    "label": "Full Stack",
    "featured": False,
    "sort_order": 6
  },
  {
    "title": "Spoontacular — Meal Planning App",
    "description": "Full-stack meal planning app with React frontend, Express.js REST API, JWT auth, and dynamic meal generation via Spoonacular API. Containerised with Docker Compose. Deployed to Kubernetes with custom manifests. Multi-branch CI/CD using GitLab CI/CD and GitHub Actions with automated sanity, integration, and regression tests.",
    "tech": ["React", "Node.js", "Express", "PostgreSQL", "Docker", "Kubernetes", "GitLab CI/CD", "GitHub Actions", "Spoonacular API"],
    "github_url": "https://github.com/anzaeee/trinity-devops.git",
    "live_url": "",
    "accent": "#34D399",
    "label": "DevOps",
    "featured": False,
    "sort_order": 7
  },
  {
    "title": "Techarainfoway — Tech Company Website",
    "description": "Responsive corporate website for a tech company built with React.js, focusing on interactive features, smooth navigation, and component-based architecture to improve user engagement.",
    "tech": ["React JS", "CSS", "JavaScript"],
    "github_url": "",
    "live_url": "",
    "accent": "#3B82F6",
    "label": None,
    "featured": False,
    "sort_order": 8
  },
]

for p in projects:
    data = json.dumps(p).encode()
    req = urllib.request.Request(BASE, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            result = json.loads(res.read())
            print(f"✓ {result['title']} (id={result['id']})")
    except Exception as e:
        print(f"✗ {p['title']}: {e}")

print("\nDone!")

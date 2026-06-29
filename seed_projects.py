"""
Run this once while the backend is running:
  python3 seed_projects.py
"""
import urllib.request, json

BASE = "http://localhost:8000/api/projects/"

projects = [
  {
    "title": "AgriSense AI",
    "description": "AI-powered agricultural advisory platform for South Asian smallholder farmers. Features real-time pest risk assessment (Random Forest, 86.59% accuracy), irrigation recommendations (XGBoost, 99.78% accuracy), and crop advisory via FastAPI REST endpoints. Trained on 36,162 rows of NASA POWER weather data. Deployed on AWS EC2 with Docker and GitHub Actions CI/CD.",
    "tech": ["Python", "FastAPI", "PostgreSQL", "Scikit-learn", "XGBoost", "TensorFlow", "Docker", "AWS EC2", "NASA POWER API"],
    "github_url": "https://github.com/Tejaswini3107/agrisenseai.git",
    "live_url": "",
    "accent": "#A78BFA",
    "label": "Ongoing",
    "featured": True,
    "sort_order": 1
  },
  {
    "title": "CIA — Inventory Management Platform",
    "description": "Full-stack inventory management platform with Node.js/Express/TypeScript REST API featuring JWT auth, bcrypt hashing, and role-based access control. React/Redux/TypeScript frontend. Production-grade security with rate limiting, Helmet headers, and CORS. Docker Compose orchestration with CI/CD pipeline pushing to AWS ECR and deploying to EC2.",
    "tech": ["Node.js", "Express", "TypeScript", "React", "Redux", "MySQL", "TypeORM", "JWT", "Docker", "GitHub Actions", "AWS ECR", "EC2"],
    "github_url": "https://github.com/JeetRatanpara28/cia-epitech.git",
    "live_url": "",
    "accent": "#64DCFF",
    "label": "Featured",
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

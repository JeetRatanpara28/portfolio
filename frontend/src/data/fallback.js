/**
 * Static fallback content.
 *
 * Rendered immediately on first paint, then replaced by the API data when it arrives
 * (see src/lib/store.js). It keeps the page complete while the backend wakes up from a
 * cold start, or if it is down. Keep it in sync with what you want visitors to see.
 */

export const profile = {
  "name": "Jeetkumar Ratanpara",
  "location": "Paris, France",
  "status": "Open to work",
  "email": "jeetratanpara2003@gmail.com",
  "github": "https://github.com/Jeetratanpara28",
  "linkedin": "https://linkedin.com/in/jeetratanpara",
  "twitter": "",
  "bio": "MSc Information Technology student at Epitech Paris with a strong foundation in IoT, full-stack software engineering and DevOps practices. Experienced in building complete systems from embedded hardware (Arduino, ESP8266) to cloud-deployed APIs (Python, FastAPI, Docker). International profile with professional English and a proactive, team-oriented mindset.",
  "titles": [
    "Full Stack Developer",
    "MSc IT @ Epitech Paris",
    "IoT & DevOps Engineer",
    "React & Python Builder"
  ],
  "resume_exists": false
}

export const skillGroups = [
  {
    "id": 1,
    "name": "Frontend",
    "color": "#61DAFB",
    "sort_order": 1,
    "skills": [
      {
        "id": 1,
        "name": "React / Next.js"
      },
      {
        "id": 2,
        "name": "TypeScript"
      },
      {
        "id": 3,
        "name": "HTML / CSS"
      },
      {
        "id": 4,
        "name": "Vue 3"
      },
      {
        "id": 5,
        "name": "UI/UX Design"
      },
      {
        "id": 6,
        "name": "Recharts"
      }
    ]
  },
  {
    "id": 2,
    "name": "Backend",
    "color": "#68A063",
    "sort_order": 2,
    "skills": [
      {
        "id": 7,
        "name": "Node.js / Express"
      },
      {
        "id": 8,
        "name": "Python / FastAPI"
      },
      {
        "id": 9,
        "name": "REST API Design"
      },
      {
        "id": 10,
        "name": "Elixir / Phoenix"
      },
      {
        "id": 11,
        "name": "ASP.NET Core"
      }
    ]
  },
  {
    "id": 3,
    "name": "Database & Infra",
    "color": "#336791",
    "sort_order": 3,
    "skills": [
      {
        "id": 17,
        "name": "PostgreSQL"
      },
      {
        "id": 18,
        "name": "Docker / Compose"
      },
      {
        "id": 19,
        "name": "GitHub Actions CI/CD"
      },
      {
        "id": 20,
        "name": "AWS (EC2 / S3 / ECR)"
      },
      {
        "id": 21,
        "name": "Kubernetes"
      }
    ]
  },
  {
    "id": 4,
    "name": "IoT & Hardware",
    "color": "#FF6B35",
    "sort_order": 4,
    "skills": [
      {
        "id": 22,
        "name": "Arduino / C++"
      },
      {
        "id": 23,
        "name": "ESP8266 / WiFi"
      },
      {
        "id": 24,
        "name": "Sensor Integration"
      },
      {
        "id": 25,
        "name": "Serial Communication"
      },
      {
        "id": 26,
        "name": "Hardware Debugging"
      }
    ]
  },
  {
    "id": 5,
    "name": "AI & Machine Learning",
    "color": "#8B5CF6",
    "sort_order": 5,
    "skills": [
      {
        "id": 27,
        "name": "Scikit-learn"
      },
      {
        "id": 28,
        "name": "TensorFlow / Keras"
      },
      {
        "id": 29,
        "name": "XGBoost"
      },
      {
        "id": 30,
        "name": "CNN / Deep Learning"
      },
      {
        "id": 31,
        "name": "Data Preprocessing"
      }
    ]
  }
]

export const projects = [
  {
    // TODO: CONFIRM AgriSense validation method — the last sentence of the description says the
    // accuracy figures come from "a held-out test set". Edit it here AND in the admin if that is wrong.
    "id": 1,
    "title": "AgriSense AI",
    "description": "AI-powered agricultural advisory platform for South Asian smallholder farmers. Features real-time pest risk assessment (Random Forest, 86.59% accuracy), irrigation recommendations (XGBoost, 99.78% accuracy), and crop advisory via FastAPI REST endpoints. Trained on 36,162 rows of NASA POWER weather data. Deployed on AWS EC2 with Docker and GitHub Actions CI/CD. Accuracy figures are evaluated on a held-out test set.",
    "tech": [
      "Python",
      "FastAPI",
      "PostgreSQL",
      "Scikit-learn",
      "XGBoost",
      "TensorFlow",
      "Docker",
      "AWS EC2",
      "NASA POWER API"
    ],
    "github_url": "https://github.com/Tejaswini3107/agrisenseai.git",
    "live_url": "",
    "accent": "#A78BFA",
    "label": "Ongoing",
    "featured": true,
    "sort_order": 1
  },
  {
    // TODO: CONFIRM CIA DESCRIPTION — content intentionally unchanged until the final text is provided.
    "id": 2,
    "title": "CIA — Inventory Management Platform",
    "description": "Full-stack inventory management platform with Node.js/Express/TypeScript REST API featuring JWT auth, bcrypt hashing, and role-based access control. React/Redux/TypeScript frontend. Production-grade security with rate limiting, Helmet headers, and CORS. Docker Compose orchestration with CI/CD pipeline pushing to AWS ECR and deploying to EC2.",
    "tech": [
      "Node.js",
      "Express",
      "TypeScript",
      "React",
      "Redux",
      "MySQL",
      "TypeORM",
      "JWT",
      "Docker",
      "GitHub Actions",
      "AWS ECR",
      "EC2"
    ],
    "github_url": "https://github.com/JeetRatanpara28/cia-epitech.git",
    "live_url": "",
    "accent": "#64DCFF",
    "label": "Featured",
    "featured": true,
    "sort_order": 2
  },
  {
    "id": 3,
    "title": "MarchéGo — Farmers Market E-Commerce",
    "description": "Full-stack e-commerce platform for local farmers markets. FastAPI backend with JWT auth, role-based access, QR/barcode scanning with Open Food Facts API for Nutri-Score classification, and PayPal sandbox payments. React 18 admin dashboard with Recharts analytics. Flutter mobile app for iOS & Android. Deployed on Railway and AWS EC2 with GitHub Actions CI/CD.",
    "tech": [
      "Python",
      "FastAPI",
      "React 18",
      "Flutter",
      "PostgreSQL",
      "Docker",
      "GitHub Actions",
      "Railway",
      "AWS EC2",
      "Tailwind CSS"
    ],
    "github_url": "https://gitlab.com/TejuReddyy/marchego.git",
    "live_url": "",
    "accent": "#FB923C",
    "label": "Featured",
    "featured": true,
    "sort_order": 3
  },
  {
    "id": 4,
    "title": "Zoidberg 2.0 — Pneumonia Detection",
    "description": "ML pipeline for binary and 3-class pneumonia detection on 5,216 chest X-ray images. Benchmarked 5 architectures — best: SVM ROC-AUC 0.9952. CNN with TensorFlow/Keras for Normal/Bacteria/Virus classification. PCA to 100 components retaining 87.88% variance. Exported all models as Joblib/Keras files with a reusable inference pipeline.",
    "tech": [
      "Python",
      "Scikit-learn",
      "TensorFlow",
      "Keras",
      "Pandas",
      "NumPy",
      "PCA",
      "SVM",
      "CNN",
      "Joblib"
    ],
    "github_url": "https://github.com/JeetRatanpara28/Zoidberg2.0.git",
    "live_url": "",
    "accent": "#EC4899",
    "label": "AI/ML",
    "featured": false,
    "sort_order": 4
  },
  {
    "id": 5,
    "title": "Cleaning Gotham — IoT Waste Management",
    "description": "End-to-end IoT smart waste management system. Full pipeline: ultrasonic, LDR and water sensors → ESP8266 WiFi → HTTP REST API → PostgreSQL → real-time dashboard. Debugged ESP8266 power instability with capacitor filtering. .NET ASP.NET Core REST API on Railway. Unity AR mobile frontend with ArUco markers for augmented reality bin visualisation.",
    "tech": [
      "Arduino UNO",
      "ESP8266",
      "Python",
      "ASP.NET Core",
      "PostgreSQL",
      "Railway",
      "Unity AR",
      "REST API"
    ],
    "github_url": "https://github.com/Tejaswini3107/KM.git",
    "live_url": "",
    "accent": "#F59E0B",
    "label": "IoT",
    "featured": false,
    "sort_order": 5
  },
  {
    "id": 6,
    "title": "Time Manager — Employee Tracking",
    "description": "Full-stack monorepo with Phoenix/Elixir REST API featuring JWT auth and role-based access (employee/manager/general_manager). Vue 3 frontend with clock in/out, break management, analytics and CSV export. React 18 + TypeScript prototype with Recharts data visualisation. Wrapped Vue build into Cordova iOS mobile app for cross-platform deployment.",
    "tech": [
      "React 18",
      "TypeScript",
      "Vue 3",
      "Elixir",
      "Phoenix",
      "PostgreSQL",
      "JWT",
      "Docker",
      "Cordova iOS"
    ],
    "github_url": "https://github.com/JeetRatanpara28/time-manager.git",
    "live_url": "",
    "accent": "#8B5CF6",
    "label": "Full Stack",
    "featured": false,
    "sort_order": 6
  },
  {
    "id": 7,
    "title": "Spoontacular — Meal Planning App",
    "description": "Full-stack meal planning app with React frontend, Express.js REST API, JWT auth, and dynamic meal generation via Spoonacular API. Containerised with Docker Compose. Deployed to Kubernetes with custom manifests. Multi-branch CI/CD using GitLab CI/CD and GitHub Actions with automated sanity, integration, and regression tests.",
    "tech": [
      "React",
      "Node.js",
      "Express",
      "PostgreSQL",
      "Docker",
      "Kubernetes",
      "GitLab CI/CD",
      "GitHub Actions",
      "Spoonacular API"
    ],
    "github_url": "https://github.com/anzaeee/trinity-devops.git",
    "live_url": "",
    "accent": "#34D399",
    "label": "DevOps",
    "featured": false,
    "sort_order": 7
  },
  {
    "id": 8,
    "title": "Techarainfoway — Tech Company Website",
    "description": "Responsive corporate website for a tech company built with React.js, focusing on interactive features, smooth navigation, and component-based architecture to improve user engagement.",
    "tech": [
      "React JS",
      "CSS",
      "JavaScript"
    ],
    "github_url": "",
    "live_url": "",
    "accent": "#3B82F6",
    "label": null,
    "featured": false,
    "sort_order": 8
  }
]

export const experience = [
  {
    "id": 1,
    "company": "BrainyBeam Info-Tech Pvt. Ltd",
    "role": "Web Design Intern (React JS)",
    "start_date": "05/2024",
    "end_date": "06/2024",
    "location": "Ahmedabad, India",
    "description": "Internship focused on React JS — created dynamic, visually appealing user interfaces and collaborated with a team on responsive design and front-end development techniques.",
    "current": false,
    "sort_order": 1
  },
  {
    "id": 2,
    "company": "Cygner Technolabs Pvt. Ltd.",
    "role": "Web Development Trainee",
    "start_date": "05/2023",
    "end_date": "06/2023",
    "location": "Rajkot, India",
    "description": "Web development training on the 'Knot' project using PHP, CSS, and jQuery — focused on enhancing visual appeal and functionality through effective styling and interactive UI elements.",
    "current": false,
    "sort_order": 2
  }
]

export const education = [
  {
    "id": 1,
    "degree": "MSc Information Technology",
    "institution": "Epitech Paris",
    "location": "Paris, France",
    "start_date": "09/2025",
    "end_date": "",
    "grade": "",
    "current": true,
    "sort_order": 1
  },
  {
    "id": 2,
    "degree": "Bachelor of Technology (Computer Engineering)",
    "institution": "Marwadi University",
    "location": "Rajkot, India",
    "start_date": "07/2021",
    "end_date": "04/2025",
    "grade": "",
    "current": false,
    "sort_order": 2
  }
]

export const certifications = [
  {
    "id": 1,
    "name": "CISCO CCNAv7: Introduction to Networks",
    "pdf_url": "",
    "issuer": null,
    "issued_date": null,
    "sort_order": 1
  },
  {
    "id": 2,
    "name": "CISCO CCNAv7: Switching, Routing & Wireless Essentials",
    "pdf_url": "",
    "issuer": null,
    "issued_date": null,
    "sort_order": 2
  },
  {
    "id": 4,
    "name": "Programming for Everybody (Getting Started with Python)",
    "pdf_url": "",
    "issuer": null,
    "issued_date": null,
    "sort_order": 4
  },
  {
    "id": 5,
    "name": "Python Data Structures",
    "pdf_url": "",
    "issuer": null,
    "issued_date": null,
    "sort_order": 5
  },
  {
    "id": 6,
    "name": "AWS Academy Cloud Foundations",
    "pdf_url": "",
    "issuer": null,
    "issued_date": null,
    "sort_order": 6
  },
  {
    "id": 7,
    "name": "TryHackMe Pre Security (2026)",
    "pdf_url": "",
    "issuer": "TryHackMe",
    "issued_date": "2026",
    "sort_order": 7
  },
  {
    "id": 8,
    "name": "NDG Linux Essentials (2023)",
    "pdf_url": "",
    "issuer": "Cisco Networking Academy (NDG)",
    "issued_date": "2023",
    "sort_order": 8
  }
]

export default { profile, skillGroups, projects, experience, education, certifications }

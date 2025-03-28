# ⚡ Entry-Level Job Matching Platform

**Find jobs that match your skills. Instantly. Intelligently.**

A futuristic job discovery platform that uses machine learning and AI to connect users with the most relevant **entry-level job opportunities** from across the web.

---

## 🚀 Overview

This platform is a full-stack application built with **Next.js**, powered by **Firebase**, and backed by intelligent automation using **Python ML models** and the **OpenAI API**.

### 🔎 What It Does

- 🌐 Scrapes jobs from multiple sources hourly (Indeed, LinkedIn, Google Jobs, etc.)
- 🧠 Classifies listings as entry-level using an ML model (TF-IDF + XGBoost)
- 📂 Stores jobs in **Firestore**, deletes outdated ones automatically
- 🧐 Matches uploaded resumes to job descriptions using **OpenAI**
- 💬 Provides match scores and actionable resume feedback
- 📈 Shows users jobs on a real-time dashboard built with Next.js

---

## ⚙️ Tech Stack

| Layer          | Technology                                                          |
| -------------- | ------------------------------------------------------------------- |
| Frontend       | **Next.js**, TypeScript, Tailwind CSS, Framer Motion, **shadcn/ui** |
| Backend        | **Python** (for scraping + ML), Firebase Functions                  |
| Database       | **Firestore** (Firebase NoSQL DB)                                   |
| Authentication | **Firebase Auth**                                                   |
| Cloud Storage  | **Firebase Storage** for resumes                                    |
| AI/ML          | **TF-IDF**, **XGBoost**, **OpenAI API**                             |

---

## 📂 Project Structure

```bash
entry-level-job-platform/
├── app/                  # Next.js 13+ App Router
│   ├── jobs/             # Job listings page
│   ├── auth/             # Auth flows
│   └── dashboard/        # Future dashboard (TBD)
├── components/           # Reusable UI components
├── context/              # React contexts (JobsContext, etc.)
├── firebase/             # Firebase config and utils
├── lib/                  # Utility functions
├── public/               # Static assets
├── scripts/              # Python scraper + ML jobs
├── styles/               # Global styles
├── .env.local            # Environment variables
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## 🛠️ Installation & Running the App

1. **Clone the repository**

```bash
git clone https://github.com/malli7/entry_level_jobs_dashboard.git
cd entry_level_jobs_dashboard
```

2. **Install frontend dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file with your Firebase and OpenAI credentials:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_OPENAI_API_KEY=sk-xxxxxxx
...
```

4. **Run the development server**

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

> ✅ Python scripts for job scraping & ML classification run as background workers or scheduled functions and are already integrated with Firestore.

---

## 📈 Dashboards

The platform includes a real-time dashboard that visualizes:

- ✨ Entry-Level Job Landscape — showing available roles across domains (e.g., AI Engineer, Frontend Developer, Data Analyst, UI/UX Designer).

📊 **Dashboard Visuals:**

<table>
  <tr>
    <td><img src="./public/images/dashboard-1.png" alt="Jobs per Category" width="100%"/></td>
    <td><img src="./public/images/dashboard-2.png" alt="Job Locations Distribution" width="100%"/></td>
  </tr>
  <tr>
    <td><img src="./public/images/dashboard-3.png" alt="Jobs Posted Over Time" width="100%"/></td>
    <td><img src="./public/images/dashboard-4.png" alt="Top Hiring Locations" width="100%"/></td>
  </tr>
  <tr>
    <td><img src="./public/images/dashboard-5.png" alt="Employment Type Distribution" width="100%"/></td>
    <td><img src="./public/images/dashboard-6.png" alt="Jobs by Category and Employment Type" width="100%"/></td>
  </tr>
</table>

---



## 🤝 Contributing

We welcome contributions to enhance the platform! Here's how you can help:

1. **Fork the Repository** – Start by forking the repo to your GitHub account.
2. **Create a Feature Branch** – Use meaningful names (e.g., `feature/job-filter`).
3. **Commit Changes** – Keep commits focused and atomic.
4. **Submit a Pull Request** – Describe your changes clearly and link related issues.
5. **Open an Issue** – Have a feature idea or bug? Let us know by opening an issue.

We follow standard practices and encourage clean, modular code. Don't forget to lint and test your changes!

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


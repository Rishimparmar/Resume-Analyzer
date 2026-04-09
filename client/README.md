# 🧠 AI Resume Analyzer

An AI-powered web application that evaluates resumes against ATS (Applicant Tracking Systems) and provides an improvement report including score, missing skills, and actionable suggestions.

This project demonstrates full-stack development with React, Node.js, SQLite, and LLM API integration.

---

## 🚀 Features

* Upload resume in PDF format
* Extracts text automatically from resume
* AI analyzes resume using LLM
* Generates ATS compatibility score (0–100)
* Suggests missing skills
* Provides improvement recommendations
* Stores previous analyses (history dashboard)
* Clean modern UI (TailwindCSS)

---

## 🛠 Tech Stack

**Frontend**

* React.js
* Axios
* TailwindCSS

**Backend**

* Node.js
* Express.js
* Multer (file upload)
* pdf-parse (PDF text extraction)

**Database**

* SQLite

**AI Integration**

* Groq LLM API (Llama 3.1)

---

## 📂 Project Structure

```
ai-resume-analyzer/
│
├── client/        → React frontend
├── server/        → Node/Express backend
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/ai-resume-analyzer.git
cd ai-resume-analyzer
```

---

### 2️⃣ Backend Setup

```
cd server
npm install
```

Create a `.env` file inside **server/**:

```
GROQ_API_KEY=your_api_key_here
```

Start backend:

```
node index.js
```

Backend will run at:

```
http://127.0.0.1:5000
```

---

### 3️⃣ Frontend Setup

Open another terminal:

```
cd client
npm install
npm start
```

Frontend will run at:

```
http://localhost:3000
```

---

## 📊 How It Works

1. User uploads a resume (PDF)
2. Backend extracts text using pdf-parse
3. Text is sent to LLM API
4. AI evaluates ATS quality
5. Response parsed into:

   * Score
   * Missing Skills
   * Suggestions
6. Result displayed and saved into SQLite database

---

## 🧪 Example Output

```
ATS Score: 78

Missing Skills:
Docker, AWS, CI/CD

Suggestions:
Add measurable achievements, include deployment projects, and highlight technical stack clearly.
```

---

## 🧠 Learning Outcomes

* File upload handling in Node.js
* Parsing PDFs programmatically
* API integration with LLM
* Prompt engineering
* Full-stack architecture
* Database persistence
* Frontend-backend communication

---

## 📌 Future Improvements

* Resume keyword matching by job description
* Downloadable PDF report
* User authentication
* Resume tailoring suggestions
* Multiple resume comparison

---

## 👨‍💻 Author

Rishi Parmar
MSc IT Student | Full-Stack Developer

---

## 📜 License

This project is for educational and portfolio use.

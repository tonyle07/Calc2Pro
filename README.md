# Calc2Pro

Calc2Pro is an AI-powered Calculus II study platform built to help students review difficult topics, track learning progress, and generate custom practice quizzes in one place.

**Live Demo:** https://calc2pro.vercel.app

---

## Overview

Calc2Pro combines structured calculus review content with interactive study tools. The platform was designed to make Calc II prep more organized and less overwhelming by giving students:

- guided study notes
- AI tutoring assistance
- customizable quizzes
- user authentication
- cloud-based progress tracking

---

## Features

- **25 study units** covering key Calculus II topics, formulas, and concepts
- **AI-powered tutoring** using the Anthropic Claude API
- **Custom quiz builder** with difficulty settings and timed mode
- **Firebase Authentication** with Google and email sign-in
- **Firestore sync** for saving and tracking user progress across sessions
- **Responsive frontend** built for a clean study experience

---

## Demo Screenshots

![Calc2Pro Landing Page](https://github.com/user-attachments/assets/afd5f863-23b5-450a-abd7-5c99e2f678bf)
![Calc2Pro Notes View](https://github.com/user-attachments/assets/98ae538f-539d-4efb-8418-4203a01d2171)
![Calc2Pro Custom Quiz](https://github.com/user-attachments/assets/a3a2ffae-f567-4a38-ace8-deca20fcc73a)

---

## Tech Stack

- **Frontend:** React, Vite, HTML, CSS
- **Authentication / Database:** Firebase Authentication, Firestore
- **AI Integration:** Anthropic Claude API (REST)
- **Deployment:** Vercel (serverless)
- **Version Control:** Git, GitHub
- **Linting / Tooling:** ESLint

---

## Why I Built It

I built Calc2Pro to create a more useful and engaging way to study Calculus II. Instead of relying on scattered notes, random videos, and separate quiz tools, I wanted one platform where students could review concepts, ask questions, and track progress in a single app.

This project also helped me practice building and deploying a full web application with authentication, cloud storage, and AI features.

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/tonyle07/Calc2Pro.git
cd Calc2Pro
```

### 2. Install dependencies
```bash
npm install
```

### 3. Add environment variables
Create a `.env` file in the root directory:
```
VITE_ANTHROPIC_KEY=your_anthropic_key_here
```

### 4. Run locally
```bash
npm run dev
```

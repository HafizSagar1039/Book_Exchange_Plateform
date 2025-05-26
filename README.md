<<<<<<< HEAD
# Book_Exchange_Plateform
This is a full-stack web application that allows users to upload books, browse others’ books, and request exchanges.
=======

# 📚 Online Book Exchange Platform

This is a full-stack web application that allows users to upload books, browse others’ books, and request exchanges.

- Frontend: React (Vite)
- Backend: Node.js (Express)
- Database: MySQL

---

## 🚀 Features

- ✅ User Registration and Login using JWT
- ✅ Upload Books with Cover Images
- ✅ Send/Receive Exchange Requests
- ✅ Exchange Books
- ✅ Message Feature
- ✅ Responsive UI

---

## 📁 Project Structure

```

book-exchange/
├── client/         # Frontend - React (Vite)
├── server/         # Backend - Node.js (Express)
├── package.json    # Root file with dev scripts
├── README.md       # This documentation file

````

---

## ⚙️ Prerequisites

Make sure you have the following installed:
-React (vite Eng)
- Node.js (Express.js)
- NPM
- MySQL Server

---

## 📦 Installation Steps


````

2. Install All Dependencies:

   ```bash
   npm run install:all
   ```

3. Configure Environment Variables:
    .ev file:

   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=saghar
   DB_NAME=book_exchange

   JWT_SECRET=Hafiz_Saghar
   JWT_EXPIRE=24h

   EMAIL_USER=tufailahmedsagar951@gmail.com
   EMAIL_PASS=hvkj bodx ltao bdgp

   FRONTEND_URL=http://localhost:5173
   ```

---

## 🏃 How to Run the App

To run both frontend and backend together:

```bash
npm run dev
```

This will:

* 🌐 Start frontend at: `http://localhost:5173`
* 🔧 Start backend at: `http://localhost:5000`

---

## 💻 Available Scripts

| Command               | Description                                |
| --------------------- | ------------------------------------------ |
| `npm run dev`         | Run client and server concurrently         |
| `npm run dev:client`  | Run frontend (React) only                  |
| `npm run dev:server`  | Run backend (Express) only                 |
| `npm run build`       | Build frontend for production              |
| `npm run preview`     | Preview the production build of frontend   |
| `npm run install:all` | Install dependencies in root/client/server |

---



## 📧 Contact: 

Developer: Tufail Ahmed 
Email: [tufailahmedsagar951@gmail.com] (mailto:tufailahmedsagar951@gmail.com)
Project: Full Stack Book Exchange Web App
Submission: LMS Assignment


(Best of Luck)
>>>>>>> 714379a (Without Notification Feature)

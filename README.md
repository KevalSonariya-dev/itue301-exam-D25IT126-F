# EventHub - Ticket Booking System

A web-based event ticket booking platform developed for the **ITUE301 Advanced Web Development Frameworks** practical examination.

---

## Tech Stack

- **Frontend:** React (Vite) & JavaScript
- **Routing:** React Router
- **Backend:** Node.js & Express.js
- **Database:** MongoDB Atlas with Mongoose
- **Styling:** Vanilla CSS

---

## Project Structure

```text
EventHub/
├── frontend/             # React + Vite frontend application
│   ├── public/           # Static assets
│   ├── src/              # React source code (components, routes, styles)
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html        # HTML entry point
│   ├── package.json      # Frontend dependencies & scripts
│   └── vite.config.js    # Vite configuration
├── backend/              # Node.js + Express backend application
│   ├── .env.example      # Environment variables template
│   ├── package.json      # Backend dependencies & scripts
│   └── server.js         # Express server starter entry point
├── .env.example          # Root environment variables template
├── .gitignore            # Git ignore configuration
└── README.md             # Project documentation
```

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account and database cluster

---

### 2. Environment Configuration

1. Create a `.env` file in the `backend/` directory (or root) based on `.env.example`:
   ```bash
   cp .env.example backend/.env
   ```
2. Configure the following variables in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/eventhub?retryWrites=true&w=majority
   ```
   > **Note:** Never commit the `.env` file containing actual database credentials to version control.

---

### 3. Installation & Run Instructions

#### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Run backend development server (with nodemon)
npm run dev

# Or run in standard production mode
npm start
```
The backend server runs on `http://localhost:5000`.

#### Frontend Setup
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend application will be accessible at `http://localhost:5173`.

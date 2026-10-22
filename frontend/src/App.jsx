import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>EventHub</h1>
        <p className="app-tagline">Ticket Booking System</p>
      </header>
      <main className="app-content">
        <div className="card">
          <h2>Project Skeleton Initialized</h2>
          <p>
            Ready for examination task implementation.
          </p>
          <div className="badge-group">
            <span className="badge">React (Vite)</span>
            <span className="badge">React Router</span>
            <span className="badge">Express.js</span>
            <span className="badge">MongoDB Atlas</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

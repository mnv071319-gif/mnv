// Home.js component එකක් create කරන්න
// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="home-container">
      <div className="home-card">
        <h1>🎮 Welcome to VyFun Color Prediction Game 🎮</h1>
        <p>Test your luck and win amazing prizes!</p>
        
        <div className="home-buttons">
          <button onClick={() => navigate('/auth')} className="home-button login">
            Login
          </button>
          <button onClick={() => navigate('/auth')} className="home-button signup">
            Sign Up
          </button>
        </div>
        
        <div className="home-features">
          <div className="feature">
            <h3>🎯 Easy to Play</h3>
            <p>Predict colors and numbers to win</p>
          </div>
          <div className="feature">
            <h3>💰 Instant Withdrawals</h3>
            <p>Get your winnings quickly</p>
          </div>
          <div className="feature">
            <h3>🎁 Daily Bonuses</h3>
            <p>Free bonuses every day</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
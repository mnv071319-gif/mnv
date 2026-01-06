// src/components/Auth.js
import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateWhatsAppNumber = (number) => {
    const regex = /^[0-9]{10,15}$/;
    return regex.test(number);
  };

  const exportToExcel = async (userData) => {
    try {
      // Get existing users from localStorage (or initialize empty array)
      let existingUsers = JSON.parse(localStorage.getItem('vyfun_users')) || [];
      
      // Add new user data with timestamp
      const newUser = {
        'User ID': userData.uid,
        'Email': userData.email,
        'Username': userData.username,
        'WhatsApp Number': userData.whatsappNumber,
        'Signup Date': new Date().toLocaleDateString('en-US'),
        'Signup Time': new Date().toLocaleTimeString('en-US'),
        'Balance': '₹10,000',
        'Status': 'Active'
      };
      
      existingUsers.push(newUser);
      
      // Save back to localStorage
      localStorage.setItem('vyfun_users', JSON.stringify(existingUsers));
      
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(existingUsers);
      
      // Set column widths
      const colWidths = [
        { wch: 30 }, // User ID
        { wch: 25 }, // Email
        { wch: 20 }, // Username
        { wch: 15 }, // WhatsApp
        { wch: 12 }, // Date
        { wch: 12 }, // Time
        { wch: 10 }, // Balance
        { wch: 10 }  // Status
      ];
      worksheet['!cols'] = colWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'VyFun Users');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      // Save file with current date
      const date = new Date();
      const fileName = `VyFun_Users_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.xlsx`;
      saveAs(data, fileName);
      
      console.log('Excel file downloaded:', fileName);
    } catch (error) {
      console.error('Excel export error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (!username) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      if (!whatsappNumber || !validateWhatsAppNumber(whatsappNumber)) {
        setError('Please enter a valid WhatsApp number (10-15 digits)');
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        navigate('/game');
      } else {
        // Signup
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: email,
          username: username,
          whatsappNumber: whatsappNumber,
          createdAt: new Date().toISOString(),
          balance: 10000,
          totalBets: 0,
          totalWins: 0,
          lastLogin: new Date().toISOString()
        });

        // Export to Excel
        await exportToExcel({
          uid: user.uid,
          email: email,
          username: username,
          whatsappNumber: whatsappNumber
        });

        navigate('/game');
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">
          {isLogin ? '🎮 Login to VyFun' : '🎮 Sign Up for VyFun'}
        </h1>
        
        {error && <div className="error-message">⚠️ {error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">📧 Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">👤 Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                autoComplete="username"
              />
            </div>
          )}
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="whatsapp">📱 WhatsApp Number</label>
              <input
                type="tel"
                id="whatsapp"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Enter WhatsApp number"
                required
                autoComplete="tel"
              />
              <small style={{ color: '#9ca3af', fontSize: '12px' }}>
                Example: 94771234567
              </small>
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              minLength="6"
              autoComplete={isLogin ? "current-password" : "new-password"}
            />
            {!isLogin && (
              <small style={{ color: '#9ca3af', fontSize: '12px' }}>
                Password must be at least 6 characters
              </small>
            )}
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">🔒 Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
                minLength="6"
                autoComplete="new-password"
              />
            </div>
          )}
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? '🔄 Processing...' : (isLogin ? '🎮 Login' : '📝 Sign Up & Download Excel')}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              onClick={() => setIsLogin(!isLogin)}
              className="switch-link"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </span>
          </p>
        </div>
        
        {!isLogin && (
          <div className="auth-note">
            <p style={{ fontSize: '12px', color: '#22c55e', textAlign: 'center', marginTop: '15px' }}>
              ⭐ Sign up successful! Excel file will download automatically.
            </p>
          </div>
        )}
        
        <div className="auth-footer">
          <p style={{ fontSize: '10px', opacity: 0.7 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
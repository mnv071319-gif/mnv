// src/App.js
import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import VyFunGame from './components/VyFunGame';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel'; // එක් වරක් පමණක්
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Admin emails list (ඔබට admin කරන්න ඕනෑ අයගේ emails)
  const ADMIN_EMAILS = ['admin@vyfun.com', 'mnv071319@gmail.com']; // ඔබගේ email එකතු කරන්න

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Check if user is admin
        if (ADMIN_EMAILS.includes(currentUser.email)) {
          setIsAdmin(true);
        }
        
        // Fetch user data from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserData(data);
            
            // Update last login
            await updateDoc(doc(db, 'users', currentUser.uid), {
              lastLogin: new Date().toISOString()
            });
          } else {
            // Create user document if it doesn't exist
            await updateDoc(doc(db, 'users', currentUser.uid), {
              uid: currentUser.uid,
              email: currentUser.email,
              username: currentUser.email.split('@')[0],
              balance: 10000,
              totalBets: 0,
              totalWins: 0,
              createdAt: new Date().toISOString(),
              lastLogin: new Date().toISOString()
            });
            setUserData({
              uid: currentUser.uid,
              email: currentUser.email,
              username: currentUser.email.split('@')[0],
              balance: 10000,
              totalBets: 0,
              totalWins: 0
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
        setUserData(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading VyFun...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/game" /> : <Auth />} 
        />
        <Route 
          path="/auth" 
          element={user ? <Navigate to="/game" /> : <Auth />} 
        />
        <Route 
          path="/game" 
          element={user ? <VyFunGame user={userData} /> : <Navigate to="/auth" />} 
        />
        {/* Admin route - Admin විතරක්ට පමණක් */}
        <Route 
          path="/admin" 
          element={isAdmin ? <AdminPanel /> : <Navigate to="/game" />} 
        />
      </Routes>
    </Router>
  );
};

export default App;
// src/components/VyFunGame.js
import React, { useState, useEffect } from 'react';
import { 
  Bell, CreditCard, Home, TrendingUp, User, 
  Trophy, Award, Gift, History, LogOut, 
  Settings, Wallet, Users, Star 
} from 'lucide-react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const VyFunGame = ({ user }) => {
  const [balance, setBalance] = useState(user?.balance || 10000);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [period, setPeriod] = useState(20250105001);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentBets, setCurrentBets] = useState([]);
  const [totalWin, setTotalWin] = useState(user?.totalWins || 0);
  const [totalBetsCount, setTotalBetsCount] = useState(user?.totalBets || 0);
  const [activeTab, setActiveTab] = useState('home');
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [showBetModal, setShowBetModal] = useState(false);
  const navigate = useNavigate();

  const quickAmounts = [10, 50, 100, 500, 1000, 5000];
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const betOptions = [
    { id: 'green', name: 'Green', color: '#22c55e', multiplier: 2, numbers: [0] },
    { id: 'violet', name: 'Violet', color: '#a855f7', multiplier: 4.5, numbers: [2, 4, 6, 8] },
    { id: 'red', name: 'Red', color: '#ef4444', multiplier: 2, numbers: [1, 3, 7, 9] },
  ];

  const getNumberColor = (num) => {
    if (num === 0) return 'linear-gradient(135deg, #a855f7 0%, #22c55e 100%)';
    if (num === 5) return 'linear-gradient(135deg, #ef4444 0%, #22c55e 100%)';
    if ([1, 3, 7, 9].includes(num)) return '#ef4444';
    if ([2, 4, 6, 8].includes(num)) return '#a855f7';
    return '#22c55e';
  };

  const showAlertMessage = (text) => {
    setMessage(text);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 3000);
  };

  const updateUserBalance = async (newBalance, newWins, newBets) => {
    if (!user?.uid) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        balance: newBalance,
        totalWins: newWins,
        totalBets: newBets,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating user balance:', error);
    }
  };

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          processRound();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBets]);

  const processRound = async () => {
    const result = Math.floor(Math.random() * 10);
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });

    let roundWin = 0;
    let totalBetAmount = 0;

    // Calculate winnings
    currentBets.forEach(bet => {
      totalBetAmount += bet.amount;
      let multiplier = 1;
      let isWin = false;

      if (bet.type === 'number' && bet.value === result) {
        isWin = true;
        multiplier = result === 0 ? 10 : result === 5 ? 9 : 9;
      } else if (bet.type === 'color') {
        const option = betOptions.find(opt => opt.id === bet.value);
        if (option && option.numbers.includes(result)) {
          isWin = true;
          multiplier = option.multiplier;
        }
      }

      if (isWin) {
        const winAmount = bet.amount * multiplier;
        roundWin += winAmount;
      }
    });

    if (roundWin > 0) {
      const newBalance = balance + roundWin;
      setBalance(newBalance);
      setTotalWin(prev => prev + roundWin);
      showAlertMessage(`🎉 Congratulations! You won ₹${roundWin.toFixed(2)}`);
      
      // Update user data in Firebase
      await updateUserBalance(newBalance, totalWin + roundWin, totalBetsCount + currentBets.length);
    } else if (currentBets.length > 0) {
      const newBalance = balance - totalBetAmount;
      setBalance(newBalance);
      showAlertMessage('😔 Better luck next time!');
      
      // Update user data in Firebase
      await updateUserBalance(newBalance, totalWin, totalBetsCount + currentBets.length);
    }

    // Add to history
    const historyItem = {
      period: period,
      result: result,
      color: getNumberColor(result),
      time: time,
      winAmount: roundWin,
      betAmount: totalBetAmount
    };

    setGameHistory(prev => [historyItem, ...prev.slice(0, 9)]);
    setTotalBetsCount(prev => prev + currentBets.length);
    setPeriod(prev => prev + 1);
    setCurrentBets([]);
  };

  const openBetModal = (type, value) => {
    if (timeLeft <= 10) {
      showAlertMessage('⏰ Betting time is over! Wait for next round');
      return;
    }
    setSelectedBet({ type, value });
    setShowBetModal(true);
  };

  const confirmBet = async () => {
    if (balance < betAmount) {
      showAlertMessage('⚠️ Insufficient balance!');
      return;
    }

    const newBalance = balance - betAmount;
    setBalance(newBalance);
    setCurrentBets(prev => [...prev, { 
      type: selectedBet.type, 
      value: selectedBet.value, 
      amount: betAmount 
    }]);
    showAlertMessage(`✅ Bet placed successfully! ₹${betAmount}`);
    setShowBetModal(false);

    // Update user balance in Firebase
    if (user?.uid) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          balance: newBalance
        });
      } catch (error) {
        console.error('Error updating balance:', error);
      }
    }
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await signOut(auth);
        navigate('/auth');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  };

  return (
    <div className="app">
      {/* Top Bar */}
      <div className="top-bar">
        <h1>VyFun</h1>
        <div className="top-icons">
          <Bell size={20} />
          <CreditCard size={20} />
        </div>
      </div>

      {/* Balance Card */}
      <div className="balance-card">
        <div className="balance-info">
          <h2>Total Balance</h2>
          <div className="amount">₹{balance.toLocaleString('en-IN')}</div>
        </div>
        <div className="balance-buttons">
          <button className="btn btn-light" onClick={() => showAlertMessage('Deposit feature coming soon!')}>Deposit</button>
          <button className="btn btn-light" onClick={() => showAlertMessage('Withdraw feature coming soon!')}>Withdraw</button>
        </div>
      </div>

      {/* Message Alert */}
      {showMessage && (
        <div className="message-alert">
          {message}
        </div>
      )}

      <div className="container">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="home-tab">
            {/* Game Card */}
            <div className="game-card">
              <div className="timer-section">
                <div className="period-info">
                  <h3>Period</h3>
                  <p>{period}</p>
                </div>
                <div className="timer-info">
                  <h3>Count Down</h3>
                  <p className={timeLeft <= 10 ? 'warning' : ''}>{formatTime()}</p>
                </div>
              </div>

              {/* Color Betting */}
              <div className="color-grid">
                {betOptions.map(option => (
                  <button
                    key={option.id}
                    className="color-btn"
                    style={{ backgroundColor: option.color }}
                    onClick={() => openBetModal('color', option.id)}
                    disabled={timeLeft <= 10}
                  >
                    {option.name}
                    <div className="multiplier">{option.multiplier}x</div>
                  </button>
                ))}
              </div>

              {/* Number Betting */}
              <div className="number-grid">
                {numbers.map(num => (
                  <button
                    key={num}
                    className="number-btn"
                    style={{ background: getNumberColor(num) }}
                    onClick={() => openBetModal('number', num)}
                    disabled={timeLeft <= 10}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Current Bets */}
              {currentBets.length > 0 && (
                <div className="current-bets">
                  <h4>Current Bets:</h4>
                  <div className="bet-tags">
                    {currentBets.map((bet, idx) => (
                      <div key={idx} className="bet-tag">
                        {bet.type === 'color' ? bet.value : `Number ${bet.value}`}: ₹{bet.amount}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="stats-grid">
              <div className="stat-card">
                <Trophy size={24} color="#fbbf24" />
                <div className="value">₹{totalWin.toLocaleString('en-IN')}</div>
                <div className="label">Total Win</div>
              </div>
              <div className="stat-card">
                <Award size={24} color="#60a5fa" />
                <div className="value">{totalBetsCount}</div>
                <div className="label">Total Bets</div>
              </div>
              <div className="stat-card">
                <Gift size={24} color="#ec4899" />
                <div className="value">0</div>
                <div className="label">Bonus</div>
              </div>
            </div>
          </div>
        )}

        {/* Win Tab */}
        {activeTab === 'win' && (
          <div className="win-tab">
            <div className="game-card">
              <h2 style={{ fontSize: '24px', marginBottom: '20px' }}>
                <History style={{ marginRight: '8px' }} />
                Game Records
              </h2>
              <div className="history-list">
                {gameHistory.map((item, idx) => (
                  <div key={idx} className="history-item">
                    <div className="history-header">
                      <span>Period: {item.period}</span>
                      <span>{item.time}</span>
                    </div>
                    <div className="history-content">
                      <div 
                        className="result-box" 
                        style={{ background: item.color }}
                      >
                        {item.result}
                      </div>
                      <div className={`win-amount ${item.winAmount > 0 ? 'positive' : 'negative'}`}>
                        <div className="amount">
                          {item.winAmount > 0 ? '+' : '-'}₹{Math.abs(item.winAmount > 0 ? item.winAmount : item.betAmount).toFixed(2)}
                        </div>
                        <div className="label">{item.winAmount > 0 ? 'Won' : 'Lost'}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Tab */}
        {activeTab === 'my' && (
          <div className="my-tab">
            <div className="game-card">
              <div className="profile-section">
                <div className="profile-avatar">
                  <User size={32} />
                </div>
                <div className="profile-info">
                  <h2>{user?.username || 'Player'}</h2>
                  <p>{user?.email || 'Player Email'}</p>
                  {user?.whatsappNumber && <p style={{ fontSize: '12px' }}>📱 {user.whatsappNumber}</p>}
                </div>
              </div>

              <div className="menu-list">
                <div className="menu-item" onClick={() => showAlertMessage('Wallet feature coming soon!')}>
                  <div className="menu-item-left">
                    <Wallet size={20} />
                    <span>Wallet</span>
                  </div>
                  <span style={{ color: '#22c55e', fontWeight: 'bold' }}>
                    ₹{balance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="menu-item" onClick={() => showAlertMessage('Transaction history coming soon!')}>
                  <div className="menu-item-left">
                    <History size={20} />
                    <span>Transaction History</span>
                  </div>
                </div>

                <div className="menu-item" onClick={() => showAlertMessage('Invite friends feature coming soon!')}>
                  <div className="menu-item-left">
                    <Users size={20} />
                    <span>Invite Friends</span>
                  </div>
                </div>

                <div className="menu-item" onClick={() => showAlertMessage('Rewards coming soon!')}>
                  <div className="menu-item-left">
                    <Gift size={20} />
                    <span>Rewards</span>
                  </div>
                </div>

                <div className="menu-item" onClick={() => showAlertMessage('Settings coming soon!')}>
                  <div className="menu-item-left">
                    <Settings size={20} />
                    <span>Settings</span>
                  </div>
                </div>

                <div 
                  className="menu-item logout" 
                  onClick={handleLogout}
                >
                  <div className="menu-item-left">
                    <LogOut size={20} />
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bet Modal */}
      {showBetModal && (
        <div className="modal show" onClick={() => setShowBetModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Select Amount</h3>
            <div className="amount-grid">
              {quickAmounts.map(amount => (
                <button
                  key={amount}
                  className={`amount-btn ${betAmount === amount ? 'selected' : ''}`}
                  onClick={() => setBetAmount(amount)}
                >
                  ₹{amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              className="custom-input"
              value={betAmount}
              onChange={e => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
              placeholder="Enter custom amount"
              min="10"
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowBetModal(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmBet}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button 
          className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <Home size={24} />
          <span>Home</span>
        </button>
        
        <button 
          className={`nav-btn ${activeTab === 'win' ? 'active' : ''}`}
          onClick={() => setActiveTab('win')}
        >
          <TrendingUp size={24} />
          <span>Win</span>
        </button>
        
        <button 
          className={`nav-btn ${activeTab === 'my' ? 'active' : ''}`}
          onClick={() => setActiveTab('my')}
        >
          <User size={24} />
          <span>My</span>
        </button>
      </div>
    </div>
  );
};

export default VyFunGame;
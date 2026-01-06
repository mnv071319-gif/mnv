import React, { useState, useEffect } from 'react';
import { Home, TrendingUp, Wallet, User, Gift, Trophy, Clock, Award, History, LogOut, Settings, CreditCard, Users, Bell } from 'lucide-react';

const VyFunPlatform = () => {
  const [balance, setBalance] = useState(10000);
  const [betAmount, setBetAmount] = useState(10);
  const [selectedBet, setSelectedBet] = useState(null);
  const [timeLeft, setTimeLeft] = useState(180);
  const [period, setPeriod] = useState(20250105001);
  const [gameHistory, setGameHistory] = useState([]);
  const [currentBets, setCurrentBets] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [message, setMessage] = useState('');
  const [showBetModal, setShowBetModal] = useState(false);
  const [winBalance, setWinBalance] = useState(0);
  const [totalBets, setTotalBets] = useState(0);

  const betOptions = [
    { id: 'green', name: 'Green', color: 'bg-green-500', multiplier: 2, numbers: [0, 5] },
    { id: 'violet', name: 'Violet', color: 'bg-purple-500', multiplier: 4.5, numbers: [0, 2, 4, 6, 8] },
    { id: 'red', name: 'Red', color: 'bg-red-500', multiplier: 2, numbers: [1, 3, 5, 7, 9] },
  ];

  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const getNumberColor = (num) => {
    if ([0].includes(num)) return 'bg-gradient-to-br from-purple-500 to-green-500';
    if ([5].includes(num)) return 'bg-gradient-to-br from-red-500 to-green-500';
    if ([1, 3, 7, 9].includes(num)) return 'bg-red-500';
    if ([2, 4, 6, 8].includes(num)) return 'bg-purple-500';
    return 'bg-green-500';
  };

  const getSriLankaTime = () => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          processRound();
          return 180;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentBets]);

  const canPlaceBet = () => timeLeft > 10;

  const processRound = () => {
    const result = Math.floor(Math.random() * 10);
    const resultTime = getSriLankaTime().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });

    let winnings = 0;
    let totalBetAmount = 0;

    currentBets.forEach(bet => {
      totalBetAmount += bet.amount;
      if (bet.type === 'number' && bet.value === result) {
        winnings += bet.amount * 9;
      } else if (bet.type === 'color') {
        const option = betOptions.find(o => o.id === bet.value);
        if (option.numbers.includes(result)) {
          winnings += bet.amount * option.multiplier;
        }
      }
    });

    if (winnings > 0) {
      setBalance(prev => prev + winnings);
      setWinBalance(prev => prev + winnings);
      setMessage(`🎉 Congratulations! You won ₹${winnings.toFixed(2)}`);
    } else if (currentBets.length > 0) {
      setMessage('😔 Better luck next time!');
    }

    setGameHistory(prev => [
      { 
        period: period, 
        number: result, 
        size: result >= 5 ? 'Big' : 'Small',
        color: getNumberColor(result),
        time: resultTime,
        winnings,
        betAmount: totalBetAmount
      },
      ...prev.slice(0, 9)
    ]);

    setPeriod(prev => prev + 1);
    setTotalBets(prev => prev + currentBets.length);
    setCurrentBets([]);
    setTimeout(() => setMessage(''), 4000);
  };

  const openBetModal = (type, value) => {
    if (!canPlaceBet()) {
      setMessage('⏰ Betting time is over! Wait for next round');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    setSelectedBet({ type, value });
    setShowBetModal(true);
  };

  const confirmBet = () => {
    if (balance < betAmount) {
      setMessage('⚠️ Insufficient balance!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setBalance(prev => prev - betAmount);
    setCurrentBets(prev => [...prev, { 
      type: selectedBet.type, 
      value: selectedBet.value, 
      amount: betAmount 
    }]);
    setMessage(`✅ Bet placed successfully! ₹${betAmount}`);
    setShowBetModal(false);
    setTimeout(() => setMessage(''), 2000);
  };

  const quickAmounts = [10, 50, 100, 500, 1000, 5000];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 flex justify-between items-center">
        <div className="text-white text-xl font-bold">VyFun</div>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-white" />
          <CreditCard className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-6">
        <div className="flex justify-between items-center text-white">
          <div>
            <div className="text-sm opacity-90">Total Balance</div>
            <div className="text-3xl font-bold">₹{balance.toFixed(2)}</div>
          </div>
          <div className="flex gap-2">
            <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur text-sm font-semibold hover:bg-opacity-30 transition">
              Deposit
            </button>
            <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur text-sm font-semibold hover:bg-opacity-30 transition">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl text-center font-semibold animate-pulse shadow-lg">
          {message}
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 py-6 pb-24">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <>
            {/* Timer & Period */}
            <div className="bg-gray-900 bg-opacity-50 backdrop-blur rounded-2xl p-6 mb-4 border border-purple-500">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-gray-400 text-sm">Period</div>
                  <div className="text-white text-xl font-bold">{period}</div>
                </div>
                <div className="text-right">
                  <div className="text-gray-400 text-sm">Count Down</div>
                  <div className={`text-3xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                </div>
              </div>
              
              {/* Color Betting */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {betOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => openBetModal('color', option.id)}
                    disabled={!canPlaceBet()}
                    className={`${option.color} text-white font-bold py-8 rounded-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg`}
                  >
                    <div className="text-xl">{option.name}</div>
                    <div className="text-sm mt-1">{option.multiplier}x</div>
                  </button>
                ))}
              </div>

              {/* Number Betting */}
              <div className="grid grid-cols-5 gap-2">
                {numbers.map(num => (
                  <button
                    key={num}
                    onClick={() => openBetModal('number', num)}
                    disabled={!canPlaceBet()}
                    className={`${getNumberColor(num)} text-white font-bold py-6 rounded-xl hover:opacity-90 transition-all transform hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg`}
                  >
                    <div className="text-2xl">{num}</div>
                  </button>
                ))}
              </div>

              {/* Current Bets Display */}
              {currentBets.length > 0 && (
                <div className="mt-4 p-4 bg-purple-900 bg-opacity-30 rounded-xl">
                  <div className="text-white text-sm font-semibold mb-2">Current Bets:</div>
                  <div className="flex flex-wrap gap-2">
                    {currentBets.map((bet, idx) => (
                      <div key={idx} className="bg-gray-800 px-3 py-1 rounded-full text-white text-xs">
                        {bet.type === 'color' ? bet.value : `#${bet.value}`} - ₹{bet.amount}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-900 bg-opacity-50 backdrop-blur rounded-xl p-4 border border-purple-500 text-center">
                <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">₹{winBalance.toFixed(0)}</div>
                <div className="text-xs text-gray-400">Total Win</div>
              </div>
              <div className="bg-gray-900 bg-opacity-50 backdrop-blur rounded-xl p-4 border border-purple-500 text-center">
                <Award className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{totalBets}</div>
                <div className="text-xs text-gray-400">Total Bets</div>
              </div>
              <div className="bg-gray-900 bg-opacity-50 backdrop-blur rounded-xl p-4 border border-purple-500 text-center">
                <Gift className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">0</div>
                <div className="text-xs text-gray-400">Bonus</div>
              </div>
            </div>
          </>
        )}

        {/* My Tab */}
        {activeTab === 'my' && (
          <div className="space-y-4">
            <div className="bg-gray-900 bg-opacity-50 backdrop-blur rounded-2xl p-6 border border-purple-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="text-white text-xl font-bold">Player ID: #{Math.floor(Math.random() * 100000)}</div>
                  <div className="text-gray-400 text-sm">VIP Level 1</div>
                </div>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl flex items-center justify-between transition">
                  <span className="flex items-center gap-3">
                    <Wallet className="w-5 h-5" />
                    Wallet
                  </span>
                  <span className="text-green-400 font-bold">₹{balance.toFixed(2)}</span>
                </button>

                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl flex items-center justify-between transition">
                  <span className="flex items-center gap-3">
                    <History className="w-5 h-5" />
                    Transaction History
                  </span>
                </button>

                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl flex items-center justify-between transition">
                  <span className="flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    Invite Friends
                  </span>
                </button>

                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl flex items-center justify-between transition">
                  <span className="flex items-center gap-3">
                    <Gift className="w-5 h-5" />
                    Rewards
                  </span>
                </button>

                <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl flex items-center justify-between transition">
                  <span className="flex items-center gap-3">
                    <Settings className="w-5 h-5" />
                    Settings
                  </span>
                </button>

                <button className="w-full bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition">
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Win Tab */}
        {activeTab === 'win' && (
          <div className="bg-gray-900 bg-opacity-50 backdrop-blur rounded-2xl p-6 border border-purple-500">
            <h2 className="text-white text-2xl font-bold mb-6 flex items-center gap-2">
              <History className="w-6 h-6" />
              Game Records
            </h2>
            
            <div className="space-y-3">
              {gameHistory.map((item, idx) => (
                <div key={idx} className="bg-gray-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-gray-400 text-sm">Period: {item.period}</div>
                    <div className="text-gray-400 text-sm">{item.time}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg`}>
                        {item.number}
                      </div>
                      <div>
                        <div className="text-white font-semibold">{item.size}</div>
                        <div className="text-gray-400 text-xs">Result</div>
                      </div>
                    </div>
                    
                    {item.winnings > 0 ? (
                      <div className="text-right">
                        <div className="text-green-400 font-bold text-lg">+₹{item.winnings.toFixed(2)}</div>
                        <div className="text-gray-400 text-xs">Won</div>
                      </div>
                    ) : item.betAmount > 0 ? (
                      <div className="text-right">
                        <div className="text-red-400 font-bold text-lg">-₹{item.betAmount.toFixed(2)}</div>
                        <div className="text-gray-400 text-xs">Lost</div>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bet Modal */}
      {showBetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-purple-500">
            <h3 className="text-white text-xl font-bold mb-4">Select Amount</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              {quickAmounts.map(amt => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  className={`py-3 rounded-xl font-bold transition ${
                    betAmount === amt
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <label className="text-gray-400 text-sm mb-2 block">Custom Amount</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBetModal(false)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmBet}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white py-3 rounded-xl font-bold transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-purple-500 backdrop-blur-lg">
        <div className="grid grid-cols-3 max-w-lg mx-auto">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-4 flex flex-col items-center gap-1 transition ${
              activeTab === 'home' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs font-semibold">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('win')}
            className={`py-4 flex flex-col items-center gap-1 transition ${
              activeTab === 'win' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs font-semibold">Win</span>
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`py-4 flex flex-col items-center gap-1 transition ${
              activeTab === 'my' ? 'text-purple-400' : 'text-gray-400'
            }`}
          >
            <User className="w-6 h-6" />
            <span className="text-xs font-semibold">My</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VyFunPlatform;
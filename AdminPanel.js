// src/components/AdminPanel.js (තාවකාලික වෙනස් කිරීම)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  Users, 
  Download, 
  Trash2, 
  LogOut, 
  Home,
  BarChart,
  DollarSign,
  Calendar
} from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const navigate = useNavigate();

  // Mock data for testing
  useEffect(() => {
    setUsers([
      {
        id: '1',
        uid: 'user123',
        email: 'test@example.com',
        username: 'testuser',
        whatsappNumber: '94771234567',
        balance: 10000,
        totalBets: 10,
        totalWins: 5000,
        formattedDate: '2024-01-01',
        lastLoginFormatted: '2024-01-01 10:00'
      },
      {
        id: '2',
        uid: 'user456',
        email: 'admin@vyfun.com',
        username: 'admin',
        whatsappNumber: '94777654321',
        balance: 50000,
        totalBets: 50,
        totalWins: 25000,
        formattedDate: '2024-01-02',
        lastLoginFormatted: '2024-01-02 12:00'
      }
    ]);
  }, []);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.whatsappNumber?.includes(searchTerm) ||
    user.uid?.includes(searchTerm)
  );

  // Export to Excel
  const exportToExcel = () => {
    if (users.length === 0) {
      alert('No users to export!');
      return;
    }

    try {
      // Format data for Excel
      const excelData = users.map(user => ({
        'User ID': user.uid,
        'Email': user.email,
        'Username': user.username || 'N/A',
        'WhatsApp': user.whatsappNumber || 'N/A',
        'Balance': `₹${user.balance?.toLocaleString() || '0'}`,
        'Total Bets': user.totalBets || 0,
        'Total Wins': `₹${user.totalWins?.toLocaleString() || '0'}`,
        'Signup Date': user.formattedDate,
        'Last Login': user.lastLoginFormatted,
        'Status': 'Active'
      }));

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const colWidths = [
        { wch: 30 }, // User ID
        { wch: 25 }, // Email
        { wch: 15 }, // Username
        { wch: 15 }, // WhatsApp
        { wch: 12 }, // Balance
        { wch: 10 }, // Total Bets
        { wch: 12 }, // Total Wins
        { wch: 12 }, // Signup Date
        { wch: 20 }, // Last Login
        { wch: 10 }  // Status
      ];
      worksheet['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'VyFun Users');
      
      const excelBuffer = XLSX.write(workbook, { 
        bookType: 'xlsx', 
        type: 'array' 
      });
      
      const data = new Blob([excelBuffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `VyFun_Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);
      
      alert(`✅ Exported ${users.length} users to Excel!`);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Error exporting to Excel: ' + error.message);
    }
  };

  // Handle user selection
  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(user => user.id));
    }
  };

  // Calculate statistics
  const totalBalance = users.reduce((sum, user) => sum + (user.balance || 0), 0);
  const totalBets = users.reduce((sum, user) => sum + (user.totalBets || 0), 0);
  const totalWins = users.reduce((sum, user) => sum + (user.totalWins || 0), 0);

  const handleLogout = async () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Admin Panel...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Admin Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1><Users size={32} /> VyFun Admin Panel</h1>
          <p>Total Users: <span className="count">{users.length}</span></p>
        </div>
        <div className="admin-header-right">
          <button onClick={() => navigate('/game')} className="admin-btn">
            <Home size={20} /> Game
          </button>
          <button onClick={handleLogout} className="admin-btn logout">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid admin-stats">
        <div className="stat-card">
          <DollarSign size={28} color="#22c55e" />
          <div className="value">₹{totalBalance.toLocaleString('en-IN')}</div>
          <div className="label">Total Balance</div>
        </div>
        <div className="stat-card">
          <BarChart size={28} color="#3b82f6" />
          <div className="value">{totalBets.toLocaleString('en-IN')}</div>
          <div className="label">Total Bets</div>
        </div>
        <div className="stat-card">
          <DollarSign size={28} color="#10b981" />
          <div className="value">₹{totalWins.toLocaleString('en-IN')}</div>
          <div className="label">Total Wins</div>
        </div>
        <div className="stat-card">
          <Calendar size={28} color="#8b5cf6" />
          <div className="value">{users.length}</div>
          <div className="label">Active Users</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by email, username, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="action-buttons">
          <button onClick={exportToExcel} className="action-btn export">
            <Download size={18} /> Export Excel
          </button>
          <button onClick={() => alert('Delete feature is disabled for testing')} 
                  className="action-btn delete" 
                  disabled={selectedUsers.length === 0}>
            <Trash2 size={18} /> Delete Selected ({selectedUsers.length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>User ID</th>
              <th>Email</th>
              <th>Username</th>
              <th>WhatsApp</th>
              <th>Balance</th>
              <th>Total Bets</th>
              <th>Total Wins</th>
              <th>Signup Date</th>
              <th>Last Login</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className={selectedUsers.includes(user.id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                    />
                  </td>
                  <td className="user-id">{user.uid?.substring(0, 8)}...</td>
                  <td className="email">{user.email}</td>
                  <td>{user.username || 'N/A'}</td>
                  <td>{user.whatsappNumber || 'N/A'}</td>
                  <td className="balance">₹{user.balance?.toLocaleString('en-IN') || '0'}</td>
                  <td>{user.totalBets || 0}</td>
                  <td className="wins">₹{user.totalWins?.toLocaleString('en-IN') || '0'}</td>
                  <td>{user.formattedDate}</td>
                  <td>{user.lastLoginFormatted}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="summary-bar">
        <p>
          Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> users | 
          Selected: <strong>{selectedUsers.length}</strong> users | 
          Total Balance: <strong>₹{totalBalance.toLocaleString('en-IN')}</strong>
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
// src/components/ChronoTracker.jsx

import React, { useState, useEffect } from 'react';
import './ChronoTracker.css';

const ChronoTracker = () => {
  // --- STATE MANAGEMENT WITH LOCAL STORAGE ---
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('chronoLogs');
    return savedLogs ? JSON.parse(savedLogs) : [];
  });

  const [activeSession, setActiveSession] = useState(() => {
    const savedSession = localStorage.getItem('chronoActiveSession');
    return savedSession ? JSON.parse(savedSession) : null;
  }); 

  const [isLightMode, setIsLightMode] = useState(() => {
    const savedTheme = localStorage.getItem('chronoTheme');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // NEW: State to track if we are in true Fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [customInput, setCustomInput] = useState('');
  const [now, setNow] = useState(Date.now());

  // --- LOCAL STORAGE EFFECTS ---
  useEffect(() => localStorage.setItem('chronoLogs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('chronoActiveSession', JSON.stringify(activeSession)), [activeSession]);
  useEffect(() => localStorage.setItem('chronoTheme', JSON.stringify(isLightMode)), [isLightMode]);

  // --- LIFECYCLE HOOKS ---
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // NEW: Effect to listen for fullscreen changes (like pressing ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // --- FULLSCREEN LOGIC ---
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn(`Error attempting to enable fullscreen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // --- LOGGING FUNCTIONS ---
  const addBasicLog = (code) => {
    const finalCode = customInput.trim() ? `${code} - ${customInput.trim()}` : code;
    
    const newLog = {
      id: crypto.randomUUID(), 
      code: finalCode,
      category: code, 
      timestamp: Date.now(),
      type: 'basic',
      editCount: 0,
      originalTime: null,
    };
    setLogs((prev) => [...prev, newLog]);
    setCustomInput(''); 
  };

  const handleQuickAction = (code) => {
    const note = customInput.trim() ? ` - ${customInput.trim()}` : '';
    
    if (activeSession) {
      if (activeSession.code === code) {
        const newLog = {
          id: crypto.randomUUID(),
          code: `${code}${note} (End)`,
          category: code, 
          timestamp: Date.now(),
          type: 'session-end',
          sessionId: activeSession.sessionId,
          editCount: 0,
          originalTime: null,
        };
        setLogs((prev) => [...prev, newLog]);
        setActiveSession(null); 
        setCustomInput(''); 
      } else {
        alert(`You are currently logged out for '${activeSession.code}'. Finish that session before going into '${code}'`);
      }
    } else {
      const sessionId = crypto.randomUUID();
      setActiveSession({ code, sessionId });
      const newLog = {
        id: crypto.randomUUID(),
        code: `${code}${note} (Start)`,
        category: code, 
        timestamp: Date.now(),
        type: 'session-start',
        sessionId: sessionId,
        editCount: 0,
        originalTime: null,
      };
      setLogs((prev) => [...prev, newLog]);
      setCustomInput(''); 
    }
  };

  const handleCustomSubmit = (e) => {
    if (e.key === 'Enter' && customInput.trim() !== '') {
      const newLog = {
        id: crypto.randomUUID(),
        code: customInput.trim(),
        category: 'Custom',
        timestamp: Date.now(),
        type: 'basic',
        editCount: 0,
        originalTime: null,
      };
      setLogs((prev) => [...prev, newLog]);
      setCustomInput('');
    }
  };

  // --- EDITING LOGIC ---
  const editLogText = (id) => {
    const log = logs.find((l) => l.id === id);
    if (!log) return;
    const newCode = window.prompt("Edit your log text:", log.code);
    if (newCode && newCode.trim() !== "") {
      setLogs((prev) => prev.map((l) => l.id === id ? { ...l, code: newCode.trim() } : l));
    }
  };

  const editLogTime = (id) => {
    const log = logs.find((l) => l.id === id);
    if (!log) return;
    
    if (log.editCount >= 2) {
      alert("Maximum of two time edits allowed! We aren't running a time machine here!");
      return;
    }

    const currentDate = new Date(log.timestamp);
    const currentHours = String(currentDate.getHours()).padStart(2, '0');
    const currentMinutes = String(currentDate.getMinutes()).padStart(2, '0');
    
    const newTimeStr = window.prompt(
      "Enter new time in 24-hour format (HH:MM):", 
      `${currentHours}:${currentMinutes}`
    );
    
    if (newTimeStr) {
      const [hours, minutes] = newTimeStr.split(':');
      if (hours && minutes && !isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const newTimestamp = new Date(currentDate).setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
        
        setLogs((prev) => prev.map((l) => {
          if (l.id === id) {
            return {
              ...l,
              timestamp: newTimestamp,
              originalTime: l.originalTime || l.timestamp,
              editCount: l.editCount + 1
            };
          }
          return l;
        }));
      } else {
        alert("That's an invalid time format. Please use HH:MM (e.g., 14:30).");
      }
    }
  };

  // --- DELETION & EXPORTING ---
  const deleteLog = (id) => {
    if (window.confirm("Are you absolutely sure you want to delete this punch? It will be gone forever!")) {
      setLogs((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const clearLogs = () => {
    if (window.confirm("Nuke all logs? You can't undo this!")) {
      setLogs([]);
      setActiveSession(null); 
    }
  };

  const handleExport = () => {
    if (logs.length === 0) {
      alert("There is nothing to export. Log some time first!");
      return;
    }

    let fileContent = "Chrono Tracker Logs\n";
    fileContent += `Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n`;
    fileContent += "===================================\n\n";

    logs.forEach(log => {
      const timeString = formatTimestamp(log.timestamp);
      fileContent += `[${timeString}] ${log.code}`;
      if (log.originalTime) {
        const origTimeStr = formatTimestamp(log.originalTime);
        fileContent += ` (Edited, originally: ${origTimeStr})`;
      }
      fileContent += "\n";
    });

    fileContent += "\n===================================\n";
    fileContent += "TOTALS:\n";
    const currentTotals = calculateTotals();
    
    Object.entries(currentTotals).forEach(([code, ms]) => {
      fileContent += `${code}: ${formatDuration(ms)}\n`;
    });

    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chrono_Logs_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- CALCULATION HELPERS ---
  const calculateTotals = () => {
    const trackedCodes = ['Case Notes', 'USB/RR', 'IT Issues', 'Meeting', 'Training', 'Outbound Call'];
    const totals = trackedCodes.reduce((acc, code) => ({ ...acc, [code]: 0 }), {});

    const startLogs = logs.filter(l => l.type === 'session-start');
    
    startLogs.forEach(startLog => {
      const baseCode = startLog.category || startLog.code.replace(' (Start)', '').split(' - ')[0];
      
      if (trackedCodes.includes(baseCode)) {
        const endLog = logs.find(l => l.sessionId === startLog.sessionId && l.type === 'session-end');
        const endTime = endLog ? endLog.timestamp : now;
        totals[baseCode] += Math.max(0, endTime - startLog.timestamp);
      }
    });

    return totals;
  };

  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const formatTimestamp = (ts) => {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const totals = calculateTotals();

  return (
    <div className={`chrono-tracker-wrapper ${isLightMode ? 'light-theme' : ''}`}>
      <div className="control-panel">
        <div className="header">
          <h2>Chrono Tracker</h2>
          <div className="header-actions">
            {/* NEW: The Full Window Toggle Button! */}
            <button className="theme-toggle" onClick={toggleFullScreen}>
              {isFullscreen ? '◫ Exit Full Screen' : '⛶ Full Window'}
            </button>
            <button className="theme-toggle" onClick={() => setIsLightMode(!isLightMode)}>
              {isLightMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </button>
          </div>
        </div>

        <input 
          type="text" 
          placeholder="Type a custom code or note..." 
          className="custom-input"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleCustomSubmit}
        />

        <div className="auth-buttons">
          <button onClick={() => addBasicLog('Log In')}>Log In</button>
          <button onClick={() => addBasicLog('Log Out')}>Log Out</button>
        </div>

        <h3 className="section-title">Quick Actions</h3>
        
        <div className="quick-actions-grid">
          {['Break 1', 'Lunch', 'Break 2', 'USB/RR', 'Training', 'Meeting', 'IT Issues', 'Case Notes', 'Outbound Call'].map(code => {
            const isActive = activeSession?.code === code;
            return (
              <button 
                key={code}
                onClick={() => handleQuickAction(code)}
                className={isActive ? 'active-session-btn' : ''}
              >
                {isActive ? `End ${code}` : code}
              </button>
            );
          })}
        </div>

        <div className="totals-display">
          <h4>Active Totals</h4>
          <ul>
            <li>Case Notes: <span>{formatDuration(totals['Case Notes'])}</span></li>
            <li>Outbound Call: <span>{formatDuration(totals['Outbound Call'])}</span></li>
            <li>USB/RR: <span>{formatDuration(totals['USB/RR'])}</span></li>
            <li>IT Issues: <span>{formatDuration(totals['IT Issues'])}</span></li>
            <li>Meeting: <span>{formatDuration(totals['Meeting'])}</span></li>
            <li>Training: <span>{formatDuration(totals['Training'])}</span></li>
          </ul>
        </div>

        <div className="footer-actions">
          <button className="export-btn" onClick={handleExport}>Export to .TXT</button>
          <button className="clear-btn" onClick={clearLogs}>Clear Logs</button>
        </div>
      </div>

      <div className="log-panel">
        <div className="date-header">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        
        <div className="log-entries">
          {logs.length === 0 ? (
            <p className="empty-state">No logs yet. Better get to work!</p>
          ) : (
            <ul>
              {logs.map((log) => {
                const isSession = log.type === 'session-start' || log.type === 'session-end';
                return (
                  <li key={log.id} className={`log-item ${isSession ? 'session-linked' : ''}`}>
                    <div className="log-info">
                        <span className="log-time">{formatTimestamp(log.timestamp)}</span>
                        <span className="log-code">{log.code}</span>
                        
                        {log.originalTime && (
                          <span className="time-edit-note">
                            (changed from {formatTimestamp(log.originalTime)})
                          </span>
                        )}
                    </div>
                    
                    <div className="log-actions">
                      <button onClick={() => editLogTime(log.id)} className="time-btn" title="Edit Time">⏱️</button>
                      <button onClick={() => editLogText(log.id)} className="edit-btn">Edit</button>
                      <button onClick={() => deleteLog(log.id)} className="delete-btn">X</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChronoTracker;
import React, { useState, useEffect, useRef } from 'react';
import './ChronoTracker.css';

const ChronoTracker = () => {
    // --- STATE MANAGEMENT ---
    // Initialize logs from localStorage, or default to an empty array
    const [logs, setLogs] = useState(() => {
        const savedLogs = localStorage.getItem('chriscamChronoLogs');
        return savedLogs ? JSON.parse(savedLogs) : [];
    });

    // NEW: Track the currently active quick-action code. 
    // Pulls from localStorage so a cheeky page refresh doesn't wipe your active status!
    const [activeAction, setActiveAction] = useState(() => {
        return localStorage.getItem('chronoActiveAction') || null;
    });

    const [inputValue, setInputValue] = useState("");
    const [isDarkMode, setIsDarkMode] = useState(true);
    const logsEndRef = useRef(null);

    // --- SIDE EFFECTS ---
    // Sync logs to local storage
    useEffect(() => {
        localStorage.setItem('chriscamChronoLogs', JSON.stringify(logs));
    }, [logs]);

    // NEW: Sync the active action state to local storage
    useEffect(() => {
        if (activeAction) {
            localStorage.setItem('chronoActiveAction', activeAction);
        } else {
            localStorage.removeItem('chronoActiveAction');
        }
    }, [activeAction]);

    // Auto-scroll to the newest log entry
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // --- CORE LOGIC ---
    // The master function for creating a new timestamp entry
    const logEvent = (type, defaultComment = "") => {
        const timeString = new Date().toLocaleTimeString('en-US', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        
        const commentToLog = inputValue.trim() !== "" ? inputValue.trim() : defaultComment;

        const newLog = {
            id: Date.now(), 
            type: type,
            time: timeString,
            comment: commentToLog
        };

        setLogs([...logs, newLog]);
        setInputValue(""); 
    };

    // --- BUTTON HANDLERS (The New Babysitters) ---
    // Handles clicks on the standard Log In button
    const handleStandardLogin = () => {
        if (activeAction) {
            // Yell at the user for trying to bypass the active code
            alert(`Warning! You are currently clocked out for [${activeAction.split(' - ')[0]}]. Click the active flashing button to log back in properly!`);
        } else {
            logEvent('Login', 'Session Start');
        }
    };

    // Handles clicks on our Quick Action buttons
    const handleQuickAction = (type, defaultComment) => {
        if (activeAction === defaultComment) {
            // If the clicked button is the currently active one, log a return event and clear the state
            logEvent('Login', `Returned from ${defaultComment.split(' - ')[0]}`);
            setActiveAction(null);
        } else if (activeAction !== null) {
            // If they try to click a DIFFERENT quick action while one is already active
            alert(`Hold your horses! You're already clocked out for [${activeAction.split(' - ')[0]}]. You must return from that first before starting something else.`);
        } else {
            // Standard departure: log the event and set the button as active
            logEvent(type, defaultComment);
            setActiveAction(defaultComment);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            logEvent('Custom');
        }
    };

    const clearLogs = () => {
        if (window.confirm("Are you entirely sure you want to bin today's logs? This cannot be undone!")) {
            setLogs([]);
            setActiveAction(null); // Also clear any stuck active states just in case
        }
    };

    // --- EXPORT LOGIC ---
    const exportLogs = () => {
        if (logs.length === 0) {
            alert("Nothing to export yet, mate. Log some times first!");
            return;
        }

        let textContent = "Chrono Tracker - Shift Logs\n=================================\n\n";
        logs.forEach(log => {
            textContent += `[${log.type.toUpperCase()}] ${log.time} - Note: ${log.comment || 'N/A'}\n`;
        });

        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10); 
        const timeStr = now.toTimeString().slice(0, 5).replace(':', ''); 
        const fileName = `ChronoTracker_Logs_${dateStr}_${timeStr}.txt`;

        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- RENDER LOGIC ---
    // Stitches departure and return codes together visually
    const renderLogs = () => {
        const displayElements = [];
        
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            
            const isDeparture = !['Login', 'Notes', 'Custom'].includes(log.type);
            const hasNextLogin = i + 1 < logs.length && logs[i + 1].type === 'Login';

            if (isDeparture && hasNextLogin) {
                const returnLog = logs[i + 1];
                displayElements.push(
                    <div key={`group-${log.id}`} className="log-group">
                        <div className="log-entry grouped-entry">
                            <span className="log-time">{log.time}</span>
                            <span className="log-type">[{log.type}]</span>
                            <span className="log-comment">{log.comment} (Out)</span>
                        </div>
                        <div className="log-connection">⮑</div>
                        <div className="log-entry grouped-entry">
                            <span className="log-time">{returnLog.time}</span>
                            <span className="log-type">[Login]</span>
                            <span className="log-comment">{returnLog.comment || 'Session Resumed'} (In)</span>
                        </div>
                    </div>
                );
                i++; 
            } else {
                displayElements.push(
                    <div key={log.id} className={`log-entry type-${log.type.toLowerCase()}`}>
                        <span className="log-time">{log.time}</span>
                        <span className="log-type">[{log.type}]</span>
                        <span className="log-comment">{log.comment}</span>
                    </div>
                );
            }
        }
        return displayElements;
    };

    const todayStr = new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
    });

    return (
        <div className={`chrono-wrapper ${isDarkMode ? 'dark' : 'light'}`}>
            <header className="chrono-header">
                <h1>Chrono Tracker</h1>
                <button className="theme-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                    {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </header>

            <main className="chrono-main">
                <section className="chrono-controls">
                    <input 
                        type="text" 
                        className="chrono-input" 
                        placeholder="Type a custom code or note..." 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    
                    <div className="button-group standard-actions">
                        <button onClick={handleStandardLogin}>Log In</button>
                        <button onClick={() => logEvent('Logout', 'Session End')}>Log Out</button>
                    </div>

                    <h3 className="section-title">Quick Actions</h3>
                    <div className="button-group quick-actions">
                        <button 
                            className={activeAction === 'BR1 - First Break' ? 'active-action' : ''} 
                            onClick={() => handleQuickAction('Break', 'BR1 - First Break')}
                        >
                            {activeAction === 'BR1 - First Break' ? '🔴 Break 1 (Active)' : 'Break 1'}
                        </button>
                        <button 
                            className={activeAction === 'LUN - Lunch' ? 'active-action' : ''}
                            onClick={() => handleQuickAction('Lunch', 'LUN - Lunch')}
                        >
                            {activeAction === 'LUN - Lunch' ? '🔴 Lunch (Active)' : 'Lunch'}
                        </button>
                        <button 
                            className={activeAction === 'BR2 - Last Break' ? 'active-action' : ''}
                            onClick={() => handleQuickAction('Break', 'BR2 - Last Break')}
                        >
                            {activeAction === 'BR2 - Last Break' ? '🔴 Break 2 (Active)' : 'Break 2'}
                        </button>
                        <button 
                            className={activeAction === 'USB/RR - Unscheduled/Restroom' ? 'active-action' : ''}
                            onClick={() => handleQuickAction('Restroom', 'USB/RR - Unscheduled/Restroom')}
                        >
                            {activeAction === 'USB/RR - Unscheduled/Restroom' ? '🔴 USB/RR (Active)' : 'USB/RR'}
                        </button>
                        <button 
                            className={activeAction === 'TRA - Training' ? 'active-action' : ''}
                            onClick={() => handleQuickAction('Training', 'TRA - Training')}
                        >
                            {activeAction === 'TRA - Training' ? '🔴 Training (Active)' : 'Training'}
                        </button>
                        <button 
                            className={activeAction === 'MEE - Meeting' ? 'active-action' : ''}
                            onClick={() => handleQuickAction('Meeting', 'MEE - Meeting')}
                        >
                            {activeAction === 'MEE - Meeting' ? '🔴 Meeting (Active)' : 'Meeting'}
                        </button>
                        <button 
                            className={activeAction === 'CAN - Case Notes' ? 'active-action' : ''}
                            onClick={() => handleQuickAction('Notes', 'CAN - Case Notes')}
                        >
                            {activeAction === 'CAN - Case Notes' ? '🔴 Case Notes (Active)' : 'Case Notes'}
                        </button>
                    </div>

                    <div className="button-group utility-actions">
                        <button className="btn-export" onClick={exportLogs}>Export to .TXT</button>
                        <button className="btn-clear" onClick={clearLogs}>Clear Logs</button>
                    </div>
                </section>

                <section className="chrono-display">
                    <div className="display-header">
                        <h2>{todayStr}</h2>
                    </div>
                    <div className="logs-container">
                        {logs.length === 0 ? (
                            <p className="empty-state">No logs yet. Better get to work!</p>
                        ) : (
                            renderLogs()
                        )}
                        <div ref={logsEndRef} />
                    </div>
                </section>
            </main>

            <footer className="chrono-footer">
                <p>Designed and Developed by <a href="https://chriscam.pro" target="_blank" rel="noopener noreferrer">Christopher Cameron Tow</a></p>
            </footer>
        </div>
    );
};

export default ChronoTracker;
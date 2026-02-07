import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Award, Download, Bell, TrendingUp, Calendar, DollarSign, CheckCircle, XCircle, User, Briefcase, AlertCircle, LogOut } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    const [isLoaded, setIsLoaded] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState('Not Marked');
    const [employeeData, setEmployeeData] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Get employee ID from localStorage
    const employeeId = localStorage.getItem('userId');

    useEffect(() => {
        // Check if user is authenticated
        const userRole = localStorage.getItem('userRole');
        if (!userRole || userRole !== 'employee') {
            navigate('/');
            return;
        }

        if (!employeeId) {
            navigate('/');
            return;
        }

        setTimeout(() => setIsLoaded(true), 100);
        fetchEmployeeData();
        fetchNotifications();
        checkTodayAttendance();
        
        // Update current time every second
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        
        // Fetch data every 30 seconds
        const dataInterval = setInterval(() => {
            fetchEmployeeData();
            fetchNotifications();
            checkTodayAttendance();
        }, 30000);
        
        return () => {
            clearInterval(timeInterval);
            clearInterval(dataInterval);
        };
    }, [employeeId, navigate]);

    const fetchEmployeeData = async () => {
        try {
            const res = await fetch(`${API_URL}/employees/${employeeId}`);
            if (res.ok) {
                const data = await res.json();
                setEmployeeData(data);
            }
        } catch (error) {
            console.error('Error fetching employee data:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`${API_URL}/notifications/${employeeId}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const checkTodayAttendance = async () => {
        try {
            const res = await fetch(`${API_URL}/attendance/today/${employeeId}`);
            if (res.ok) {
                const data = await res.json();
                
                if (data.status === 'not_marked') {
                    setAttendanceStatus('Not Marked');
                    setTodayAttendance(null);
                } else if (data.status === 'clocked_in') {
                    setAttendanceStatus('Clocked In');
                    setTodayAttendance(data.attendance);
                } else if (data.status === 'clocked_out') {
                    setAttendanceStatus('Clocked Out');
                    setTodayAttendance(data.attendance);
                }
            }
        } catch (error) {
            console.error('Error checking attendance:', error);
        }
    };

    const handleClockIn = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        
        try {
            const res = await fetch(`${API_URL}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    employee_id: employeeId,
                    action: 'check_in'
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setAttendanceStatus('Clocked In');
                setTodayAttendance(data);
                
                const statusMessage = data.is_early ? 'Early Bird! 🎉' : data.is_on_time ? 'Right on Time! ⏰' : 'Late';
                setSuccessMessage(`Successfully clocked in at ${data.check_in_time}! ${statusMessage} You earned ${data.points_earned} points.`);
                
                // Refresh data to show updated points
                setTimeout(() => {
                    fetchEmployeeData();
                    fetchNotifications();
                }, 500);
            } else {
                setErrorMessage(data.error || 'Failed to clock in');
            }
        } catch (error) {
            setErrorMessage('Connection error. Please try again.');
            console.error('Error clocking in:', error);
        }
    };

    const handleClockOut = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        
        try {
            const res = await fetch(`${API_URL}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    employee_id: employeeId,
                    action: 'check_out'
                })
            });
            
            const data = await res.json();
            
            if (res.ok) {
                setAttendanceStatus('Clocked Out');
                setTodayAttendance(data);
                setSuccessMessage(`Successfully clocked out at ${data.check_out_time}!`);
            } else {
                setErrorMessage(data.error || 'Failed to clock out');
            }
        } catch (error) {
            setErrorMessage('Connection error. Please try again.');
            console.error('Error clocking out:', error);
        }
    };

    const handleDownloadReport = async () => {
        try {
            const res = await fetch(`${API_URL}/salary-report/${employeeId}`);
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `salary_report_${employeeId}.txt`;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download report. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        navigate('/');
    };

    const StatCard = ({ icon: Icon, label, value, color, subtext, delay }) => (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '28px',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(255,255,255,0.3)',
            transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
            opacity: isLoaded ? 1 : 0,
            transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s`,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
                animation: 'pulse 4s ease-in-out infinite'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '18px',
                    background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    boxShadow: `0 12px 32px ${color}40`
                }}>
                    <Icon size={32} color="#fff" strokeWidth={2.5} />
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>{value}</div>
                {subtext && <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '500' }}>{subtext}</div>}
            </div>
        </div>
    );

    const NotificationBadge = () => {
        const unreadCount = notifications.filter(n => !n.is_read).length;
        
        return (
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '100px',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 32px rgba(6, 182, 212, 0.4)',
                    transition: 'all 0.3s ease',
                    zIndex: 1000
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
            >
                <Bell size={24} color="#fff" />
                {unreadCount > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        background: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#fff',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)'
                    }}>
                        {unreadCount}
                    </div>
                )}
            </button>
        );
    };

    const LogoutButton = () => (
        <button
            onClick={handleLogout}
            style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                padding: '14px 24px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
                transition: 'all 0.3s ease',
                zIndex: 1000,
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.3)';
            }}
        >
            <LogOut size={18} />
            Logout
        </button>
    );

    const NotificationsPanel = () => (
        showNotifications && (
            <div style={{
                position: 'fixed',
                top: '96px',
                right: '24px',
                width: '380px',
                maxHeight: '500px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                overflow: 'hidden',
                zIndex: 1000,
                animation: 'slideDown 0.3s ease'
            }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Notifications</h3>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '16px' }}>
                    {notifications.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '32px 0' }}>No notifications</p>
                    ) : (
                        notifications.map((notif, index) => (
                            <div key={notif.id} style={{
                                padding: '16px',
                                marginBottom: '12px',
                                background: notif.is_read ? 'rgba(248,250,252,0.6)' : 'rgba(6,182,212,0.08)',
                                borderRadius: '16px',
                                border: `1px solid ${notif.is_read ? '#e2e8f0' : 'rgba(6,182,212,0.2)'}`,
                                animation: `fadeInUp 0.3s ease ${index * 0.05}s both`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: notif.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    }}>
                                        {notif.type === 'success' ? <CheckCircle size={20} color="#fff" /> : <Bell size={20} color="#fff" />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{notif.title}</div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>{notif.message}</div>
                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                                            {new Date(notif.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )
    );

    const AttendanceCard = () => {
        const displayTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const currentDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        
        // Check-in: before 9:00 AM
        const canCheckIn = currentHour < 9 && attendanceStatus === 'Not Marked';
        
        // Check-out: between 4:30 PM (16:30) and 5:30 PM (17:30)
        const canCheckOut = ((currentHour === 16 && currentMinute >= 30) || (currentHour === 17 && currentMinute <= 30)) && attendanceStatus === 'Clocked In';

        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                padding: '32px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,255,255,0.3)',
                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                opacity: isLoaded ? 1 : 0,
                transition: 'all 0.6s ease 0.3s',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)',
                    animation: 'pulse 3s ease-in-out infinite'
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 32px rgba(6, 182, 212, 0.4)'
                        }}>
                            <Clock size={32} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>Mark Attendance</h2>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>{currentDate}</p>
                        </div>
                    </div>

                    <div style={{
                        padding: '16px',
                        background: 'rgba(6, 182, 212, 0.08)',
                        border: '1px solid rgba(6, 182, 212, 0.2)',
                        borderRadius: '12px',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                            <AlertCircle size={20} color="#06b6d4" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                                <strong>Important:</strong><br />
                                • Check-in: Before 9:00 AM only<br />
                                • Early arrival (before 8:30 AM): 5 points<br />
                                • On-time (8:30 AM - 9:00 AM): 3 points<br />
                                • Check-out: Between 4:30 PM - 5:30 PM
                            </div>
                        </div>
                    </div>

                    <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.6) 100%)',
                        borderRadius: '16px',
                        marginBottom: '24px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <div>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Current Time</div>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#1e293b', fontFamily: 'monospace' }}>{displayTime}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Status</div>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '8px 16px',
                                    borderRadius: '12px',
                                    background: attendanceStatus === 'Clocked In' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                                               attendanceStatus === 'Clocked Out' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                               'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    color: '#fff',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    boxShadow: attendanceStatus === 'Clocked In' ? '0 4px 16px rgba(16, 185, 129, 0.4)' : 
                                               attendanceStatus === 'Clocked Out' ? '0 4px 16px rgba(239, 68, 68, 0.4)' :
                                               '0 4px 16px rgba(245, 158, 11, 0.4)'
                                }}>
                                    {attendanceStatus}
                                </div>
                            </div>
                        </div>

                        {errorMessage && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <XCircle size={18} color="#ef4444" />
                                <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>{errorMessage}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                borderRadius: '12px',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <CheckCircle size={18} color="#10b981" />
                                <span style={{ fontSize: '14px', color: '#10b981', fontWeight: '500' }}>{successMessage}</span>
                            </div>
                        )}

                        {todayAttendance && todayAttendance.check_in_time && (
                            <div style={{
                                padding: '16px',
                                background: todayAttendance.is_early ? 'rgba(16, 185, 129, 0.1)' : 
                                           todayAttendance.is_on_time ? 'rgba(6, 182, 212, 0.1)' : 
                                           'rgba(245, 158, 11, 0.1)',
                                borderRadius: '12px',
                                border: `2px solid ${todayAttendance.is_early ? '#10b981' : 
                                                     todayAttendance.is_on_time ? '#06b6d4' : 
                                                     '#f59e0b'}`,
                                marginBottom: '16px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                    {todayAttendance.is_early ? <CheckCircle size={24} color="#10b981" /> : 
                                     todayAttendance.is_on_time ? <CheckCircle size={24} color="#06b6d4" /> : 
                                     <Clock size={24} color="#f59e0b" />}
                                    <div>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                            {todayAttendance.is_early ? 'Early Bird! 🎉' : 
                                             todayAttendance.is_on_time ? 'Right on Time! ⏰' : 
                                             'Attendance Marked'}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                                            Checked in at {todayAttendance.check_in_time}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>
                                    Points earned: <strong style={{ color: '#1e293b' }}>{todayAttendance.points_earned}</strong>
                                </div>
                                {todayAttendance.check_out_time && (
                                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                                        Checked out at: <strong style={{ color: '#1e293b' }}>{todayAttendance.check_out_time}</strong>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        {attendanceStatus === 'Not Marked' && (
                            <button
                                onClick={handleClockIn}
                                disabled={!canCheckIn}
                                style={{
                                    flex: 1,
                                    padding: '16px 24px',
                                    background: canCheckIn ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '14px',
                                    cursor: canCheckIn ? 'pointer' : 'not-allowed',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: canCheckIn ? '0 8px 24px rgba(16, 185, 129, 0.4)' : 'none',
                                    transition: 'all 0.3s ease',
                                    opacity: canCheckIn ? 1 : 0.5
                                }}
                                onMouseEnter={(e) => {
                                    if (canCheckIn) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (canCheckIn) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.4)';
                                    }
                                }}
                            >
                                <CheckCircle size={20} />
                                {canCheckIn ? 'Clock In Now' : 'Check-in Closed'}
                            </button>
                        )}
                        
                        {attendanceStatus === 'Clocked In' && (
                            <button
                                onClick={handleClockOut}
                                disabled={!canCheckOut}
                                style={{
                                    flex: 1,
                                    padding: '16px 24px',
                                    background: canCheckOut ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '14px',
                                    cursor: canCheckOut ? 'pointer' : 'not-allowed',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    boxShadow: canCheckOut ? '0 8px 24px rgba(239, 68, 68, 0.4)' : 'none',
                                    transition: 'all 0.3s ease',
                                    opacity: canCheckOut ? 1 : 0.5
                                }}
                                onMouseEnter={(e) => {
                                    if (canCheckOut) {
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = '0 12px 32px rgba(239, 68, 68, 0.5)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (canCheckOut) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.4)';
                                    }
                                }}
                            >
                                <XCircle size={20} />
                                {canCheckOut ? 'Clock Out Now' : 'Check-out Closed'}
                            </button>
                        )}

                        {attendanceStatus === 'Clocked Out' && (
                            <div style={{
                                flex: 1,
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                borderRadius: '14px',
                                fontSize: '16px',
                                fontWeight: '700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)'
                            }}>
                                <CheckCircle size={20} />
                                Attendance Complete for Today
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const SalaryReportCard = () => {
        const breakdown = employeeData?.salary_breakdown || {};
        
        return (
            <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                padding: '32px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                border: '1px solid rgba(255,255,255,0.3)',
                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                opacity: isLoaded ? 1 : 0,
                transition: 'all 0.6s ease 0.4s',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
                    animation: 'pulse 3s ease-in-out infinite 0.5s'
                }} />

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '18px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.4)'
                        }}>
                            <DollarSign size={32} color="#fff" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>Salary Breakdown</h2>
                            <p style={{ fontSize: '14px', color: '#64748b' }}>Current Period</p>
                        </div>
                    </div>

                    <div style={{
                        padding: '28px',
                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                        borderRadius: '20px',
                        marginBottom: '24px',
                        boxShadow: '0 12px 32px rgba(6, 182, 212, 0.3)'
                    }}>
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Total Salary</div>
                        <div style={{ fontSize: '48px', fontWeight: '900', color: '#fff', fontFamily: 'monospace' }}>
                            KES {(breakdown.total || 0).toLocaleString()}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                        {[
                            { label: 'Base Salary', value: breakdown.base_salary || 0, color: '#06b6d4', icon: Briefcase },
                            { label: 'Allowances', value: breakdown.allowances || 0, color: '#10b981', icon: TrendingUp },
                            { label: 'Bonus (Points)', value: breakdown.bonus || 0, color: '#8b5cf6', icon: Award },
                            { label: 'Raise', value: breakdown.raise || 0, color: '#f59e0b', icon: TrendingUp },
                            { label: 'Deductions', value: breakdown.deductions || 0, color: '#ef4444', icon: XCircle, isNegative: true }
                        ].map((item, index) => (
                            <div key={item.label} style={{
                                padding: '16px 20px',
                                background: 'linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.6) 100%)',
                                borderRadius: '14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                border: '1px solid rgba(226,232,240,0.5)',
                                animation: `fadeInUp 0.4s ease ${0.5 + index * 0.05}s both`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '10px',
                                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <item.icon size={18} color="#fff" />
                                    </div>
                                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{item.label}</span>
                                </div>
                                <span style={{
                                    fontSize: '18px',
                                    fontWeight: '800',
                                    color: item.isNegative ? '#ef4444' : '#1e293b',
                                    fontFamily: 'monospace'
                                }}>
                                    {item.isNegative ? '-' : '+'}KES {item.value.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleDownloadReport}
                        style={{
                            width: '100%',
                            padding: '16px 24px',
                            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '14px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '700',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 12px 32px rgba(6, 182, 212, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 182, 212, 0.4)';
                        }}
                    >
                        <Download size={20} />
                        Download Full Report
                    </button>
                </div>
            </div>
        );
    };

    if (!employeeData) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
                <div style={{ fontSize: '24px', color: '#fff', fontWeight: '700' }}>Loading...</div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
            padding: '40px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                opacity: 0.4
            }} />

            <LogoutButton />
            <NotificationBadge />
            <NotificationsPanel />

            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    marginBottom: '48px',
                    transform: isLoaded ? 'translateY(0)' : 'translateY(-30px)',
                    opacity: isLoaded ? 1 : 0,
                    transition: 'all 0.6s ease'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                            backdropFilter: 'blur(20px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                            fontWeight: '900',
                            color: '#06b6d4',
                            boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                            border: '2px solid rgba(255,255,255,0.5)'
                        }}>
                            {employeeData?.name?.[0] || 'E'}
                        </div>
                        <div>
                            <h1 style={{ fontSize: '42px', fontWeight: '900', color: '#fff', margin: 0, textShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                                Welcome, {employeeData?.name || 'Employee'}
                            </h1>
                            <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.9)', margin: 0, fontWeight: '500' }}>
                                {employeeData?.department_name || 'Department'} • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    <StatCard 
                        icon={Award} 
                        label="Total Points" 
                        value={employeeData?.points || 0}
                        subtext={`KES ${((employeeData?.points || 0) * (employeeData?.salary_breakdown?.bonus / (employeeData?.points || 1) || 100)).toLocaleString()} bonus`}
                        color="#8b5cf6" 
                        delay={0} 
                    />
                    <StatCard 
                        icon={DollarSign} 
                        label="Current Salary" 
                        value={`KES ${(employeeData?.salary_breakdown?.total || 0).toLocaleString()}`}
                        subtext="This period"
                        color="#10b981" 
                        delay={0.1} 
                    />
                    <StatCard 
                        icon={TrendingUp} 
                        label="Bonus Earned" 
                        value={`KES ${(employeeData?.salary_breakdown?.bonus || 0).toLocaleString()}`}
                        subtext="From points"
                        color="#06b6d4" 
                        delay={0.2} 
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                    <AttendanceCard />
                    <SalaryReportCard />
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes fadeInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes pulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.8; }
                }
                
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: rgba(6,182,212,0.5);
                    border-radius: 10px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(6,182,212,0.7);
                }
            `}</style>
        </div>
    );
};

export default EmployeeDashboard;
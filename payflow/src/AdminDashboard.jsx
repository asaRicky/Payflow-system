import React, { useState, useEffect } from 'react';
import { Bell, Users, Building2, Settings, FileText, TrendingUp, Award, Calendar, DollarSign, UserPlus, Edit2, Trash2, Check, X, Clock, CheckCircle, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isLoaded, setIsLoaded] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [settings, setSettings] = useState({});
    const [statistics, setStatistics] = useState({});
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const DEPARTMENT_TEMPLATES = {
        'IT': { base_salary: 80000, allowances: 15000, deductions: 5000 },
        'Human Resource': { base_salary: 60000, allowances: 10000, deductions: 4000 },
        'Finance': { base_salary: 75000, allowances: 12000, deductions: 4500 },
        'Marketing': { base_salary: 65000, allowances: 11000, deductions: 4200 },
        'Sales': { base_salary: 55000, allowances: 20000, deductions: 3800 },
        'Operations': { base_salary: 50000, allowances: 8000, deductions: 3500 },
        'Customer Service': { base_salary: 45000, allowances: 7000, deductions: 3200 },
        'Engineering': { base_salary: 65000, allowances: 15000, deductions: 3700 }
    };

    const COLORS = ['#06b6d4', '#10b981', '#14b8a6', '#22c55e', '#0891b2'];
    
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [empRes, deptRes, setRes, statRes] = await Promise.all([
                fetch(`${API_URL}/employees`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`${API_URL}/departments`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`${API_URL}/settings`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }),
                fetch(`${API_URL}/statistics`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                })
            ]);

            if (empRes.ok) setEmployees(await empRes.json());
            if (deptRes.ok) setDepartments(await deptRes.json());
            if (setRes.ok) setSettings(await setRes.json());
            if (statRes.ok) setStatistics(await statRes.json());
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        navigate('/');
    };

    const generateEmail = (name) => {
        if (!name) return '';
        const cleanName = name.trim().toLowerCase().replace(/[^a-z\s]/g, '').replace(/\s+/g, '');
        return `${cleanName}@payflow.org`;
    };

    const suggestEmails = (name) => {
        if (!name) return [];
        const cleanName = name.trim().toLowerCase();
        const parts = cleanName.split(/\s+/);
        const suggestions = [];

        const basic = cleanName.replace(/[^a-z\s]/g, '').replace(/\s+/g, '');
        suggestions.push(`${basic}@payflow.org`);

        if (parts.length >= 2) {
            const firstName = parts[0].replace(/[^a-z]/g, '');
            const lastName = parts[parts.length - 1].replace(/[^a-z]/g, '');
            suggestions.push(`${firstName}.${lastName}@payflow.org`);
            suggestions.push(`${firstName[0]}${lastName}@payflow.org`);
            suggestions.push(`${firstName}_${lastName}@payflow.org`);
        }

        return [...new Set(suggestions)];
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => console.error('Failed to copy: ', err));
    };

    const RefreshButton = () => (
        <button
            onClick={fetchData}
            disabled={isRefreshing}
            style={{
                padding: '10px 20px',
                background: isRefreshing
                    ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                    : 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(6, 182, 212, 0.3)',
                transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => !isRefreshing && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !isRefreshing && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
    );

    // Reusable Components
    const StatCard = ({ icon: Icon, label, value, color, delay }) => (
        <div style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
            backdropFilter: 'blur(20px)',
            padding: '28px',
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
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
                background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
                animation: 'pulse 3s ease-in-out infinite'
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 8px 24px ${color}40`
                    }}>
                        <Icon size={28} color="#fff" />
                    </div>
                </div>
                <div style={{ fontSize: '15px', color: '#64748b', fontWeight: '500', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#1e293b' }}>{value}</div>
            </div>
        </div>
    );

    const Sidebar = () => {
        const menuItems = [
            { id: 'overview', icon: TrendingUp, label: 'Overview' },
            { id: 'employees', icon: Users, label: 'Employees' },
            { id: 'attendance', icon: Calendar, label: 'Attendance' },
            { id: 'departments', icon: Building2, label: 'Departments' },
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'reports', icon: FileText, label: 'Reports' }
        ];

        return (
            <aside style={{
                width: '280px',
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                padding: '32px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                height: '100vh',
                position: 'sticky',
                top: 0,
                overflowY: 'auto'
            }}>
                <div style={{ marginBottom: '40px', transform: isLoaded ? 'scale(1)' : 'scale(0.8)', opacity: isLoaded ? 1 : 0, transition: 'all 0.5s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.4)'
                        }}>
                            <DollarSign size={28} color="#fff" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 }}>PayFlow</h2>
                            <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Admin Portal</p>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    {menuItems.map((item, index) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                padding: '14px 20px',
                                background: activeTab === item.id ? 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' : 'transparent',
                                color: activeTab === item.id ? '#fff' : '#94a3b8',
                                border: 'none',
                                borderRadius: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                fontSize: '15px',
                                fontWeight: '600',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: isLoaded ? 'translateX(0)' : 'translateX(-20px)',
                                opacity: isLoaded ? 1 : 0,
                                transitionDelay: `${index * 0.05}s`,
                                boxShadow: activeTab === item.id ? '0 8px 24px rgba(6, 182, 212, 0.3)' : 'none',
                                marginBottom: '4px',
                                width: '100%'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    e.currentTarget.style.color = '#e2e8f0';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== item.id) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = '#94a3b8';
                                }
                            }}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: '14px 20px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        marginTop: '16px',
                        width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>
        );
    };

    const OverviewTab = () => (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <StatCard icon={Users} label="Total Employees" value={statistics.total_employees || 0} color="#06b6d4" delay={0} />
                <StatCard icon={Building2} label="Departments" value={statistics.total_departments || 0} color="#10b981" delay={0.1} />
                <StatCard icon={DollarSign} label="Monthly Payout" value={`KES ${(statistics.total_payout || 0).toLocaleString()}`} color="#14b8a6" delay={0.2} />
                <StatCard icon={Calendar} label="Attendance Today" value={statistics.attendance_today || 0} color="#22c55e" delay={0.3} />
            </div>

            <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                padding: '32px',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                opacity: isLoaded ? 1 : 0,
                transition: 'all 0.6s ease 0.4s'
            }}>
                <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Recent Employees</h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                    {employees.slice(0, 5).map((emp, index) => (
                        <div key={emp.id} style={{
                            padding: '20px',
                            background: 'linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.6) 100%)',
                            borderRadius: '16px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transform: isLoaded ? 'translateX(0)' : 'translateX(-20px)',
                            opacity: isLoaded ? 1 : 0,
                            transition: `all 0.5s ease ${0.5 + index * 0.1}s`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: `linear-gradient(135deg, ${COLORS[index % 5]} 0%, ${COLORS[index % 5]}dd 100%)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontSize: '18px',
                                    fontWeight: '700'
                                }}>{emp.name[0]}</div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>{emp.name}</div>
                                    <div style={{ fontSize: '14px', color: '#64748b' }}>{emp.department_name || 'No Department'}</div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>KES {emp.salary_breakdown?.total.toLocaleString()}</div>
                                <div style={{ fontSize: '13px', color: '#64748b' }}>Total Salary</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const EmployeesTab = () => {
        const [showForm, setShowForm] = useState(false);
        const [showPassword, setShowPassword] = useState(null);
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
        const [emailSuggestions, setEmailSuggestions] = useState([]);
        const [form, setForm] = useState({
            name: '', email: '', department_id: '', base_salary: '', allowances: '', deductions: '', points: '0'
        });

        const handleNameChange = (name) => {
            setForm(prev => ({ ...prev, name, email: generateEmail(name) }));
            if (name.trim()) {
                setEmailSuggestions(suggestEmails(name));
                setShowEmailSuggestions(true);
            } else {
                setShowEmailSuggestions(false);
            }
        };

        const handleDepartmentChange = (deptId) => {
            const selectedDept = departments.find(d => d.id === parseInt(deptId));
            if (selectedDept && DEPARTMENT_TEMPLATES[selectedDept.name]) {
                const template = DEPARTMENT_TEMPLATES[selectedDept.name];
                setForm(prev => ({
                    ...prev,
                    department_id: deptId,
                    base_salary: template.base_salary.toString(),
                    allowances: template.allowances.toString(),
                    deductions: template.deductions.toString()
                }));
            } else {
                setForm(prev => ({ ...prev, department_id: deptId }));
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isSubmitting) return;
            setIsSubmitting(true);

            try {
                const url = editingEmployee ? `${API_URL}/employees/${editingEmployee.id}` : `${API_URL}/employees`;
                const method = editingEmployee ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(form)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to save employee' }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const newEmployee = await response.json();

                if (!editingEmployee && newEmployee.one_time_password) {
                    setShowPassword(newEmployee);
                } else {
                    setShowForm(false);
                    setEditingEmployee(null);
                }

                setForm({ name: '', email: '', department_id: '', base_salary: '', allowances: '', deductions: '', points: '0' });
                setShowEmailSuggestions(false);

                await fetchData();
            } catch (error) {
                console.error('Error saving employee:', error);
                alert(`Error: ${error.message || 'Failed to save employee. Please check your connection and try again.'}`);
            } finally {
                setIsSubmitting(false);
            }
        };

        const handleEdit = (emp) => {
            setEditingEmployee(emp);
            setForm({
                name: emp.name,
                email: emp.email,
                department_id: emp.department_id || '',
                base_salary: emp.base_salary,
                allowances: emp.allowances,
                deductions: emp.deductions,
                points: emp.points || 0
            });
            setShowForm(true);
            setShowEmailSuggestions(false);
        };

        const handleDelete = async (id) => {
            if (window.confirm('Are you sure you want to delete this employee?')) {
                try {
                    const response = await fetch(`${API_URL}/employees/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({ message: 'Failed to delete employee' }));
                        throw new Error(errorData.message);
                    }

                    await fetchData();
                } catch (error) {
                    console.error('Error deleting employee:', error);
                    alert(`Error: ${error.message || 'Failed to delete employee. Please try again.'}`);
                }
            }
        };

        const handlePromote = async (id) => {
            try {
                const response = await fetch(`${API_URL}/employees/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ is_promoted: true })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to promote employee' }));
                    throw new Error(errorData.message);
                }

                await fetchData();
                alert('Employee promoted successfully!');
            } catch (error) {
                console.error('Error promoting employee:', error);
                alert(`Error: ${error.message || 'Failed to promote employee. Please try again.'}`);
            }
        };

        const resetForm = () => {
            setShowForm(!showForm);
            setEditingEmployee(null);
            setForm({ name: '', email: '', department_id: '', base_salary: '', allowances: '', deductions: '', points: '0' });
            setShowEmailSuggestions(false);
        };

        return (
            <div>
                {/* Password Modal */}
                {showPassword && (
                    <div style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}>
                        <div style={{
                            background: '#fff',
                            padding: '40px',
                            borderRadius: '24px',
                            maxWidth: '600px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                                Employee Created Successfully! 🎉
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '24px' }}>
                                Here are the login credentials for <strong>{showPassword.name}</strong>:
                            </p>

                            <div style={{ marginBottom: '16px' }}>
                                <div style={{
                                    padding: '20px',
                                    background: '#f1f5f9',
                                    borderRadius: '12px',
                                    marginBottom: '12px'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Email (Username)</div>
                                    <div style={{
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>{showPassword.email}</span>
                                        <button
                                            onClick={() => copyToClipboard(showPassword.email)}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#06b6d4',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                <div style={{
                                    padding: '20px',
                                    background: '#f1f5f9',
                                    borderRadius: '12px'
                                }}>
                                    <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>Default Password</div>
                                    <div style={{
                                        fontSize: '28px',
                                        fontWeight: '700',
                                        color: '#06b6d4',
                                        letterSpacing: '2px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <span>welcome2026</span>
                                        <button
                                            onClick={() => copyToClipboard('welcome2026')}
                                            style={{
                                                padding: '8px 16px',
                                                background: '#06b6d4',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                fontWeight: '600'
                                            }}
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div style={{
                                padding: '16px',
                                background: '#fef2f2',
                                borderRadius: '12px',
                                border: '1px solid #fecaca',
                                marginBottom: '24px'
                            }}>
                                <p style={{ fontSize: '14px', color: '#991b1b', margin: 0 }}>
                                    ⚠️ <strong>Important:</strong> Please save these credentials securely. The employee will use this default password (welcome2026) for their first login, after which they'll be required to set a new password.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setShowPassword(null);
                                    setShowForm(false);
                                    setEditingEmployee(null);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Manage Employees</h2>
                    <button
                        onClick={resetForm}
                        type="button"
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 24px rgba(6, 182, 212, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <UserPlus size={20} />
                        {showForm ? 'Cancel' : 'Add Employee'}
                    </button>
                </div>

                {showForm && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                        backdropFilter: 'blur(20px)',
                        padding: '32px',
                        borderRadius: '24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        marginBottom: '24px',
                        animation: 'slideDown 0.3s ease'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
                            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                                <input
                                    type="text"
                                    placeholder="Full Name (e.g., Derrick Omondi)"
                                    value={form.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        background: 'rgba(255,255,255,0.8)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                            </div>

                            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                                <input
                                    type="email"
                                    placeholder="Email (auto-generated)"
                                    value={form.email}
                                    onChange={(e) => {
                                        setForm({ ...form, email: e.target.value });
                                        setShowEmailSuggestions(false);
                                    }}
                                    required
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        padding: '14px 18px',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        background: 'rgba(255,255,255,0.8)'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#06b6d4';
                                        if (emailSuggestions.length > 0) setShowEmailSuggestions(true);
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        setTimeout(() => setShowEmailSuggestions(false), 200);
                                    }}
                                />

                                {showEmailSuggestions && emailSuggestions.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: '#fff',
                                        border: '2px solid #e2e8f0',
                                        borderRadius: '12px',
                                        marginTop: '4px',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                        zIndex: 10,
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ padding: '8px 12px', fontSize: '12px', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0' }}>
                                            Email Suggestions:
                                        </div>
                                        {emailSuggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                onMouseDown={() => {
                                                    setForm({ ...form, email: suggestion });
                                                    setShowEmailSuggestions(false);
                                                }}
                                                style={{
                                                    padding: '12px 16px',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    color: '#1e293b',
                                                    borderBottom: idx < emailSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {suggestion}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <select
                                value={form.department_id}
                                onChange={(e) => handleDepartmentChange(e.target.value)}
                                disabled={isSubmitting}
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.8)',
                                    gridColumn: 'span 2'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            >
                                <option value="">Select Department (auto-fills salary)</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>

                            <input
                                type="number"
                                placeholder="Base Salary (KES)"
                                value={form.base_salary}
                                onChange={(e) => setForm({ ...form, base_salary: e.target.value })}
                                required
                                disabled={isSubmitting}
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.8)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <input
                                type="number"
                                placeholder="Allowances (KES)"
                                value={form.allowances}
                                onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                                disabled={isSubmitting}
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.8)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <input
                                type="number"
                                placeholder="Deductions (KES)"
                                value={form.deductions}
                                onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                                disabled={isSubmitting}
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.8)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <input
                                type="number"
                                placeholder="Points"
                                value={form.points}
                                onChange={(e) => setForm({ ...form, points: e.target.value })}
                                disabled={isSubmitting}
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.8)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    padding: '14px 24px',
                                    background: isSubmitting
                                        ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)'
                                        : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    gridColumn: 'span 2',
                                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
                                onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
                            >
                                <Check size={20} />
                                {isSubmitting ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Save Employee')}
                            </button>
                        </form>
                    </div>
                )}

                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                                    <th style={{ padding: '20px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Base Salary</th>
                                    <th style={{ padding: '20px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Points</th>
                                    <th style={{ padding: '20px', textAlign: 'right', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Salary</th>
                                    <th style={{ padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, index) => (
                                    <tr key={emp.id} style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease',
                                        animation: `fadeInUp 0.5s ease ${index * 0.05}s both`
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,250,252,0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: `linear-gradient(135deg, ${COLORS[index % 5]} 0%, ${COLORS[index % 5]}dd 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontSize: '16px',
                                                    fontWeight: '700'
                                                }}>{emp.name[0]}</div>
                                                <div>
                                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{emp.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '15px', color: '#475569' }}>{emp.department_name || 'N/A'}</td>
                                        <td style={{ padding: '20px', fontSize: '15px', fontWeight: '600', color: '#1e293b', textAlign: 'right' }}>KES {emp.base_salary.toLocaleString()}</td>
                                        <td style={{ padding: '20px', fontSize: '15px', fontWeight: '600', color: '#10b981', textAlign: 'right' }}>{emp.points || 0}</td>
                                        <td style={{ padding: '20px', fontSize: '15px', fontWeight: '700', color: '#10b981', textAlign: 'right' }}>KES {emp.salary_breakdown?.total.toLocaleString()}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleEdit(emp)}
                                                    type="button"
                                                    style={{
                                                        padding: '8px 12px',
                                                        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <Edit2 size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handlePromote(emp.id)}
                                                    type="button"
                                                    style={{
                                                        padding: '8px 12px',
                                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <Award size={14} />
                                                    Promote
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(emp.id)}
                                                    type="button"
                                                    style={{
                                                        padding: '8px 12px',
                                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        fontSize: '13px',
                                                        fontWeight: '600',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px',
                                                        transition: 'all 0.3s ease'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                                >
                                                    <Trash2 size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const AttendanceTab = () => {
        const [attendanceRecords, setAttendanceRecords] = useState({});

        useEffect(() => {
            const records = {};
            employees.forEach(emp => {
                records[emp.id] = 'present';
            });
            setAttendanceRecords(records);
        }, [employees]);

        const handleAttendanceChange = (empId, status) => {
            setAttendanceRecords(prev => ({ ...prev, [empId]: status }));
        };

        const handleBulkSubmit = async () => {
            try {
                const records = Object.entries(attendanceRecords).map(([empId, status]) => ({
                    employee_id: parseInt(empId),
                    status
                }));

                const response = await fetch(`${API_URL}/attendance/bulk`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({ records, date: attendanceDate })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to submit attendance' }));
                    throw new Error(errorData.message);
                }

                alert('Attendance marked successfully!');
                await fetchData();
            } catch (error) {
                console.error('Error marking attendance:', error);
                alert(`Error: ${error.message || 'Failed to mark attendance. Please try again.'}`);
            }
        };

        const getStatusColor = (status) => {
            const colors = {
                early: { bg: '#10b981', bgEnd: '#059669' },
                present: { bg: '#06b6d4', bgEnd: '#0891b2' },
                late: { bg: '#f59e0b', bgEnd: '#ea580c' },
                absent: { bg: '#ef4444', bgEnd: '#dc2626' }
            };
            return colors[status] || colors.present;
        };

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Mark Attendance</h2>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            style={{
                                padding: '12px 18px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '15px',
                                outline: 'none',
                                background: 'rgba(255,255,255,0.9)'
                            }}
                        />
                        <button
                            onClick={handleBulkSubmit}
                            type="button"
                            style={{
                                padding: '12px 24px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <CheckCircle size={20} />
                            Submit Attendance
                        </button>
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
                                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employee</th>
                                    <th style={{ padding: '20px', textAlign: 'left', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</th>
                                    <th style={{ padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Points</th>
                                    <th style={{ padding: '20px', textAlign: 'center', fontSize: '14px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((emp, index) => (
                                    <tr key={emp.id} style={{
                                        borderBottom: '1px solid #e2e8f0',
                                        transition: 'all 0.3s ease'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248,250,252,0.5)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    borderRadius: '10px',
                                                    background: `linear-gradient(135deg, ${COLORS[index % 5]} 0%, ${COLORS[index % 5]}dd 100%)`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#fff',
                                                    fontSize: '16px',
                                                    fontWeight: '700'
                                                }}>{emp.name[0]}</div>
                                                <div>
                                                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>{emp.name}</div>
                                                    <div style={{ fontSize: '13px', color: '#64748b' }}>{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', fontSize: '15px', color: '#475569' }}>{emp.department_name || 'N/A'}</td>
                                        <td style={{ padding: '20px', fontSize: '18px', fontWeight: '700', color: '#10b981', textAlign: 'center' }}>{emp.points || 0}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                {['early', 'present', 'late', 'absent'].map(status => {
                                                    const colors = getStatusColor(status);
                                                    const isActive = attendanceRecords[emp.id] === status;
                                                    return (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleAttendanceChange(emp.id, status)}
                                                            type="button"
                                                            style={{
                                                                padding: '8px 16px',
                                                                background: isActive
                                                                    ? `linear-gradient(135deg, ${colors.bg} 0%, ${colors.bgEnd} 100%)`
                                                                    : 'rgba(226,232,240,0.5)',
                                                                color: isActive ? '#fff' : '#64748b',
                                                                border: 'none',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                fontSize: '13px',
                                                                fontWeight: '600',
                                                                transition: 'all 0.3s ease',
                                                                textTransform: 'capitalize'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                if (!isActive) e.currentTarget.style.background = 'rgba(226,232,240,0.8)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isActive) e.currentTarget.style.background = 'rgba(226,232,240,0.5)';
                                                            }}
                                                        >
                                                            {status}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const DepartmentsTab = () => {
        const [showForm, setShowForm] = useState(false);
        const [form, setForm] = useState({ name: '', manager: '' });
        const [editing, setEditing] = useState(null);

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const url = editing ? `${API_URL}/departments/${editing.id}` : `${API_URL}/departments`;
                const method = editing ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(form)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to save department' }));
                    throw new Error(errorData.message);
                }

                setShowForm(false);
                setEditing(null);
                setForm({ name: '', manager: '' });
                await fetchData();
            } catch (error) {
                console.error('Error saving department:', error);
                alert(`Error: ${error.message || 'Failed to save department. Please try again.'}`);
            }
        };

        const resetForm = () => {
            setShowForm(!showForm);
            setEditing(null);
            setForm({ name: '', manager: '' });
        };

        return (
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', margin: 0 }}>Manage Departments</h2>
                    <button
                        onClick={resetForm}
                        type="button"
                        style={{
                            padding: '12px 24px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <Building2 size={20} />
                        {showForm ? 'Cancel' : 'Add Department'}
                    </button>
                </div>

                {showForm && (
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                        backdropFilter: 'blur(20px)',
                        padding: '32px',
                        borderRadius: '24px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        marginBottom: '24px',
                        animation: 'slideDown 0.3s ease'
                    }}>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>
                            {editing ? 'Edit Department' : 'Add New Department'}
                        </h3>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                            <input
                                type="text"
                                placeholder="Department Name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.8)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <input
                                type="text"
                                placeholder="Manager Name"
                                value={form.manager}
                                onChange={(e) => setForm({ ...form, manager: e.target.value })}
                                style={{
                                    padding: '14px 18px',
                                    border: '2px solid #e2e8f0',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'all 0.3s ease',
                                    background: 'rgba(255,255,255,0.8)'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#10b981'}
                                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '14px 24px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    fontSize: '15px',
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Check size={20} />
                                {editing ? 'Update' : 'Save'}
                            </button>
                        </form>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {departments.map((dept, index) => {
                        const deptEmployees = employees.filter(e => e.department_id === dept.id);
                        return (
                            <div key={dept.id} style={{
                                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                                backdropFilter: 'blur(20px)',
                                padding: '28px',
                                borderRadius: '20px',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                transform: isLoaded ? 'translateY(0)' : 'translateY(30px)',
                                opacity: isLoaded ? 1 : 0,
                                transition: `all 0.6s ease ${index * 0.1}s`,
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    right: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: `radial-gradient(circle, ${COLORS[index % 4]}15 0%, transparent 70%)`,
                                    animation: 'pulse 3s ease-in-out infinite'
                                }} />
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '14px',
                                            background: `linear-gradient(135deg, ${COLORS[index % 4]} 0%, ${COLORS[index % 4]}dd 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '16px'
                                        }}>
                                            <Building2 size={28} color="#fff" />
                                        </div>
                                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{dept.name}</h3>
                                        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '16px' }}>Manager: {dept.manager || 'Not assigned'}</p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                                            <Users size={16} color="#64748b" />
                                            <span style={{ fontSize: '14px', color: '#64748b' }}>{deptEmployees.length} Employees</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditing(dept);
                                            setForm({ name: dept.name, manager: dept.manager });
                                            setShowForm(true);
                                        }}
                                        type="button"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(16,185,129,0.1) 100%)',
                                            color: '#06b6d4',
                                            border: '2px solid rgba(6,182,212,0.2)',
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(6,182,212,0.1) 0%, rgba(16,185,129,0.1) 100%)';
                                            e.currentTarget.style.color = '#06b6d4';
                                        }}
                                    >
                                        Edit Department
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const SettingsTab = () => {
        const [form, setForm] = useState(settings);

        useEffect(() => setForm(settings), [settings]);

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const response = await fetch(`${API_URL}/settings`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(form)
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to update settings' }));
                    throw new Error(errorData.message);
                }

                await fetchData();
                alert('Settings updated successfully!');
            } catch (error) {
                console.error('Error updating settings:', error);
                alert(`Error: ${error.message || 'Failed to update settings. Please try again.'}`);
            }
        };

        const inputStyle = {
            width: '100%',
            padding: '14px 18px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 0.3s ease',
            background: 'rgba(255,255,255,0.8)'
        };

        return (
            <div>
                <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '32px' }}>System Settings</h2>

                <div style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                    backdropFilter: 'blur(20px)',
                    padding: '32px',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
                }}>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '32px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {[
                                { label: 'Raise After Years', key: 'raise_after_years', type: 'number' },
                                { label: 'Raise Percentage (%)', key: 'raise_percentage', type: 'number', step: '0.01' },
                                { label: 'Point Value (KES)', key: 'point_value', type: 'number', step: '0.01' },
                                { label: 'Payment Method', key: 'payment_method', type: 'text' },
                                { label: 'Early Points', key: 'early_points', type: 'number' },
                                { label: 'On-Time Points', key: 'on_time_points', type: 'number' }
                            ].map(({ label, key, type, step }) => (
                                <div key={key}>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px' }}>
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        step={step}
                                        value={form[key] || ''}
                                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                        style={inputStyle}
                                        onFocus={(e) => e.target.style.borderColor = '#06b6d4'}
                                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: '16px 32px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                width: 'fit-content',
                                boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <Check size={20} />
                            Save Settings
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const ReportsTab = () => (
        <div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '32px' }}>Salary Reports</h2>

            <div style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '32px', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Total Payroll</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                                KES {(statistics.total_payout || 0).toLocaleString()}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Active Employees</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                                {statistics.total_employees || 0}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>Average Salary</div>
                            <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>
                                KES {statistics.total_employees ? Math.round((statistics.total_payout || 0) / statistics.total_employees).toLocaleString() : 0}
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '32px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '24px' }}>Employee Salary Breakdown</h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {employees.map((emp, index) => (
                            <div key={emp.id} style={{
                                padding: '24px',
                                background: 'linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.6) 100%)',
                                borderRadius: '16px',
                                border: '1px solid rgba(226,232,240,0.5)',
                                transform: isLoaded ? 'translateX(0)' : 'translateX(-20px)',
                                opacity: isLoaded ? 1 : 0,
                                transition: `all 0.5s ease ${index * 0.05}s`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <div style={{
                                            width: '48px',
                                            height: '48px',
                                            borderRadius: '12px',
                                            background: `linear-gradient(135deg, ${COLORS[index % 5]} 0%, ${COLORS[index % 5]}dd 100%)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: '18px',
                                            fontWeight: '700'
                                        }}>{emp.name[0]}</div>
                                        <div>
                                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>{emp.name}</div>
                                            <div style={{ fontSize: '14px', color: '#64748b' }}>{emp.department_name || 'No Department'}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981' }}>
                                            KES {emp.salary_breakdown?.total.toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#64748b' }}>Total Salary</div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                    {[
                                        { label: 'Base Salary', key: 'base_salary', color: '#1e293b' },
                                        { label: 'Allowances', key: 'allowances', color: '#10b981', prefix: '+' },
                                        { label: 'Bonus (Points)', key: 'bonus', color: '#14b8a6', prefix: '+' },
                                        { label: 'Raise', key: 'raise', color: '#f59e0b', prefix: '+' },
                                        { label: 'Deductions', key: 'deductions', color: '#ef4444', prefix: '-' }
                                    ].map(({ label, key, color, prefix = '' }) => (
                                        <div key={key} style={{ padding: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '10px' }}>
                                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>{label}</div>
                                            <div style={{ fontSize: '16px', fontWeight: '600', color }}>
                                                {prefix}KES {emp.salary_breakdown?.[key].toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        const tabs = {
            overview: OverviewTab,
            employees: EmployeesTab,
            attendance: AttendanceTab,
            departments: DepartmentsTab,
            settings: SettingsTab,
            reports: ReportsTab
        };
        const TabComponent = tabs[activeTab] || OverviewTab;
        return <TabComponent />;
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
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

            <Sidebar />

            <main style={{
                flex: 1,
                padding: '40px',
                overflowY: 'auto',
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto'
                }}>
                    {renderContent()}
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                
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
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
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

export default AdminDashboard;
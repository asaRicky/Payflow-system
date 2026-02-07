import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Sparkles, Award, TrendingUp } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

// ─────────────────────────────────────────────
// HARDCODED ADMIN CREDENTIALS
// ─────────────────────────────────────────────
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  name: 'Administrator'
};

// ─────────────────────────────────────────────
// ANIMATED PARTICLES BACKGROUND
// ─────────────────────────────────────────────
const AnimatedParticles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5
  }));

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.3)',
            animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0); opacity: 0.3; }
          25% { transform: translate(20px, -30px); opacity: 0.6; }
          50% { transform: translate(-20px, -60px); opacity: 0.3; }
          75% { transform: translate(30px, -30px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// PASSWORD-CHANGE SCREEN
// ─────────────────────────────────────────────
const PasswordChangeScreen = ({ employee, onSuccess, onCancel }) => {
  const [data, setData] = useState({ newpassword: '', confirmpassword: '' });
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [strength, setStrength] = useState(0);

  const calcStrength = (val) => {
    let s = 0;
    if (val.length >= 8) s++;
    if (/[a-z]/.test(val) && /[A-Z]/.test(val)) s++;
    if (/\d/.test(val)) s++;
    if (/[^a-zA-Z\d]/.test(val)) s++;
    return s;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'newpassword') setStrength(calcStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (data.newpassword.length < 8) { 
      setError('Password must be at least 8 characters.'); 
      return; 
    }
    if (data.newpassword !== data.confirmpassword) { 
      setError('Passwords do not match.'); 
      return; 
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API_URL}/employee/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employee_id: employee.id, 
          new_password: data.newpassword 
        })
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Connection error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const strengthColor = ['#ef4444','#ef4444','#f59e0b','#06b6d4','#10b981'][strength];
  const strengthLabel = ['','Weak','Fair','Good','Strong'][strength];

  const inputStyle = {
    width: '100%',
    padding: '14px 44px 14px 18px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
    background: 'rgba(255,255,255,0.8)',
    boxSizing: 'border-box'
  };

  return (
    <div style={pageWrap}>
      <AnimatedParticles />
      <BgPattern />
      <div style={cardWrap}>
        <LogoBlock />

        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', textAlign: 'center', margin: '0 0 6px' }}>
          Change Your Password
        </h2>
        <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', margin: '0 0 28px' }}>
          Welcome <strong>{employee.name}</strong>! Please set a new password to continue
        </p>

        <form onSubmit={handleSubmit}>
          <label style={labelStyle}>New Password</label>
          <div style={{ position: 'relative', marginBottom: strength ? '8px' : '20px' }}>
            <input
              type={showNew ? 'text' : 'password'}
              name="newpassword"
              value={data.newpassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#06b6d4'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button type="button" onClick={() => setShowNew(s => !s)} style={eyeBtn}>
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {data.newpassword && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    flex: 1, height: '4px', borderRadius: '2px',
                    background: i <= strength ? strengthColor : '#e2e8f0',
                    transition: 'background 0.3s ease'
                  }} />
                ))}
              </div>
              <span style={{ fontSize: '12px', color: strengthColor, fontWeight: '600' }}>
                Password Strength: {strengthLabel}
              </span>
            </div>
          )}

          <label style={labelStyle}>Confirm Password</label>
          <div style={{ position: 'relative', marginBottom: '8px' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmpassword"
              value={data.confirmpassword}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isSubmitting}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = '#06b6d4'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            <button type="button" onClick={() => setShowConfirm(s => !s)} style={eyeBtn}>
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {data.newpassword && data.confirmpassword && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              {data.newpassword === data.confirmpassword
                ? <><CheckCircle size={16} color="#10b981" /><span style={{ fontSize: '13px', color: '#10b981', fontWeight: '600' }}>Passwords match</span></>
                : <><AlertCircle size={16} color="#ef4444" /><span style={{ fontSize: '13px', color: '#ef4444', fontWeight: '600' }}>Passwords do not match</span></>
              }
            </div>
          )}

          {error && <ErrorBadge msg={error} />}

          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{
              ...primaryBtn,
              opacity: isSubmitting ? 0.6 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => !isSubmitting && (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Shield size={18} /> {isSubmitting ? 'Changing Password...' : 'Change Password & Continue'}
          </button>
        </form>

        <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(6,182,212,0.06)', borderRadius: '10px', border: '1px solid rgba(6,182,212,0.15)' }}>
          <p style={{ fontSize: '12px', color: '#64748b', margin: 0, lineHeight: 1.7 }}>
            <strong style={{ color: '#06b6d4' }}>Requirements:</strong><br />
            • At least 8 characters<br />
            • Mix of uppercase &amp; lowercase<br />
            • Include numbers &amp; special characters
          </p>
        </div>

        <button 
          onClick={onCancel} 
          disabled={isSubmitting}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#06b6d4', 
            fontSize: '13px', 
            cursor: isSubmitting ? 'not-allowed' : 'pointer', 
            marginTop: '16px', 
            width: '100%',
            opacity: isSubmitting ? 0.5 : 1
          }}
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// FEATURE CARDS (displayed below login form)
// ─────────────────────────────────────────────
const FeatureCards = () => {
  const features = [
    { icon: Award, title: 'Points System', desc: 'Earn rewards for attendance', color: '#8b5cf6' },
    { icon: TrendingUp, title: 'Track Progress', desc: 'Monitor your performance', color: '#06b6d4' },
    { icon: Sparkles, title: 'Smart Analytics', desc: 'Get insights on your data', color: '#10b981' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '16px',
      marginTop: '32px',
      animation: 'fadeInUp 0.8s ease 0.3s both'
    }}>
      {features.map((feat, idx) => (
        <div
          key={idx}
          style={{
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            animation: `fadeInUp 0.6s ease ${0.4 + idx * 0.1}s both`
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${feat.color} 0%, ${feat.color}dd 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: `0 8px 20px ${feat.color}40`
          }}>
            <feat.icon size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>
            {feat.title}
          </h3>
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            {feat.desc}
          </p>
        </div>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN LOGIN PAGE
// ─────────────────────────────────────────────
const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [pendingEmployee, setPendingEmployee] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing auth data on mount
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      // Check if it's admin login
      if (formData.username === ADMIN_CREDENTIALS.username && formData.password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userName', ADMIN_CREDENTIALS.name);
        navigate('/admin');
        return;
      }

      // Try employee login via API - FIXED ENDPOINT
      const response = await fetch(`${API_URL}/employee/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.username,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const employeeData = data.employee;
        
        // Check if password needs to be changed
        if (employeeData.requires_password_change) {
          setPendingEmployee(employeeData);
          setMustChangePassword(true);
        } else {
          // Password already changed, go directly to dashboard
          localStorage.setItem('userRole', 'employee');
          localStorage.setItem('userId', employeeData.id);
          localStorage.setItem('userName', employeeData.name);
          navigate('/employee');
        }
      } else {
        setError(data.error || 'Invalid username or password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Connection error. Please check if the server is running.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handlePasswordChanged = () => {
    // After password change, store user data and navigate to employee dashboard
    setMustChangePassword(false);
    localStorage.setItem('userRole', 'employee');
    localStorage.setItem('userId', pendingEmployee.id);
    localStorage.setItem('userName', pendingEmployee.name);
    navigate('/employee');
  };

  if (mustChangePassword) {
    return (
      <PasswordChangeScreen
        employee={pendingEmployee}
        onSuccess={handlePasswordChanged}
        onCancel={() => { 
          setMustChangePassword(false); 
          setPendingEmployee(null); 
          setFormData({ username: '', password: '' });
        }}
      />
    );
  }

  return (
    <div style={pageWrap}>
      <AnimatedParticles />
      <BgPattern />

      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Animated Welcome Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          transform: isLoaded ? 'translateY(0)' : 'translateY(-30px)',
          opacity: isLoaded ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '16px',
            padding: '10px 24px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}>
            <Sparkles size={20} color="#fff" />
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#fff',
              letterSpacing: '0.5px'
            }}>
              Welcome to PayFlow
            </span>
            <Sparkles size={20} color="#fff" />
          </div>
          
          <h1 style={{
            fontSize: '48px',
            fontWeight: '900',
            color: '#fff',
            margin: '0 0 12px',
            textShadow: '0 4px 20px rgba(0,0,0,0.2)',
            letterSpacing: '-1px'
          }}>
            PayFlow System
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            fontWeight: '500'
          }}>
            Your Smart Payroll &amp; Attendance Solution
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          ...cardWrap,
          transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: isLoaded ? 1 : 0,
          transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s'
        }}>
          <LogoBlock />

          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#1e293b', textAlign: 'center', margin: '0 0 4px' }}>
            Sign In
          </h2>
          <p style={{ fontSize: '14px', color: '#64748b', textAlign: 'center', margin: '0 0 32px' }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <label style={labelStyle}>Username / Email</label>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username or email"
                required
                disabled={isLoggingIn}
                style={{ ...inputStyle, paddingLeft: '42px' }}
                onFocus={e => e.target.style.borderColor = '#06b6d4'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative', marginBottom: '24px' }}>
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoggingIn}
                style={{ ...inputStyle, paddingLeft: '42px', paddingRight: '44px' }}
                onFocus={e => e.target.style.borderColor = '#06b6d4'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} style={eyeBtn}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error */}
            {error && <ErrorBadge msg={error} />}

            {/* Submit */}
            <button 
              type="submit" 
              disabled={isLoggingIn}
              style={{
                ...primaryBtn,
                opacity: isLoggingIn ? 0.6 : 1,
                cursor: isLoggingIn ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={e => {
                if (!isLoggingIn) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(6,182,212,0.5)';
                }
              }}
              onMouseLeave={e => {
                if (!isLoggingIn) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(6,182,212,0.35)';
                }
              }}
            >
              <Lock size={18} /> {isLoggingIn ? 'Signing In...' : 'Sign In Securely'}
            </button>
          </form>

          <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(6,182,212,0.05)', borderRadius: '10px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
              <strong>Demo Credentials:</strong><br />
              Admin: admin / admin123<br />
              New Employee: use email / welcome2026
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <FeatureCards />
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

// ─────────────────────────────────────────────
// SHARED COMPONENTS & STYLES
// ─────────────────────────────────────────────
const pageWrap = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
  position: 'relative',
  overflow: 'hidden',
  padding: '40px 20px'
};

const cardWrap = {
  position: 'relative',
  zIndex: 1,
  width: '100%',
  maxWidth: '440px',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 100%)',
  backdropFilter: 'blur(24px)',
  padding: '48px 40px',
  borderRadius: '28px',
  boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.4)',
  margin: '0 auto'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#64748b',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const inputStyle = {
  width: '100%',
  padding: '14px 18px',
  border: '2px solid #e2e8f0',
  borderRadius: '12px',
  fontSize: '15px',
  outline: 'none',
  transition: 'border-color 0.3s ease',
  background: 'rgba(255,255,255,0.8)',
  boxSizing: 'border-box'
};

const eyeBtn = {
  position: 'absolute',
  right: '12px',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#94a3b8',
  display: 'flex',
  alignItems: 'center',
  padding: '4px'
};

const primaryBtn = {
  width: '100%',
  padding: '15px 24px',
  background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
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
  boxShadow: '0 8px 24px rgba(6,182,212,0.35)',
  transition: 'all 0.3s ease'
};

const ErrorBadge = ({ msg }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 16px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '10px',
    marginBottom: '16px'
  }}>
    <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0 }} />
    <span style={{ fontSize: '14px', color: '#ef4444', fontWeight: '500' }}>{msg}</span>
  </div>
);

const LogoBlock = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '32px' }}>
    <div style={{
      width: '52px', height: '52px', borderRadius: '16px',
      background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(6,182,212,0.4)'
    }}>
      <Lock size={26} color="#fff" strokeWidth={2.5} />
    </div>
    <div>
      <div style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', lineHeight: 1.1 }}>PayFlow</div>
      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Portal</div>
    </div>
  </div>
);

const BgPattern = () => (
  <div style={{
    position: 'absolute', inset: 0, pointerEvents: 'none',
    background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    opacity: 0.3
  }} />
);

export default Login;
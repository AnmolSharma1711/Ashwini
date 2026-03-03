/**
 * Login Component for Frontend-Main (Registration/Nurses Portal)
 */

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, PORTAL_CONFIG } from '../services/authService';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(username, password);
            console.log('Login successful:', user);
            
            // Redirect to the page they tried to visit or home
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.loginCard}>
                <div style={styles.header}>
                    <h1 style={styles.title}>🏥 Ashwini Health System</h1>
                    <h2 style={styles.subtitle}>{PORTAL_CONFIG.displayName}</h2>
                    <p style={styles.description}>
                        For Nurses, Reception Staff, and Administrators
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={styles.form}>
                    {error && (
                        <div style={styles.errorBox}>
                            <span style={styles.errorIcon}>⚠️</span>
                            {error}
                        </div>
                    )}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                            required
                            style={styles.input}
                            autoComplete="username"
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            style={styles.input}
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {})
                        }}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div style={styles.footer}>
                    <div style={styles.roleInfo}>
                        <p style={styles.roleTitle}>Authorized Roles:</p>
                        <div style={styles.roleBadges}>
                            {PORTAL_CONFIG.allowedRoles.map(role => (
                                <span key={role} style={styles.roleBadge}>
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p style={styles.footerNote}>
                        <strong>Doctors:</strong> Please use the{' '}
                        <a 
                            href={PORTAL_CONFIG.redirectUrl}
                            style={styles.link}
                        >
                            Doctor's Portal
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#e3f2fd',
        padding: '20px'
    },
    loginCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '40px',
        maxWidth: '500px',
        width: '100%'
    },
    header: {
        textAlign: 'center',
        marginBottom: '30px'
    },
    title: {
        color: '#1976d2',
        fontSize: '28px',
        marginBottom: '8px',
        fontWeight: 'bold'
    },
    subtitle: {
        color: '#333',
        fontSize: '22px',
        marginBottom: '8px'
    },
    description: {
        color: '#666',
        fontSize: '14px'
    },
    form: {
        marginBottom: '24px'
    },
    formGroup: {
        marginBottom: '20px'
    },
    label: {
        display: 'block',
        marginBottom: '8px',
        color: '#333',
        fontWeight: '500',
        fontSize: '14px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '16px',
        boxSizing: 'border-box',
        transition: 'border-color 0.3s'
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#1976d2',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '10px'
    },
    buttonDisabled: {
        backgroundColor: '#90caf9',
        cursor: 'not-allowed'
    },
    errorBox: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        border: '1px solid #ef5350',
        fontSize: '14px'
    },
    errorIcon: {
        marginRight: '8px'
    },
    footer: {
        borderTop: '1px solid #eee',
        paddingTop: '20px'
    },
    roleInfo: {
        marginBottom: '16px'
    },
    roleTitle: {
        fontSize: '12px',
        color: '#666',
        marginBottom: '8px',
        textAlign: 'center'
    },
    roleBadges: {
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        flexWrap: 'wrap'
    },
    roleBadge: {
        backgroundColor: '#e3f2fd',
        color: '#1976d2',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500'
    },
    footerNote: {
        textAlign: 'center',
        fontSize: '13px',
        color: '#666'
    },
    link: {
        color: '#1976d2',
        textDecoration: 'none',
        fontWeight: '500'
    }
};

export default Login;

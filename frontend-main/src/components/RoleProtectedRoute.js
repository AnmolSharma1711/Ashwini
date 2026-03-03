/**
 * Role-Protected Route Component for Frontend-Main
 * 
 * This component wraps routes to ensure:
 * 1. User is authenticated
 * 2. User's role is authorized for this portal (ADMIN, NURSE, or RECEPTION)
 * 3. Redirects unauthorized users to login or shows error message
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import {
    isAuthenticated,
    verifyPortalAccess,
    getUserRole,
    getCurrentUser,
    PORTAL_CONFIG
} from '../services/authService';

const RoleProtectedRoute = ({ children }) => {
    const location = useLocation();
    const [authState, setAuthState] = useState({
        loading: true,
        isAuth: false,
        hasAccess: false
    });

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = () => {
        const authenticated = isAuthenticated();
        const hasPortalAccess = verifyPortalAccess();

        setAuthState({
            loading: false,
            isAuth: authenticated,
            hasAccess: hasPortalAccess
        });
    };

    // Show loading state
    if (authState.loading) {
        return (
            <div style={styles.container}>
                <div style={styles.loader}>
                    <div style={styles.spinner}></div>
                    <p>Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // Not authenticated - redirect to login
    if (!authState.isAuth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Authenticated but wrong role - show unauthorized page
    if (!authState.hasAccess) {
        const role = getUserRole();
        const user = getCurrentUser();

        return (
            <div style={styles.container}>
                <div style={styles.unauthorizedCard}>
                    <div style={styles.iconError}>⛔</div>
                    <h1 style={styles.title}>Access Denied</h1>
                    <p style={styles.message}>
                        {PORTAL_CONFIG.unauthorizedMessage}
                    </p>
                    <div style={styles.infoBox}>
                        <p><strong>Current User:</strong> {user?.username}</p>
                        <p><strong>Your Role:</strong> {role}</p>
                        <p><strong>Portal:</strong> {PORTAL_CONFIG.displayName}</p>
                        <p><strong>Allowed Roles:</strong> {PORTAL_CONFIG.allowedRoles.join(', ')}</p>
                    </div>
                    {role === 'DOCTOR' && (
                        <div style={styles.redirectBox}>
                            <p style={styles.redirectText}>
                                As a Doctor, you should use the <strong>Doctor's Portal</strong>.
                            </p>
                            <a 
                                href={PORTAL_CONFIG.redirectUrl} 
                                style={styles.redirectButton}
                            >
                                Go to Doctor's Portal →
                            </a>
                        </div>
                    )}
                    <button
                        onClick={() => window.location.href = '/login'}
                        style={styles.logoutButton}
                    >
                        Logout & Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // Authenticated and authorized - render children
    return <>{children}</>;
};

// Inline styles for unauthorized page
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px'
    },
    loader: {
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
    },
    unauthorizedCard: {
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        padding: '40px',
        maxWidth: '600px',
        textAlign: 'center'
    },
    iconError: {
        fontSize: '64px',
        marginBottom: '20px'
    },
    title: {
        color: '#d32f2f',
        fontSize: '32px',
        marginBottom: '16px',
        fontWeight: 'bold'
    },
    message: {
        fontSize: '18px',
        color: '#666',
        marginBottom: '24px',
        lineHeight: '1.6'
    },
    infoBox: {
        backgroundColor: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        textAlign: 'left'
    },
    redirectBox: {
        backgroundColor: '#e3f2fd',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '2px solid #2196f3'
    },
    redirectText: {
        color: '#1976d2',
        marginBottom: '16px',
        fontSize: '16px'
    },
    redirectButton: {
        display: 'inline-block',
        backgroundColor: '#2196f3',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: 'bold',
        fontSize: '16px',
        transition: 'background-color 0.3s'
    },
    logoutButton: {
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        borderRadius: '6px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s'
    }
};

// Add keyframe animation for spinner (you may need to add this to your CSS file)
const styleSheet = document.styleSheets[0];
if (styleSheet) {
    try {
        styleSheet.insertRule(`
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `, styleSheet.cssRules.length);
    } catch (e) {
        // Ignore if animation already exists
    }
}

export default RoleProtectedRoute;

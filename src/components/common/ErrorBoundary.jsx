import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    backgroundColor: '#f1f5f9',
                    padding: '1rem'
                }}>
                    <div style={{
                        textAlign: 'center',
                        maxWidth: '400px',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '2.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: '#fef2f2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            fontSize: '28px'
                        }}>
                            !
                        </div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                            Something went wrong
                        </h2>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                            An unexpected error occurred. Please reload the page to continue.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                background: '#0f172a',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.625rem 1.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;

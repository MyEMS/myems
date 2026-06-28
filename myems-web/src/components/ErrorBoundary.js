import React, { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render() {
        if (this.state.hasError) {
            const isDevelopment = process.env.NODE_ENV === 'development';

            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    maxWidth: '600px',
                    margin: '100px auto',
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>Page Loading Error</h2>
                    <p style={{ color: '#6c757d', marginBottom: '24px' }}>
                        Sorry, an error occurred while loading this page. Please try refreshing the page or returning to the homepage.
                    </p>

                    {isDevelopment && (
                        <details style={{
                            textAlign: 'left',
                            backgroundColor: '#f8f9fa',
                            padding: '16px',
                            borderRadius: '4px',
                            marginBottom: '24px',
                            maxHeight: '200px',
                            overflow: 'auto'
                        }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                                Error Details (Developer Information)
                            </summary>
                            <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {this.state.error && this.state.error.toString()}
                                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
                        </details>
                    )}

                    <div>
                        <button
                            onClick={this.handleReset}
                            style={{
                                padding: '10px 24px',
                                marginRight: '12px',
                                backgroundColor: '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '10px 24px',
                                backgroundColor: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Return to Homepage
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

ErrorBoundary.propTypes = {
    children: PropTypes.node.isRequired
};

export default ErrorBoundary;
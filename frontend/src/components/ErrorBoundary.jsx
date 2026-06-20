import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container py-5 text-center mt-5">
          <div className="card shadow-lg p-5 mx-auto border-0" style={{ maxWidth: '600px' }}>
            <div className="text-danger mb-4">
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '4rem' }}></i>
            </div>
            <h2 className="mb-3 display-font text-dark">Something went wrong</h2>
            <p className="text-muted mb-4">
              An unexpected error has occurred in the application rendering loop.
            </p>
            {this.state.error && (
              <div className="alert alert-light border text-start mb-4 overflow-auto" style={{ maxHeight: '150px' }}>
                <code className="small">{this.state.error.toString()}</code>
              </div>
            )}
            <div className="d-flex justify-content-center gap-3">
              <button 
                className="btn btn-primary px-4" 
                onClick={() => window.location.reload()}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>Reload App
              </button>
              <button 
                className="btn btn-outline-secondary px-4" 
                onClick={() => this.setState({ hasError: false, error: null })}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

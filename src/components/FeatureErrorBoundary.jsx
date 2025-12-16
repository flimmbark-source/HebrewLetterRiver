import React from 'react';
import PropTypes from 'prop-types';

/**
 * Feature-level Error Boundary
 * Lighter weight error boundary for non-critical features
 */
class FeatureErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[FeatureErrorBoundary: ${this.props.featureName}]`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Hide feature silently if configured
      if (this.props.silent) {
        return null;
      }

      // Show minimal error UI
      return (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            {this.props.message || `Unable to load ${this.props.featureName || 'this feature'}`}
          </p>
          {this.props.showRetry && (
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 w-full text-xs text-cyan-400 hover:text-cyan-300"
            >
              Try again
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

FeatureErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  featureName: PropTypes.string,
  message: PropTypes.string,
  silent: PropTypes.bool,
  showRetry: PropTypes.bool
};

export default FeatureErrorBoundary;

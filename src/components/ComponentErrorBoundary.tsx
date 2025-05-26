import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ComponentErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 text-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-yellow-500 text-xl mb-2"
          />
          <h3 className="text-sm font-medium text-white mb-1">
            Component Error
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            This component encountered an error.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="text-xs text-purple-400 hover:text-purple-300 underline"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 
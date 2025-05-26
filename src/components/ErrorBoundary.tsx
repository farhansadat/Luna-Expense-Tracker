import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faHome } from '@fortawesome/free-solid-svg-icons';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-gray-900 to-blue-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 text-center"
      >
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-yellow-500 text-5xl mb-6"
        />
        <h1 className="text-2xl font-bold text-white mb-4">
          {isRouteErrorResponse(error)
            ? error.status === 404
              ? 'Page Not Found'
              : 'Oops! Something went wrong'
            : 'Unexpected Error'}
        </h1>
        <p className="text-gray-300 mb-8">
          {isRouteErrorResponse(error)
            ? error.status === 404
              ? "We couldn't find the page you're looking for."
              : 'An error occurred while processing your request.'
            : 'An unexpected error occurred.'}
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/"
            className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            <FontAwesomeIcon icon={faHome} />
            <span>Go Home</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
} 
import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error boundary caught an error:", error, errorInfo);

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === "production") {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-catalog-bg px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-6 bg-royal/10 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-royal"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-royal mb-4">
              Nimadir noto'g'ri ketdi
            </h2>
            <p className="text-royal-dark mb-6">
              Sahifani yuklashda xatolik yuz berdi. Iltimos, sahifani yangilang
              yoki qaytadan urinib ko'ring.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-royal text-white font-semibold rounded-full hover:bg-royal-light transition-colors duration-300 shadow-lg hover:shadow-catalog-hover"
            >
              Sahifani yangilash
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

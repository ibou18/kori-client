"use client";

import { AlertCircle, Home, RefreshCw, Scissors } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("❌ Erreur capturée par ErrorBoundary:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#FEFCF9] px-4">
          <div className="w-full max-w-md">
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              {/* Logo/Icon */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#F0F4F1] blur-xl"></div>
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#F0F4F1]">
                    <Scissors className="h-10 w-10 text-[#53745D]" />
                  </div>
                </div>
              </div>

              {/* Error Icon */}
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-red-50 p-3">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </div>

              {/* Title */}
              <h1 className="mb-3 text-center text-2xl font-bold text-gray-900">
                Oups ! Une erreur s&apos;est produite
              </h1>

              {/* Message */}
              <p className="mb-2 text-center text-gray-600">
                Désolé, quelque chose s&apos;est mal passé dans votre espace
                korí.
              </p>
              <p className="mb-8 text-center text-sm text-gray-500">
                Ne vous inquiétez pas, nous sommes là pour vous aider à
                retrouver votre routine beauté.
              </p>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#53745D] px-6 py-3 font-medium text-white transition-all hover:bg-[#4A6854] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#53745D] focus:ring-offset-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Réessayer
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                >
                  <Home className="h-4 w-4" />
                  Retour à l&apos;accueil
                </button>
              </div>

              {/* Help Text */}
              <p className="mt-6 text-center text-xs text-gray-400">
                Si le problème persiste, contactez notre support client
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

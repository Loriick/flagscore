"use client";

import Image from "next/image";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Here we could send the error to a monitoring service like Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <div className="max-w-md mx-auto text-center">
            <Image
              src="/404.png"
              alt="Erreur"
              className="w-24 h-24 mx-auto mb-6 opacity-60"
              width={100}
              height={100}
            />
            <h1 className="text-2xl font-bold mb-4">
              Oups ! Une erreur s'est produite
            </h1>
            <p className="text-white/80 mb-6">
              Nous rencontrons actuellement un problème technique. Veuillez
              réessayer dans quelques instants.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Recharger la page
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Retour à l'accueil
              </button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-white/60 mb-2">
                  Détails de l'erreur (développement)
                </summary>
                <pre className="text-xs text-red-400 bg-red-900/20 p-3 rounded overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

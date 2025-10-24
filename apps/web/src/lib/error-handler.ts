import { toast } from "sonner";

export interface ErrorHandlerOptions {
  showToast?: boolean;
  logError?: boolean;
  fallbackMessage?: string;
}

export class ErrorHandler {
  static handle(
    error: unknown,
    context: string,
    options: ErrorHandlerOptions = {}
  ) {
    const {
      showToast = true,
      logError = true,
      fallbackMessage = "Une erreur inattendue s'est produite",
    } = options;

    const errorMessage =
      error instanceof Error ? error.message : fallbackMessage;
    const fullMessage = `${context}: ${errorMessage}`;

    if (logError) {
      console.error(fullMessage, error);
    }

    if (showToast) {
      toast.error("Erreur", {
        description: errorMessage,
        duration: 5000,
      });
    }

    return errorMessage;
  }

  static handleApiError(
    error: unknown,
    endpoint: string,
    options: ErrorHandlerOptions = {}
  ) {
    return this.handle(error, `Erreur API (${endpoint})`, {
      fallbackMessage: "Erreur de communication avec le serveur",
      ...options,
    });
  }

  static handleNetworkError(error: unknown, options: ErrorHandlerOptions = {}) {
    return this.handle(error, "Erreur réseau", {
      fallbackMessage:
        "Problème de connexion. Vérifiez votre connexion internet.",
      ...options,
    });
  }

  static handleValidationError(
    error: unknown,
    field: string,
    options: ErrorHandlerOptions = {}
  ) {
    return this.handle(error, `Erreur de validation (${field})`, {
      fallbackMessage: "Données invalides",
      ...options,
    });
  }
}

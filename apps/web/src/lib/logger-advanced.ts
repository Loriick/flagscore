// Types pour les logs
export interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

export interface LogContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

class LoggerService {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeUserTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeUserTracking() {
    // Générer un ID utilisateur anonyme basé sur le localStorage
    if (typeof window !== "undefined") {
      let userId = localStorage.getItem("flagscore_user_id");
      if (!userId) {
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("flagscore_user_id", userId);
      }
      this.userId = userId;
    }
  }

  private createLogEntry(
    level: LogEntry["level"],
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : undefined,
    };
  }

  private async sendToVercel(logEntry: LogEntry) {
    try {
      // Envoyer à Vercel Analytics
      if (
        typeof window !== "undefined" &&
        (
          window as unknown as {
            analytics?: {
              track: (event: string, data: Record<string, unknown>) => void;
            };
          }
        ).analytics
      ) {
        (
          window as unknown as {
            analytics: {
              track: (event: string, data: Record<string, unknown>) => void;
            };
          }
        ).analytics.track("log_event", {
          level: logEntry.level,
          message: logEntry.message,
          data: logEntry.data,
          timestamp: logEntry.timestamp,
          userId: logEntry.userId,
          sessionId: logEntry.sessionId,
        });
      }

      // Envoyer à notre API pour stockage
      await fetch("/api/logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du log:", error);
    }
  }

  private async sendToSupabase(logEntry: LogEntry) {
    try {
      // Envoyer à Supabase pour stockage persistant
      const response = await fetch("/api/logs/supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logEntry),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du log à Supabase:", error);
    }
  }

  // Méthodes publiques
  async info(message: string, data?: Record<string, unknown>) {
    const logEntry = this.createLogEntry("info", message, data);

    // Log local
    console.log(`[INFO] ${message}`, data);

    // Envoyer aux services externes
    await Promise.allSettled([
      this.sendToVercel(logEntry),
      this.sendToSupabase(logEntry),
    ]);
  }

  async warn(message: string, data?: Record<string, unknown>) {
    const logEntry = this.createLogEntry("warn", message, data);

    // Log local
    console.warn(`[WARN] ${message}`, data);

    // Envoyer aux services externes
    await Promise.allSettled([
      this.sendToVercel(logEntry),
      this.sendToSupabase(logEntry),
    ]);
  }

  async error(message: string, data?: Record<string, unknown>) {
    const logEntry = this.createLogEntry("error", message, data);

    // Log local
    console.error(`[ERROR] ${message}`, data);

    // Envoyer aux services externes
    await Promise.allSettled([
      this.sendToVercel(logEntry),
      this.sendToSupabase(logEntry),
    ]);
  }

  async debug(message: string, data?: Record<string, unknown>) {
    const logEntry = this.createLogEntry("debug", message, data);

    // Log local seulement en développement
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, data);
    }

    // Envoyer aux services externes seulement en production
    if (process.env.NODE_ENV === "production") {
      await Promise.allSettled([
        this.sendToVercel(logEntry),
        this.sendToSupabase(logEntry),
      ]);
    }
  }

  // Méthodes spécialisées pour Flagscore
  async logSupabaseSync(action: string, data?: Record<string, unknown>) {
    await this.info(`Supabase Sync: ${action}`, {
      action,
      ...data,
    });
  }

  async logFFFAAPI(call: string, data?: Record<string, unknown>) {
    await this.info(`FFFA API Call: ${call}`, {
      apiCall: call,
      ...data,
    });
  }

  async logUserAction(action: string, data?: Record<string, unknown>) {
    await this.info(`User Action: ${action}`, {
      userAction: action,
      userId: this.userId,
      sessionId: this.sessionId,
      ...data,
    });
  }

  async logPerformance(
    metric: string,
    value: number,
    data?: Record<string, unknown>
  ) {
    await this.info(`Performance: ${metric}`, {
      metric,
      value,
      ...data,
    });
  }

  // Méthode pour récupérer les logs (pour debugging)
  async getLogs(limit = 100): Promise<LogEntry[]> {
    try {
      const response = await fetch(`/api/logs?limit=${limit}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
      return [];
    }
  }
}

// Instance singleton
export const logger = new LoggerService();

// Hook React pour utiliser le logger
export function useLogger() {
  return logger;
}

// Fonctions utilitaires
export const logSupabaseSync = (
  action: string,
  data?: Record<string, unknown>
) => logger.logSupabaseSync(action, data);

export const logFFFAAPI = (call: string, data?: Record<string, unknown>) =>
  logger.logFFFAAPI(call, data);

export const logUserAction = (action: string, data?: Record<string, unknown>) =>
  logger.logUserAction(action, data);

export const logPerformance = (
  metric: string,
  value: number,
  data?: Record<string, unknown>
) => logger.logPerformance(metric, value, data);

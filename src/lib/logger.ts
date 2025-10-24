// Logger simplifié pour Next.js (compatible client/server)

const logColors = {
  error: "🔴",
  warn: "🟡",
  info: "🟢",
  debug: "🔵",
};

// Logger côté serveur (Node.js)
const serverLogger = {
  error: (message: string, meta?: any) => {
    console.error(
      `${logColors.error} [ERROR] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
  warn: (message: string, meta?: any) => {
    console.warn(
      `${logColors.warn} [WARN] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
  info: (message: string, meta?: any) => {
    console.info(
      `${logColors.info} [INFO] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
  debug: (message: string, meta?: any) => {
    console.debug(
      `${logColors.debug} [DEBUG] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
};

// Logger côté client (Browser)
const clientLogger = {
  error: (message: string, meta?: any) => {
    console.error(
      `${logColors.error} [ERROR] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
  warn: (message: string, meta?: any) => {
    console.warn(
      `${logColors.warn} [WARN] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
  info: (message: string, meta?: any) => {
    console.info(
      `${logColors.info} [INFO] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
  debug: (message: string, meta?: any) => {
    console.debug(
      `${logColors.debug} [DEBUG] ${new Date().toISOString()}: ${message}`,
      meta || ""
    );
  },
};

// Logger universel
const logger = typeof window === "undefined" ? serverLogger : clientLogger;

// Interface pour les métriques personnalisées
interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

// Fonction pour logger les métriques
export const logMetric = (data: MetricData) => {
  logger.info("METRIC", {
    metric: data.name,
    value: data.value,
    tags: data.tags || {},
    timestamp: data.timestamp || new Date(),
  });
};

// Fonction pour logger les événements utilisateur
export const logUserEvent = (
  event: string,
  userId?: string,
  metadata?: Record<string, any>
) => {
  logger.info("USER_EVENT", {
    event,
    userId,
    metadata: metadata || {},
    timestamp: new Date(),
  });
};

// Fonction pour logger les performances
export const logPerformance = (
  operation: string,
  duration: number,
  metadata?: Record<string, any>
) => {
  logger.info("PERFORMANCE", {
    operation,
    duration,
    metadata: metadata || {},
    timestamp: new Date(),
  });
};

// Fonction pour logger les erreurs API
export const logApiError = (
  endpoint: string,
  error: Error,
  statusCode?: number
) => {
  logger.error("API_ERROR", {
    endpoint,
    error: error.message,
    stack: error.stack,
    statusCode,
    timestamp: new Date(),
  });
};

// Fonction pour logger les requêtes HTTP
export const logHttpRequest = (
  method: string,
  url: string,
  statusCode: number,
  responseTime: number
) => {
  logger.info("HTTP_REQUEST", {
    method,
    url,
    statusCode,
    responseTime,
    timestamp: new Date(),
  });
};

export default logger;

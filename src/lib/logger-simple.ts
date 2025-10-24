interface LogLevel {
  error: 0;
  warn: 1;
  info: 2;
  debug: 3;
}

const logLevels: LogLevel = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logColors = {
  error: "🔴",
  warn: "🟡",
  info: "🟢",
  debug: "🔵",
};

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

const logger = typeof window === "undefined" ? serverLogger : clientLogger;

interface MetricData {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

export const logMetric = (data: MetricData) => {
  logger.info("METRIC", {
    metric: data.name,
    value: data.value,
    tags: data.tags || {},
    timestamp: data.timestamp || new Date(),
  });
};

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

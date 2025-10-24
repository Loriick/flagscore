import React from "react";
import { NextRequest, NextResponse } from "next/server";
import logger, { logHttpRequest, logApiError } from "./logger";

export function withMonitoring<T = any>(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (req: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const method = req.method;
    const url = req.url;

    try {
      logger.info("API_REQUEST_START", {
        method,
        url,
        userAgent: req.headers.get("user-agent"),
        ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip"),
        timestamp: new Date(),
      });

      const response = await handler(req, ...args);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      logger.info("API_REQUEST_SUCCESS", {
        method,
        url,
        statusCode: response.status,
        responseTime,
        timestamp: new Date(),
      });

      logHttpRequest(method, url, response.status, responseTime);

      response.headers.set("X-Response-Time", `${responseTime}ms`);
      response.headers.set("X-Request-ID", generateRequestId());

      return response;
    } catch (error) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      logger.error("API_REQUEST_ERROR", {
        method,
        url,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        responseTime,
        timestamp: new Date(),
      });

      logApiError(
        url,
        error instanceof Error ? error : new Error(String(error))
      );

      return NextResponse.json(
        {
          error: "Internal Server Error",
          requestId: generateRequestId(),
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      ) as NextResponse<T>;
    }
  };
}

function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function usePerformanceMonitor(componentName: string) {
  const startTime = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime.current;

      logger.info("COMPONENT_MOUNT_TIME", {
        component: componentName,
        duration,
        timestamp: new Date(),
      });
    };
  }, [componentName]);
}

export const logClientPerformance = (
  metricName: string,
  value: number,
  metadata?: Record<string, any>
) => {
  if (typeof window !== "undefined") {
    fetch("/api/metrics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metric: metricName,
        value,
        metadata: metadata || {},
        timestamp: new Date(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch((error) => {
      console.error("Failed to send performance metrics:", error);
    });
  }
};

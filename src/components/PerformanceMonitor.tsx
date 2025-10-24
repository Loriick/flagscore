"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface PerformanceMonitorProps {
  children: React.ReactNode;
  enabled?: boolean;
}

export function PerformanceMonitor({
  children,
  enabled = process.env.NODE_ENV === "development",
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Observer les métriques Web Vitals
    const observeWebVitals = () => {
      // First Contentful Paint
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (
              entry.entryType === "paint" &&
              entry.name === "first-contentful-paint"
            ) {
              setMetrics(
                prev =>
                  ({
                    ...prev,
                    fcp: entry.startTime,
                  }) as PerformanceMetrics
              );
            }
          }
        });
        observer.observe({ entryTypes: ["paint"] });
      }

      // Largest Contentful Paint
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver(list => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          setMetrics(
            prev =>
              ({
                ...prev,
                lcp: lastEntry.startTime,
              }) as PerformanceMetrics
          );
        });
        observer.observe({ entryTypes: ["largest-contentful-paint"] });
      }

      // First Input Delay
      if ("PerformanceObserver" in window) {
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "first-input") {
              const firstInputEntry = entry as PerformanceEventTiming;
              setMetrics(
                prev =>
                  ({
                    ...prev,
                    fid:
                      firstInputEntry.processingStart -
                      firstInputEntry.startTime,
                  }) as PerformanceMetrics
              );
            }
          }
        });
        observer.observe({ entryTypes: ["first-input"] });
      }

      // Cumulative Layout Shift
      if ("PerformanceObserver" in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            const layoutShiftEntry = entry as unknown as {
              hadRecentInput: boolean;
              value: number;
            };
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          setMetrics(
            prev =>
              ({
                ...prev,
                cls: clsValue,
              }) as PerformanceMetrics
          );
        });
        observer.observe({ entryTypes: ["layout-shift"] });
      }
    };

    // Time to First Byte
    const measureTTFB = () => {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        setMetrics(
          prev =>
            ({
              ...prev,
              ttfb: navigation.responseStart - navigation.requestStart,
            }) as PerformanceMetrics
        );
      }
    };

    // Démarrer l'observation
    observeWebVitals();
    measureTTFB();

    // Afficher le panneau après 3 secondes
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, [enabled]);

  if (!enabled || !isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {children}

      {/* Panneau de performance */}
      <div className="fixed bottom-4 left-4 bg-black/90 text-white p-4 rounded-lg shadow-lg z-50 text-xs font-mono">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold">Performance</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>

        {metrics && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span>FCP:</span>
              <span className={getMetricColor(metrics.fcp, [0, 1800, 3000])}>
                {metrics.fcp ? Math.round(metrics.fcp) : "N/A"}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>LCP:</span>
              <span className={getMetricColor(metrics.lcp, [0, 2500, 4000])}>
                {metrics.lcp ? Math.round(metrics.lcp) : "N/A"}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>FID:</span>
              <span className={getMetricColor(metrics.fid, [0, 100, 300])}>
                {metrics.fid ? Math.round(metrics.fid) : "N/A"}ms
              </span>
            </div>
            <div className="flex justify-between">
              <span>CLS:</span>
              <span className={getMetricColor(metrics.cls, [0, 0.1, 0.25])}>
                {metrics.cls ? metrics.cls.toFixed(3) : "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>TTFB:</span>
              <span className={getMetricColor(metrics.ttfb, [0, 800, 1800])}>
                {metrics.ttfb ? Math.round(metrics.ttfb) : "N/A"}ms
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function getMetricColor(
  value: number,
  thresholds: [number, number, number]
): string {
  if (value <= thresholds[0]) return "text-green-400";
  if (value <= thresholds[1]) return "text-yellow-400";
  return "text-red-400";
}

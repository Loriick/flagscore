"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricData {
  metric: string;
  value: number;
  metadata?: Record<string, any>;
  timestamp: string;
}

interface MetricsStats {
  count: number;
  average: number;
  min: number;
  max: number;
  sum: number;
}

interface MetricsResponse {
  metrics: MetricData[];
  stats: MetricsStats;
  total: number;
  timestamp: string;
}

function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>("");

  const fetchMetrics = async (metricName?: string) => {
    try {
      setLoading(true);
      setError(null);

      const url = metricName
        ? `/api/metrics?metric=${metricName}&limit=50`
        : "/api/metrics?limit=50";

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics(selectedMetric);

    // Rafraîchir les métriques toutes les 30 secondes
    const interval = setInterval(() => {
      fetchMetrics(selectedMetric);
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedMetric]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("fr-FR");
  };

  const formatValue = (value: number) => {
    if (value < 1000) {
      return `${value.toFixed(2)}ms`;
    }
    return `${(value / 1000).toFixed(2)}s`;
  };

  if (loading && !metrics) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard de Monitoring</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard de Monitoring</h1>
        <Card className="border-red-500">
          <CardContent className="p-6">
            <p className="text-red-500">
              Erreur lors du chargement des métriques: {error}
            </p>
            <button
              onClick={() => fetchMetrics(selectedMetric)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Réessayer
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard de Monitoring</h1>
        <div className="flex gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">Toutes les métriques</option>
            <option value="page_load">Chargement de page</option>
            <option value="api_rankings">API Rankings</option>
            <option value="api_matches">API Matches</option>
            <option value="scroll_duration">Durée de scroll</option>
          </select>
          <button
            onClick={() => fetchMetrics(selectedMetric)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Actualiser
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Statistiques générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total des métriques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Moyenne
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(metrics.stats.average)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Minimum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(metrics.stats.min)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">
                  Maximum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatValue(metrics.stats.max)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des métriques récentes */}
          <Card>
            <CardHeader>
              <CardTitle>Métriques récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Métrique</th>
                      <th className="text-left p-2">Valeur</th>
                      <th className="text-left p-2">Timestamp</th>
                      <th className="text-left p-2">Métadonnées</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.metrics.slice(0, 20).map((metric, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-mono text-xs">
                          {metric.metric}
                        </td>
                        <td className="p-2 font-bold">
                          {formatValue(metric.value)}
                        </td>
                        <td className="p-2 text-gray-600">
                          {formatTimestamp(metric.timestamp)}
                        </td>
                        <td className="p-2">
                          {metric.metadata &&
                          Object.keys(metric.metadata).length > 0 ? (
                            <div className="text-xs text-gray-500">
                              {Object.entries(metric.metadata).map(
                                ([key, value]) => (
                                  <div key={key}>
                                    <span className="font-semibold">
                                      {key}:
                                    </span>{" "}
                                    {String(value)}
                                  </div>
                                )
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

export default function MonitoringPage() {
  return <MonitoringDashboard />;
}

"use client";

import { useState, useEffect } from "react";

import { logger, useLogger, LogEntry } from "@/lib/logger-advanced";

export default function LogsMonitor() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    level: "",
    limit: 50,
  });

  const loggerInstance = useLogger();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const fetchedLogs = await loggerInstance.getLogs(filter.limit);
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Erreur lors de la récupération des logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const testLogging = async () => {
    await logger.info("Test log depuis la page de monitoring", {
      timestamp: new Date().toISOString(),
      test: true,
    });

    await logger.warn("Test warning", {
      warning: "Ceci est un test de warning",
    });

    await logger.error("Test error", {
      error: "Ceci est un test d'erreur",
    });

    await logger.logSupabaseSync("test_sync", {
      action: "test",
      data: { test: true },
    });

    await logger.logFFFAAPI("test_api_call", {
      endpoint: "/test",
      method: "GET",
    });

    await logger.logUserAction("test_user_action", {
      action: "click",
      element: "test_button",
    });

    await logger.logPerformance("test_metric", 123.45, {
      metric: "response_time",
      unit: "ms",
    });

    // Rafraîchir les logs après les tests
    setTimeout(fetchLogs, 1000);
  };

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50 border-red-200";
      case "warn":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "info":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "debug":
        return "text-gray-600 bg-gray-50 border-gray-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const filteredLogs = logs.filter(
    log => !filter.level || log.level === filter.level
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Monitoring des Logs</h1>

        {/* Contrôles */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contrôles</h2>
          <div className="flex gap-4 items-center mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Niveau:</label>
              <select
                value={filter.level}
                onChange={e => setFilter({ ...filter, level: e.target.value })}
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Tous</option>
                <option value="error">Error</option>
                <option value="warn">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Limite:</label>
              <select
                value={filter.limit}
                onChange={e =>
                  setFilter({ ...filter, limit: parseInt(e.target.value) })
                }
                className="border border-gray-300 rounded-md px-3 py-2"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Chargement..." : "Actualiser"}
            </button>
            <button
              onClick={testLogging}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
            >
              Test Logging
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {logs.filter(log => log.level === "error").length}
              </div>
              <div className="text-sm text-gray-600">Erreurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {logs.filter(log => log.level === "warn").length}
              </div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {logs.filter(log => log.level === "info").length}
              </div>
              <div className="text-sm text-gray-600">Infos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {logs.filter(log => log.level === "debug").length}
              </div>
              <div className="text-sm text-gray-600">Debug</div>
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Logs ({filteredLogs.length})
          </h2>

          {filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Aucun log trouvé
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredLogs.map((log, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-md border ${getLevelColor(log.level)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm uppercase">
                        {log.level}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {log.userId && `User: ${log.userId.substring(0, 8)}...`}
                      {log.sessionId &&
                        ` | Session: ${log.sessionId.substring(0, 8)}...`}
                    </div>
                  </div>

                  <div className="font-medium mb-2">{log.message}</div>

                  {log.data && Object.keys(log.data).length > 0 && (
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                        Données ({Object.keys(log.data).length} propriétés)
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </details>
                  )}

                  {log.url && (
                    <div className="text-xs text-gray-500 mt-2">
                      URL: {log.url}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

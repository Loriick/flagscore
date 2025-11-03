import { NextRequest } from "next/server";

import {
  createOptimizedResponse,
  createErrorResponse,
} from "@/lib/compression";

// Handlers implémentés plus bas

// Interface pour les logs
interface LogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
}

// Stockage temporaire des logs (en production, utiliser une base de données)
const logs: LogEntry[] = [];
const MAX_LOGS = 1000; // Limite pour éviter la surcharge mémoire

export async function POST(request: NextRequest) {
  try {
    const logEntry: LogEntry = await request.json();

    // Validation basique
    if (!logEntry.level || !logEntry.message) {
      return createErrorResponse("Invalid log entry", 400);
    }

    // Ajouter le log
    logs.push(logEntry);

    // Maintenir la limite
    if (logs.length > MAX_LOGS) {
      logs.splice(0, logs.length - MAX_LOGS);
    }

    // Log côté serveur aussi
    console.log(
      `[${logEntry.level.toUpperCase()}] ${logEntry.message}`,
      logEntry.data
    );

    return createOptimizedResponse({ success: true, logged: true });
  } catch (error) {
    console.error("Erreur lors du traitement du log:", error);
    return createErrorResponse("Failed to process log", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    const level = searchParams.get("level");
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    // Filtrer les logs
    let filteredLogs = [...logs];

    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === userId);
    }

    if (sessionId) {
      filteredLogs = filteredLogs.filter(log => log.sessionId === sessionId);
    }

    // Limiter et trier par timestamp (plus récent en premier)
    const result = filteredLogs
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);

    return createOptimizedResponse({
      logs: result,
      total: filteredLogs.length,
      limit,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des logs:", error);
    return createErrorResponse("Failed to retrieve logs", 500);
  }
}

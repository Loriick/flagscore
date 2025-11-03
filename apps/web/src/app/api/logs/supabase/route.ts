import { NextRequest } from "next/server";

import {
  createOptimizedResponse,
  createErrorResponse,
} from "@/lib/compression";

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

export async function POST(request: NextRequest) {
  try {
    const logEntry: LogEntry = await request.json();

    // Validation basique
    if (!logEntry.level || !logEntry.message) {
      return createErrorResponse("Invalid log entry", 400);
    }

    // Créer la table logs dans Supabase si elle n'existe pas
    // Pour l'instant, on va juste logger côté serveur
    console.log(
      `[SUPABASE LOG] [${logEntry.level.toUpperCase()}] ${logEntry.message}`,
      {
        ...logEntry.data,
        userId: logEntry.userId,
        sessionId: logEntry.sessionId,
        url: logEntry.url,
        userAgent: logEntry.userAgent,
      }
    );

    // TODO: Implémenter l'insertion dans Supabase
    // await SupabaseService.insertLog(logEntry);

    return createOptimizedResponse({ success: true, logged: true });
  } catch (error) {
    console.error("Erreur lors du traitement du log Supabase:", error);
    return createErrorResponse("Failed to process Supabase log", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "100");
    // const level = searchParams.get("level");
    // const userId = searchParams.get("userId");
    // const sessionId = searchParams.get("sessionId");

    // TODO: Implémenter la récupération depuis Supabase
    // const logs = await SupabaseService.getLogs({ limit, level, userId, sessionId });

    return createOptimizedResponse({
      logs: [],
      total: 0,
      limit,
      message: "Supabase logging not yet implemented",
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des logs Supabase:", error);
    return createErrorResponse("Failed to retrieve Supabase logs", 500);
  }
}

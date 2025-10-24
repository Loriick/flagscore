import { NextRequest } from "next/server";

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  message?: string;
}

// Stockage en mémoire pour le rate limiting
// En production, utiliser Redis ou une base de données
class RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  get(key: string): { count: number; resetTime: number } | undefined {
    const record = this.store.get(key);
    if (record && Date.now() > record.resetTime) {
      this.store.delete(key);
      return undefined;
    }
    return record;
  }

  set(key: string, count: number, resetTime: number): void {
    this.store.set(key, { count, resetTime });
  }

  increment(key: string): number {
    const record = this.get(key);
    if (!record) {
      return 1;
    }
    return record.count + 1;
  }

  // Nettoyer les entrées expirées périodiquement
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const store = new RateLimitStore();

// Nettoyer le store toutes les 5 minutes
setInterval(() => store.cleanup(), 5 * 60 * 1000);

export function createRateLimit(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest): RateLimitResult {
    const key = getClientIdentifier(request);
    const now = Date.now();
    const windowStart = now - config.windowMs;

    const record = store.get(key);

    if (!record || record.resetTime < windowStart) {
      // Nouvelle fenêtre ou première requête
      const resetTime = now + config.windowMs;
      store.set(key, 1, resetTime);

      return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    }

    const currentCount = record.count;

    if (currentCount >= config.maxRequests) {
      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime: record.resetTime,
        message:
          config.message || "Trop de requêtes. Veuillez réessayer plus tard.",
      };
    }

    // Incrémenter le compteur
    const newCount = store.increment(key);
    store.set(key, newCount, record.resetTime);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - newCount,
      resetTime: record.resetTime,
    };
  };
}

function getClientIdentifier(request: NextRequest): string {
  // Priorité : IP réelle > IP forwarded > IP par défaut
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip =
    realIp ||
    (forwarded ? forwarded.split(",")[0].trim() : null) ||
    "127.0.0.1";

  // Ajouter l'User-Agent pour une identification plus précise
  const userAgent = request.headers.get("user-agent") || "";
  const userAgentHash = userAgent.slice(0, 50); // Limiter la taille

  return `${ip}:${userAgentHash}`;
}

// Configurations prédéfinies
export const rateLimitConfigs = {
  // API générale : 100 requêtes par 15 minutes
  api: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
    message:
      "Limite de requêtes API atteinte. Veuillez réessayer dans 15 minutes.",
  },

  // API de données : 50 requêtes par 5 minutes
  dataApi: {
    windowMs: 5 * 60 * 1000,
    maxRequests: 50,
    message:
      "Limite de requêtes de données atteinte. Veuillez réessayer dans 5 minutes.",
  },

  // API stricte : 20 requêtes par minute
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    message:
      "Limite de requêtes stricte atteinte. Veuillez réessayer dans 1 minute.",
  },

  // Authentification : 5 tentatives par 15 minutes
  auth: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message:
      "Trop de tentatives d'authentification. Veuillez réessayer dans 15 minutes.",
  },
} as const;

// Fonctions utilitaires
export function getRateLimitHeaders(
  result: RateLimitResult
): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
  };
}

export function isRateLimited(result: RateLimitResult): boolean {
  return !result.success;
}

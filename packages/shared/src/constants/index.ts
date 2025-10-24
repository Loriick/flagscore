// Constants will be added here
export const API_ENDPOINTS = {
  CHAMPIONSHIPS: "/api/championships",
  POOLS: "/api/pools",
  DAYS: "/api/days",
  MATCHES: "/api/matches",
  RANKINGS: "/api/rankings",
} as const;

export const CACHE_DURATION = {
  SHORT: 2 * 60 * 1000, // 2 minutes
  MEDIUM: 5 * 60 * 1000, // 5 minutes
  LONG: 30 * 60 * 1000, // 30 minutes
} as const;

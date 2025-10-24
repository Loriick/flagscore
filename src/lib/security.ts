// Security configuration for Flagscore application

export const securityConfig = {
  // Content Security Policy
  csp: {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-eval'", // Required for Next.js in development
      "'unsafe-inline'", // Required for some components
      "https://vercel.live",
      "https://va.vercel-scripts.com",
    ],
    "style-src": [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS
      "https://fonts.googleapis.com",
    ],
    "font-src": ["'self'", "https://fonts.gstatic.com"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "connect-src": [
      "'self'",
      "https://api.example.com", // API FFFA
      "https://vitals.vercel-insights.com",
    ],
    "frame-src": ["'none'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    "upgrade-insecure-requests": [],
  },

  // Headers de sécurité
  headers: {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy":
      "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    "X-XSS-Protection": "1; mode=block",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  },

  // Rate limiting
  rateLimit: {
    // API générale
    api: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,
      message:
        "Limite de requêtes API atteinte. Veuillez réessayer dans 15 minutes.",
    },

    // API de données
    dataApi: {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 50,
      message:
        "Limite de requêtes de données atteinte. Veuillez réessayer dans 5 minutes.",
    },

    // API stricte (métriques, monitoring)
    strict: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20,
      message:
        "Limite de requêtes stricte atteinte. Veuillez réessayer dans 1 minute.",
    },

    // Authentification (si ajoutée plus tard)
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      message:
        "Trop de tentatives d'authentification. Veuillez réessayer dans 15 minutes.",
    },
  },

  // Configuration CORS
  cors: {
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://flagscore.fr", "https://www.flagscore.fr"]
        : ["http://localhost:3000", "http://127.0.0.1:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
  },

  // Validation des entrées
  validation: {
    maxStringLength: 1000,
    maxArrayLength: 100,
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp"],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },

  // Logging de sécurité
  securityLogging: {
    enabled: true,
    logLevel: "warn", // warn, error, info
    logRateLimitHits: true,
    logSuspiciousActivity: true,
    logFailedValidations: true,
  },
} as const;

// Fonction utilitaire pour générer la CSP string
export function generateCSPString(): string {
  return Object.entries(securityConfig.csp)
    .map(([directive, sources]) => {
      if (Array.isArray(sources)) {
        return `${directive} ${sources.join(" ")}`;
      }
      return directive;
    })
    .join("; ");
}

// Function to validate user inputs
export function validateInput(
  input: unknown,
  type: "string" | "number" | "array"
): boolean {
  switch (type) {
    case "string":
      return (
        typeof input === "string" &&
        input.length <= securityConfig.validation.maxStringLength
      );
    case "number":
      return typeof input === "number" && !isNaN(input) && isFinite(input);
    case "array":
      return (
        Array.isArray(input) &&
        input.length <= securityConfig.validation.maxArrayLength
      );
    default:
      return false;
  }
}

// Fonction pour nettoyer les entrées utilisateur
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Supprimer les balises HTML
    .replace(/javascript:/gi, "") // Supprimer les URLs javascript
    .replace(/on\w+=/gi, "") // Supprimer les event handlers
    .trim();
}

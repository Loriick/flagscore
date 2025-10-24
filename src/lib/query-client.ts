import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache les données pendant 5 minutes
      staleTime: 5 * 60 * 1000,
      // Garde les données en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry automatique en cas d'erreur
      retry: 3,
      // Délai entre les retry
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch automatique quand la fenêtre reprend le focus
      refetchOnWindowFocus: false,
      // Refetch automatique quand la connexion reprend
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

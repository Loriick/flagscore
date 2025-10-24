"use client";

import { useState } from "react";

interface RetryButtonProps {
  onRetry: () => void;
  loading?: boolean;
  className?: string;
}

export function RetryButton({
  onRetry,
  loading = false,
  className = "",
}: RetryButtonProps) {
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    onRetry();
  };

  return (
    <div className={`text-center ${className}`}>
      <button
        onClick={handleRetry}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {loading ? "Rechargement..." : "Réessayer"}
      </button>
      {retryCount > 0 && (
        <p className="text-sm text-white/60 mt-2">Tentative {retryCount}</p>
      )}
    </div>
  );
}

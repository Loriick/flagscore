import Image from "next/image";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function ErrorFallback({
  title = "Erreur de chargement",
  message = "Impossible de charger les données",
  onRetry,
  showRetry = true,
  className = "",
}: ErrorFallbackProps) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <Image
        src="/404.png"
        alt="Erreur"
        className="w-16 h-16 mx-auto mb-4 opacity-60"
        width={64}
        height={64}
      />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/80 mb-4">{message}</p>
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      )}
    </div>
  );
}

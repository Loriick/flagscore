export function SkeletonLoader() {
  return (
    <div className="w-full max-w-md mx-auto sm:max-w-lg md:max-w-2xl lg:max-w-4xl animate-pulse">
      <div className="mb-4">
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 bg-gray-800 border border-gray-600 rounded-lg w-24"
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 w-full sm:w-64">
        <div className="h-4 bg-gray-700 rounded w-12 mb-2"></div>
        <div className="h-10 bg-gray-800 border border-gray-600 rounded"></div>
      </div>

      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded p-3">
            <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

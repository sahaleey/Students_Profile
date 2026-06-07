// Frontend: components/shared/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="w-full max-w-sm p-4 border border-gray-700 rounded-xl bg-slate-900 animate-pulse">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
        <div className="flex-1 py-1 space-y-2">
          <div className="w-2/3 h-4 bg-gray-700 rounded"></div>
          <div className="w-1/3 h-3 bg-gray-700 rounded"></div>
        </div>
      </div>

      {/* Mimic a chart or text body block */}
      <div className="mt-6 space-y-3">
        <div className="h-24 bg-gray-700 rounded-lg"></div>
        <div className="w-full h-3 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

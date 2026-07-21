export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-48 bg-gray-200 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-7 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

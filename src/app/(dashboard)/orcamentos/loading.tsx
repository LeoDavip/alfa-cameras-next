export default function OrcamentosLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-9 w-48 bg-gray-200 rounded" />
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 p-3">
          <div className="h-4 w-full bg-gray-200 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-t p-3">
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

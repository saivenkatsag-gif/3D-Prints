// Shown instantly while a product page loads, so clicking Details feels immediate.
export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl animate-pulse px-5 py-10" aria-busy="true" aria-label="Loading product">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-violet-100" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 rounded-xl bg-violet-100" />
          <div className="h-6 w-1/4 rounded-xl bg-violet-100" />
          <div className="h-20 rounded-xl bg-violet-100" />
          <div className="h-64 rounded-3xl bg-violet-100" />
        </div>
      </div>
    </main>
  );
}

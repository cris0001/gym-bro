// Root application component. Becomes the TanStack Router RouterProvider once
// routing is wired in; for now it just confirms the app boots.
export function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-2xl font-bold">GM</h1>
      <p className="text-gray-500">Frontend foundation is up.</p>
    </main>
  );
}

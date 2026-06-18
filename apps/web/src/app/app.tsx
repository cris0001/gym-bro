import { Button } from '@/components/ui/button';

// Root application component. Becomes the TanStack Router RouterProvider once
// routing is wired in; for now it confirms the app boots and the theme works.
export function App() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-bold">GM</h1>
      <p className="text-muted-foreground">Frontend foundation is up.</p>
      <Button>Get started</Button>
    </main>
  );
}

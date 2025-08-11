import { Loader2 } from 'lucide-react';

export function RouteLoader() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}

export default RouteLoader;

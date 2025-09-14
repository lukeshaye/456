import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="animate-spin mb-4">
        <Loader2 className="w-12 h-12 text-blue-600" />
      </div>
      <p className="text-gray-600 text-lg">Carregando...</p>
    </div>
  );
}

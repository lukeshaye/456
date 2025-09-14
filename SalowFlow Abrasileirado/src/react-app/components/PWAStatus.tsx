import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Download, RefreshCw, X } from 'lucide-react';
import { useServiceWorker } from '../hooks/useServiceWorker';

export default function PWAStatus() {
  const { isOffline, isUpdated, updateServiceWorker } = useServiceWorker();
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);

  useEffect(() => {
    if (isUpdated) {
      setShowUpdateBanner(true);
    }
  }, [isUpdated]);

  const handleUpdate = () => {
    updateServiceWorker();
    setShowUpdateBanner(false);
  };

  const dismissUpdate = () => {
    setShowUpdateBanner(false);
  };

  return (
    <>
      {/* Status Offline */}
      {isOffline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4" />
            <span>Você está offline. Algumas funcionalidades podem estar limitadas.</span>
          </div>
        </div>
      )}

      {/* Banner de Atualização */}
      {showUpdateBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <Download className="w-5 h-5" />
              <div>
                <p className="font-medium">Nova versão disponível!</p>
                <p className="text-sm opacity-90">Atualize para obter as últimas funcionalidades.</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpdate}
                className="flex items-center space-x-1 bg-white text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </button>
              <button
                onClick={dismissUpdate}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Online */}
      {!isOffline && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="flex items-center space-x-2 bg-green-500 text-white px-3 py-2 rounded-full text-sm font-medium shadow-lg">
            <Wifi className="w-4 h-4" />
            <span>Online</span>
          </div>
        </div>
      )}
    </>
  );
}

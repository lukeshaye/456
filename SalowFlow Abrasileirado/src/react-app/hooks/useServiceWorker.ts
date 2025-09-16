import { useEffect, useState } from 'react';

interface ServiceWorkerState {
  isSupported: boolean;
  isInstalled: boolean;
  isUpdated: boolean;
  isOffline: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isInstalled: false,
    isUpdated: false,
    isOffline: !navigator.onLine,
    registration: null,
  });

  useEffect(() => {
    if (!swState.isSupported) return;

    // Registrar o service worker
    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        setSwState(prev => ({
          ...prev,
          isInstalled: true,
          registration,
        }));

        // Verificar se há uma atualização
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwState(prev => ({ ...prev, isUpdated: true }));
              }
            });
          }
        });

        console.log('Service Worker registrado com sucesso:', registration);
      } catch (error) {
        console.error('Erro ao registrar Service Worker:', error);
      }
    };

    registerSW();

    // Listener para mudanças de conectividade
    const handleOnline = () => {
      setSwState(prev => ({ ...prev, isOffline: false }));
    };

    const handleOffline = () => {
      setSwState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [swState.isSupported]);

  const updateServiceWorker = () => {
    if (swState.registration?.waiting) {
      swState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const skipWaiting = () => {
    if (swState.registration?.waiting) {
      swState.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return {
    ...swState,
    updateServiceWorker,
    skipWaiting,
  };
}

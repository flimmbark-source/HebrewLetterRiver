import { useEffect, useState } from 'react';
import { addOnlineStatusListener, isOnline } from '../lib/offlineQueue';

/**
 * Offline Status Indicator
 * Shows connection status and offline mode feedback
 */
export default function OfflineIndicator() {
  const [online, setOnline] = useState(isOnline());
  const [showIndicator, setShowIndicator] = useState(!isOnline());
  const [justWentOnline, setJustWentOnline] = useState(false);

  useEffect(() => {
    // Listen for online/offline changes
    const unsubscribe = addOnlineStatusListener((newOnlineStatus) => {
      setOnline(newOnlineStatus);

      if (!newOnlineStatus) {
        // Went offline - show indicator
        setShowIndicator(true);
        setJustWentOnline(false);
      } else {
        // Went online - show "back online" message briefly
        setJustWentOnline(true);
        setShowIndicator(true);

        // Hide after 3 seconds
        setTimeout(() => {
          setShowIndicator(false);
          setJustWentOnline(false);
        }, 3000);
      }
    });

    return unsubscribe;
  }, []);

  if (!showIndicator) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showIndicator ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div
        className={`py-2 px-4 text-center text-sm font-medium ${
          online
            ? 'bg-green-600 text-white'
            : 'bg-yellow-600 text-white'
        }`}
      >
        {online ? (
          <>
            <span className="mr-2">✓</span>
            {justWentOnline ? 'Back online!' : 'Connected'}
          </>
        ) : (
          <>
            <span className="mr-2">⚠️</span>
            Offline mode - Your progress is saved locally
          </>
        )}
      </div>
    </div>
  );
}

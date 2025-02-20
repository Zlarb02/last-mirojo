import { useState, useEffect } from 'react';

export function useHash() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || "appearance");

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash.slice(1) || "appearance");
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return hash;
}

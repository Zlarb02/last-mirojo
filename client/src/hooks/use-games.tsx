import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Game {
  id: number;
  saved_at: string;
  stats: {
    health: number;
    mana: number;
    level: number;
  };
  conversation: {
    messages: Array<{
      role: string;
      content: string;
      timestamp: string;
    }>;
  };
}

export function useGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const res = await apiRequest('GET', '/api/games');
        if (!res.ok) throw new Error('Failed to fetch games');
        const data = await res.json();
        setGames(data);
      } catch (err) {
        console.error('Error fetching games:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGames();
  }, []);

  return { games, isLoading, error };
}
import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface Game {
    id: number;
    user_id: number;
    game_state_id: number;
    conversation: {
      messages: Array<{
        role: string;
        content: string;
        timestamp: string;
      }>;
      timestamp: string;
    };
    created_at: string;
    updated_at: string;
  }

export function useGames() {
    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    const fetchGames = async () => {
      try {
        setIsLoading(true);
        const res = await apiRequest('GET', '/api/games');
        if (!res.ok) throw new Error('Failed to fetch games');
        const data = await res.json();
        setGames(data.map((game: any) => ({
            ...game,
            id: Number(game.id),
            user_id: Number(game.user_id),
            game_state_id: Number(game.game_state_id)
          })));
      } catch (err) {
        console.error('Error fetching games:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch games');
      } finally {
        setIsLoading(false);
      }
    };
  
    useEffect(() => {
      fetchGames();
    }, []);
  
    return { games, isLoading, error, refetch: fetchGames };
  }
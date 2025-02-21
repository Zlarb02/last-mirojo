import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export interface Game {
  id: string;  // Changed from number to string - matches UUID in database
  userId: string;
  gameStateId: string;
  name: string; // S'assurer que name est présent dans l'interface
  conversation: {
    messages: Array<{
      content: string;
      role: string;
      timestamp: string;
    }>;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

export function useGames() {
  const {
    data: games = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Game[]>({
    queryKey: ['games'],
    queryFn: () => apiRequest('GET', '/api/games'),
      });

  return { games, isLoading, error, refetch };
}

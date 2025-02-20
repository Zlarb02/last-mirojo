import { Progress } from "@/components/ui/progress";
import type { Stat } from "@/hooks/use-game-state";

interface StatDisplayProps {
  stat: Stat;
}

export function StatDisplay({ stat }: StatDisplayProps) {
  switch (stat.config.type) {
    case 'progress':
      return (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{stat.name}</span>
            <span>{stat.value}/{stat.config.max}</span>
          </div>
          <Progress 
            value={Number(stat.value)} 
            max={stat.config.max}
            indicatorClassName="bg-current"
            style={{
              color: stat.config.color
            }}
            className="h-2"
          />
        </div>
      );
    
    case 'number':
      return (
        <div className="flex justify-between items-center">
          <span className="text-sm">{stat.name}</span>
          <span className="text-2xl font-bold">{stat.value}</span>
        </div>
      );
    
    case 'text':
      return (
        <div className="space-y-1">
          <span className="text-sm font-medium">{stat.name}</span>
          <p className="text-sm text-muted-foreground">{stat.value}</p>
        </div>
      );
  }
}

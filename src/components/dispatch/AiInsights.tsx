"use client";

import type { AiInsight } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Lightbulb, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface AiInsightsProps {
  insights: AiInsight[];
}

const severityIcons: Record<AiInsight['severity'], React.ElementType> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertTriangle,
};

const severityColors: Record<AiInsight['severity'], string> = {
  info: 'text-blue-500',
  warning: 'text-yellow-500',
  critical: 'text-red-500',
};


export function AiInsights({ insights }: AiInsightsProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Lightbulb size={20} className="mr-2 text-primary" />
          AI Insights & Alerts
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full p-4 pt-0">
          {insights.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No active AI insights.</p>
          ) : (
            <ul className="space-y-3">
              {insights.map((insight) => {
                const Icon = severityIcons[insight.severity];
                return (
                  <li key={insight.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-start space-x-3">
                      <Icon size={20} className={`mt-0.5 ${severityColors[insight.severity]}`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                           <h4 className="font-semibold text-sm">{insight.title}</h4>
                           <Badge variant={insight.severity === 'critical' ? 'destructive' : insight.severity === 'warning' ? 'secondary' : 'outline'} className="capitalize text-xs">
                             {insight.severity}
                           </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{insight.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(insight.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

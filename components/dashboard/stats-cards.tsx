import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { DashboardStats } from "@/types/app";

interface StatsCardsProps {
  stats: DashboardStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Totaal aanvragen",
      value: stats.total,
      icon: ClipboardList,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Openstaand",
      value: stats.pending,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Afgerond",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Conflicten",
      value: stats.conflicts,
      icon: AlertTriangle,
      color: stats.conflicts > 0 ? "text-red-600" : "text-gray-400",
      bg: stats.conflicts > 0 ? "bg-red-50" : "bg-gray-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import {
  getDashboardStats,
  getProductAvailability,
  getRequests,
} from "@/lib/queries";
import { Header } from "@/components/layout/header";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { ProductOverview } from "@/components/dashboard/product-overview";
import { RecentRequests } from "@/components/dashboard/recent-requests";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default async function DashboardPage() {
  const { profile } = await requireAuth();

  const [stats, availability, recentRequests] = await Promise.all([
    getDashboardStats(),
    getProductAvailability(),
    getRequests(),
  ]);

  const latest = recentRequests.slice(0, 5);

  return (
    <div>
      <Header
        title={`Welkom, ${profile.full_name || profile.email}`}
        description="Overzicht van aanvragen en beschikbaarheid"
        actions={
          <Button asChild>
            <Link href="/nieuwe-aanvraag">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nieuwe aanvraag
            </Link>
          </Button>
        }
      />

      <div className="space-y-6 p-8">
        {/* Statistieken */}
        <StatsCards stats={stats} />

        {/* Status breakdown */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Goedgekeurd", value: stats.approved, color: "text-blue-600" },
            { label: "Gepland", value: stats.scheduled, color: "text-purple-600" },
            { label: "Geannuleerd", value: stats.cancelled, color: "text-gray-400" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg border bg-white px-4 py-3 text-center"
            >
              <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Onderste grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <RecentRequests requests={latest} />
          <ProductOverview availability={availability} />
        </div>
      </div>
    </div>
  );
}

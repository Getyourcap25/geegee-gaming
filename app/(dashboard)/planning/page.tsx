import { requireAuth } from "@/lib/auth";
import { getRequests, getProductAvailability } from "@/lib/queries";
import { Header } from "@/components/layout/header";
import { AvailabilityCard } from "@/components/planning/availability-card";
import { PlanningTable } from "@/components/planning/planning-table";
import { AlertTriangle } from "lucide-react";

export default async function PlanningPage() {
  await requireAuth();

  const [requests, availability] = await Promise.all([
    getRequests(),
    getProductAvailability(),
  ]);

  const conflictCount = availability.filter((a) => a.hasConflict).length;

  return (
    <div>
      <Header
        title="Planning & beschikbaarheid"
        description="Overzicht van geplande inzet en productvrijheid"
      />
      <div className="space-y-6 p-8">
        {/* Conflict banner */}
        {conflictCount > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Er {conflictCount === 1 ? "is" : "zijn"} {conflictCount}{" "}
              product{conflictCount === 1 ? "" : "en"} met een
              dubbelboeking-conflict. Controleer de aanvragen hieronder.
            </p>
          </div>
        )}

        {/* Beschikbaarheidskaarten */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Productbeschikbaarheid
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availability.map((item) => (
              <AvailabilityCard key={item.product.id} item={item} />
            ))}
          </div>
        </div>

        {/* Geplande inzet */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Geplande inzet (goedgekeurd + gepland)
          </h2>
          <PlanningTable requests={requests} />
        </div>
      </div>
    </div>
  );
}

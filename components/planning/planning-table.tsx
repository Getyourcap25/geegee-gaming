import { formatDateRange } from "@/lib/utils";
import { StatusBadge } from "@/components/requests/status-badge";
import type { RequestWithRelations } from "@/types/app";

interface PlanningTableProps {
  requests: RequestWithRelations[];
}

export function PlanningTable({ requests }: PlanningTableProps) {
  const active = requests.filter((r) =>
    ["approved", "scheduled"].includes(r.status)
  );

  if (active.length === 0) {
    return (
      <div className="rounded-lg border bg-white py-12 text-center">
        <p className="text-sm text-gray-500">
          Geen goedgekeurde of geplande aanvragen.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Referentie
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Wijk
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Periode
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Aantal
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {active.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-violet-700">
                  {req.reference_code}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {req.product.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {req.district.name}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {formatDateRange(req.preferred_date, req.end_date)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                  {req.quantity}×
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <StatusBadge status={req.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

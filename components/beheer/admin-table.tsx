import { formatDateRange } from "@/lib/utils";
import { StatusBadge } from "@/components/requests/status-badge";
import { EditRequestDialog } from "./edit-request-dialog";
import type { RequestWithRelations } from "@/types/app";
import { MessageSquare } from "lucide-react";

interface AdminTableProps {
  requests: RequestWithRelations[];
}

export function AdminTable({ requests }: AdminTableProps) {
  if (requests.length === 0) {
    return (
      <div className="rounded-lg border bg-white py-12 text-center">
        <p className="text-sm text-gray-500">Geen aanvragen gevonden.</p>
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
                Aanvrager / Org
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
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                Notities
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                Acties
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {requests.map((req) => (
              <tr key={req.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-violet-700">
                  {req.reference_code}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div>{req.requested_by_name}</div>
                  {req.organization && (
                    <div className="text-xs text-gray-400">{req.organization}</div>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                  {req.product.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  <div>{req.district.name}</div>
                  <div className="text-xs text-gray-400">{req.location}</div>
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
                <td className="px-4 py-3">
                  {req.internal_notes ? (
                    <div className="flex items-start gap-1">
                      <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-500" />
                      <span className="text-xs text-gray-500 line-clamp-2 max-w-[160px]">
                        {req.internal_notes}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <EditRequestDialog request={req} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

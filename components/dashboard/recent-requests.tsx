import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/app";
import type { RequestWithRelations } from "@/types/app";
import { ArrowRight } from "lucide-react";

interface RecentRequestsProps {
  requests: RequestWithRelations[];
}

export function RecentRequests({ requests }: RecentRequestsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-semibold">
          Recente aanvragen
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/aanvragen">
            Alle aanvragen
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-400">
            Nog geen aanvragen
          </p>
        ) : (
          <div className="divide-y">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between py-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {req.reference_code}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[req.status]
                      }`}
                    >
                      {STATUS_LABELS[req.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-500">
                    {req.product.name} · {req.district.name} ·{" "}
                    {formatDate(req.preferred_date)}
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/aanvragen`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

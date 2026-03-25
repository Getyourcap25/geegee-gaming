import { Suspense } from "react";
import { requireAuth } from "@/lib/auth";
import { getRequests, getProducts, getDistricts } from "@/lib/queries";
import { Header } from "@/components/layout/header";
import { RequestsTable } from "@/components/requests/requests-table";
import { RequestsFilters } from "@/components/requests/requests-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import type { RequestStatus } from "@/types/database";

interface SearchParams {
  search?: string;
  status?: string;
  district?: string;
  product?: string;
}

export default async function AanvragenPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { profile } = await requireAuth();
  const params = await searchParams;

  const validStatuses: RequestStatus[] = [
    "pending",
    "approved",
    "scheduled",
    "completed",
    "cancelled",
  ];

  const rawStatus = params.status;
  const status =
    rawStatus && validStatuses.includes(rawStatus as RequestStatus)
      ? (rawStatus as RequestStatus)
      : "all";

  const [requests, products, districts] = await Promise.all([
    getRequests({
      search: params.search,
      status: status as RequestStatus | "all",
      districtId: params.district ?? "all",
      productId: params.product ?? "all",
    }),
    getProducts(),
    getDistricts(),
  ]);

  return (
    <div>
      <Header
        title="Aanvragen"
        description={`${requests.length} aanvra${requests.length === 1 ? "ag" : "gen"} gevonden`}
        actions={
          <Button asChild>
            <Link href="/nieuwe-aanvraag">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nieuwe aanvraag
            </Link>
          </Button>
        }
      />
      <div className="space-y-4 p-8">
        <Suspense>
          <RequestsFilters products={products} districts={districts} />
        </Suspense>
        <RequestsTable requests={requests} isAdmin={profile.role === "admin"} />
      </div>
    </div>
  );
}

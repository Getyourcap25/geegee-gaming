import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { getRequests, getProducts, getDistricts } from "@/lib/queries";
import { Header } from "@/components/layout/header";
import { AdminTable } from "@/components/beheer/admin-table";
import { RequestsFilters } from "@/components/requests/requests-filters";
import type { RequestStatus } from "@/types/database";

interface SearchParams {
  search?: string;
  status?: string;
  district?: string;
  product?: string;
}

export default async function BeheerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdmin();
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
        title="Beheer"
        description={`${requests.length} aanvra${requests.length === 1 ? "ag" : "gen"} — status, data en interne notities aanpassen`}
      />
      <div className="space-y-4 p-8">
        <Suspense>
          <RequestsFilters products={products} districts={districts} />
        </Suspense>
        <AdminTable requests={requests} />
      </div>
    </div>
  );
}

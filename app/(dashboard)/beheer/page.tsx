import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import {
  getRequests,
  getProducts,
  getDistricts,
  getProductAvailability,
} from "@/lib/queries";
import { Header } from "@/components/layout/header";
import { AdminTable } from "@/components/beheer/admin-table";
import { ProductManagement } from "@/components/beheer/product-management";
import { RequestsFilters } from "@/components/requests/requests-filters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RequestStatus } from "@/types/database";

interface SearchParams {
  search?: string;
  status?: string;
  district?: string;
  product?: string;
  tab?: string;
}

export default async function BeheerPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { profile } = await requireAdmin();
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

  const [requests, products, districts, availability] = await Promise.all([
    getRequests({
      search: params.search,
      status: status as RequestStatus | "all",
      districtId: params.district ?? "all",
      productId: params.product ?? "all",
    }),
    getProducts(),
    getDistricts(),
    getProductAvailability(),
  ]);

  return (
    <div>
      <Header
        title="Beheer"
        description="Aanvragen en producten beheren"
      />
      <div className="p-8">
        <Tabs defaultValue={params.tab ?? "aanvragen"}>
          <TabsList className="mb-6">
            <TabsTrigger value="aanvragen">
              Aanvragen ({requests.length})
            </TabsTrigger>
            <TabsTrigger value="producten">
              Producten &amp; voorraad
            </TabsTrigger>
          </TabsList>

          {/* ── Aanvragen tab ── */}
          <TabsContent value="aanvragen" className="space-y-4">
            <Suspense>
              <RequestsFilters products={products} districts={districts} />
            </Suspense>
            <AdminTable requests={requests} />
          </TabsContent>

          {/* ── Producten tab ── */}
          <TabsContent value="producten">
            <ProductManagement
              availability={availability}
              userId={profile.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { requireAuth } from "@/lib/auth";
import { getProducts, getDistricts } from "@/lib/queries";
import { Header } from "@/components/layout/header";
import { NewRequestForm } from "@/components/requests/new-request-form";

export default async function NieuweAanvraagPage() {
  const { profile } = await requireAuth();
  const [products, districts] = await Promise.all([
    getProducts(),
    getDistricts(),
  ]);

  return (
    <div>
      <Header
        title="Nieuwe aanvraag"
        description="Dien een aanvraag in voor een gaming-activiteit"
      />
      <div className="max-w-3xl p-8">
        <NewRequestForm
          products={products}
          districts={districts}
          userId={profile.id}
          userEmail={profile.email}
          userName={profile.full_name ?? ""}
          userOrg={profile.organization ?? ""}
        />
      </div>
    </div>
  );
}

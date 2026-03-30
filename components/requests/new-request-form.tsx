"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitRequest } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import type { Product, District } from "@/types/app";

interface NewRequestFormProps {
  products: Product[];
  districts: District[];
  userId: string;
  userEmail: string;
  userName: string;
  userOrg: string;
}

export function NewRequestForm({
  products,
  districts,
  userId,
  userEmail,
  userName,
  userOrg,
}: NewRequestFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    product_id: "",
    quantity: "1",
    district_id: "",
    location: "",
    requested_by_name: userName,
    requested_by_email: userEmail,
    requested_by_phone: "",
    organization: userOrg,
    preferred_date: "",
    end_date: "",
    notes: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 1) {
      toast({ title: "Ongeldig aantal", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (form.end_date < form.preferred_date) {
      toast({
        title: "Einddatum vóór startdatum",
        description: "De einddatum moet op of na de startdatum liggen.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const selectedProduct = products.find((p) => p.id === form.product_id);
    const selectedDistrict = districts.find((d) => d.id === form.district_id);

    const { error, referenceCode } = await submitRequest({
      product_id: form.product_id,
      quantity: qty,
      district_id: form.district_id,
      location: form.location.trim(),
      requested_by_name: form.requested_by_name.trim(),
      requested_by_email: form.requested_by_email.trim(),
      requested_by_phone: form.requested_by_phone.trim() || null,
      organization: form.organization.trim() || null,
      preferred_date: form.preferred_date,
      end_date: form.end_date,
      notes: form.notes.trim() || null,
      productName: selectedProduct?.name ?? "",
      districtName: selectedDistrict?.name ?? "",
    });

    if (error) {
      toast({
        title: "Fout bij opslaan",
        description: error,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Aanvraag ingediend",
      description: `${referenceCode} — een bevestiging is verstuurd naar ${form.requested_by_email}.`,
    });
    router.push("/aanvragen");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {/* Product + Aantal */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Product *</Label>
              <Select
                value={form.product_id}
                onValueChange={(v) => set("product_id", v)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies een product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      {p.notes ? ` (${p.notes})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Aantal *</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Wijk + Locatie */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Wijk *</Label>
              <Select
                value={form.district_id}
                onValueChange={(v) => set("district_id", v)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kies een wijk" />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Exacte locatie / adres *</Label>
              <Input
                id="location"
                placeholder="Bijv. Bospolder 14, Rotterdam"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Contactgegevens */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">
              Contactgegevens
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Naam aanvrager *</Label>
              <Input
                id="name"
                value={form.requested_by_name}
                onChange={(e) => set("requested_by_name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mailadres *</Label>
              <Input
                id="email"
                type="email"
                value={form.requested_by_email}
                onChange={(e) => set("requested_by_email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefoonnummer</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="06-12345678"
                value={form.requested_by_phone}
                onChange={(e) => set("requested_by_phone", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org">Organisatie</Label>
              <Input
                id="org"
                placeholder="Naam van de organisatie"
                value={form.organization}
                onChange={(e) => set("organization", e.target.value)}
              />
            </div>
          </div>

          {/* Datums */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="preferred_date">Startdatum *</Label>
              <Input
                id="preferred_date"
                type="date"
                value={form.preferred_date}
                onChange={(e) => set("preferred_date", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Einddatum *</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                min={form.preferred_date}
                onChange={(e) => set("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Toelichting */}
          <div className="space-y-2">
            <Label htmlFor="notes">Toelichting</Label>
            <Textarea
              id="notes"
              placeholder="Aanvullende informatie over de aanvraag…"
              rows={4}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Versturen…
                </>
              ) : (
                "Aanvraag indienen"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

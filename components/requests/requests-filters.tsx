"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { Product, District } from "@/types/app";
import { STATUS_LABELS } from "@/types/app";
import type { RequestStatus } from "@/types/database";

interface RequestsFiltersProps {
  products: Product[];
  districts: District[];
}

const ALL_STATUSES: RequestStatus[] = [
  "pending",
  "approved",
  "scheduled",
  "completed",
  "cancelled",
];

export function RequestsFilters({ products, districts }: RequestsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "all";
  const districtId = searchParams.get("district") ?? "all";
  const productId = searchParams.get("product") ?? "all";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const hasFilters = search || status !== "all" || districtId !== "all" || productId !== "all";

  function clearFilters() {
    router.push(pathname);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Zoek */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Zoek op naam, locatie, code…"
          value={search}
          onChange={(e) => updateParam("search", e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status */}
      <Select value={status} onValueChange={(v) => updateParam("status", v)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Alle statussen" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle statussen</SelectItem>
          {ALL_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Wijk */}
      <Select value={districtId} onValueChange={(v) => updateParam("district", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle wijken" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle wijken</SelectItem>
          {districts.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Product */}
      <Select value={productId} onValueChange={(v) => updateParam("product", v)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Alle producten" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Alle producten</SelectItem>
          {products.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Wis filters
        </Button>
      )}
    </div>
  );
}

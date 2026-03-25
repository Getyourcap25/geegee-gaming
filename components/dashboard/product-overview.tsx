import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Package } from "lucide-react";
import type { ProductAvailability } from "@/types/app";

interface ProductOverviewProps {
  availability: ProductAvailability[];
}

export function ProductOverview({ availability }: ProductOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Package className="h-4 w-4 text-violet-600" />
          Productbeschikbaarheid
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availability.map(({ product, totalInventory, reserved, available, hasConflict }) => {
          const pct = totalInventory > 0 ? (reserved / totalInventory) * 100 : 0;
          return (
            <div key={product.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">{product.name}</span>
                  {hasConflict && (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                      <AlertTriangle className="h-3 w-3" />
                      Conflict
                    </span>
                  )}
                </div>
                <span className="text-gray-500">
                  {available} / {totalInventory} beschikbaar
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-2 rounded-full transition-all ${
                    hasConflict
                      ? "bg-red-500"
                      : pct >= 100
                      ? "bg-orange-500"
                      : pct >= 75
                      ? "bg-yellow-500"
                      : "bg-violet-500"
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              {product.notes && (
                <p className="text-xs text-gray-400">{product.notes}</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Package } from "lucide-react";
import type { ProductAvailability } from "@/types/app";

interface AvailabilityCardProps {
  item: ProductAvailability;
}

export function AvailabilityCard({ item }: AvailabilityCardProps) {
  const { product, totalInventory, reserved, available, hasConflict } = item;
  const pct = totalInventory > 0 ? (reserved / totalInventory) * 100 : 0;

  return (
    <Card className={hasConflict ? "border-red-300" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-violet-600" />
            {product.name}
          </div>
          {hasConflict ? (
            <span className="flex items-center gap-1 text-sm font-medium text-red-600">
              <AlertTriangle className="h-4 w-4" />
              Conflict
            </span>
          ) : available > 0 ? (
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <CheckCircle className="h-4 w-4" />
              Beschikbaar
            </span>
          ) : (
            <span className="text-sm font-medium text-orange-600">Vol geboekt</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-gray-50 p-2">
            <p className="text-lg font-bold text-gray-900">{totalInventory}</p>
            <p className="text-xs text-gray-500">Totaal</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-2">
            <p className="text-lg font-bold text-orange-700">{reserved}</p>
            <p className="text-xs text-gray-500">Gereserveerd</p>
          </div>
          <div className={`rounded-lg p-2 ${available > 0 ? "bg-green-50" : "bg-red-50"}`}>
            <p className={`text-lg font-bold ${available > 0 ? "text-green-700" : "text-red-700"}`}>
              {available}
            </p>
            <p className="text-xs text-gray-500">Vrij</p>
          </div>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full ${
              hasConflict ? "bg-red-500" : pct >= 100 ? "bg-orange-500" : "bg-violet-500"
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        {product.notes && (
          <p className="text-xs text-gray-400">{product.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

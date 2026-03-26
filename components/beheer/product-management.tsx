"use client";

import { useState } from "react";
import {
  updateProductInventory,
  addProductAdjustment,
  deleteProductAdjustment,
} from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Package,
  Pencil,
  PlusCircle,
  Trash2,
  Loader2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ProductAvailability } from "@/types/app";

interface ProductManagementProps {
  availability: ProductAvailability[];
  userId: string;
}

export function ProductManagement({
  availability,
  userId,
}: ProductManagementProps) {
  return (
    <div className="space-y-4">
      {availability.map((item) => (
        <ProductCard key={item.product.id} item={item} userId={userId} />
      ))}
    </div>
  );
}

// ── Per-product kaart ──────────────────────────────────────

function ProductCard({
  item,
  userId,
}: {
  item: ProductAvailability;
  userId: string;
}) {
  const { product, totalInventory, reserved, manualDeductions, available, adjustments } = item;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Package className="h-4 w-4 text-violet-600" />
            {product.name}
            {product.notes && (
              <span className="text-xs font-normal text-gray-400">
                ({product.notes})
              </span>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <EditInventoryDialog product={item} />
            <AddAdjustmentDialog productId={product.id} userId={userId} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Voorraad overzicht */}
        <div className="grid grid-cols-4 gap-3 text-center text-sm">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xl font-bold text-gray-900">{totalInventory}</p>
            <p className="text-xs text-gray-500">Totaal</p>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <p className="text-xl font-bold text-orange-700">{reserved}</p>
            <p className="text-xs text-gray-500">Gereserveerd</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xl font-bold text-red-700">{manualDeductions}</p>
            <p className="text-xs text-gray-500">Handmatig</p>
          </div>
          <div
            className={`rounded-lg p-3 ${
              available > 0 ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <p
              className={`text-xl font-bold ${
                available > 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {available}
            </p>
            <p className="text-xs text-gray-500">Beschikbaar</p>
          </div>
        </div>

        {/* Aftrekposten log */}
        {adjustments.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Handmatige mutaties
            </p>
            <div className="divide-y rounded-lg border bg-gray-50">
              {adjustments.map((adj) => (
                <AdjustmentRow
                  key={adj.id}
                  adjustment={adj}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Aftrekpost rij ──────────────────────────────────────────

function AdjustmentRow({
  adjustment,
}: {
  adjustment: ProductAvailability["adjustments"][number];
}) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Weet je zeker dat je deze mutatie wilt verwijderen?")) return;
    setLoading(true);
    const { error } = await deleteProductAdjustment(adjustment.id);
    if (error) {
      toast({ title: "Fout", description: error, variant: "destructive" });
    } else {
      toast({ title: "Mutatie verwijderd" });
    }
    setLoading(false);
  }

  const isDeduction = adjustment.quantity < 0;

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-3">
        {isDeduction ? (
          <TrendingDown className="h-4 w-4 flex-shrink-0 text-red-500" />
        ) : (
          <TrendingUp className="h-4 w-4 flex-shrink-0 text-green-500" />
        )}
        <div>
          <p className="text-sm text-gray-800">{adjustment.reason}</p>
          <p className="text-xs text-gray-400">
            {formatDate(adjustment.created_at)}
            {adjustment.creator?.full_name
              ? ` · ${adjustment.creator.full_name}`
              : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-semibold ${
            isDeduction ? "text-red-600" : "text-green-600"
          }`}
        >
          {adjustment.quantity > 0 ? "+" : ""}
          {adjustment.quantity}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-gray-400 hover:text-red-600"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

// ── Dialog: voorraad aanpassen ──────────────────────────────

function EditInventoryDialog({ product }: { product: ProductAvailability }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState(
    product.product.inventory_total.toString()
  );

  async function handleSave() {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) {
      toast({
        title: "Ongeldig getal",
        description: "Voer een getal van 0 of hoger in.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { error } = await updateProductInventory(product.product.id, num);
    if (error) {
      toast({ title: "Fout", description: error, variant: "destructive" });
    } else {
      toast({
        title: "Voorraad bijgewerkt",
        description: `${product.product.name}: totaal is nu ${num}`,
      });
      setOpen(false);
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Totaal aanpassen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Totale voorraad aanpassen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-gray-500">
            Huidig totaal:{" "}
            <span className="font-semibold text-gray-900">
              {product.product.inventory_total}
            </span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="inventory">Nieuw totaal aantal</Label>
            <Input
              id="inventory"
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Opslaan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Dialog: handmatige aftrekpost toevoegen ─────────────────

function AddAdjustmentDialog({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"deduction" | "addition">("deduction");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");

  async function handleSave() {
    const num = parseInt(quantity, 10);
    if (isNaN(num) || num <= 0) {
      toast({
        title: "Ongeldig aantal",
        description: "Voer een positief getal in.",
        variant: "destructive",
      });
      return;
    }
    if (!reason.trim()) {
      toast({
        title: "Reden verplicht",
        description: "Geef een reden op voor de mutatie.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const finalQty = type === "deduction" ? -num : num;
    const { error } = await addProductAdjustment({
      productId,
      quantity: finalQty,
      reason,
      userId,
    });

    if (error) {
      toast({ title: "Fout", description: error, variant: "destructive" });
    } else {
      toast({
        title: type === "deduction" ? "Aftrekpost toegevoegd" : "Toevoeging geregistreerd",
      });
      setOpen(false);
      setQuantity("1");
      setReason("");
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
          Mutatie toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Handmatige mutatie</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Type: aftrek of toevoeging */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("deduction")}
              className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                type === "deduction"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TrendingDown className="h-4 w-4" />
              In mindering
            </button>
            <button
              type="button"
              onClick={() => setType("addition")}
              className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                type === "addition"
                  ? "border-green-300 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Toevoeging
            </button>
          </div>

          {/* Aantal */}
          <div className="space-y-2">
            <Label htmlFor="adj-qty">Aantal</Label>
            <Input
              id="adj-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Reden */}
          <div className="space-y-2">
            <Label htmlFor="adj-reason">
              Reden <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="adj-reason"
              rows={3}
              placeholder={
                type === "deduction"
                  ? "Bijv. unit defect, in reparatie, gereserveerd voor event…"
                  : "Bijv. nieuw apparaat ontvangen, reparatie voltooid…"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Annuleren
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className={
              type === "deduction"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {type === "deduction" ? "In mindering brengen" : "Toevoeging registreren"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

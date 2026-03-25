"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Pencil } from "lucide-react";
import type { RequestWithRelations } from "@/types/app";
import { STATUS_LABELS } from "@/types/app";
import type { RequestStatus } from "@/types/database";
import { useRouter } from "next/navigation";

interface EditRequestDialogProps {
  request: RequestWithRelations;
}

const STATUSES: RequestStatus[] = [
  "pending",
  "approved",
  "scheduled",
  "completed",
  "cancelled",
];

export function EditRequestDialog({ request }: EditRequestDialogProps) {
  const supabase = createClient();
  const { toast } = useToast();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<RequestStatus>(request.status);
  const [quantity, setQuantity] = useState(request.quantity.toString());
  const [preferredDate, setPreferredDate] = useState(request.preferred_date);
  const [endDate, setEndDate] = useState(request.end_date);
  const [internalNotes, setInternalNotes] = useState(
    request.internal_notes ?? ""
  );

  async function handleSave() {
    setLoading(true);

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      toast({ title: "Ongeldig aantal", variant: "destructive" });
      setLoading(false);
      return;
    }

    if (endDate < preferredDate) {
      toast({
        title: "Einddatum vóór startdatum",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("requests")
      .update({
        status,
        quantity: qty,
        preferred_date: preferredDate,
        end_date: endDate,
        internal_notes: internalNotes.trim() || null,
      })
      .eq("id", request.id);

    if (error) {
      toast({ title: "Fout bij opslaan", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: "Opgeslagen", description: `${request.reference_code} bijgewerkt.` });
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aanvraag bewerken — {request.reference_code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Readonly info */}
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p>
              <span className="font-medium">Product:</span>{" "}
              {request.product.name}
            </p>
            <p>
              <span className="font-medium">Aanvrager:</span>{" "}
              {request.requested_by_name}
              {request.organization ? ` (${request.organization})` : ""}
            </p>
            <p>
              <span className="font-medium">Locatie:</span> {request.location}
            </p>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Aantal */}
          <div className="space-y-2">
            <Label htmlFor="edit-qty">Aantal</Label>
            <Input
              id="edit-qty"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>

          {/* Datums */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-start">Startdatum</Label>
              <Input
                id="edit-start"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-end">Einddatum</Label>
              <Input
                id="edit-end"
                type="date"
                value={endDate}
                min={preferredDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Interne notities */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes">
              Interne notities{" "}
              <span className="text-xs font-normal text-gray-400">
                (alleen zichtbaar voor admins)
              </span>
            </Label>
            <Textarea
              id="edit-notes"
              rows={3}
              placeholder="Interne opmerkingen…"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Annuleren
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opslaan…
              </>
            ) : (
              "Opslaan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

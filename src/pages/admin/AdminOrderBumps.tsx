import { useState } from "react";
import { useOrderBumps, useUpsertOrderBump, useDeleteOrderBump, type OrderBumpDB } from "@/hooks/useOrderBumps";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const EMPTY: Partial<OrderBumpDB> = {
  name: "", description: "", price: 0, original_price: 0,
  is_active: true, display_order: 0,
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const AdminOrderBumps = () => {
  const { data: bumps, isLoading } = useOrderBumps();
  const upsert = useUpsertOrderBump();
  const remove = useDeleteOrderBump();
  const [editing, setEditing] = useState<Partial<OrderBumpDB> | null>(null);

  const handleSave = async () => {
    if (!editing?.name || !editing.price) {
      toast.error("Preencha nome e preço");
      return;
    }
    try {
      await upsert.mutateAsync(editing as any);
      toast.success(editing.id ? "Bump atualizado!" : "Bump criado!");
      setEditing(null);
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este order bump?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Bump excluído!");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  if (isLoading) return <p>Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Bumps</h1>
          <p className="text-sm text-muted-foreground">Ofertas extras exibidas no checkout</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })} className="gap-2">
          <Plus size={16} /> Novo Bump
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Preço Original</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bumps?.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-medium">{b.name}</TableCell>
              <TableCell>{formatBRL(b.price)}</TableCell>
              <TableCell>{b.original_price ? formatBRL(b.original_price) : "—"}</TableCell>
              <TableCell>{b.is_active ? "✅" : "❌"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing({ ...b })}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar Bump" : "Novo Bump"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={editing?.name || ""} onChange={(e) => setEditing((p) => ({ ...p!, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Textarea value={editing?.description || ""} onChange={(e) => setEditing((p) => ({ ...p!, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" value={editing?.price || 0} onChange={(e) => setEditing((p) => ({ ...p!, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Preço Original (R$)</Label>
                <Input type="number" step="0.01" value={editing?.original_price || 0} onChange={(e) => setEditing((p) => ({ ...p!, original_price: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ordem</Label>
                <Input type="number" value={editing?.display_order || 0} onChange={(e) => setEditing((p) => ({ ...p!, display_order: parseInt(e.target.value) || 0 }))} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={editing?.is_active ?? true} onCheckedChange={(v) => setEditing((p) => ({ ...p!, is_active: v }))} />
                <Label>Ativo</Label>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full" disabled={upsert.isPending}>
              {upsert.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrderBumps;

import { useState } from "react";
import { useLinkProducts, useUpsertLinkProduct, useDeleteLinkProduct, type LinkProduct } from "@/hooks/useLinkProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const EMPTY: Partial<LinkProduct> = {
  label: "", subtitle: "", description: "", price: 0,
  icon_type: "target", display_order: 0, is_active: true, section: "main",
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const AdminLinkProducts = () => {
  const { data: products, isLoading } = useLinkProducts();
  const upsert = useUpsertLinkProduct();
  const remove = useDeleteLinkProduct();
  const [editing, setEditing] = useState<Partial<LinkProduct> | null>(null);

  const handleSave = async () => {
    if (!editing?.label || !editing.price) {
      toast.error("Preencha nome e preço");
      return;
    }
    try {
      await upsert.mutateAsync(editing as any);
      toast.success(editing.id ? "Produto atualizado!" : "Produto criado!");
      setEditing(null);
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Produto excluído!");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  if (isLoading) return <p>Carregando...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Produtos Link in Bio</h1>
          <p className="text-sm text-muted-foreground">Gerencie os produtos exibidos na página de links</p>
        </div>
        <Button onClick={() => setEditing({ ...EMPTY })} className="gap-2">
          <Plus size={16} /> Novo Produto
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Subtítulo</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Seção</TableHead>
            <TableHead>Ícone</TableHead>
            <TableHead>Ativo</TableHead>
            <TableHead className="w-24">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products?.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.label}</TableCell>
              <TableCell>{p.subtitle || "—"}</TableCell>
              <TableCell>{formatBRL(p.price)}</TableCell>
              <TableCell className="capitalize">{p.section}</TableCell>
              <TableCell>{p.icon_type}</TableCell>
              <TableCell>{p.is_active ? "✅" : "❌"}</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEditing({ ...p })}>
                    <Pencil size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
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
            <DialogTitle>{editing?.id ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={editing?.label || ""} onChange={(e) => setEditing((p) => ({ ...p!, label: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Subtítulo</Label>
              <Input value={editing?.subtitle || ""} onChange={(e) => setEditing((p) => ({ ...p!, subtitle: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Descrição</Label>
              <Input value={editing?.description || ""} onChange={(e) => setEditing((p) => ({ ...p!, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Preço (R$)</Label>
                <Input type="number" step="0.01" value={editing?.price || 0} onChange={(e) => setEditing((p) => ({ ...p!, price: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Ordem</Label>
                <Input type="number" value={editing?.display_order || 0} onChange={(e) => setEditing((p) => ({ ...p!, display_order: parseInt(e.target.value) || 0 }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Ícone</Label>
                <Select value={editing?.icon_type || "target"} onValueChange={(v) => setEditing((p) => ({ ...p!, icon_type: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="target">🎯 Target</SelectItem>
                    <SelectItem value="android">🤖 Android</SelectItem>
                    <SelectItem value="apple">🍎 Apple</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Seção</Label>
                <Select value={editing?.section || "main"} onValueChange={(v) => setEditing((p) => ({ ...p!, section: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="main">Principal</SelectItem>
                    <SelectItem value="extra">Extra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing?.is_active ?? true} onCheckedChange={(v) => setEditing((p) => ({ ...p!, is_active: v }))} />
              <Label>Ativo</Label>
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

export default AdminLinkProducts;

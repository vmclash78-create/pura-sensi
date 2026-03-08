import { useState } from "react";
import { useCategories, useUpsertCategory, useDeleteCategory } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateSlug } from "@/lib/constants";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminCategories = () => {
  const { data: categories, isLoading } = useCategories();
  const upsert = useUpsertCategory();
  const del = useDeleteCategory();
  const [editing, setEditing] = useState<{ id?: string; name: string; description: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleSave = async () => {
    if (!editing?.name.trim()) return;
    try {
      await upsert.mutateAsync({
        id: editing.id,
        name: editing.name,
        slug: generateSlug(editing.name),
        description: editing.description || undefined,
      });
      toast.success(editing.id ? "Categoria atualizada" : "Categoria criada");
      setEditing(null);
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting);
      toast.success("Categoria excluída");
    } catch {
      toast.error("Erro ao excluir");
    }
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Categorias</h1>
        <Button size="sm" onClick={() => setEditing({ name: "", description: "" })} className="gap-1">
          <Plus size={16} /> Nova Categoria
        </Button>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="bg-card border rounded-lg p-4 mb-6 max-w-md space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">{editing.id ? "Editar" : "Nova"} Categoria</h3>
            <button onClick={() => setEditing(null)}><X size={16} /></button>
          </div>
          <div>
            <Label>Nome</Label>
            <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          </div>
          <Button size="sm" onClick={handleSave} disabled={upsert.isPending}>Salvar</Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Nome</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Descrição</th>
                <th className="text-right p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {categories?.map((c) => (
                <tr key={c.id} className="border-t border-border">
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">{c.description || "—"}</td>
                  <td className="p-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditing({ id: c.id, name: c.name, description: c.description || "" })}>
                      <Pencil size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleting(c.id)}>
                      <Trash2 size={14} className="text-destructive" />
                    </Button>
                  </td>
                </tr>
              ))}
              {(!categories || categories.length === 0) && (
                <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">Nenhuma categoria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>Produtos associados ficarão sem categoria.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;

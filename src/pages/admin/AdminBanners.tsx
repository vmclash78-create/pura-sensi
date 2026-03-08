import { useState } from "react";
import { useBanners, useUpsertBanner, useDeleteBanner } from "@/hooks/useBanners";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, X, Upload } from "lucide-react";
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

const AdminBanners = () => {
  const { data: banners, isLoading } = useBanners(false);
  const upsert = useUpsertBanner();
  const del = useDeleteBanner();
  const { uploadBannerImage } = useImageUpload();
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!file) { toast.error("Selecione uma imagem"); return; }
    setSaving(true);
    try {
      const url = await uploadBannerImage(file);
      await upsert.mutateAsync({
        title: title || null,
        subtitle: subtitle || null,
        image_url: url,
        is_active: isActive,
        display_order: (banners?.length || 0),
      });
      toast.success("Banner criado!");
      setCreating(false);
      setTitle(""); setSubtitle(""); setFile(null); setIsActive(true);
    } catch {
      toast.error("Erro ao criar banner");
    }
    setSaving(false);
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    await upsert.mutateAsync({ id, image_url: "", is_active: !currentActive } as any);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await del.mutateAsync(deleting);
      toast.success("Banner excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold">Banners</h1>
        <Button size="sm" onClick={() => setCreating(true)} className="gap-1">
          <Plus size={16} /> Novo Banner
        </Button>
      </div>

      {creating && (
        <div className="bg-card border rounded-lg p-4 mb-6 max-w-md space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-sm">Novo Banner</h3>
            <button onClick={() => setCreating(false)}><X size={16} /></button>
          </div>
          <div>
            <Label>Título (opcional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label>Subtítulo (opcional)</Label>
            <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div>
            <Label>Imagem</Label>
            <label className="flex items-center gap-2 border-2 border-dashed rounded-lg p-3 cursor-pointer hover:border-accent">
              <Upload size={16} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{file ? file.name : "Selecionar"}</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Ativo</Label>
          </div>
          <Button size="sm" onClick={handleCreate} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : (
        <div className="grid gap-4">
          {banners?.map((b) => (
            <div key={b.id} className="flex items-center gap-4 border rounded-lg p-3">
              <img src={b.image_url} alt="" className="w-24 h-14 rounded object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{b.title || "Sem título"}</p>
                <p className="text-xs text-muted-foreground">{b.is_active ? "Ativo" : "Inativo"}</p>
              </div>
              <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b.id, b.is_active)} />
              <Button variant="ghost" size="sm" onClick={() => setDeleting(b.id)}>
                <Trash2 size={14} className="text-destructive" />
              </Button>
            </div>
          ))}
          {(!banners || banners.length === 0) && (
            <p className="text-muted-foreground text-center py-8">Nenhum banner.</p>
          )}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir banner?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
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

export default AdminBanners;

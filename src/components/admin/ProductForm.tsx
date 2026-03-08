import { useState, useEffect } from "react";
import { useUpsertProduct, useProduct, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useImageUpload } from "@/hooks/useImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateSlug } from "@/lib/constants";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  productId?: string;
  onClose: () => void;
}

export const ProductForm = ({ productId, onClose }: Props) => {
  const { data: categories } = useCategories();
  const upsert = useUpsertProduct();
  const { uploadProductImages, deleteProductImage } = useImageUpload();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string }[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!productId);

  useEffect(() => {
    if (!productId) return;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("*, product_images(id, image_url, display_order)")
        .eq("id", productId)
        .single();
      if (data) {
        setName(data.name);
        setDescription(data.description || "");
        setPrice(String(data.price));
        setCategoryId(data.category_id || "");
        setIsActive(data.is_active);
        setIsFeatured(data.is_featured);
        setWhatsappMsg(data.whatsapp_message || "");
        setExistingImages(
          (data.product_images || [])
            .sort((a: any, b: any) => a.display_order - b.display_order)
            .map((img: any) => ({ id: img.id, image_url: img.image_url }))
        );
      }
      setLoading(false);
    })();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const slug = generateSlug(name);
      const id = await upsert.mutateAsync({
        id: productId,
        name,
        slug,
        description: description || undefined,
        price: parseFloat(price),
        category_id: categoryId || null,
        is_active: isActive,
        is_featured: isFeatured,
        whatsapp_message: whatsappMsg || undefined,
      });

      if (newFiles.length > 0 && id) {
        await uploadProductImages(newFiles, id);
      }

      toast.success(productId ? "Produto atualizado!" : "Produto criado!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    }
    setSaving(false);
  };

  const handleRemoveImage = async (imgId: string) => {
    await deleteProductImage(imgId);
    setExistingImages((prev) => prev.filter((i) => i.id !== imgId));
  };

  if (loading) return <p className="text-muted-foreground">Carregando...</p>;

  return (
    <div>
      <button onClick={onClose} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft size={14} /> Voltar
      </button>
      <h2 className="text-xl font-display font-semibold mb-6">
        {productId ? "Editar Produto" : "Novo Produto"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-lg">
        <div>
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <Label>Preço (R$)</Label>
          <Input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Mensagem WhatsApp (opcional)</Label>
          <Input value={whatsappMsg} onChange={(e) => setWhatsappMsg(e.target.value)} placeholder="Olá, tenho interesse..." />
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Switch checked={isActive} onCheckedChange={setIsActive} />
            <Label>Ativo</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={isFeatured} onCheckedChange={setIsFeatured} />
            <Label>Destaque</Label>
          </div>
        </div>

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div>
            <Label className="mb-2 block">Imagens atuais</Label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((img) => (
                <div key={img.id} className="relative w-20 h-20 rounded overflow-hidden group">
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New image upload */}
        <div>
          <Label className="mb-2 block">Adicionar imagens</Label>
          <label className="flex items-center gap-2 border-2 border-dashed border-border rounded-lg p-4 cursor-pointer hover:border-accent transition-colors">
            <Upload size={18} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {newFiles.length > 0 ? `${newFiles.length} arquivo(s) selecionado(s)` : "Clique para selecionar"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setNewFiles(Array.from(e.target.files || []))}
            />
          </label>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
};

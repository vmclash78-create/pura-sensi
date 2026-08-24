import { useState } from "react";
import { useAdminProducts, useDeleteProduct } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/constants";
import { Plus, Pencil, Trash2, Search, Package } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import { motion } from "framer-motion";
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

const AdminProducts = () => {
  const { data: products, isLoading } = useAdminProducts();
  const deleteProduct = useDeleteProduct();
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = products?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteProduct.mutateAsync(deleting);
      toast.success("Produto excluído");
    } catch {
      toast.error("Erro ao excluir");
    }
    setDeleting(null);
  };

  if (creating || editing) {
    return (
      <ProductForm
        productId={editing || undefined}
        onClose={() => { setCreating(false); setEditing(null); }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Produtos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie seu catálogo e destaques</p>
        </div>
        <Button 
          onClick={() => setCreating(true)} 
          className="rounded-full px-6 bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] transition-all hover:scale-105 active:scale-95 gap-2"
        >
          <Plus size={18} /> Novo Produto
        </Button>
      </div>

      <div className="relative max-w-md group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur opacity-25 group-focus-within:opacity-100 transition duration-500" />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
        <Input
          placeholder="Pesquisar por nome do produto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-11 h-12 bg-card/40 backdrop-blur-sm border-border/40 rounded-full focus:ring-primary/20 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando catálogo...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered?.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative overflow-hidden rounded-2xl bg-card/30 backdrop-blur-md border border-border/40 p-4 hover:border-primary/40 hover:bg-card/50 transition-all duration-300 shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-border/40">
                  {p.product_images?.[0] ? (
                    <img
                      src={p.product_images[0].image_url}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt=""
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground italic text-[10px]">Sem imagem</div>
                  )}
                  {p.is_featured && (
                    <div className="absolute top-1 left-1 bg-accent/90 text-accent-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                      ★ TOP
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{p.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{p.categories?.name || "Sem Categoria"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-lg">{formatPrice(p.price)}</p>
                      <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${p.is_active ? "bg-success/10 text-success border border-success/20" : "bg-muted/30 text-muted-foreground border border-border/40"}`}>
                        <div className={`w-1 h-1 rounded-full ${p.is_active ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                        {p.is_active ? "Ativo" : "Pausado"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={() => setEditing(p.id)}
                    className="h-9 w-9 rounded-full border border-border/40 hover:bg-primary/10 hover:text-primary transition-all"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    onClick={() => setDeleting(p.id)}
                    className="h-9 w-9 rounded-full border border-border/40 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          
          {(!filtered || filtered.length === 0) && (
            <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border/20 bg-card/10">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium text-foreground/80">Nenhum produto encontrado</h3>
              <p className="text-sm text-muted-foreground mt-1">Tente outro termo ou adicione um novo item.</p>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={!!deleting} onOpenChange={() => setDeleting(null)}>
        <AlertDialogContent className="bg-card/95 backdrop-blur-xl border-border/40 rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Excluir este produto?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Esta ação removerá permanentemente o item e todas as suas configurações de venda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-full border-border/40 hover:bg-secondary">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20"
            >
              Excluir Definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;

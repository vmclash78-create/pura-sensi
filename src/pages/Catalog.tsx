import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySlug = searchParams.get("categoria") || undefined;
  const [search, setSearch] = useState("");
  const { data: categories } = useCategories();
  const { data: products, isLoading } = useProducts({ categorySlug, search: search || undefined });

  const activeCategory = categories?.find((c) => c.slug === categorySlug);

  const clearFilters = () => {
    setSearch("");
    setSearchParams({});
  };

  return (
    <div className="container py-8 md:py-16">
      {/* Title */}
      <div className="mb-8 md:mb-12">
        <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">
          {activeCategory ? activeCategory.name : "Catálogo"}
        </h1>
        <p className="text-muted-foreground">
          {activeCategory
            ? `Produtos na categoria ${activeCategory.name}`
            : "Explore todos os nossos produtos"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Buscar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full bg-card"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!categorySlug ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            onClick={() => setSearchParams({})}
          >
            Todos
          </Button>
          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={categorySlug === cat.slug ? "default" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSearchParams({ categoria: cat.slug })}
            >
              {cat.name}
            </Button>
          ))}
          {(search || categorySlug) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="rounded-full">
              <X size={14} className="mr-1" /> Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
              <div className="h-3 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">Nenhum produto encontrado.</p>
          <Button variant="outline" className="mt-4 rounded-full" onClick={clearFilters}>
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  );
};

export default Catalog;

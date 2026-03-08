import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProducts";
import { formatPrice, generateWhatsAppLink } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug || "");
  const [selectedImage, setSelectedImage] = useState(0);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-display font-semibold mb-4">Produto não encontrado</h1>
        <Link to="/catalogo">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft size={16} className="mr-2" /> Voltar ao catálogo
          </Button>
        </Link>
      </div>
    );
  }

  const images = product.product_images?.sort((a, b) => a.display_order - b.display_order) || [];
  const whatsappLink = generateWhatsAppLink(product.name, product.whatsapp_message || undefined);

  return (
    <div className="container py-8 md:py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Início</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-foreground">Catálogo</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link to={`/catalogo?categoria=${product.categories.slug}`} className="hover:text-foreground">
              {product.categories.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <AnimatePresence mode="wait">
              {images[selectedImage] ? (
                <motion.img
                  key={images[selectedImage].id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={images[selectedImage].image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sem imagem
                </div>
              )}
            </AnimatePresence>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-colors ${
                    i === selectedImage ? "border-accent" : "border-transparent"
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {product.categories && (
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              {product.categories.name}
            </p>
          )}
          <h1 className="font-display text-3xl md:text-4xl font-semibold">{product.name}</h1>
          <p className="font-display text-2xl md:text-3xl font-bold text-accent">
            {formatPrice(product.price)}
          </p>
          {product.description && (
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
              <p>{product.description}</p>
            </div>
          )}
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button size="lg" className="w-full bg-[hsl(142,70%,40%)] text-accent-foreground hover:bg-[hsl(142,70%,35%)] rounded-full">
              <MessageCircle className="mr-2" size={18} />
              Comprar via WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

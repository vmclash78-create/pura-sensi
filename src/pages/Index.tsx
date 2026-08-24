import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useBanners } from "@/hooks/useBanners";
import { useCategories } from "@/hooks/useCategories";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STORE_NAME, STORE_DESCRIPTION, WHATSAPP_NUMBER } from "@/lib/constants";
import { motion } from "framer-motion";
import heroBanner from "@/assets/hero-banner.jpg";

const Index = () => {
  const { data: featured } = useProducts({ featured: true });
  const { data: banners } = useBanners();
  const { data: categories } = useCategories();
  const banner = banners?.[0];

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] md:h-[85vh] overflow-hidden">
        <img
          src={banner?.image_url || heroBanner}
          alt="Banner principal"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
        <div className="relative container h-full flex flex-col justify-end pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
              {banner?.title || STORE_NAME}
            </h1>
            <p className="text-primary-foreground/90 text-lg mb-6">
              {banner?.subtitle || STORE_DESCRIPTION}
            </p>
            <Link to="/catalogo">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-8">
                Ver Catálogo <ArrowRight className="ml-2" size={18} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      {categories && categories.length > 0 && (
        <section className="container py-16 md:py-24">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-center mb-10">
            Categorias
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/catalogo?categoria=${cat.slug}`}>
                <Button variant="outline" className="rounded-full px-6 hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all">
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="bg-warm">
          <div className="container py-16 md:py-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-semibold">
                Destaques
              </h2>
              <Link
                to="/catalogo"
                className="text-sm font-medium text-accent hover:underline inline-flex items-center gap-1"
              >
                Ver todos <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Empty state when no featured products */}
      {(!featured || featured.length === 0) && (
        <section className="bg-warm">
          <div className="container py-16 md:py-24 text-center">
            <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
              Destaques
            </h2>
            <p className="text-muted-foreground mb-6">
              Em breve nossos produtos em destaque estarão aqui.
            </p>
            <Link to="/catalogo">
              <Button variant="outline" className="rounded-full">
                Explorar Catálogo
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="container py-16 md:py-24 text-center">
        <h2 className="font-display text-2xl md:text-3xl font-semibold mb-4">
          Ficou interessado?
        </h2>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Entre em contato pelo WhatsApp e tire suas dúvidas ou faça sua encomenda.
        </p>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
          <Button size="lg" className="bg-[hsl(142,70%,40%)] text-accent-foreground hover:bg-[hsl(142,70%,35%)] rounded-full px-8">
            <MessageCircle className="mr-2" size={18} />
            Falar no WhatsApp
          </Button>
        </a>
      </section>
    </>
  );
};

export default Index;

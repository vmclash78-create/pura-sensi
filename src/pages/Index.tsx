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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
        <div className="relative container h-full flex flex-col justify-end pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
              {banner?.title || STORE_NAME}
            </h1>
            <p className="text-slate-200 text-lg mb-6">
              {banner?.subtitle || STORE_DESCRIPTION}
            </p>
            <Link to="/catalogo">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 shadow-lg">
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
                <Button variant="outline" className="rounded-full px-6 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  {cat.name}
                </Button>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      {featured && featured.length > 0 && (
        <section className="bg-slate-50 dark:bg-slate-900/50">
          <div className="container py-16 md:py-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-semibold">
                Destaques
              </h2>
              <Link to="/catalogo">
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  Ver todos <ArrowRight className="ml-1" size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* WhatsApp CTA */}
      <section className="container py-16 md:py-24 text-center">
        <div className="max-w-xl mx-auto bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 rounded-3xl p-8 md:p-12 shadow-sm">
          <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Precisa de ajuda?
          </h2>
          <p className="text-muted-foreground mb-6">
            Fale conosco diretamente pelo WhatsApp para tirar dúvidas ou fazer pedidos personalizados.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 shadow-md">
              Atendimento via WhatsApp
            </Button>
          </a>
        </div>
      </section>
    </>
  );
};

export default Index;

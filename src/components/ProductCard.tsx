import { Link } from "react-router-dom";
import { Product } from "@/hooks/useProducts";
import { formatPrice } from "@/lib/constants";
import { motion } from "framer-motion";

export const ProductCard = ({ product }: { product: Product }) => {
  const mainImage = product.product_images?.sort((a, b) => a.display_order - b.display_order)[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/produto/${product.slug}`} className="group block">
        <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-3">
          {mainImage ? (
            <img
              src={mainImage.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-sm">Sem imagem</span>
            </div>
          )}
        </div>
        <div className="space-y-1">
          {product.categories && (
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {product.categories.name}
            </p>
          )}
          <h3 className="font-medium text-sm group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <p className="font-display text-lg font-semibold">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
};

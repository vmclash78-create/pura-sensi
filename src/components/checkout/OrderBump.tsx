import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";

export interface OrderBumpItem {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image?: string;
}

interface OrderBumpProps {
  bumps: OrderBumpItem[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  formatPrice: (v: number) => string;
}

const OrderBump = ({ bumps, selected, onToggle, formatPrice }: OrderBumpProps) => {
  if (bumps.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-gray-900 text-base">Você pode gostar</h3>
        <span className="text-xs text-gray-400">Selecionar todos</span>
      </div>

      {bumps.map((bump) => {
        const isSelected = selected.has(bump.id);
        return (
          <motion.div
            key={bump.id}
            layout
            className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
              isSelected
                ? "border-yellow-400 bg-yellow-50"
                : "border-yellow-200 bg-yellow-50/50"
            }`}
          >
            {/* Checkbox header */}
            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggle(bump.id)}
                className="border-gray-400 data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
              />
              <span className="font-semibold text-gray-800 text-sm">Garantir oferta especial</span>
              <div className="ml-auto flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-200 px-2 py-0.5 rounded-full">
                <Tag className="w-3 h-3" />
                Oferta
              </div>
            </label>

            {/* Product card */}
            <div className="px-4 pb-4">
              <div className="flex items-start gap-3 bg-white/60 rounded-lg p-3 border border-yellow-200">
                {bump.image ? (
                  <img
                    src={bump.image}
                    alt={bump.name}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-gray-400">
                      {bump.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 text-sm leading-tight">{bump.name}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base font-bold text-gray-900">{formatPrice(bump.price)}</span>
                    {bump.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">{formatPrice(bump.originalPrice)}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{bump.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default OrderBump;

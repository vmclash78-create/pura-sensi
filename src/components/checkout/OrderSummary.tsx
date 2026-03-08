import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderBumpItem } from "./OrderBump";

interface OrderSummaryProps {
  productName: string;
  productPrice: number;
  selectedBumps: OrderBumpItem[];
  formatPrice: (v: number) => string;
  loading: boolean;
}

const OrderSummary = ({
  productName,
  productPrice,
  selectedBumps,
  formatPrice,
  loading,
}: OrderSummaryProps) => {
  const bumpTotal = selectedBumps.reduce((sum, b) => sum + b.price, 0);
  const total = productPrice + bumpTotal;

  return (
    <>
      {/* Summary card */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-2">
        <h3 className="font-bold text-gray-900 mb-3">Resumo</h3>

        <div className="flex justify-between text-sm text-gray-600">
          <span>{productName}</span>
          <span>{formatPrice(productPrice)}</span>
        </div>

        {selectedBumps.map((b) => (
          <div key={b.id} className="flex justify-between text-sm text-gray-600">
            <span className="truncate pr-2">{b.name}</span>
            <span className="flex-shrink-0">{formatPrice(b.price)}</span>
          </div>
        ))}

        <div className="border-t border-dashed border-gray-200 pt-2 mt-2 flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(total)}</span>
        </div>

        <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span>
          <span>1x {formatPrice(total)}</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full py-6 text-base font-bold tracking-wide bg-[#00a859] hover:bg-[#008a49] text-white rounded-xl shadow-lg shadow-green-500/20"
      >
        {loading ? "Processando..." : "Comprar agora"}
      </Button>

      {/* Security */}
      <div className="flex items-center justify-center gap-2 text-gray-500">
        <ShieldCheck className="w-5 h-5" />
        <div className="text-xs">
          <p className="font-semibold">Ambiente seguro</p>
          <p>Seus dados estão protegidos</p>
        </div>
      </div>
    </>
  );
};

export default OrderSummary;

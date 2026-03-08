import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { X, Clock, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CheckoutForm, { type CheckoutFormData } from "@/components/checkout/CheckoutForm";
import OrderBump, { type OrderBumpItem } from "@/components/checkout/OrderBump";
import OrderSummary from "@/components/checkout/OrderSummary";
import PixPaymentScreen from "@/components/checkout/PixPaymentScreen";

interface PaymentProduct {
  name: string;
  subtitle?: string;
  price: number;
  description?: string;
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PaymentProduct | null;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const ORDER_BUMPS: OrderBumpItem[] = [
  {
    id: "bump-sensi-premium",
    name: "PACK DE SENSIBILIDADES VIP",
    description: "🎯 Pack Sensi Premium: 5 Configurações exclusivas! Garanta mira grudada e 90% de capa",
    price: 2.22,
    originalPrice: 9.90,
  },
  {
    id: "bump-aura",
    name: "Módulo Aura +999",
    description: "🎯 Domine a mira absurdamente! Segredos da UMP, Desert, AC80, Carapina revelados.",
    price: 4.90,
    originalPrice: 14.90,
  },
];

const CountdownTimer = () => {
  const [seconds, setSeconds] = useState(300);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");

  return (
    <div className="flex items-center gap-3 bg-[#1a1a2e] text-white px-4 py-2.5">
      <div className="flex items-center gap-2">
        <div className="text-center">
          <span className="text-xl font-bold font-mono">{min}</span>
          <span className="block text-[10px] uppercase text-white/60">min</span>
        </div>
        <span className="text-xl font-bold">:</span>
        <div className="text-center">
          <span className="text-xl font-bold font-mono">{sec}</span>
          <span className="block text-[10px] uppercase text-white/60">seg</span>
        </div>
      </div>
      <Clock className="w-5 h-5 text-white/70" />
      <span className="text-sm font-medium">Seu tempo está acabando!</span>
    </div>
  );
};

const PaymentModal = ({ open, onOpenChange, product }: PaymentModalProps) => {
  const navigate = useNavigate();
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());

  const toggleBump = useCallback((id: string) => {
    setSelectedBumps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const activeBumps = ORDER_BUMPS.filter((b) => selectedBumps.has(b.id));
  const total = (product?.price ?? 0) + activeBumps.reduce((s, b) => s + b.price, 0);

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto p-0 rounded-t-2xl bg-[#f5f5f5] border-none [&>button]:hidden">
        <CountdownTimer />

        <button
          onClick={() => onOpenChange(false)}
          className="absolute top-2.5 right-3 z-30 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="max-w-lg mx-auto px-4 pb-8">
          {/* Product card */}
          <div className="bg-white mt-4 rounded-xl p-4 flex items-center gap-4 border border-gray-200">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#00a859] to-[#008a49] flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {product.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{product.name}</p>
              <p className="text-xl font-bold text-gray-900">{formatBRL(product.price)}</p>
              {product.description && (
                <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>
              )}
            </div>
          </div>

          {/* PIX info badge */}
          <div className="mt-3 bg-[#00a859]/10 border border-[#00a859]/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a859] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">◈</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">Pagamento exclusivo via PIX</p>
              <p className="text-xs text-gray-500">Rápido, seguro e sem taxas</p>
            </div>
          </div>

          {/* Order bumps */}
          <div className="mt-3">
            <OrderBump
              bumps={ORDER_BUMPS}
              selected={selectedBumps}
              onToggle={toggleBump}
              formatPrice={formatBRL}
            />
          </div>

          {/* PIX Payment */}
          <div className="mt-4">
            <PixPaymentScreen
              productName={product.name}
              amount={total}
              onBack={() => onOpenChange(false)}
              onConfirm={() => {
                onOpenChange(false);
                navigate("/pix/confirmacao");
              }}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentModal;
export type { PaymentProduct };

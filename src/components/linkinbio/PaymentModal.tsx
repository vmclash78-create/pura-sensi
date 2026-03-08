import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { toast } from "sonner";
import { X, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import CheckoutForm, { type CheckoutFormData } from "@/components/checkout/CheckoutForm";
import PaymentMethods, { type PaymentMethod, type CardFormData } from "@/components/checkout/PaymentMethods";
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

// Order bumps — easily extendable
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
  const [seconds, setSeconds] = useState(300); // 5 min

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
  const [buyerForm, setBuyerForm] = useState<CheckoutFormData>({
    email: "", name: "", cpf: "", phone: "",
  });
  const [cardForm, setCardForm] = useState<CardFormData>({
    cardNumber: "", expiry: "", cvv: "", cardHolder: "",
  });
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [showPixScreen, setShowPixScreen] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerForm.email.trim() || !buyerForm.name.trim() || buyerForm.cpf.replace(/\D/g, "").length < 11) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }

    if (method === "pix") {
      setShowPixScreen(true);
      return;
    }

    if (method === "card") {
      if (
        cardForm.cardNumber.replace(/\D/g, "").length < 16 ||
        !cardForm.expiry ||
        !cardForm.cvv ||
        !cardForm.cardHolder
      ) {
        toast.error("Preencha todos os dados do cartão.");
        return;
      }
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast.success("Pagamento enviado! Em breve você receberá os dados de acesso.");
    onOpenChange(false);
  };

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto p-0 rounded-t-2xl bg-[#f5f5f5] border-none [&>button]:hidden">
        <AnimatePresence mode="wait">
          {showPixScreen ? (
            <PixPaymentScreen
              key="pix-screen"
              productName={product.name}
              amount={total}
              onBack={() => setShowPixScreen(false)}
              onConfirm={() => {
                onOpenChange(false);
                setShowPixScreen(false);
                navigate("/pix/confirmacao");
              }}
            />
          ) : (
            <div key="checkout-form">
              {/* Urgency bar */}
              <CountdownTimer />

              {/* Close button */}
              <button
                onClick={() => onOpenChange(false)}
                className="absolute top-2.5 right-3 z-30 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <form onSubmit={handleSubmit} className="max-w-lg mx-auto px-4 pb-8">
                {/* Product card */}
                <div className="bg-white mt-4 rounded-xl p-4 flex items-center gap-4 border border-gray-200">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
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

                {/* Buyer form */}
                <div className="mt-3">
                  <CheckoutForm form={buyerForm} onChange={setBuyerForm} />
                </div>

                {/* Payment methods */}
                <div className="mt-3">
                  <PaymentMethods
                    method={method}
                    onMethodChange={setMethod}
                    cardForm={cardForm}
                    onCardFormChange={setCardForm}
                    totalFormatted={formatBRL(total)}
                  />
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

                {/* Summary + CTA */}
                <div className="mt-4 space-y-4">
                  <OrderSummary
                    productName={product.name}
                    productPrice={product.price}
                    selectedBumps={activeBumps}
                    formatPrice={formatBRL}
                    loading={loading}
                  />
                </div>
              </form>
            </div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentModal;
export type { PaymentProduct };

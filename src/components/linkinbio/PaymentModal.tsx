import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CheckoutForm, { type CheckoutFormData } from "@/components/checkout/CheckoutForm";
import OrderBump, { type OrderBumpItem } from "@/components/checkout/OrderBump";
import PixPaymentScreen from "@/components/checkout/PixPaymentScreen";
import { useOrderBumps } from "@/hooks/useOrderBumps";
import { useSiteSettings } from "@/hooks/useSiteSettings";

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
    <div className="flex items-center gap-3 bg-secondary text-foreground px-4 py-2">
      <div className="flex items-center gap-2">
        <div className="text-center">
          <span className="text-lg font-bold font-mono">{min}</span>
          <span className="block text-[10px] uppercase text-muted-foreground">min</span>
        </div>
        <span className="text-lg font-bold">:</span>
        <div className="text-center">
          <span className="text-lg font-bold font-mono">{sec}</span>
          <span className="block text-[10px] uppercase text-muted-foreground">seg</span>
        </div>
      </div>
      <Clock className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">Seu tempo está acabando!</span>
    </div>
  );
};

const PaymentModal = ({ open, onOpenChange, product }: PaymentModalProps) => {
  const navigate = useNavigate();
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [buyerForm, setBuyerForm] = useState<CheckoutFormData>({
    email: "", name: "", cpf: "", phone: "",
  });

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!buyerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerForm.email.trim())) {
      errors.email = "Informe um e-mail válido";
    }
    if (!buyerForm.name.trim() || buyerForm.name.trim().length < 3) {
      errors.name = "Informe seu nome completo";
    }
    const cpfDigits = buyerForm.cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11 && cpfDigits.length !== 14) {
      errors.cpf = "Informe um CPF ou CNPJ válido";
    }
    const phoneDigits = buyerForm.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      errors.phone = "Informe um celular válido";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { data: dbBumps } = useOrderBumps();
  const { data: settings } = useSiteSettings();

  const bumps: OrderBumpItem[] = (dbBumps || []).map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description || "",
    price: Number(b.price),
    originalPrice: b.original_price ? Number(b.original_price) : undefined,
  }));

  const pixKey = settings?.pix_key || "198871e4-f73c-4643-bb1d-3d3fafa2aa18";
  const merchantName = settings?.pix_merchant_name || "PURA SENSI";
  const merchantCity = settings?.pix_merchant_city || "SAO PAULO";

  const toggleBump = useCallback((id: string) => {
    setSelectedBumps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const activeBumps = bumps.filter((b) => selectedBumps.has(b.id));
  const total = (product?.price ?? 0) + activeBumps.reduce((s, b) => s + b.price, 0);

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto p-0 rounded-t-2xl bg-background border-none [&>button]:hidden">
        <div className="sticky top-0 z-30">
          <div className="flex items-center gap-2 bg-card border-b border-border px-4 py-3">
            <button
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-1 text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Voltar
            </button>
          </div>
          <CountdownTimer />
        </div>

        <div className="max-w-lg mx-auto px-4 pb-8">
          <div className="bg-card mt-4 rounded-xl p-4 flex items-center gap-4 border border-border">
            <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary-foreground">{product.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-bold text-foreground">{product.name}</p>
              <p className="text-xl font-bold text-foreground">{formatBRL(product.price)}</p>
              {product.description && <p className="text-xs text-muted-foreground mt-0.5">{product.description}</p>}
            </div>
          </div>

          <div className="mt-3 bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground text-lg">◈</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Pagamento exclusivo via PIX</p>
              <p className="text-xs text-muted-foreground">Rápido, seguro e sem taxas</p>
            </div>
          </div>

          <div className="mt-3">
            <CheckoutForm form={buyerForm} onChange={(f) => { setBuyerForm(f); if (Object.keys(formErrors).length) setFormErrors({}); }} errors={formErrors} />
          </div>

          {bumps.length > 0 && (
            <div className="mt-3">
              <OrderBump bumps={bumps} selected={selectedBumps} onToggle={toggleBump} formatPrice={formatBRL} />
            </div>
          )}

          <div className="mt-4">
            <PixPaymentScreen
              productName={product.name}
              amount={total}
              pixKey={pixKey}
              merchantName={merchantName}
              merchantCity={merchantCity}
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

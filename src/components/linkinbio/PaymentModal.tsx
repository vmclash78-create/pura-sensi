import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft, Clock, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CheckoutForm, { type CheckoutFormData } from "@/components/checkout/CheckoutForm";
import OrderBump, { type OrderBumpItem } from "@/components/checkout/OrderBump";
import SigiloPayCharge from "@/components/checkout/SigiloPayCharge";
import { Button } from "@/components/ui/button";
import { useOrderBumps } from "@/hooks/useOrderBumps";
import { supabase } from "@/integrations/supabase/client";

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

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const isSameDigitSequence = (value: string) => /^(\d)\1+$/.test(value);

const isValidCpf = (cpf: string) => {
  if (cpf.length !== 11 || isSameDigitSequence(cpf)) return false;
  const calcDigit = (length: number) => {
    const sum = cpf
      .slice(0, length)
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * (length + 1 - index), 0);
    const digit = (sum * 10) % 11;
    return digit === 10 ? 0 : digit;
  };
  return calcDigit(9) === Number(cpf[9]) && calcDigit(10) === Number(cpf[10]);
};

const isValidCnpj = (cnpj: string) => {
  if (cnpj.length !== 14 || isSameDigitSequence(cnpj)) return false;
  const calcDigit = (base: string, weights: number[]) => {
    const sum = base
      .split("")
      .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const firstDigit = calcDigit(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calcDigit(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return firstDigit === Number(cnpj[12]) && secondDigit === Number(cnpj[13]);
};

const isValidDocument = (document: string) =>
  document.length === 11 ? isValidCpf(document) : document.length === 14 ? isValidCnpj(document) : false;

const CountdownTimer = () => {
  const [seconds, setSeconds] = useState(300);
  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
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

interface ChargeData {
  transactionId: string;
  pixCode: string;
  pixImage?: string;
  amount: number;
}

const PaymentModal = ({ open, onOpenChange, product }: PaymentModalProps) => {
  const navigate = useNavigate();
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [buyerForm, setBuyerForm] = useState<CheckoutFormData>({
    email: "", name: "", cpf: "", phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [charge, setCharge] = useState<ChargeData | null>(null);

  const { data: dbBumps } = useOrderBumps();

  const bumps: OrderBumpItem[] = (dbBumps || []).map((b) => ({
    id: b.id,
    name: b.name,
    description: b.description || "",
    price: Number(b.price),
    originalPrice: b.original_price ? Number(b.original_price) : undefined,
  }));

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

  // Reset state when modal closes — bug: selectedBumps e buyerForm vazavam entre aberturas de produtos diferentes
  useEffect(() => {
    if (!open) {
      setCharge(null);
      setLoading(false);
      setFormErrors({});
      setSelectedBumps(new Set());
      setBuyerForm({ email: "", name: "", cpf: "", phone: "" });
    }
  }, [open]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!buyerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerForm.email.trim())) {
      errors.email = "Informe um e-mail válido";
    }
    if (!buyerForm.name.trim() || buyerForm.name.trim().length < 3) {
      errors.name = "Informe seu nome completo";
    }
    const cpfDigits = onlyDigits(buyerForm.cpf);
    if (!isValidDocument(cpfDigits)) {
      errors.cpf = "Informe um CPF/CNPJ real e válido";
    }
    const phoneDigits = onlyDigits(buyerForm.phone);
    if (phoneDigits.length < 10) {
      errors.phone = "Informe um celular válido";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGeneratePix = async () => {
    if (!product) return;
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("sigilopay-create-pix", {
        body: {
          amount: product.price,
          product_name: product.name,
          buyer: {
            name: buyerForm.name.trim(),
            email: buyerForm.email.trim(),
            document: buyerForm.cpf,
            phone: buyerForm.phone,
          },
          bumps: activeBumps.map((b) => ({ id: b.id, name: b.name, price: b.price })),
        },
      });
      if (error) throw new Error(data?.error || error.message);
      if (!data?.pix?.code) throw new Error(data?.error || "Falha ao gerar PIX");

      setCharge({
        transactionId: data.transactionId,
        pixCode: data.pix.code,
        pixImage: data.pix.image,
        amount: data.amount,
      });
    } catch (e) {
      toast.error((e as Error).message || "Erro ao gerar cobrança PIX");
    } finally {
      setLoading(false);
    }
  };

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
              <p className="text-xs text-muted-foreground">Processado pela SigiloPay · sem taxas</p>
            </div>
          </div>

          {!charge ? (
            <>
              <div className="mt-3">
                <CheckoutForm
                  form={buyerForm}
                  onChange={(f) => { setBuyerForm(f); if (Object.keys(formErrors).length) setFormErrors({}); }}
                  errors={formErrors}
                />
              </div>

              {bumps.length > 0 && (
                <div className="mt-3">
                  <OrderBump bumps={bumps} selected={selectedBumps} onToggle={toggleBump} formatPrice={formatBRL} />
                </div>
              )}

              <div className="mt-4 bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-2xl font-bold text-foreground">{formatBRL(total)}</span>
              </div>

              <Button
                type="button"
                onClick={handleGeneratePix}
                disabled={loading}
                className="w-full mt-4 h-14 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {loading ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Gerando PIX...</span>
                ) : (
                  <>Gerar código PIX</>
                )}
              </Button>
            </>
          ) : (
            <div className="mt-4">
              <SigiloPayCharge
                productName={product.name}
                amount={charge.amount}
                pixCode={charge.pixCode}
                pixImage={charge.pixImage}
                transactionId={charge.transactionId}
                onPaid={() => {
                  onOpenChange(false);
                  navigate("/pix/confirmacao");
                }}
              />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentModal;
export type { PaymentProduct };

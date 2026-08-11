import { useState, useCallback, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import CheckoutForm, { type CheckoutFormData } from "@/components/checkout/CheckoutForm";
import OrderBump, { type OrderBumpItem } from "@/components/checkout/OrderBump";
import SigiloPayCharge from "@/components/checkout/SigiloPayCharge";
import CountdownTimer from "@/components/checkout/CountdownTimer";
import { Button } from "@/components/ui/button";
import { useOrderBumps } from "@/hooks/useOrderBumps";
import { useSigiloPayCharge } from "@/hooks/useSigiloPayCharge";
import { formatBRL } from "@/lib/format";
import { onlyDigits, isValidDocument } from "@/lib/document";

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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_NAME_LENGTH = 3;
const MIN_PHONE_DIGITS = 10;

const EMPTY_FORM: CheckoutFormData = { email: "", name: "", cpf: "", phone: "" };

const PaymentModal = ({ open, onOpenChange, product }: PaymentModalProps) => {
  const navigate = useNavigate();
  const [selectedBumps, setSelectedBumps] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [buyerForm, setBuyerForm] = useState<CheckoutFormData>(EMPTY_FORM);
  const { charge, isLoading, createCharge, reset: resetCharge } = useSigiloPayCharge();

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
      resetCharge();
      setFormErrors({});
      setSelectedBumps(new Set());
      setBuyerForm(EMPTY_FORM);
    }
  }, [open, resetCharge]);

  /** Valida email/nome/CPF/telefone e devolve true se passou. Popula formErrors. */
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
    if (!buyerForm.email.trim() || !EMAIL_REGEX.test(buyerForm.email.trim())) {
      errors.email = "Informe um e-mail válido";
    }
    if (!buyerForm.name.trim() || buyerForm.name.trim().length < MIN_NAME_LENGTH) {
      errors.name = "Informe seu nome completo";
    }
    if (!isValidDocument(onlyDigits(buyerForm.cpf))) {
      errors.cpf = "Informe um CPF/CNPJ real e válido";
    }
    if (onlyDigits(buyerForm.phone).length < MIN_PHONE_DIGITS) {
      errors.phone = "Informe um celular válido";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGeneratePix = async () => {
    if (!product) return;
    if (!validateForm()) return;
    try {
      await createCharge({
        amount: product.price,
        product_name: product.name,
        buyer: {
          name: buyerForm.name.trim(),
          email: buyerForm.email.trim(),
          document: buyerForm.cpf,
          phone: buyerForm.phone,
        },
        bumps: activeBumps.map((b) => ({ id: b.id, name: b.name, price: b.price })),
      });
    } catch (e) {
      toast.error((e as Error).message);
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
                disabled={isLoading}
                className="w-full mt-4 h-14 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
              >
                {isLoading ? (
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

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreditCard, QrCode, ShieldCheck, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentProduct {
  name: string;
  subtitle?: string;
  price: number;
}

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PaymentProduct | null;
}

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const cpfMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
};

const phoneMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
};

const cardMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const expiryMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.replace(/(\d{2})(\d)/, "$1/$2");
};

type PaymentMethod = "card" | "pix";

const PaymentModal = ({ open, onOpenChange, product }: PaymentModalProps) => {
  const [form, setForm] = useState({
    email: "",
    name: "",
    cpf: "",
    phone: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: "",
  });
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email.trim() || !form.name.trim() || form.cpf.replace(/\D/g, "").length < 11) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }
    if (method === "card") {
      if (form.cardNumber.replace(/\D/g, "").length < 16 || !form.expiry || !form.cvv || !form.cardHolder) {
        toast.error("Preencha todos os dados do cartão.");
        return;
      }
    }
    setLoading(true);
    // TODO: Integrar com Mercado Pago API via edge function
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast.success("Pagamento enviado! Em breve você receberá os dados de acesso.");
    onOpenChange(false);
    setForm({ email: "", name: "", cpf: "", phone: "", cardNumber: "", expiry: "", cvv: "", cardHolder: "" });
  };

  if (!product) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[95vh] overflow-y-auto p-0 rounded-t-2xl bg-[#f5f5f5] border-none">
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#1a1a2e] text-white px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">{product.name}</h2>
            {product.subtitle && <span className="text-sm text-white/70">{product.subtitle}</span>}
          </div>
          <button onClick={() => onOpenChange(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
          {/* Product info */}
          <div className="bg-white mx-4 mt-4 rounded-xl p-4 flex items-center gap-4 border border-gray-200">
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-primary">
                {product.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{product.name}</p>
              <p className="text-xl font-bold text-gray-900">{formatBRL(product.price)}</p>
            </div>
          </div>

          {/* Personal info */}
          <div className="bg-white mx-4 mt-3 rounded-xl p-5 border border-gray-200 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-semibold text-sm">Seu e-mail</Label>
              <Input
                type="email"
                placeholder="Insira seu e-mail"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                maxLength={255}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-semibold text-sm">Nome completo</Label>
              <Input
                placeholder="Insira seu nome completo"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-semibold text-sm">CPF/CNPJ</Label>
              <Input
                placeholder="Insira seu CPF ou CNPJ"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                value={form.cpf}
                onChange={(e) => setForm((f) => ({ ...f, cpf: cpfMask(e.target.value) }))}
                maxLength={18}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-semibold text-sm">Seu celular</Label>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-md px-3 text-sm text-gray-700 flex-shrink-0">
                  🇧🇷 +55
                </div>
                <Input
                  placeholder="(00) 00000-0000"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: phoneMask(e.target.value) }))}
                  maxLength={15}
                />
              </div>
            </div>
          </div>

          {/* Payment method tabs */}
          <div className="bg-white mx-4 mt-3 rounded-xl p-5 border border-gray-200">
            <div className="flex gap-2 mb-5">
              <button
                type="button"
                onClick={() => setMethod("card")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                  method === "card"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Cartão de crédito
              </button>
              <button
                type="button"
                onClick={() => setMethod("pix")}
                className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-4 rounded-lg border-2 transition-all text-sm font-medium ${
                  method === "pix"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                <QrCode className="w-5 h-5" />
                Pix
              </button>
            </div>

            <AnimatePresence mode="wait">
              {method === "card" ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 font-semibold text-sm">Número do cartão</Label>
                    <Input
                      placeholder="0000 0000 0000 0000"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                      value={form.cardNumber}
                      onChange={(e) => setForm((f) => ({ ...f, cardNumber: cardMask(e.target.value) }))}
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-gray-700 font-semibold text-sm">Validade</Label>
                      <Input
                        placeholder="MM/AA"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                        value={form.expiry}
                        onChange={(e) => setForm((f) => ({ ...f, expiry: expiryMask(e.target.value) }))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-gray-700 font-semibold text-sm">CVV</Label>
                      <Input
                        placeholder="3 ou 4 dígitos"
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                        value={form.cvv}
                        onChange={(e) => setForm((f) => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 font-semibold text-sm">Nome do titular</Label>
                    <Input
                      placeholder="Insira o nome impresso no cartão"
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-primary"
                      value={form.cardHolder}
                      onChange={(e) => setForm((f) => ({ ...f, cardHolder: e.target.value }))}
                      maxLength={100}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-gray-700 font-semibold text-sm">Parcelas</Label>
                    <div className="bg-white border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700">
                      1x de {formatBRL(product.price)}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="pix"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-center py-6"
                >
                  <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600">O QR Code Pix será gerado após confirmar a compra</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="bg-white mx-4 mt-3 rounded-xl p-5 border border-gray-200 space-y-2">
            <h3 className="font-bold text-gray-900 mb-3">Resumo</h3>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{product.name}</span>
              <span>{formatBRL(product.price)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatBRL(product.price)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>1x {formatBRL(product.price)}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="mx-4 mt-4 mb-3">
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-base font-bold tracking-wide bg-[#00a859] hover:bg-[#008a49] text-white rounded-xl"
            >
              {loading ? "Processando..." : "Comprar agora"}
            </Button>
          </div>

          {/* Security badge */}
          <div className="flex items-center justify-center gap-2 pb-8 text-gray-500">
            <ShieldCheck className="w-5 h-5" />
            <div className="text-xs">
              <p className="font-semibold">Ambiente seguro</p>
              <p>Seus dados confidenciais</p>
            </div>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default PaymentModal;
export type { PaymentProduct };

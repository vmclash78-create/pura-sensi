import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const PaymentModal = ({ open, onOpenChange, product }: PaymentModalProps) => {
  const [form, setForm] = useState({ name: "", email: "", cpf: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || form.cpf.replace(/\D/g, "").length < 11) {
      toast.error("Preencha todos os campos corretamente.");
      return;
    }
    setLoading(true);
    // TODO: Integrar com Mercado Pago API via edge function
    // Payload esperado: { product, buyer: form }
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    toast.success("Pagamento enviado! Em breve você receberá os dados de acesso.");
    onOpenChange(false);
    setForm({ name: "", email: "", cpf: "" });
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground">
            {product.name}
            {product.subtitle && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({product.subtitle})
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-2xl font-bold text-primary">
            {formatBRL(product.price)}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="pay-name">Nome completo</Label>
            <Input
              id="pay-name"
              placeholder="Seu nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              maxLength={100}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-email">Email</Label>
            <Input
              id="pay-email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              maxLength={255}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pay-cpf">CPF</Label>
            <Input
              id="pay-cpf"
              placeholder="000.000.000-00"
              value={form.cpf}
              onChange={(e) => setForm((f) => ({ ...f, cpf: cpfMask(e.target.value) }))}
              maxLength={14}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full text-base font-bold tracking-wider py-6"
            disabled={loading}
          >
            {loading ? "Processando..." : "PAGAR"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Pagamento seguro · Integração Mercado Pago
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
export type { PaymentProduct };

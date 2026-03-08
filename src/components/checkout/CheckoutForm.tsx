import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export interface CheckoutFormData {
  email: string;
  name: string;
  cpf: string;
  phone: string;
}

interface CheckoutFormProps {
  form: CheckoutFormData;
  onChange: (form: CheckoutFormData) => void;
  errors?: Partial<Record<keyof CheckoutFormData, string>>;
}

const CheckoutForm = ({ form, onChange, errors }: CheckoutFormProps) => {
  const set = (key: keyof CheckoutFormData, value: string) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="bg-card rounded-xl p-5 border border-border space-y-4">
      <div className="space-y-1.5">
        <Label className="text-foreground font-semibold text-sm">Seu e-mail</Label>
        <Input
          type="email"
          placeholder="Insira seu e-mail"
          className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${errors?.email ? 'border-destructive' : ''}`}
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          maxLength={255}
          required
        />
        {errors?.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>
      <div className="space-y-1.5">
        <Label className="text-foreground font-semibold text-sm">Nome completo</Label>
        <Input
          placeholder="Insira seu nome completo"
          className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${errors?.name ? 'border-destructive' : ''}`}
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          maxLength={100}
          required
        />
        {errors?.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-1.5">
        <Label className="text-foreground font-semibold text-sm">CPF/CNPJ</Label>
        <Input
          placeholder="Insira seu CPF ou CNPJ"
          className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${errors?.cpf ? 'border-destructive' : ''}`}
          value={form.cpf}
          onChange={(e) => set("cpf", cpfMask(e.target.value))}
          maxLength={18}
          required
        />
        {errors?.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
      </div>
      <div className="space-y-1.5">
        <Label className="text-foreground font-semibold text-sm">Seu celular</Label>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 bg-secondary border border-border rounded-md px-3 text-sm text-foreground flex-shrink-0">
            🇧🇷 +55
          </div>
          <Input
            placeholder="(00) 00000-0000"
            className={`bg-secondary border-border text-foreground placeholder:text-muted-foreground ${errors?.phone ? 'border-destructive' : ''}`}
            value={form.phone}
            onChange={(e) => set("phone", phoneMask(e.target.value))}
            maxLength={15}
          />
        </div>
        {errors?.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>
    </div>
};
};

export default CheckoutForm;

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
}

const CheckoutForm = ({ form, onChange }: CheckoutFormProps) => {
  const set = (key: keyof CheckoutFormData, value: string) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200 space-y-4">
      <div className="space-y-1.5">
        <Label className="text-gray-700 font-semibold text-sm">Seu e-mail</Label>
        <Input
          type="email"
          placeholder="Insira seu e-mail"
          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          maxLength={255}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-gray-700 font-semibold text-sm">Nome completo</Label>
        <Input
          placeholder="Insira seu nome completo"
          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          maxLength={100}
          required
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-gray-700 font-semibold text-sm">CPF/CNPJ</Label>
        <Input
          placeholder="Insira seu CPF ou CNPJ"
          className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
          value={form.cpf}
          onChange={(e) => set("cpf", cpfMask(e.target.value))}
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
            className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
            value={form.phone}
            onChange={(e) => set("phone", phoneMask(e.target.value))}
            maxLength={15}
          />
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;

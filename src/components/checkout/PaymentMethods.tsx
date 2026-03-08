import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, QrCode, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type PaymentMethod = "card" | "pix" | "applepay";

export interface CardFormData {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

interface PaymentMethodsProps {
  method: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  cardForm: CardFormData;
  onCardFormChange: (form: CardFormData) => void;
  totalFormatted: string;
}

const cardMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

const expiryMask = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.replace(/(\d{2})(\d)/, "$1/$2");
};

const METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: "card", label: "Cartão de crédito", icon: <CreditCard className="w-5 h-5" /> },
  { id: "pix", label: "Pix", icon: <QrCode className="w-5 h-5" /> },
  { id: "applepay", label: "Apple Pay", icon: <Smartphone className="w-5 h-5" /> },
];

const PaymentMethods = ({
  method,
  onMethodChange,
  cardForm,
  onCardFormChange,
  totalFormatted,
}: PaymentMethodsProps) => {
  const setCard = (key: keyof CardFormData, value: string) =>
    onCardFormChange({ ...cardForm, [key]: value });

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      {/* Tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onMethodChange(m.id)}
            className={`flex-1 min-w-[100px] flex flex-col items-center gap-1.5 py-3 px-3 rounded-lg border-2 transition-all text-xs font-medium ${
              method === m.id
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-gray-200 text-gray-500 hover:border-gray-300"
            }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mb-4">← Deslize para ver mais →</p>

      <AnimatePresence mode="wait">
        {method === "card" && (
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
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
                value={cardForm.cardNumber}
                onChange={(e) => setCard("cardNumber", cardMask(e.target.value))}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">Validade</Label>
                <Input
                  placeholder="MM/AA"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
                  value={cardForm.expiry}
                  onChange={(e) => setCard("expiry", expiryMask(e.target.value))}
                  maxLength={5}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-gray-700 font-semibold text-sm">CVV</Label>
                <Input
                  placeholder="3 ou 4 dígitos"
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
                  value={cardForm.cvv}
                  onChange={(e) => setCard("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                  maxLength={4}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-semibold text-sm">Nome do titular</Label>
              <Input
                placeholder="Insira o nome impresso no cartão"
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus-visible:ring-blue-500"
                value={cardForm.cardHolder}
                onChange={(e) => setCard("cardHolder", e.target.value)}
                maxLength={100}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-gray-700 font-semibold text-sm">Parcelas</Label>
              <div className="bg-white border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-700 flex items-center justify-between">
                <span>1x de {totalFormatted}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {method === "pix" && (
          <motion.div
            key="pix"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center py-8"
          >
            <QrCode className="w-20 h-20 mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-600 font-medium">O QR Code Pix será gerado após confirmar a compra</p>
            <p className="text-xs text-gray-400 mt-1">Pagamento instantâneo e sem taxas</p>
          </motion.div>
        )}

        {method === "applepay" && (
          <motion.div
            key="applepay"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-center py-8"
          >
            <Smartphone className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-sm text-gray-600 font-medium">Apple Pay disponível em breve</p>
            <p className="text-xs text-gray-400 mt-1">Selecione outro método de pagamento</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentMethods;

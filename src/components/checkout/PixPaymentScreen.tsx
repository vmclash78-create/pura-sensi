import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Clock, QrCode, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generatePixPayload } from "@/lib/pix";
import QRCode from "qrcode";

interface PixPaymentScreenProps {
  productName: string;
  amount: number;
  onBack: () => void;
  onConfirm: () => void;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const TOTAL_SECONDS = 600; // 10 min

const PixPaymentScreen = ({ productName, amount, onBack, onConfirm }: PixPaymentScreenProps) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [pixCode, setPixCode] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [seconds, setSeconds] = useState(TOTAL_SECONDS);

  // Generate payload + QR
  useEffect(() => {
    const payload = generatePixPayload(amount);
    setPixCode(payload);
    QRCode.toDataURL(payload, {
      width: 280,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [amount]);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2500);
  }, [pixCode]);

  const min = String(Math.floor(seconds / 60)).padStart(2, "0");
  const sec = String(seconds % 60).padStart(2, "0");
  const expired = seconds === 0;
  const progress = (seconds / TOTAL_SECONDS) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center px-4 pb-8"
    >
      {/* Header */}
      <div className="w-full max-w-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mt-4 mb-2 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
      </div>

      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Green PIX header */}
        <div className="bg-[#00a859] px-5 py-4 flex items-center gap-3">
          <QrCode className="w-6 h-6 text-white" />
          <div>
            <p className="text-white font-bold text-base">Pagamento via PIX</p>
            <p className="text-white/80 text-xs">Aprovação instantânea</p>
          </div>
        </div>

        {/* Timer bar */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Clock className={`w-4 h-4 ${expired ? "text-red-500" : "text-amber-500"}`} />
            <span className={`text-sm font-semibold ${expired ? "text-red-500" : "text-gray-700"}`}>
              {expired ? "Tempo expirado!" : `${min}:${sec}`}
            </span>
            <span className="text-xs text-gray-400 ml-auto">
              {expired ? "Gere um novo código" : "Seu tempo está acabando"}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${expired ? "bg-red-400" : "bg-[#00a859]"}`}
              initial={{ width: "100%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Product info */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">{productName}</p>
              <p className="text-xs text-gray-400">Pagamento único</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{formatBRL(amount)}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center py-5 px-5">
          {qrDataUrl ? (
            <div className="border-2 border-[#00a859]/20 rounded-2xl p-3 bg-white shadow-sm">
              <img src={qrDataUrl} alt="QR Code PIX" className="w-56 h-56" />
            </div>
          ) : (
            <div className="w-56 h-56 bg-gray-100 rounded-2xl animate-pulse" />
          )}

          <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
            Abra o app do seu banco e pague usando o <strong>QR Code</strong> ou o <strong>código PIX</strong> abaixo
          </p>
        </div>

        {/* Copy code */}
        <div className="px-5 pb-5">
          <div className="bg-gray-50 rounded-xl p-3 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Código PIX copia e cola</p>
            <p className="text-xs text-gray-600 break-all font-mono leading-relaxed select-all">
              {pixCode.slice(0, 80)}...
            </p>
          </div>

          <Button
            type="button"
            onClick={handleCopy}
            className="w-full h-12 rounded-xl font-bold text-base transition-all"
            style={{
              background: copied ? "#16a34a" : "#00a859",
              color: "#fff",
            }}
          >
            {copied ? (
              <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Copiado!</span>
            ) : (
              <span className="flex items-center gap-2"><Copy className="w-5 h-5" /> Copiar código PIX</span>
            )}
          </Button>
        </div>
      </div>

      {/* Confirm button */}
      <div className="w-full max-w-lg mt-4">
        <Button
          type="button"
          onClick={onConfirm}
          variant="outline"
          className="w-full h-12 rounded-xl font-semibold text-base border-2 border-[#00a859] text-[#00a859] hover:bg-[#00a859]/5"
        >
          ✅ Já realizei o pagamento
        </Button>
      </div>
    </motion.div>
  );
};

export default PixPaymentScreen;

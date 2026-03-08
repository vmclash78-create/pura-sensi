import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Clock, QrCode, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generatePixPayload } from "@/lib/pix";
import QRCode from "qrcode";

const PIX_KEY = "198871e4-f73c-4643-bb1d-3d3fafa2aa18";
const WAIT_SECONDS = 15;

interface PixPaymentScreenProps {
  productName: string;
  amount: number;
  onBack: () => void;
  onConfirm: () => void;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PixPaymentScreen = ({ productName, amount, onBack, onConfirm }: PixPaymentScreenProps) => {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(WAIT_SECONDS);

  const unlocked = countdown === 0;

  // Generate QR
  useEffect(() => {
    const payload = generatePixPayload(amount);
    QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [amount]);

  // 20s countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    toast.success("Chave PIX copiada!");
    setTimeout(() => setCopied(false), 2500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >

      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="bg-[#00a859] px-5 py-4 flex items-center gap-3">
          <QrCode className="w-6 h-6 text-white" />
          <div>
            <p className="text-white font-bold text-lg">Pagamento via PIX</p>
            <p className="text-white/80 text-xs">Aprovação instantânea</p>
          </div>
        </div>

        {/* Product + amount */}
        <div className="px-5 pt-5">
          <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
            <div>
              <p className="text-sm font-semibold text-gray-800">{productName}</p>
              <p className="text-xs text-gray-400">Pagamento único</p>
            </div>
            <p className="text-xl font-bold text-gray-900">{formatBRL(amount)}</p>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center py-6 px-5">
          {qrDataUrl ? (
            <div className="border-2 border-[#00a859]/20 rounded-2xl p-3 bg-white shadow-sm">
              <img src={qrDataUrl} alt="QR Code PIX" className="w-64 h-64" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-gray-100 rounded-2xl animate-pulse" />
          )}

          <p className="text-sm text-gray-500 mt-4 text-center max-w-xs">
            Abra o app do seu banco e pague usando o <strong>QR Code</strong> ou copie a <strong>chave PIX</strong> abaixo
          </p>
        </div>

        {/* PIX Key display + copy */}
        <div className="px-5 pb-5">
          <div className="bg-gray-50 rounded-xl p-4 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">
              Chave PIX
            </p>
            <p className="text-sm text-gray-800 font-mono select-all break-all">
              {PIX_KEY}
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
              <span className="flex items-center gap-2"><Copy className="w-5 h-5" /> Copiar chave PIX</span>
            )}
          </Button>
        </div>
      </div>

      {/* Countdown / Finalize */}
      <div className="w-full max-w-lg mt-5">
        {!unlocked ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin text-[#00a859]" />
              <span className="text-sm font-medium">Aguardando pagamento...</span>
            </div>
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="#00a859" strokeWidth="4"
                  strokeDasharray={2 * Math.PI * 28}
                  strokeDashoffset={2 * Math.PI * 28 * (1 - countdown / WAIT_SECONDS)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-800">
                {countdown}
              </span>
            </div>
            <p className="text-xs text-gray-400">Aguarde para finalizar</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              type="button"
              onClick={onConfirm}
              className="w-full h-14 rounded-xl font-bold text-base bg-[#00a859] hover:bg-[#008a49] text-white shadow-lg shadow-green-500/20"
            >
              ✅ Finalizar Pedido
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PixPaymentScreen;

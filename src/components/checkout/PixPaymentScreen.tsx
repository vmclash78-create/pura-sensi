import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, QrCode, ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { generatePixPayload } from "@/lib/pix";
import QRCode from "qrcode";

interface PixPaymentScreenProps {
  productName: string;
  amount: number;
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  onBack: () => void;
  onConfirm: () => void;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const PixPaymentScreen = ({ productName, amount, pixKey, merchantName, merchantCity, onBack, onConfirm }: PixPaymentScreenProps) => {
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [pixPayload, setPixPayload] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const payload = generatePixPayload(amount, pixKey, merchantName, merchantCity);
    setPixPayload(payload);
    QRCode.toDataURL(payload, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    }).then(setQrDataUrl);
  }, [amount, pixKey, merchantName, merchantCity]);

  const handleCopy = useCallback(async () => {
    if (!pixPayload) {
      toast.error("O código PIX ainda não foi gerado.");
      return;
    }
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast.success("Código PIX copiado!");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie o código manualmente.");
    }
  }, [pixPayload]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        <div className="bg-primary px-5 py-4 flex items-center gap-3">
          <QrCode className="w-6 h-6 text-primary-foreground" />
          <div>
            <p className="text-primary-foreground font-bold text-lg">Pagamento via PIX</p>
            <p className="text-primary-foreground/70 text-xs">PIX copia e cola</p>
          </div>
        </div>

        <div className="px-5 pt-5">
          <div className="flex items-center justify-between bg-secondary rounded-xl p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{productName}</p>
              <p className="text-xs text-muted-foreground">Pagamento único</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatBRL(amount)}</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-6 px-5">
          {qrDataUrl ? (
            <div className="border-2 border-primary/20 rounded-2xl p-3 bg-white shadow-sm">
              <img src={qrDataUrl} alt="QR Code PIX" className="w-64 h-64" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-secondary rounded-2xl animate-pulse" />
          )}

          <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
            Abra o app do seu banco e pague usando o <strong className="text-foreground">QR Code</strong> ou copie o <strong className="text-foreground">código PIX</strong> abaixo.
          </p>
          <div className="mt-4 w-full rounded-xl border border-primary/25 bg-primary/10 p-3 flex items-start gap-2 text-left">
            <AlertTriangle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-foreground/80">Este site ainda não verifica pagamentos automaticamente. Confira os dados e o destinatário no app do banco; a tela seguinte não confirma que o pagamento foi recebido.</p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <div className="bg-secondary rounded-xl p-4 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              PIX Copia e Cola
            </p>
            <p className="text-xs text-foreground font-mono select-all break-all leading-relaxed">
              {pixPayload}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleCopy}
            className="w-full h-12 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
          >
            {copied ? (
              <span className="flex items-center gap-2"><Check className="w-5 h-5" /> Copiado!</span>
            ) : (
              <span className="flex items-center gap-2"><Copy className="w-5 h-5" /> Copiar código PIX</span>
            )}
          </Button>
        </div>

        <div className="px-5 pb-5">
          <div className="flex items-center justify-center gap-4 py-3 border-t border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[11px] font-medium">Compra Segura</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Lock className="w-4 h-4 text-green-500" />
              <span className="text-[11px] font-medium">Dados Protegidos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-lg mt-5">
        <Button
          type="button"
          onClick={onConfirm}
          className="w-full h-14 rounded-xl font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
        >
          Continuar
        </Button>
      </div>
    </motion.div>
  );
};

export default PixPaymentScreen;

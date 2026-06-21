import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Copy, Check, QrCode, Loader2, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import QRCode from "qrcode";

interface Props {
  productName: string;
  amount: number;
  pixCode: string;
  pixImage?: string;
  transactionId: string;
  onPaid: () => void;
}

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const SigiloPayCharge = ({ productName, amount, pixCode, pixImage, transactionId, onPaid }: Props) => {
  const [copied, setCopied] = useState(false);
  const [paid, setPaid] = useState(false);
  const [qrSrc, setQrSrc] = useState<string | null>(null);

  // Normalize pixImage (might be raw base64) or generate QR from pixCode
  useEffect(() => {
    let cancelled = false;
    const normalize = (img?: string) => {
      if (!img) return null;
      if (img.startsWith("data:")) return img;
      if (img.startsWith("http")) return img;
      return `data:image/png;base64,${img}`;
    };
    const fromProvider = normalize(pixImage);
    if (fromProvider) {
      setQrSrc(fromProvider);
      return;
    }
    if (pixCode) {
      QRCode.toDataURL(pixCode, { width: 320, margin: 1, errorCorrectionLevel: "M" })
        .then((url) => { if (!cancelled) setQrSrc(url); })
        .catch((e) => console.error("QR gen error", e));
    }
    return () => { cancelled = true; };
  }, [pixImage, pixCode]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success("Código PIX copiado!");
    setTimeout(() => setCopied(false), 2500);
  }, [pixCode]);

  // Polling status a cada 5s
  useEffect(() => {
    if (!transactionId || paid) return;
    let cancelled = false;

    const check = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("sigilopay-check-status", {
          body: { transactionId },
        });
        if (cancelled || error) return;
        const s = data?.status;
        if (s === "OK" || s === "PAID") {
          setPaid(true);
          toast.success("Pagamento confirmado!");
          setTimeout(() => onPaid(), 1500);
        }
      } catch (e) {
        console.error("polling error", e);
      }
    };

    check();
    const interval = setInterval(check, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [transactionId, paid, onPaid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border overflow-hidden shadow-lg">
        <div className="bg-primary px-5 py-4 flex items-center gap-3">
          <QrCode className="w-6 h-6 text-primary-foreground" />
          <div>
            <p className="text-primary-foreground font-bold text-lg">Pagamento via PIX</p>
            <p className="text-primary-foreground/70 text-xs">SigiloPay · Aprovação instantânea</p>
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
          {pixImage ? (
            <div className="border-2 border-primary/20 rounded-2xl p-3 bg-white shadow-sm">
              <img src={pixImage} alt="QR Code PIX" className="w-64 h-64 object-contain" />
            </div>
          ) : (
            <div className="w-64 h-64 bg-secondary rounded-2xl animate-pulse" />
          )}

          <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
            Abra o app do seu banco e pague com o <strong className="text-foreground">QR Code</strong> ou copie o <strong className="text-foreground">código PIX</strong> abaixo
          </p>
        </div>

        <div className="px-5 pb-5">
          <div className="bg-secondary rounded-xl p-4 mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
              PIX Copia e Cola
            </p>
            <p className="text-xs text-foreground font-mono select-all break-all leading-relaxed">
              {pixCode}
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

      <div className="w-full max-w-lg mt-5 flex flex-col items-center gap-2">
        {paid ? (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-semibold">Pagamento confirmado!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Aguardando pagamento...</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SigiloPayCharge;

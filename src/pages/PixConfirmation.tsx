import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PixConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8 max-w-md w-full text-center border border-border shadow-lg"
      >
        <AlertTriangle className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-3">Pagamento ainda não confirmado</h1>
        <p className="text-muted-foreground mb-4">
          Este site não possui integração para confirmar pagamentos diretamente com o banco. Esta página não confirma o recebimento do PIX nem registra um pedido.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Confira o status da transferência no aplicativo do seu banco e entre em contato com o vendedor para validar a compra antes de considerar o pedido concluído.
        </p>
        <Button onClick={() => navigate("/")} className="w-full h-12 rounded-xl font-bold text-base">
          Voltar ao início
        </Button>
      </motion.div>
    </div>
  );
};

export default PixConfirmation;

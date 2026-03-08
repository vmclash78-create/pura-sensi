import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const PixConfirmation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center border border-gray-200 shadow-sm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="w-20 h-20 text-[#00a859] mx-auto mb-4" />
        </motion.div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pagamento recebido!</h1>
        <p className="text-gray-500 mb-1">Seu pedido foi confirmado com sucesso.</p>
        <p className="text-sm text-gray-400 mb-6">
          Você receberá os dados de acesso no e-mail informado em até 5 minutos.
        </p>

        <div className="bg-[#00a859]/5 border border-[#00a859]/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-[#00a859] font-semibold">📩 Verifique sua caixa de entrada e spam</p>
        </div>

        <Button
          onClick={() => navigate("/")}
          className="w-full h-12 rounded-xl font-bold text-base"
          style={{ background: "#00a859", color: "#fff" }}
        >
          Voltar ao início
        </Button>
      </motion.div>
    </div>
  );
};

export default PixConfirmation;

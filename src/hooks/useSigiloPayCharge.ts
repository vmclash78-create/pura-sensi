import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SigiloPayChargePayload {
  amount: number;
  product_name: string;
  buyer: {
    name: string;
    email: string;
    document: string;
    phone: string;
  };
  bumps?: { id: string; name: string; price: number }[];
}

export interface SigiloPayCharge {
  transactionId: string;
  pixCode: string;
  pixImage?: string;
  amount: number;
}

/**
 * Encapsula a criação de cobrança PIX via edge function `sigilopay-create-pix`.
 * Mantém o estado da charge gerada, flag de loading e possíveis erros.
 */
export function useSigiloPayCharge() {
  const [charge, setCharge] = useState<SigiloPayCharge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCharge = useCallback(async (payload: SigiloPayChargePayload): Promise<SigiloPayCharge> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("sigilopay-create-pix", {
        body: payload,
      });
      if (fnError) throw new Error(data?.error || fnError.message);
      if (!data?.pix?.code) throw new Error(data?.error || "Falha ao gerar PIX");

      const next: SigiloPayCharge = {
        transactionId: data.transactionId,
        pixCode: data.pix.code,
        pixImage: data.pix.image,
        amount: data.amount,
      };
      setCharge(next);
      return next;
    } catch (err) {
      const message = (err as Error).message || "Erro ao gerar cobrança PIX";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setCharge(null);
    setIsLoading(false);
    setError(null);
  }, []);

  return { charge, isLoading, error, createCharge, reset };
}

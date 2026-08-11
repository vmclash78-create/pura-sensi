import avatar from "@/assets/avatar-purasensi.jpeg";

export const STORE_NAME = "Catálogo";
export const WHATSAPP_NUMBER = "5511999999999"; // Update with your WhatsApp number
export const STORE_DESCRIPTION = "Sua loja de roupas e acessórios com estilo e elegância.";

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
};

export const generateWhatsAppLink = (productName: string, customMessage?: string) => {
  const message = customMessage || `Olá! Tenho interesse no produto: ${productName}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
};

/** Perfil público do Link in Bio da Pura Sensi. */
export const PURA_SENSI_PROFILE = {
  name: "Pura Sensi",
  avatar,
  instagram: "https://www.instagram.com/purasensi.xit?igsh=czNvaHhxbzYyMXA5",
} as const;

/** Duração do countdown do checkout (segundos). */
export const CHECKOUT_TIMER_SECONDS = 300;

/** Intervalo de polling do status da cobrança PIX (ms). */
export const PIX_POLLING_INTERVAL_MS = 5000;

/** Delay entre confirmação de pagamento e navegação para tela de sucesso (ms). */
export const PIX_ONPAID_REDIRECT_MS = 1500;

/** Duração do feedback visual "Copiado!" no botão de copiar PIX (ms). */
export const COPY_FEEDBACK_MS = 2500;

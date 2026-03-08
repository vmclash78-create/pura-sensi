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

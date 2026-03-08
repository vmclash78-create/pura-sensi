import { Link } from "react-router-dom";
import { STORE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { MessageCircle } from "lucide-react";

export const Footer = () => (
  <footer className="bg-primary text-primary-foreground mt-auto">
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-display text-xl font-semibold mb-4">{STORE_NAME}</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Moda e acessórios com estilo e qualidade. Encontre as melhores peças para completar seu visual.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Navegação</h4>
          <div className="flex flex-col gap-2">
            <Link to="/" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Início</Link>
            <Link to="/catalogo" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Catálogo</Link>
            <Link to="/sobre" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Sobre</Link>
            <Link to="/contato" className="text-sm opacity-80 hover:opacity-100 transition-opacity">Contato</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider mb-4">Contato</h4>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-xs opacity-60">
        © {new Date().getFullYear()} {STORE_NAME}. Todos os direitos reservados.
      </div>
    </div>
  </footer>
);

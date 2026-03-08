import { STORE_NAME, WHATSAPP_NUMBER } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Mail, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const Contact = () => (
  <div className="container py-12 md:py-20 max-w-4xl">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Contato</h1>
      <p className="text-muted-foreground mb-10">
        Entre em contato conosco. Estamos prontos para atendê-lo!
      </p>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-muted">
              <MessageCircle size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">WhatsApp</h3>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-accent transition-colors"
              >
                Clique para conversar
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-muted">
              <Mail size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">E-mail</h3>
              <p className="text-muted-foreground">contato@elegancestore.com.br</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-muted">
              <MapPin size={20} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Endereço</h3>
              <p className="text-muted-foreground">São Paulo, SP - Brasil</p>
            </div>
          </div>
        </div>

        {/* Contact Form (visual only) */}
        <div className="bg-card rounded-lg p-6 border border-border space-y-4">
          <Input placeholder="Seu nome" className="rounded-full" />
          <Input placeholder="Seu e-mail" type="email" className="rounded-full" />
          <Textarea placeholder="Sua mensagem" className="rounded-lg min-h-[120px]" />
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="block">
            <Button className="w-full rounded-full bg-accent text-accent-foreground hover:bg-accent/90">
              Enviar via WhatsApp
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  </div>
);

export default Contact;

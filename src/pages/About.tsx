import { STORE_NAME } from "@/lib/constants";
import { motion } from "framer-motion";

const About = () => (
  <div className="container py-12 md:py-20 max-w-3xl">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mb-6">Sobre a {STORE_NAME}</h1>
      <div className="prose prose-lg text-muted-foreground space-y-4">
        <p>
          A <strong className="text-foreground">{STORE_NAME}</strong> nasceu com a missão de oferecer
          roupas e acessórios de qualidade, com estilo moderno e preços acessíveis.
        </p>
        <p>
          Trabalhamos com uma seleção cuidadosa de produtos que incluem chinelos, relógios,
          perfumes, blusas, camisas, bonés e diversos acessórios para completar o seu visual.
        </p>
        <p>
          Nossa equipe está sempre em busca das últimas tendências para trazer o melhor da moda
          diretamente para você. Acreditamos que estilo não precisa ser complicado — e queremos
          facilitar sua experiência de compra.
        </p>
        <p>
          Ficou com alguma dúvida? Entre em contato conosco pelo WhatsApp ou pela nossa página de contato.
          Estamos sempre prontos para ajudar!
        </p>
      </div>
    </motion.div>
  </div>
);

export default About;

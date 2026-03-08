import { Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import bgLightning from "@/assets/bg-lightning.jpg";
import logo from "@/assets/logo-purasensi.png";
import avatar from "@/assets/avatar-purasensi.jpeg";
import Particles from "@/components/linkinbio/Particles";
import LinkCard, { type LinkData } from "@/components/linkinbio/LinkCard";
import PaymentModal, { type PaymentProduct } from "@/components/linkinbio/PaymentModal";
import { AndroidIcon, AppleIcon, TargetIcon } from "@/components/linkinbio/icons";
import { useLinkProducts } from "@/hooks/useLinkProducts";

const PROFILE = {
  name: "Pura Sensi",
  avatar: avatar,
  instagram: "https://www.instagram.com/purasensi.xit?igsh=czNvaHhxbzYyMXA5",
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const logoAnim = {
  hidden: { opacity: 0, scale: 0.7, filter: "blur(12px)" },
  show: {
    opacity: 1, scale: 1, filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const getIcon = (type: string) => {
  switch (type) {
    case "android": return <AndroidIcon />;
    case "apple": return <AppleIcon />;
    default: return <TargetIcon />;
  }
};

const LinkInBio = () => {
  const [bgOpacity, setBgOpacity] = useState(0.4);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<PaymentProduct | null>(null);
  const { data: products } = useLinkProducts();

  const mainLinks = (products?.filter((p) => p.section === "main") || []).map((p) => ({
    label: p.label,
    subtitle: p.subtitle || undefined,
    description: p.description || undefined,
    price: Number(p.price),
    icon: getIcon(p.icon_type),
  }));

  const extraProducts = (products?.filter((p) => p.section === "extra") || []).map((p) => ({
    name: p.label,
    price: Number(p.price),
    desc: p.subtitle || p.description || "",
  }));

  const openPayment = (product: PaymentProduct) => {
    setSelectedProduct(product);
    setPaymentOpen(true);
  };

  useEffect(() => {
    const flash = () => {
      setBgOpacity(0.25);
      setTimeout(() => setBgOpacity(0.4), 150);
      setTimeout(() => setBgOpacity(0.3), 300);
      setTimeout(() => setBgOpacity(0.4), 450);
    };
    const interval = setInterval(flash, Math.random() * 4000 + 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      <motion.img src={bgLightning} alt="" className="absolute inset-0 w-full h-full object-cover" aria-hidden initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }} />
      <motion.div className="absolute inset-0 bg-background" animate={{ opacity: bgOpacity }} transition={{ duration: 0.15 }} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/80 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent z-[1]" />
      <Particles />

      <motion.div className="relative z-10 w-full max-w-md mx-auto px-4 py-10 flex flex-col items-center" variants={container} initial="hidden" animate="show">
        <motion.img src={logo} alt={PROFILE.name} className="w-56 md:w-64 mb-4 drop-shadow-[0_0_30px_hsl(var(--primary)/0.3)]" variants={logoAnim} />

        <motion.div variants={item} className="mb-3 relative">
          <motion.div className="absolute -inset-1 rounded-full" style={{ background: "conic-gradient(from 0deg, hsl(var(--primary)), transparent 40%, transparent 60%, hsl(var(--primary)))" }} animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
          <motion.div className="absolute -inset-2 rounded-full border border-primary/30" animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} />
          <div className="relative w-20 h-20 rounded-full border-2 border-primary overflow-hidden shadow-lg shadow-primary/40">
            <img src={PROFILE.avatar} alt={PROFILE.name} className="w-full h-full object-cover" />
          </div>
        </motion.div>

        <motion.h1 variants={item} className="text-2xl md:text-3xl font-bold tracking-[0.25em] text-foreground mb-2 drop-shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
          {PROFILE.name}
        </motion.h1>

        <motion.div variants={item} className="mb-8">
          <motion.a href={PROFILE.instagram} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors duration-300" whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
            <Instagram size={22} />
          </motion.a>
        </motion.div>

        <div className="w-full space-y-3">
          {mainLinks.map((link, i) => (
            <LinkCard key={i} link={link} index={i} onClick={() => openPayment({ name: link.label, subtitle: link.subtitle, price: link.price, description: link.description })} />
          ))}
        </div>

        {extraProducts.length > 0 && (
          <motion.div variants={item} className="w-full mt-12">
            <h2 className="text-lg font-bold tracking-widest text-foreground/80 mb-4 text-center uppercase">Mais Produtos</h2>
            <div className="grid grid-cols-2 gap-3">
              {extraProducts.map((p, i) => (
                <motion.button key={i} type="button" onClick={() => openPayment({ name: p.name, price: p.price })} whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/60 backdrop-blur-md border border-border/40 hover:border-primary/60 transition-all group cursor-pointer text-center">
                  <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{p.name}</span>
                  <span className="text-xs text-muted-foreground">{p.desc}</span>
                  <span className="text-base font-bold text-primary">{formatBRL(p.price)}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        <motion.p variants={item} className="mt-10 text-xs text-muted-foreground/50">© 2026 {PROFILE.name}</motion.p>
      </motion.div>

      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} product={selectedProduct} />
    </div>
  );
};

export default LinkInBio;

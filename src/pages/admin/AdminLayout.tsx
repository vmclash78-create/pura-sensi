import { useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { STORE_NAME } from "@/lib/constants";
import { Package, Tag, Image, LogOut, Home, Link2, Zap, Settings, Menu, X, Shield } from "lucide-react";
import bgLightning from "@/assets/bg-lightning.jpg";

const navItems = [
  { to: "/admin", label: "Produtos", icon: Package, exact: true },
  { to: "/admin/categorias", label: "Categorias", icon: Tag },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/link-products", label: "Link in Bio", icon: Link2 },
  { to: "/admin/order-bumps", label: "Order Bumps", icon: Zap },
  { to: "/admin/configuracoes", label: "Config. PIX", icon: Settings },
];

const AdminLayout = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );

  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);

  return (
    <div className="min-h-screen flex relative bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 flex flex-col overflow-hidden
          border-r border-border
          transition-transform duration-200 ease-in-out
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar bg with lightning image like home page */}
        <div className="absolute inset-0">
          <img src={bgLightning} alt="" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-background/90" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
        </div>

        {/* Brand */}
        <div className="relative p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.2)]">
              <Shield size={18} className="text-primary" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-wide text-foreground">
                {STORE_NAME}
              </span>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold">
                Painel Admin
              </p>
            </div>
          </div>
          <button
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
            Gerenciamento
          </p>
          {navItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${active
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-[0_0_15px_hsl(var(--primary)/0.12)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent"
                  }
                `}
              >
                <item.icon size={16} className={active ? "text-primary" : ""} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="relative p-3 border-t border-border space-y-1">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-all"
          >
            <Home size={16} /> Ver Loja
          </Link>
          <button
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
            onClick={signOut}
          >
            <LogOut size={16} /> Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-primary" />
            <span className="font-display font-bold text-sm tracking-wide">Painel Admin</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8 max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

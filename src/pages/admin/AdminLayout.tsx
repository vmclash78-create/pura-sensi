import { useState } from "react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { STORE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Package, Tag, Image, LogOut, Home, Link2, Zap, Settings, Menu, X } from "lucide-react";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  const closeSidebar = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <Link to="/" className="font-display text-lg font-semibold">{STORE_NAME}</Link>
          <p className="text-xs text-muted-foreground">Painel Admin</p>
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={closeSidebar}>
          <X size={18} />
        </Button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const active = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} onClick={closeSidebar}>
              <Button
                variant={active ? "secondary" : "ghost"}
                className="w-full justify-start gap-2"
                size="sm"
              >
                <item.icon size={16} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-1">
        <Link to="/" onClick={closeSidebar}>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
            <Home size={16} /> Ver Loja
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
          <LogOut size={16} /> Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - desktop: always visible, mobile: slide-in overlay */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col
          transition-transform duration-200 ease-in-out
          md:sticky md:top-0 md:h-screen md:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center gap-3 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </Button>
          <span className="font-semibold text-sm">Painel Admin</span>
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

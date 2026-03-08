import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { STORE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Package, Tag, Image, LogOut, Home, Link2, Zap, Settings } from "lucide-react";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-60 bg-card border-r border-border flex flex-col shrink-0">
        <div className="p-4 border-b border-border">
          <Link to="/" className="font-display text-lg font-semibold">{STORE_NAME}</Link>
          <p className="text-xs text-muted-foreground">Painel Admin</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = item.exact
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}>
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
          <Link to="/">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2">
              <Home size={16} /> Ver Loja
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={signOut}>
            <LogOut size={16} /> Sair
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

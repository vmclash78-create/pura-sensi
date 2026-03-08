
-- Link products (products shown on link in bio page)
CREATE TABLE public.link_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  subtitle text,
  description text,
  price numeric NOT NULL,
  icon_type text NOT NULL DEFAULT 'target',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  section text NOT NULL DEFAULT 'main',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.link_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active link products" ON public.link_products
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert link products" ON public.link_products
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update link products" ON public.link_products
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete link products" ON public.link_products
  FOR DELETE USING (is_admin());

-- Order bumps
CREATE TABLE public.order_bumps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  original_price numeric,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_bumps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active order bumps" ON public.order_bumps
  FOR SELECT USING (is_active = true OR is_admin());

CREATE POLICY "Admins can insert order bumps" ON public.order_bumps
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update order bumps" ON public.order_bumps
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete order bumps" ON public.order_bumps
  FOR DELETE USING (is_admin());

-- Site settings (for PIX key etc)
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert site settings" ON public.site_settings
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update site settings" ON public.site_settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete site settings" ON public.site_settings
  FOR DELETE USING (is_admin());

-- Seed default PIX key
INSERT INTO public.site_settings (key, value) VALUES ('pix_key', '198871e4-f73c-4643-bb1d-3d3fafa2aa18');
INSERT INTO public.site_settings (key, value) VALUES ('pix_merchant_name', 'PURA SENSI');
INSERT INTO public.site_settings (key, value) VALUES ('pix_merchant_city', 'SAO PAULO');

-- Seed existing link products
INSERT INTO public.link_products (label, subtitle, price, icon_type, display_order, section) VALUES
  ('AUXÍLIO VIP', NULL, 49.90, 'target', 0, 'main'),
  ('PAINEL PERMANENTE', 'Android', 129.90, 'android', 1, 'main'),
  ('PAINEL PERMANENTE', 'iOS', 149.90, 'apple', 2, 'main'),
  ('PAINEL MENSAL', 'Android', 39.90, 'android', 3, 'main'),
  ('PAINEL MENSAL', 'iOS', 49.90, 'apple', 4, 'main'),
  ('Sensi Pack Básico', 'Acesso ao pacote básico com recursos essenciais', 19.90, 'target', 0, 'extra'),
  ('Sensi Pack Premium', 'Pacote completo com todos os recursos', 79.90, 'target', 1, 'extra'),
  ('Consultoria Individual', 'Sessão 1-a-1 personalizada', 99.90, 'target', 2, 'extra'),
  ('Combo Sensi Total', 'Todos os painéis + auxílio VIP', 199.90, 'target', 3, 'extra');

-- Seed existing order bumps
INSERT INTO public.order_bumps (name, description, price, original_price, display_order) VALUES
  ('PACK DE SENSIBILIDADES VIP', '🎯 Pack Sensi Premium: 5 Configurações exclusivas! Garanta mira grudada e 90% de capa', 2.22, 9.90, 0),
  ('Módulo Aura +999', '🎯 Domine a mira absurdamente! Segredos da UMP, Desert, AC80, Carapina revelados.', 4.90, 14.90, 1);

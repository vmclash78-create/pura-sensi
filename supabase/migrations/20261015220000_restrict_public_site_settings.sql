-- Expose only the PIX fields required by the public checkout.
-- Admins retain access to all settings through the is_admin() security-definer helper.
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

CREATE POLICY "Public can view checkout PIX settings"
ON public.site_settings
FOR SELECT
USING (
  key IN ('pix_key', 'pix_merchant_name', 'pix_merchant_city')
  OR public.is_admin()
);

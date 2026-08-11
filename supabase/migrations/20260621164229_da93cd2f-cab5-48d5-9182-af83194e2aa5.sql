
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL UNIQUE,
  transaction_id text UNIQUE,
  status text NOT NULL DEFAULT 'PENDING',
  amount numeric(10,2) NOT NULL,
  product_name text NOT NULL,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  buyer_document text NOT NULL,
  buyer_phone text NOT NULL,
  pix_code text,
  pix_image text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz
);

GRANT SELECT, INSERT, UPDATE ON public.orders TO anon;
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Reads/updates only via edge functions (service_role). No direct client policies.
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX orders_identifier_idx ON public.orders(identifier);
CREATE INDEX orders_transaction_id_idx ON public.orders(transaction_id);

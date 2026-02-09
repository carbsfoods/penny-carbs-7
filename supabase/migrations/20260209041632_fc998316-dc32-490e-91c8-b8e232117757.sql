
-- Create delivery_rules table for cloud kitchen and homemade delivery charges
CREATE TABLE public.delivery_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_type TEXT NOT NULL CHECK (service_type IN ('cloud_kitchen', 'homemade')),
  rule_name TEXT NOT NULL,
  min_delivery_charge NUMERIC NOT NULL DEFAULT 0,
  free_delivery_above NUMERIC NULL,
  per_km_charge NUMERIC NULL DEFAULT 0,
  max_delivery_charge NUMERIC NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_rules ENABLE ROW LEVEL SECURITY;

-- Admins can manage delivery rules
CREATE POLICY "Admins can manage delivery rules"
ON public.delivery_rules
FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active delivery rules
CREATE POLICY "Anyone can view active delivery rules"
ON public.delivery_rules
FOR SELECT
USING (is_active = true);

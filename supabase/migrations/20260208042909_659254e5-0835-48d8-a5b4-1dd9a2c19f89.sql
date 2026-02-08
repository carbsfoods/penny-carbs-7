-- Add platform margin columns to food_items table
-- margin_type: 'percent' or 'fixed' 
-- margin_value: the actual value (percentage or fixed amount)

ALTER TABLE public.food_items
ADD COLUMN IF NOT EXISTS platform_margin_type text DEFAULT 'percent',
ADD COLUMN IF NOT EXISTS platform_margin_value numeric DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.food_items.platform_margin_type IS 'Type of platform margin: percent or fixed';
COMMENT ON COLUMN public.food_items.platform_margin_value IS 'Platform margin value (percentage or fixed rupees)';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Fetches the lowest cook custom_price for each homemade food item.
 * Returns a Map<food_item_id, lowest_custom_price>.
 * If a cook has no custom_price, it means they use the item's base price.
 */
export function useLowestCookPrices() {
  const [prices, setPrices] = useState<Map<string, number | null>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data, error } = await supabase
          .from('cook_dishes')
          .select(`
            food_item_id,
            custom_price,
            cooks!inner(is_active, is_available)
          `)
          .eq('cooks.is_active', true)
          .eq('cooks.is_available', true);

        if (error) throw error;

        const map = new Map<string, number | null>();
        if (data) {
          for (const row of data as any[]) {
            const itemId = row.food_item_id;
            const price = row.custom_price as number | null;
            const current = map.get(itemId);
            if (current === undefined) {
              map.set(itemId, price);
            } else if (price !== null) {
              if (current === null || price < current) {
                map.set(itemId, price);
              }
            }
          }
        }
        setPrices(map);
      } catch (err) {
        console.error('Error fetching lowest cook prices:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { lowestCookPrices: prices, isLoading };
}

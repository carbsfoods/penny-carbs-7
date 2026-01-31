import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Cook, CookOrder, CookStatus, CookEarnings } from '@/types/cook';

export function useCookProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['cook-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('cooks')
        .select(`
          *,
          panchayat:panchayats(id, name)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as Cook | null;
    },
    enabled: !!user?.id,
  });
}

export function useCookOrders() {
  const { user } = useAuth();
  const { data: profile } = useCookProfile();

  return useQuery({
    queryKey: ['cook-orders', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Fetch assignments from order_assigned_cooks
      const { data: assignments, error: assignError } = await supabase
        .from('order_assigned_cooks')
        .select('order_id, cook_status')
        .eq('cook_id', profile.id)
        .in('cook_status', ['pending', 'accepted', 'preparing', 'cooked']);

      if (assignError) throw assignError;
      if (!assignments || assignments.length === 0) return [];

      const orderIds = assignments.map(a => a.order_id);

      // Fetch orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          service_type,
          total_amount,
          event_date,
          event_details,
          delivery_address,
          guest_count,
          created_at,
          customer_id
        `)
        .in('id', orderIds)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Merge cook_status from assignments
      const assignmentMap = new Map(assignments.map(a => [a.order_id, a.cook_status]));

      // Fetch order items assigned to this cook
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          food_item_id,
          quantity,
          unit_price,
          total_price,
          food_item:food_items(id, name)
        `)
        .in('order_id', orderIds)
        .eq('assigned_cook_id', profile.id);

      // Group order items by order_id
      const orderItemsMap = new Map<string, typeof orderItems>();
      orderItems?.forEach(item => {
        if (!orderItemsMap.has(item.order_id)) {
          orderItemsMap.set(item.order_id, []);
        }
        orderItemsMap.get(item.order_id)!.push(item);
      });
      
      // Fetch customer details separately
      const ordersWithDetails = await Promise.all((orders || []).map(async (order) => {
        const { data: customerProfile } = await supabase
          .from('profiles')
          .select('name, mobile_number')
          .eq('user_id', order.customer_id)
          .maybeSingle();
        
        return {
          ...order,
          cook_status: assignmentMap.get(order.id) || 'pending',
          customer: customerProfile || undefined,
          order_items: orderItemsMap.get(order.id) || [],
        };
      }));
      
      return ordersWithDetails as CookOrder[];
    },
    enabled: !!profile?.id,
  });
}

export function useCookEarnings() {
  const { data: profile } = useCookProfile();

  return useQuery({
    queryKey: ['cook-earnings', profile?.id],
    queryFn: async (): Promise<CookEarnings> => {
      if (!profile?.id) {
        return { total_orders_completed: 0, total_earnings: 0, pending_payout: 0 };
      }

      // Count completed orders (cook_status = 'ready')
      const { data: completedAssignments, error: assignError } = await supabase
        .from('order_assigned_cooks')
        .select('order_id')
        .eq('cook_id', profile.id)
        .eq('cook_status', 'ready');

      if (assignError) throw assignError;

      const completedOrderIds = completedAssignments?.map(a => a.order_id) || [];

      // Get settlements for this cook
      const { data: settlements, error: settleError } = await supabase
        .from('settlements')
        .select('amount, status')
        .eq('user_id', profile.user_id || '');

      if (settleError) throw settleError;

      const totalEarnings = settlements?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;
      const pendingPayout = settlements
        ?.filter(s => s.status === 'pending')
        .reduce((sum, s) => sum + Number(s.amount), 0) || 0;

      return {
        total_orders_completed: completedOrderIds.length,
        total_earnings: totalEarnings,
        pending_payout: pendingPayout,
      };
    },
    enabled: !!profile?.id,
  });
}

export function useUpdateCookStatus() {
  const queryClient = useQueryClient();
  const { data: profile } = useCookProfile();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: CookStatus }) => {
      if (!profile?.id) throw new Error('Not authenticated');

      // Update the assignment status
      const { error } = await supabase
        .from('order_assigned_cooks')
        .update({ 
          cook_status: status,
          responded_at: status === 'accepted' ? new Date().toISOString() : undefined,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', orderId)
        .eq('cook_id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cook-orders'] });
    },
  });
}

export function useUpdateCookAvailability() {
  const queryClient = useQueryClient();
  const { data: profile } = useCookProfile();

  return useMutation({
    mutationFn: async (isAvailable: boolean) => {
      if (!profile?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('cooks')
        .update({ is_available: isAvailable })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cook-profile'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OrderBumpDB {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  is_active: boolean;
  display_order: number;
}

export const useOrderBumps = () => {
  return useQuery({
    queryKey: ["order_bumps"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_bumps")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as OrderBumpDB[];
    },
  });
};

export const useUpsertOrderBump = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bump: Partial<OrderBumpDB> & { name: string; price: number }) => {
      if (bump.id) {
        const { error } = await supabase.from("order_bumps").update(bump).eq("id", bump.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("order_bumps").insert(bump);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order_bumps"] }),
  });
};

export const useDeleteOrderBump = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("order_bumps").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["order_bumps"] }),
  });
};

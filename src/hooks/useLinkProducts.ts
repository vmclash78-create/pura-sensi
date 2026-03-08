import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface LinkProduct {
  id: string;
  label: string;
  subtitle: string | null;
  description: string | null;
  price: number;
  icon_type: string;
  display_order: number;
  is_active: boolean;
  section: string;
}

export const useLinkProducts = () => {
  return useQuery({
    queryKey: ["link_products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("link_products")
        .select("*")
        .order("display_order");
      if (error) throw error;
      return data as LinkProduct[];
    },
  });
};

export const useUpsertLinkProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<LinkProduct> & { label: string; price: number }) => {
      if (product.id) {
        const { error } = await supabase.from("link_products").update(product).eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("link_products").insert(product);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["link_products"] }),
  });
};

export const useDeleteLinkProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("link_products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["link_products"] }),
  });
};

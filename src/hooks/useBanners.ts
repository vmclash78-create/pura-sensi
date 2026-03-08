import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Banner {
  id: string;
  title: string | null;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export const useBanners = (activeOnly = true) => {
  return useQuery({
    queryKey: ["banners", activeOnly],
    queryFn: async () => {
      let q = supabase.from("banners").select("*").order("display_order");
      if (activeOnly) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as Banner[];
    },
  });
};

export const useUpsertBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (banner: Partial<Banner> & { image_url: string }) => {
      if (banner.id) {
        const { error } = await supabase.from("banners").update(banner).eq("id", banner.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("banners").insert(banner);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
};

export const useDeleteBanner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banners"] }),
  });
};

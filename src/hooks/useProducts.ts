import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  whatsapp_message: string | null;
  created_at: string;
  updated_at: string;
  categories?: { id: string; name: string; slug: string } | null;
  product_images?: { id: string; image_url: string; display_order: number }[];
}

export const useProducts = (filters?: { categorySlug?: string; search?: string; featured?: boolean }) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*, categories(id, name, slug), product_images(id, image_url, display_order)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (filters?.featured) query = query.eq("is_featured", true);
      if (filters?.search) query = query.ilike("name", `%${filters.search}%`);
      if (filters?.categorySlug) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", filters.categorySlug)
          .single();
        if (cat) query = query.eq("category_id", cat.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useProduct = (slug: string) => {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name, slug), product_images(id, image_url, display_order)")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as Product;
    },
    enabled: !!slug,
  });
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(id, name, slug), product_images(id, image_url, display_order)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useDeleteProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpsertProduct = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (product: {
      id?: string;
      name: string;
      slug: string;
      description?: string;
      price: number;
      category_id?: string | null;
      is_active?: boolean;
      is_featured?: boolean;
      whatsapp_message?: string;
    }) => {
      if (product.id) {
        const { error } = await supabase.from("products").update(product).eq("id", product.id);
        if (error) throw error;
        return product.id;
      } else {
        const { data, error } = await supabase.from("products").insert(product).select("id").single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export const useImageUpload = () => {
  const qc = useQueryClient();

  const uploadImage = async (file: File, bucket: string, path: string) => {
    const ext = file.name.split(".").pop();
    const fileName = `${path}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const uploadProductImages = async (files: File[], productId: string) => {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file, "product-images", productId);
      urls.push(url);
    }
    // Insert image records
    const records = urls.map((url, i) => ({
      product_id: productId,
      image_url: url,
      display_order: i,
    }));
    const { error } = await supabase.from("product_images").insert(records);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    return urls;
  };

  const deleteProductImage = async (imageId: string) => {
    const { error } = await supabase.from("product_images").delete().eq("id", imageId);
    if (error) throw error;
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const uploadBannerImage = async (file: File) => {
    return uploadImage(file, "banners", "hero");
  };

  return { uploadImage, uploadProductImages, deleteProductImage, uploadBannerImage };
};

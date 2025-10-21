import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  category_id: z.string().uuid("Please select a category"),
  cash_price: z.number().positive("Price must be positive"),
  lease_price: z.number().positive("Price must be positive").optional(),
  stock_quantity: z.number().min(0, "Stock cannot be negative"),
});

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    cash_price: "",
    lease_price: "",
    stock_quantity: "0",
  });

  const isEditMode = !!id;

  useEffect(() => {
    loadCategories();
    if (isEditMode) {
      loadProduct();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name,
        description: data.description || "",
        category_id: data.category_id,
        cash_price: data.cash_price.toString(),
        lease_price: data.lease_price?.toString() || "",
        stock_quantity: data.stock_quantity.toString(),
      });
      setImageUrls(data.images || []);
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Failed to load product");
      navigate("/admin/products");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError, data } = await supabase.storage
          .from("product-images")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(filePath);

        newImageUrls.push(publicUrl);
      }

      setImageUrls([...imageUrls, ...newImageUrls]);
      toast.success("Images uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = productSchema.parse({
        name: formData.name,
        description: formData.description || undefined,
        category_id: formData.category_id,
        cash_price: parseFloat(formData.cash_price),
        lease_price: formData.lease_price ? parseFloat(formData.lease_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity),
      });

      const productData = {
        name: validatedData.name,
        description: validatedData.description || null,
        category_id: validatedData.category_id,
        cash_price: validatedData.cash_price,
        lease_price: validatedData.lease_price || null,
        stock_quantity: validatedData.stock_quantity,
        images: imageUrls,
      };

      if (isEditMode) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase
          .from("products")
          .insert([productData]);

        if (error) throw error;
        toast.success("Product created successfully");
      }

      navigate("/admin/products");
    } catch (error: any) {
      console.error("Error saving product:", error);
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Failed to save product");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/products")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>
              {isEditMode ? "Edit Product" : "Add New Product"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cash_price">Cash Price</Label>
                  <Input
                    id="cash_price"
                    type="number"
                    step="0.01"
                    value={formData.cash_price}
                    onChange={(e) => setFormData({ ...formData, cash_price: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lease_price">Lease Price (Monthly)</Label>
                  <Input
                    id="lease_price"
                    type="number"
                    step="0.01"
                    value={formData.lease_price}
                    onChange={(e) => setFormData({ ...formData, lease_price: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_quantity">Stock Quantity</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Product Images</Label>
                <div className="flex flex-wrap gap-4 mb-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    id="images"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("images")?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? "Uploading..." : "Upload Images"}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  isEditMode ? "Update Product" : "Create Product"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

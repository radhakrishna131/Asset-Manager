import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useGetProduct, getGetProductQueryKey, useUpdateProduct, ProductUpdate } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminEditProduct() {
  const [, params] = useRoute("/admin/products/:id/edit");
  const id = parseInt(params?.id || "0", 10);
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(id, {
    query: { enabled: !!id, queryKey: getGetProductQueryKey(id) }
  });

  const update = useUpdateProduct();

  const [formData, setFormData] = useState<Partial<ProductUpdate>>({});

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description || "",
        price: product.price,
        originalPrice: product.originalPrice,
        currency: product.currency,
        images: product.images,
        brand: product.brand || "",
        category: product.category,
        affiliateUrl: product.affiliateUrl,
        store: product.store || "",
        featured: product.featured,
        inStock: product.inStock,
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    update.mutate({ id, data: formData as ProductUpdate }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Product updated successfully." });
        queryClient.invalidateQueries({ queryKey: getGetProductQueryKey(id) });
        setLocation("/admin/products");
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.message || "Failed to update product", variant: "destructive" });
      }
    });
  };

  if (isLoading || !product) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
          <p className="text-muted-foreground mt-1">Editing "{product.title}"</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <Label>Product Title *</Label>
                  <Input 
                    value={formData.title || ''} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input 
                    type="number" step="0.01" 
                    value={formData.price || ''} 
                    onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Original Price</Label>
                  <Input 
                    type="number" step="0.01" 
                    value={formData.originalPrice || ''} 
                    onChange={e => setFormData({...formData, originalPrice: parseFloat(e.target.value)})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Input 
                    value={formData.category || ''} 
                    onChange={e => setFormData({...formData, category: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Store / Brand</Label>
                  <Input 
                    value={formData.store || formData.brand || ''} 
                    onChange={e => setFormData({...formData, store: e.target.value, brand: e.target.value})} 
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Affiliate URL *</Label>
                  <Input 
                    value={formData.affiliateUrl || ''} 
                    onChange={e => setFormData({...formData, affiliateUrl: e.target.value})} 
                    required 
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Images (Comma separated URLs)</Label>
                  <Textarea 
                    value={formData.images?.join(", ") || ""} 
                    onChange={e => setFormData({...formData, images: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} 
                    rows={3}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description || ""} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    rows={5}
                  />
                </div>

                <div className="space-y-4 md:col-span-2 bg-muted/30 p-4 rounded-xl border">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="featured" 
                      checked={formData.featured} 
                      onCheckedChange={(c) => setFormData({...formData, featured: !!c})} 
                    />
                    <Label htmlFor="featured" className="font-semibold cursor-pointer">Feature this product on homepage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="instock" 
                      checked={formData.inStock} 
                      onCheckedChange={(c) => setFormData({...formData, inStock: !!c})} 
                    />
                    <Label htmlFor="instock" className="font-semibold cursor-pointer">Product is in stock</Label>
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button type="button" variant="ghost" onClick={() => setLocation("/admin/products")}>Cancel</Button>
                <Button type="submit" disabled={update.isPending} className="font-bold px-8">
                  {update.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}

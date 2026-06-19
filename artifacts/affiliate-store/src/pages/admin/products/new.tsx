import { useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useScrapeProductUrl, useCreateProduct, ProductInput } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Wand2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminNewProduct() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const scrape = useScrapeProductUrl();
  const create = useCreateProduct();

  const [scrapeUrl, setScrapeUrl] = useState("");
  const [formData, setFormData] = useState<Partial<ProductInput>>({
    title: "",
    description: "",
    price: 0,
    originalPrice: undefined,
    currency: "USD",
    images: [],
    brand: "",
    category: "general",
    affiliateUrl: "",
    store: "",
    featured: false,
    inStock: true,
    sourceUrl: "",
  });

  const handleScrape = async () => {
    if (!scrapeUrl) return;
    
    scrape.mutate({ data: { url: scrapeUrl } }, {
      onSuccess: (data) => {
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          description: data.description || prev.description,
          price: data.price || prev.price,
          originalPrice: data.originalPrice || prev.originalPrice,
          currency: data.currency || prev.currency,
          images: data.images?.length ? data.images : prev.images,
          brand: data.brand || prev.brand,
          category: data.category?.toLowerCase() || prev.category,
          store: data.store || prev.store,
          affiliateUrl: data.affiliateUrl || scrapeUrl, // Use scraped url as fallback
          sourceUrl: scrapeUrl
        }));
        toast({ title: "Scrape successful", description: "Form populated with product data." });
      },
      onError: (err: any) => {
        toast({ title: "Scrape failed", description: err?.message || "Could not extract data", variant: "destructive" });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.category || !formData.affiliateUrl) {
      toast({ title: "Validation Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    create.mutate({ data: formData as ProductInput }, {
      onSuccess: () => {
        toast({ title: "Success", description: "Product created successfully." });
        setLocation("/admin/products");
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.message || "Failed to create product", variant: "destructive" });
      }
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Product</h1>
          <p className="text-muted-foreground mt-1">Import via URL or enter details manually.</p>
        </div>

        {/* Magic Import Card */}
        <Card className="border-primary/20 shadow-md shadow-primary/5">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" /> Magic Import
            </CardTitle>
            <CardDescription>Paste a product URL to automatically extract details.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Input
                placeholder="https://amazon.com/dp/..."
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleScrape} disabled={!scrapeUrl || scrape.isPending}>
                {scrape.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Extract Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manual Form */}
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
                    value={formData.title} 
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
                  <Label>Original Price (Optional)</Label>
                  <Input 
                    type="number" step="0.01" 
                    value={formData.originalPrice || ''} 
                    onChange={e => setFormData({...formData, originalPrice: parseFloat(e.target.value)})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category * (slug format)</Label>
                  <Input 
                    value={formData.category} 
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
                    value={formData.affiliateUrl} 
                    onChange={e => setFormData({...formData, affiliateUrl: e.target.value})} 
                    required 
                    placeholder="https://..."
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
                <Button type="submit" disabled={create.isPending} className="font-bold px-8">
                  {create.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Publish Product
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>

      </div>
    </AdminLayout>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { AdminLayout } from "@/components/AdminLayout";
import { useListProducts, getListProductsQueryKey, useDeleteProduct } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, ExternalLink, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminProductsList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  const limit = 20;

  const queryParams = { search: search || undefined, page, limit, sort: "latest" as any };
  
  const { data, isLoading } = useListProducts(queryParams, {
    query: { queryKey: getListProductsQueryKey(queryParams) }
  });

  const deleteProduct = useDeleteProduct();
  const queryClient = useQueryClient();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        }
      });
    }
  };

  const handleSyncProduct = async (id: number) => {
    setSyncingId(id);
    try {
      await fetch(`/api/admin/sync-prices/${id}`, { method: "POST", credentials: "include" });
      queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    } finally {
      setSyncingId(null);
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground mt-1">Manage your catalog of affiliate products.</p>
          </div>
          <Link href="/admin/products/new">
            <Button className="font-bold shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </Link>
        </div>

        <div className="bg-card rounded-xl border shadow-sm">
          <div className="p-4 border-b">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 bg-muted/50 border-none"
              />
            </div>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Clicks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading products...</TableCell>
                </TableRow>
              ) : data?.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No products found.</TableCell>
                </TableRow>
              ) : (
                data?.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-md bg-muted overflow-hidden border">
                        {product.images && product.images[0] && (
                          <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{product.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                        {product.store}
                        {product.featured && <Badge variant="secondary" className="text-[10px] h-4 px-1">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                    <TableCell className="text-right font-medium">₹{product.price.toFixed(2)}</TableCell>
                    <TableCell className="text-center font-bold text-primary">{product.clickCount}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Sync price from site"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        disabled={syncingId === product.id}
                        onClick={() => handleSyncProduct(product.id)}
                      >
                        <RefreshCw className={`w-4 h-4 ${syncingId === product.id ? "animate-spin" : ""}`} />
                      </Button>
                      <a href={product.affiliateUrl} target="_blank" rel="noreferrer" className="inline-block">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {data?.products.length} of {data?.total} products
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

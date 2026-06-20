import { AdminLayout } from "@/components/AdminLayout";
import { useGetAnalyticsSummary, getGetAnalyticsSummaryQueryKey, useGetTopProducts, getGetTopProductsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MousePointerClick, Package, Tag, ArrowUpRight, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";
import { useState } from "react";

function useSyncPrices() {
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const syncAll = async () => {
    setSyncing(true);
    setLastResult(null);
    try {
      const res = await fetch("/api/admin/sync-prices", { method: "POST", credentials: "include" });
      if (res.status === 409) {
        setLastResult({ type: "error", message: "Sync already running" });
      } else if (res.ok) {
        setLastResult({ type: "success", message: "Sync started — prices will update in the background" });
      } else {
        setLastResult({ type: "error", message: "Failed to start sync" });
      }
    } catch {
      setLastResult({ type: "error", message: "Network error" });
    } finally {
      setSyncing(false);
    }
  };

  return { syncing, lastResult, syncAll };
}

export default function AdminDashboard() {
  const { data: summary } = useGetAnalyticsSummary({
    query: { queryKey: getGetAnalyticsSummaryQueryKey() }
  });

  const { data: topProducts } = useGetTopProducts({ limit: 5 }, {
    query: { queryKey: getGetTopProductsQueryKey({ limit: 5 }) }
  });

  const { syncing, lastResult, syncAll } = useSyncPrices();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">Overview of your platform's performance.</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <button
              onClick={syncAll}
              disabled={syncing}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Starting sync…" : "Sync Prices Now"}
            </button>

            {lastResult && (
              <div className={`flex items-center gap-1.5 text-xs font-medium ${lastResult.type === "success" ? "text-green-600" : "text-red-500"}`}>
                {lastResult.type === "success"
                  ? <CheckCircle2 className="h-3.5 w-3.5" />
                  : <XCircle className="h-3.5 w-3.5" />}
                {lastResult.message}
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Auto-syncs every 6 hours
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalProducts || 0}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+{summary?.newProductsThisWeek || 0}</span> this week
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalClicks || 0}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className="text-muted-foreground font-medium">+{summary?.clicksToday || 0}</span> today
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalCategories || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Top: <span className="font-medium text-foreground">{summary?.topCategory || 'N/A'}</span>
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Avg. Discount</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.averageDiscount ? Math.round(summary.averageDiscount) : 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Across all products</p>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <Link href={`/products/${product.id}`} className="hover:underline">
                        {product.title}
                      </Link>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">₹{product.price?.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold text-primary">{product.clickCount}</TableCell>
                  </TableRow>
                ))}
                {!topProducts?.length && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Sync Info */}
        <Card className="border-blue-100 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" />
              Automatic Price Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>Prices, discounts, and stock availability are automatically fetched from each product's affiliate URL every <strong>6 hours</strong>.</p>
            <p>Supported sites: <strong>Amazon India</strong>, <strong>Flipkart</strong>, and other sites with structured product data.</p>
            <p className="text-xs mt-2">You can also sync a single product by clicking the refresh icon on the product edit page, or sync all products using the button above.</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

import { AdminLayout } from "@/components/AdminLayout";
import { useGetAnalyticsSummary, getGetAnalyticsSummaryQueryKey, useGetTopProducts, getGetTopProductsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MousePointerClick, Package, Tag, ArrowUpRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: summary } = useGetAnalyticsSummary({
    query: { queryKey: getGetAnalyticsSummaryQueryKey() }
  });

  const { data: topProducts } = useGetTopProducts({ limit: 5 }, {
    query: { queryKey: getGetTopProductsQueryKey({ limit: 5 }) }
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Overview of your platform's performance.</p>
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
                    <TableCell className="text-right">${product.price?.toFixed(2)}</TableCell>
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
      </div>
    </AdminLayout>
  );
}

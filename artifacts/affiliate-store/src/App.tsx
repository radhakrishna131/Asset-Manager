import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";

// Public
import Home from "@/pages/home";
import ProductsPage from "@/pages/products/index";
import ProductDetail from "@/pages/products/[id]";
import DealsPage from "@/pages/deals";
import WishlistPage from "@/pages/wishlist";
import AboutPage from "@/pages/about";
import HowItWorksPage from "@/pages/how-it-works";
import AffiliateDisclosurePage from "@/pages/affiliate-disclosure";
import PrivacyPolicyPage from "@/pages/privacy-policy";

// Admin
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProductsList from "@/pages/admin/products/index";
import AdminNewProduct from "@/pages/admin/products/new";
import AdminEditProduct from "@/pages/admin/products/edit";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppRouter() {
  return (
    <Switch>
      {/* Admin Routes (No Layout Wrapper to prevent public header from showing) */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/products" component={AdminProductsList} />
      <Route path="/admin/products/new" component={AdminNewProduct} />
      <Route path="/admin/products/:id/edit" component={AdminEditProduct} />

      {/* Public Routes with Layout */}
      <Route path="*">
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/products" component={ProductsPage} />
            <Route path="/products/:id" component={ProductDetail} />
            <Route path="/deals" component={DealsPage} />
            <Route path="/wishlist" component={WishlistPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/how-it-works" component={HowItWorksPage} />
            <Route path="/affiliate-disclosure" component={AffiliateDisclosurePage} />
            <Route path="/privacy-policy" component={PrivacyPolicyPage} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRouter />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme-provider";
import { CartProvider } from "@/lib/cart-context";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Menu from "@/pages/menu";
import Order from "@/pages/order";
import Book from "@/pages/book";
import Reviews from "@/pages/reviews";
import Admin from "@/pages/admin";
import Reservations from "@/pages/reservations";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/menu" component={Menu} />
        <Route path="/order" component={Order} />
        <Route path="/book" component={Book} />
        <Route path="/reviews" component={Reviews} />
        <Route path="/reservations" component={Reservations} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="keep-diving-theme">
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster position="top-center" />
          </TooltipProvider>
        </CartProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

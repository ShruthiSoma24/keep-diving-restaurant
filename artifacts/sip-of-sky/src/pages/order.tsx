import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";
import { useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  ShoppingCart, Minus, Plus, Trash2, ChevronRight, CheckCircle2,
  User, Mail, Phone, FileText, ArrowLeft, UtensilsCrossed
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/keep-diving";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(7, "Please enter a valid phone number"),
  specialInstructions: z.string().optional(),
});
type CheckoutFormData = z.infer<typeof checkoutSchema>;

function ConfirmationScreen({ orderId, customerName, totalPrice, items }: {
  orderId: number; customerName: string; totalPrice: number;
  items: { name: string; quantity: number; price: number }[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="min-h-screen flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </motion.div>

        <h1 className="font-serif text-3xl mb-3">Order Placed!</h1>
        <p className="text-muted-foreground mb-2">Thank you, <strong>{customerName}</strong>.</p>
        <p className="text-sm text-muted-foreground mb-8">
          Your order <strong className="text-foreground">#{orderId}</strong> has been received and is being prepared.
        </p>

        <div className="bg-muted/40 rounded-2xl p-5 mb-8 text-left space-y-3">
          {items.map(item => (
            <div key={item.name} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
               <span className="font-medium">{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold">
            <span>Total</span>
           <span className="text-primary">{formatINR(totalPrice)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/menu" className="flex-1">
            <Button variant="outline" className="w-full rounded-full">Back to Menu</Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full rounded-full">Go Home</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Order() {
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const createOrder = useCreateOrder();
  const [confirmedOrder, setConfirmedOrder] = useState<{ id: number; name: string } | null>(null);
  const [confirmedItems, setConfirmedItems] = useState<typeof items>([]);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  const onSubmit = (data: CheckoutFormData) => {
    return new Promise<void>((resolve) => {
      createOrder.mutate(
        {
          data: {
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            items: items.map(i => ({ menuItemId: i.menuItemId, name: i.name, price: i.price, quantity: i.quantity })),
            totalAmount: totalPrice,
            specialInstructions: data.specialInstructions,
          },
        },
        {
          onSuccess: (order) => {
            setConfirmedItems([...items]);
            setConfirmedTotal(totalPrice);
            clearCart();
            setConfirmedOrder({ id: order.id, name: data.customerName });
            resolve();
          },
          onError: () => {
            toast.error("Failed to place order. Please try again.");
            resolve();
          },
        }
      );
    });
  };

  if (confirmedOrder) {
    return (
      <ConfirmationScreen
        orderId={confirmedOrder.id}
        customerName={confirmedOrder.name}
        totalPrice={confirmedTotal}
        items={confirmedItems}
      />
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <UtensilsCrossed className="h-20 w-20 text-muted-foreground/25 mx-auto mb-6" />
          <h2 className="font-serif text-2xl mb-3">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Browse our menu and add some dishes to get started.</p>
          <Link href="/menu">
            <Button className="rounded-full px-8 gap-2">
              <ShoppingCart className="h-4 w-4" /> Browse Menu
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/menu">
            <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
              <ArrowLeft className="h-4 w-4" /> Back to Menu
            </button>
          </Link>

          <h1 className="font-serif text-4xl mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-10">Review your order and enter your details below.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Cart Summary */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="sticky top-24 bg-card border border-card-border rounded-2xl p-6 shadow-sm">
              <h2 className="font-serif text-xl mb-5">Order Summary</h2>
              <div className="space-y-3 mb-5">
                <AnimatePresence>
                  {items.map(item => (
                    <motion.div
                      key={item.menuItemId}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="flex items-center gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                     <p className="text-xs text-muted-foreground">{formatINR(item.price)} each</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                          onClick={() => { if (item.quantity === 1) removeItem(item.menuItemId); else updateQuantity(item.menuItemId, item.quantity - 1); }}
                        >
                          {item.quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                          onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                       <span className="text-sm font-semibold w-16 text-right shrink-0">{formatINR(item.price * item.quantity)}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal ({totalItems} items)</span>
                   <span>{formatINR(totalPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                   <span className="text-primary">{formatINR(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-5">
                <h2 className="font-serif text-xl">Your Details</h2>

                <div className="space-y-1.5">
                  <Label htmlFor="customerName" className="flex items-center gap-1.5 text-sm">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </Label>
                  <Input id="customerName" placeholder="Alexandra Chen" {...register("customerName")}
                    className={errors.customerName ? "border-destructive" : ""} />
                  {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customerEmail" className="flex items-center gap-1.5 text-sm">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </Label>
                  <Input id="customerEmail" type="email" placeholder="you@example.com" {...register("customerEmail")}
                    className={errors.customerEmail ? "border-destructive" : ""} />
                  {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customerPhone" className="flex items-center gap-1.5 text-sm">
                    <Phone className="h-3.5 w-3.5" /> Phone Number
                  </Label>
                  <Input id="customerPhone" type="tel" placeholder="+1 (555) 000-0000" {...register("customerPhone")}
                    className={errors.customerPhone ? "border-destructive" : ""} />
                  {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="specialInstructions" className="flex items-center gap-1.5 text-sm">
                    <FileText className="h-3.5 w-3.5" /> Special Instructions <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Textarea id="specialInstructions" rows={3}
                    placeholder="Allergies, dietary requirements, or anything else we should know..."
                    {...register("specialInstructions")} />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || createOrder.isPending}
                size="lg"
                className="w-full rounded-full text-base py-6 gap-2 shadow-lg shadow-primary/20"
              >
                {isSubmitting || createOrder.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </span>
                ) : (
                  <>
                     Place Order — {formatINR(totalPrice)}
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

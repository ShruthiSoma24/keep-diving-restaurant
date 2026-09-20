import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  useListMenuItems, useListOrders, useListBookings, useGetOrderStats,
  useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem,
  useUpdateOrderStatus, useUpdateBookingStatus,
  getListMenuItemsQueryKey, getListOrdersQueryKey, getListBookingsQueryKey, getGetOrderStatsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Plus, Pencil, Trash2, ChefHat, ShoppingBag, CalendarDays,
  TrendingUp, Package, Clock, CheckCircle2, XCircle, Leaf, Flame
} from "lucide-react";
import { toast } from "sonner";
import { formatINR } from "@/lib/keep-diving";

const menuItemSchema = z.object({
  name: z.string().min(2, "Required"),
  description: z.string().min(10, "Required"),
  price: z.coerce.number().min(0.01, "Required"),
  category: z.string().min(1, "Required"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  isVegetarian: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  available: z.boolean().default(true),
});
type MenuItemFormData = z.infer<typeof menuItemSchema>;

const ORDER_STATUSES = ["pending", "confirmed", "preparing", "ready", "delivered", "cancelled"] as const;
type OrderStatus = typeof ORDER_STATUSES[number];

const BOOKING_STATUSES = ["pending", "confirmed", "cancelled"] as const;
type BookingStatus = typeof BOOKING_STATUSES[number];

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20" },
  confirmed: { label: "Confirmed", color: "bg-blue-500/15 text-blue-600 border-blue-500/20" },
  preparing: { label: "Preparing", color: "bg-orange-500/15 text-orange-600 border-orange-500/20" },
  ready: { label: "Ready", color: "bg-green-500/15 text-green-600 border-green-500/20" },
  delivered: { label: "Delivered", color: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-600 border-red-500/20" },
};

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

function MenuItemForm({ item, onClose }: { item?: MenuItemFormData & { id?: number }; onClose: () => void }) {
  const qc = useQueryClient();
  const create = useCreateMenuItem();
  const update = useUpdateMenuItem();
  const isEdit = !!item?.id;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: item || { available: true, isVegetarian: false, isSpicy: false, isFeatured: false },
  });

  const isVegetarian = watch("isVegetarian");
  const isSpicy = watch("isSpicy");
  const isFeatured = watch("isFeatured");
  const available = watch("available");

  const onSubmit = (data: MenuItemFormData) => {
    return new Promise<void>((resolve) => {
      const payload = { ...data, imageUrl: data.imageUrl || undefined };
      if (isEdit && item?.id) {
        update.mutate(
           { id: item.id, data: payload },
          {
            onSuccess: () => {
              toast.success("Menu item updated");
              qc.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
              onClose();
              resolve();
            },
            onError: () => { toast.error("Failed to update"); resolve(); },
          }
        );
      } else {
        create.mutate(
          { data: payload },
          {
            onSuccess: () => {
              toast.success("Menu item added");
              qc.invalidateQueries({ queryKey: getListMenuItemsQueryKey() });
              onClose();
              resolve();
            },
            onError: () => { toast.error("Failed to create"); resolve(); },
          }
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Name</Label>
          <Input placeholder="Truffle Burrata" {...register("name")} className={errors.name ? "border-destructive" : ""} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Description</Label>
          <Textarea rows={2} placeholder="Describe the dish..." {...register("description")} className={errors.description ? "border-destructive" : ""} />
          {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
        </div>

        <div className="space-y-1">
           <Label className="text-xs">Price (₹)</Label>
          <Input type="number" step="0.01" placeholder="18.00" {...register("price")} className={errors.price ? "border-destructive" : ""} />
          {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Category</Label>
          <Input placeholder="Starters" {...register("category")} className={errors.category ? "border-destructive" : ""} />
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>

        <div className="col-span-2 space-y-1">
          <Label className="text-xs">Image URL (optional)</Label>
           <Input placeholder="https://your-image-host.com/dish.jpg" {...register("imageUrl")} />
          {errors.imageUrl && <p className="text-xs text-destructive">{errors.imageUrl.message}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-1">
        {([
          { key: "isVegetarian" as const, label: "Vegetarian", val: isVegetarian, icon: <Leaf className="h-3 w-3" /> },
          { key: "isSpicy" as const, label: "Spicy", val: isSpicy, icon: <Flame className="h-3 w-3" /> },
          { key: "isFeatured" as const, label: "Chef's Pick", val: isFeatured, icon: <ChefHat className="h-3 w-3" /> },
          { key: "available" as const, label: "Available", val: available, icon: <CheckCircle2 className="h-3 w-3" /> },
        ]).map(({ key, label, val, icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setValue(key, !val)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              val ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border"
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
        <Button type="submit" disabled={isSubmitting || create.isPending || update.isPending} className="rounded-full">
          {isSubmitting || create.isPending || update.isPending ? (
            <span className="flex items-center gap-1.5">
              <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </span>
          ) : isEdit ? "Save Changes" : "Add Item"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function MenuTab() {
  const { data: items = [], isLoading } = useListMenuItems();
  const deleteItem = useDeleteMenuItem();
  const qc = useQueryClient();
  const [editItem, setEditItem] = useState<(MenuItemFormData & { id: number }) | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    deleteItem.mutate(
       { id },
      {
        onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: getListMenuItemsQueryKey() }); },
        onError: () => toast.error("Failed to delete"),
      }
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-2xl">Menu Items</h2>
          <p className="text-sm text-muted-foreground">{items.length} items across all categories</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle className="font-serif text-xl">Add Menu Item</DialogTitle></DialogHeader>
            <MenuItemForm onClose={() => setAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : (
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{item.category}</TableCell>
                  <TableCell className="font-semibold text-primary">{formatINR(item.price)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.isVegetarian && <span className="h-5 w-5 rounded-full bg-green-500/15 flex items-center justify-center" title="Vegetarian"><Leaf className="h-3 w-3 text-green-600" /></span>}
                      {item.isSpicy && <span className="h-5 w-5 rounded-full bg-red-500/15 flex items-center justify-center" title="Spicy"><Flame className="h-3 w-3 text-red-600" /></span>}
                      {item.isFeatured && <span className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center" title="Featured"><ChefHat className="h-3 w-3 text-primary" /></span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${item.available ? "bg-green-500/15 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog open={editItem?.id === item.id} onOpenChange={open => !open && setEditItem(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setEditItem({ ...item, imageUrl: item.imageUrl ?? "" })}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-lg">
                          <DialogHeader><DialogTitle className="font-serif text-xl">Edit Item</DialogTitle></DialogHeader>
                          {editItem && <MenuItemForm item={editItem} onClose={() => setEditItem(null)} />}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-destructive hover:text-destructive" onClick={() => handleDelete(item.id, item.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data: orders = [], isLoading } = useListOrders();
  const { data: stats } = useGetOrderStats();
  const updateStatus = useUpdateOrderStatus();
  const qc = useQueryClient();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
       { id, data: { status: status as OrderStatus } },
      {
        onSuccess: () => {
          toast.success("Order updated");
          qc.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          qc.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
        },
        onError: () => toast.error("Failed to update"),
      }
    );
  };

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<ShoppingBag className="h-4 w-4" />} label="Total Orders" value={stats?.totalOrders ?? "—"} />
        <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Total Revenue" value={stats ? formatINR(stats.totalRevenue) : "—"} />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending" value={stats?.pendingOrders ?? "—"} />
        <StatCard icon={<Package className="h-4 w-4" />} label="Preparing" value={stats?.preparingOrders ?? "—"} />
      </div>

      {/* Orders Table */}
      <div>
        <h2 className="font-serif text-2xl mb-5">All Orders</h2>
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/25 mx-auto mb-3" />
            <p className="text-muted-foreground">No orders yet</p>
          </div>
        ) : (
          <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {(order.items as { name: string; quantity: number }[]).map(i => `${i.name} ×${i.quantity}`).join(", ").substring(0, 40)}
                        {(order.items as unknown[]).length > 2 ? "..." : ""}
                      </TableCell>
                      <TableCell className="font-semibold text-primary">{formatINR(order.totalAmount)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <Select value={order.status} onValueChange={v => handleStatusChange(order.id, v)}>
                          <SelectTrigger className={`h-7 text-xs rounded-full border px-3 w-[130px] ${STATUS_CONFIG[order.status]?.color || ""}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ORDER_STATUSES.map(s => (
                              <SelectItem key={s} value={s} className="text-xs capitalize">{STATUS_CONFIG[s]?.label || s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function BookingsTab() {
  const { data: bookings = [], isLoading } = useListBookings();
  const updateStatus = useUpdateBookingStatus();
  const qc = useQueryClient();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate(
       { id, data: { status: status as BookingStatus } },
      {
        onSuccess: () => {
          toast.success("Booking updated");
          qc.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        },
        onError: () => toast.error("Failed to update"),
      }
    );
  };

  return (
    <div>
      <h2 className="font-serif text-2xl mb-6">Table Reservations</h2>
      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl">
          <CalendarDays className="h-12 w-12 text-muted-foreground/25 mx-auto mb-3" />
          <p className="text-muted-foreground">No bookings yet</p>
        </div>
      ) : (
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ref</TableHead>
                  <TableHead>Guest</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Requests</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map(booking => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-sm font-medium">#{booking.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">{booking.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                        <p className="text-xs text-muted-foreground">{booking.time}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{booking.partySize} guest{booking.partySize !== 1 ? "s" : ""}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">
                      {booking.specialRequests || "—"}
                    </TableCell>
                    <TableCell>
                      <Select value={booking.status} onValueChange={v => handleStatusChange(booking.id, v)}>
                        <SelectTrigger className={`h-7 text-xs rounded-full border px-3 w-[120px] ${STATUS_CONFIG[booking.status]?.color || ""}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BOOKING_STATUSES.map(s => (
                            <SelectItem key={s} value={s} className="text-xs capitalize">{STATUS_CONFIG[s]?.label || s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-muted/50 to-background pt-12 pb-8 px-4 border-b">
        <div className="container mx-auto max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <ChefHat className="h-6 w-6 text-primary" />
              <h1 className="font-serif text-3xl">Admin Dashboard</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-9">Manage menu, orders, and reservations</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-10">
        <Tabs defaultValue="menu">
          <TabsList className="mb-8 rounded-xl p-1 h-auto">
            <TabsTrigger value="menu" className="rounded-lg gap-2 px-5 py-2.5 text-sm">
              <ChefHat className="h-4 w-4" /> Menu
            </TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg gap-2 px-5 py-2.5 text-sm">
              <ShoppingBag className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-lg gap-2 px-5 py-2.5 text-sm">
              <CalendarDays className="h-4 w-4" /> Bookings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu"><MenuTab /></TabsContent>
          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="bookings"><BookingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

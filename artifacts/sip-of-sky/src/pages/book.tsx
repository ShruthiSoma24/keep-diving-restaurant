import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { useCreateBooking } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import {
  CheckCircle2, User, Mail, Phone, Calendar, Clock, Users, FileText, ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().min(7, "Please enter a valid phone number"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  partySize: z.coerce.number().min(1, "Party size must be at least 1").max(20, "Maximum party size is 20"),
  specialRequests: z.string().optional(),
});
type BookingFormData = z.infer<typeof bookingSchema>;

const TIME_SLOTS = [
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
];

function ConfirmationScreen({ booking }: {
  booking: { id: number; customerName: string; date: string; time: string; partySize: number }
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

        <h1 className="font-serif text-3xl mb-3">Table Reserved!</h1>
        <p className="text-muted-foreground mb-8">
          We look forward to welcoming you, <strong>{booking.customerName}</strong>.
        </p>

        <div className="bg-muted/40 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-primary font-bold text-xs">#{booking.id}</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Booking Reference</p>
              <p className="font-semibold">Booking #{booking.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <Calendar className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-semibold">{new Date(booking.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
            </div>
            <div className="text-center">
              <Clock className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="text-sm font-semibold">{booking.time}</p>
            </div>
            <div className="text-center">
              <Users className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Guests</p>
              <p className="text-sm font-semibold">{booking.partySize}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-8">
          A confirmation email will be sent to you shortly. Please arrive 10 minutes before your reservation.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/menu" className="flex-1">
            <Button variant="outline" className="w-full rounded-full">View Menu</Button>
          </Link>
          <Link href="/" className="flex-1">
            <Button className="w-full rounded-full">Go Home</Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Book() {
  const createBooking = useCreateBooking();
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: number; customerName: string; date: string; time: string; partySize: number;
  } | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { partySize: 2 }
  });

  const selectedTime = watch("time");

  const onSubmit = (data: BookingFormData) => {
    return new Promise<void>((resolve) => {
      createBooking.mutate(
        {
          data: {
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            date: data.date,
            time: data.time,
            partySize: data.partySize,
            specialRequests: data.specialRequests,
          },
        },
        {
          onSuccess: (booking) => {
            toast.success("Table reserved successfully!");
            setConfirmedBooking({
              id: booking.id,
              customerName: data.customerName,
              date: data.date,
              time: data.time,
              partySize: data.partySize,
            });
            resolve();
          },
          onError: () => {
            toast.error("Failed to reserve table. Please try again.");
            resolve();
          },
        }
      );
    });
  };

  if (confirmedBooking) return <ConfirmationScreen booking={confirmedBooking} />;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-muted/40 to-background pt-16 pb-12 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-4xl md:text-5xl mb-3">Reserve a Table</h1>
            <p className="text-muted-foreground text-lg">
              Secure your spot above the skyline. We'll take care of the rest.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-10">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
        </Link>

        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Contact Info */}
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl">Contact Information</h2>

            <div className="space-y-1.5">
              <Label htmlFor="customerName" className="flex items-center gap-1.5 text-sm">
                <User className="h-3.5 w-3.5" /> Full Name
              </Label>
              <Input id="customerName" placeholder="Alexandra Chen" {...register("customerName")}
                className={errors.customerName ? "border-destructive" : ""} />
              {errors.customerName && <p className="text-xs text-destructive">{errors.customerName.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="customerEmail" className="flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5" /> Email
                </Label>
                <Input id="customerEmail" type="email" placeholder="you@example.com" {...register("customerEmail")}
                  className={errors.customerEmail ? "border-destructive" : ""} />
                {errors.customerEmail && <p className="text-xs text-destructive">{errors.customerEmail.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customerPhone" className="flex items-center gap-1.5 text-sm">
                  <Phone className="h-3.5 w-3.5" /> Phone
                </Label>
                <Input id="customerPhone" type="tel" placeholder="+1 (555) 000-0000" {...register("customerPhone")}
                  className={errors.customerPhone ? "border-destructive" : ""} />
                {errors.customerPhone && <p className="text-xs text-destructive">{errors.customerPhone.message}</p>}
              </div>
            </div>
          </div>

          {/* Reservation Details */}
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-serif text-xl">Reservation Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="flex items-center gap-1.5 text-sm">
                  <Calendar className="h-3.5 w-3.5" /> Date
                </Label>
                <Input id="date" type="date" min={today} {...register("date")}
                  className={errors.date ? "border-destructive" : ""} />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="partySize" className="flex items-center gap-1.5 text-sm">
                  <Users className="h-3.5 w-3.5" /> Number of Guests
                </Label>
                <Input id="partySize" type="number" min={1} max={20} {...register("partySize")}
                  className={errors.partySize ? "border-destructive" : ""} />
                {errors.partySize && <p className="text-xs text-destructive">{errors.partySize.message}</p>}
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Clock className="h-3.5 w-3.5" /> Preferred Time
              </Label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setValue("time", slot, { shouldValidate: true })}
                    className={`px-2 py-2 rounded-xl text-xs font-medium transition-all duration-150 border ${
                      selectedTime === slot
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                        : "bg-muted/50 text-foreground border-border/40 hover:border-primary/40 hover:bg-primary/5"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
            </div>
          </div>

          {/* Special Requests */}
          <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm space-y-3">
            <Label htmlFor="specialRequests" className="flex items-center gap-1.5 font-serif text-lg">
              <FileText className="h-4 w-4" /> Special Requests
              <span className="text-sm text-muted-foreground font-normal ml-1">(optional)</span>
            </Label>
            <Textarea id="specialRequests" rows={3}
              placeholder="Anniversary celebration, dietary requirements, seating preferences..."
              {...register("specialRequests")} />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || createBooking.isPending}
            size="lg"
            className="w-full rounded-full text-base py-6 gap-2 shadow-lg shadow-primary/20"
          >
            {isSubmitting || createBooking.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Reserving...
              </span>
            ) : (
              "Confirm Reservation"
            )}
          </Button>
        </motion.form>

        {/* Info Note */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Reservations are held for 15 minutes after the booked time. For groups of 10+, please call us directly.
        </p>
      </div>
    </div>
  );
}

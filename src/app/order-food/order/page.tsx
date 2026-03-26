"use client";

import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Upload, ChefHat, MapPin, CheckCircle2, Lock, Home, Car, AlertCircle } from "lucide-react";
import Link from "next/link";

function OrderFormContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const dish = searchParams.get("dish") || "";
    const type = (searchParams.get("type") || "indoor") as "indoor" | "outdoor";

    const isIndoor = type === "indoor";

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        quantity: 1,
        room_number: "",
        maps_url: "",
        receipt_image: null as File | null,
        govt_id: null as File | null,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status !== "authenticated") return;

        if (!isIndoor && !formData.receipt_image) {
            alert("Please upload your payment receipt to proceed.");
            return;
        }
        if (!isIndoor && !formData.govt_id) {
            alert("Please upload your Government ID to proceed.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("dishName", dish);
            data.append("quantity", formData.quantity.toString());
            data.append("order_type", isIndoor ? "INDOOR" : "OUTDOOR");

            if (isIndoor) {
                data.append("delivery_details", `Room ${formData.room_number}`);
            } else {
                data.append("delivery_details", formData.maps_url);
                data.append("maps_url", formData.maps_url);
                if (formData.receipt_image) data.append("receipt_image", formData.receipt_image);
                if (formData.govt_id) data.append("govt_id", formData.govt_id);
            }

            const res = await fetch("/api/orders", {
                method: "POST",
                credentials: "include",
                body: data,
            });

            if (res.ok) {
                const successPath = isIndoor
                    ? "/order-food/success?type=indoor"
                    : "/order-food/success?type=outdoor";
                router.push(successPath);
            } else {
                const err = await res.json();
                alert(err.error || "Failed to place order");
            }
        } catch (error) {
            console.error("Order Error:", error);
            alert("An error occurred while placing your order.");
        } finally {
            setLoading(false);
        }
    };

    // Unauthenticated gate
    if (status === "unauthenticated") {
        const currentPath = typeof window !== "undefined" ? window.location.pathname + window.location.search : "/order-food";
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-0 shadow-2xl rounded-[2.5rem] p-10 text-center bg-white">
                    <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Lock className="w-10 h-10 text-amber-600" />
                    </div>
                    <CardTitle className="text-3xl font-serif font-bold text-slate-900 mb-2">Authentication Required</CardTitle>
                    <p className="text-slate-500 mb-10 italic">Please log in to your guest account to place orders from the Palais Menu.</p>
                    <div className="space-y-4">
                        <Button luxury className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-amber-500/20" onClick={() => router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)}>
                            Go to Login
                        </Button>
                        <Button variant="outline" className="w-full h-12 rounded-xl border-amber-200 text-amber-700 hover:bg-amber-50 font-bold" onClick={() => router.push(`/signup?callbackUrl=${encodeURIComponent(currentPath)}`)}>
                            Register Guest Account
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pt-28 pb-20 px-6">
            <div className="max-w-2xl mx-auto">
                <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                    {/* Top accent bar */}
                    <div className={`h-2 ${isIndoor ? "bg-amber-500" : "bg-blue-500"}`} />

                    <CardHeader className="p-10 text-center bg-slate-50/50">
                        <div className={`w-20 h-20 ${isIndoor ? "bg-amber-100" : "bg-blue-100"} rounded-3xl flex items-center justify-center mx-auto mb-6`}>
                            {isIndoor
                                ? <Home className="w-10 h-10 text-amber-600" />
                                : <Car className="w-10 h-10 text-blue-600" />
                            }
                        </div>
                        <CardTitle className="text-3xl font-serif font-bold text-slate-900">
                            {isIndoor ? "🏠 Indoor Room Service" : "🚗 Outdoor Delivery"}
                        </CardTitle>
                        <p className="text-slate-500 mt-2">
                            Ordering: <span className={`font-bold ${isIndoor ? "text-amber-600" : "text-blue-600"}`}>{dish}</span>
                        </p>
                        {!isIndoor && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                Your order will be reviewed by our team before dispatch.
                            </div>
                        )}
                    </CardHeader>

                    <CardContent className="p-10">
                        <form onSubmit={handleSubmit} className="space-y-8">

                            {/* Quantity — always shown */}
                            <div className="space-y-3">
                                <Label className="text-slate-700 font-bold">Quantity</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                    className="h-14 rounded-2xl border-slate-200 focus:ring-amber-500"
                                />
                            </div>

                            {/* INDOOR: Room Number */}
                            {isIndoor && (
                                <div className="space-y-3">
                                    <Label className="text-slate-700 font-bold">Room Number</Label>
                                    <div className="relative">
                                        <ChefHat className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <Input
                                            placeholder="e.g. Room 402"
                                            value={formData.room_number}
                                            onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                                            className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-amber-500 font-medium"
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400">Your order goes directly to the kitchen and will be delivered to your room.</p>
                                </div>
                            )}

                            {/* OUTDOOR: Maps URL + ID + Receipt */}
                            {!isIndoor && (
                                <>
                                    {/* Google Maps URL */}
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-bold">Google Maps Location</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <Input
                                                placeholder="https://maps.google.com/..."
                                                value={formData.maps_url}
                                                onChange={(e) => setFormData({ ...formData, maps_url: e.target.value })}
                                                className="h-14 pl-12 rounded-2xl border-slate-200 focus:ring-blue-500 font-medium"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400">Paste your Google Maps share link or type your full address.</p>
                                    </div>

                                    {/* Government ID */}
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-bold">Government ID <span className="text-rose-500">*</span></Label>
                                        <FileUploadZone
                                            file={formData.govt_id}
                                            onChange={(f) => setFormData({ ...formData, govt_id: f })}
                                            label="Upload Government ID"
                                            hint="National ID, Passport, or Driver's License"
                                            accent="blue"
                                        />
                                    </div>

                                    {/* Payment Receipt */}
                                    <div className="space-y-3">
                                        <Label className="text-slate-700 font-bold">Payment Receipt <span className="text-rose-500">*</span></Label>
                                        <FileUploadZone
                                            file={formData.receipt_image}
                                            onChange={(f) => setFormData({ ...formData, receipt_image: f })}
                                            label="Upload Bank Transfer Receipt"
                                            hint="Screenshot of your CBE, Awash, or Telebirr transfer"
                                            accent="amber"
                                        />
                                    </div>
                                </>
                            )}

                            <Button
                                luxury={isIndoor}
                                className={`w-full h-16 rounded-2xl text-xl shadow-xl ${!isIndoor ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20" : "shadow-amber-500/20"}`}
                                disabled={loading}
                                type="submit"
                            >
                                {loading ? "Processing…" : isIndoor ? "Send to Kitchen 🍽️" : "Submit Delivery Order 🚗"}
                            </Button>

                            <div className="text-center">
                                <Link href="/order-food" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                                    ← Back to Menu
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function OrderFormPage() {
    return (
        <Suspense fallback={<div className="min-h-screen pt-28 pb-20 px-6 text-center text-slate-500">Loading order form...</div>}>
            <OrderFormContent />
        </Suspense>
    );
}


function FileUploadZone({ file, onChange, label, hint, accent }: {
    file: File | null;
    onChange: (f: File) => void;
    label: string;
    hint: string;
    accent: "amber" | "blue";
}) {
    const borderColor = accent === "amber"
        ? "hover:border-amber-500 focus-within:border-amber-500"
        : "hover:border-blue-500 focus-within:border-blue-500";
    return (
        <div className={`border-2 border-dashed border-slate-200 ${borderColor} rounded-3xl p-8 text-center transition-colors cursor-pointer relative bg-slate-50`}>
            <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => { if (e.target.files?.[0]) onChange(e.target.files[0]); }}
                className="absolute inset-0 opacity-0 cursor-pointer"
                required
            />
            {file ? (
                <div className={`flex items-center justify-center gap-3 ${accent === "amber" ? "text-amber-600" : "text-blue-600"} font-bold`}>
                    <CheckCircle2 className="w-6 h-6" />
                    {file.name}
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-700 font-semibold text-sm">{label}</p>
                    <p className="text-slate-400 text-xs">{hint}</p>
                </div>
            )}
        </div>
    );
}

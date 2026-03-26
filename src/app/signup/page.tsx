"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Lock, Phone, User, CheckCircle2, Camera } from "lucide-react";
import Link from "next/link";

function SignupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/order-food";

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        idFile: null as File | null
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.idFile) {
            setError("Official Government ID is required for luxury security verification.");
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("phone", formData.phone);
            data.append("password", formData.password);
            data.append("idFile", formData.idFile);

            const res = await fetch("/api/auth/signup", {
                method: "POST",
                body: data
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.error || "Signup failed");
            }

            // Automatic Login after successful signup
            const loginRes = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false
            });

            if (loginRes?.ok) {
                router.push(callbackUrl);
                router.refresh();
            } else {
                router.push("/login?success=Account created, please login.");
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24 pb-20">
            <div className="max-w-md w-full">
                <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                    <div className="h-2 bg-amber-500" />
                    <CardHeader className="p-10 text-center bg-slate-50/50">
                        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <UserPlus className="w-8 h-8 text-amber-600" />
                        </div>
                        <CardTitle className="text-3xl font-serif font-bold text-slate-900">Join the Palace</CardTitle>
                        <p className="text-slate-500 text-sm mt-1 italic">Experience culinary excellence and luxury.</p>
                    </CardHeader>

                    <CardContent className="p-10">
                        {error && (
                            <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-medium mb-6 border border-rose-100 flex items-center gap-2">
                                <div className="w-1 h-1 bg-rose-600 rounded-full" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold ml-1">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="John Doe"
                                        required
                                        className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-amber-500"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold ml-1">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        required
                                        className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-amber-500"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold ml-1">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="tel"
                                        placeholder="+251 ..."
                                        required
                                        className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-amber-500"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold ml-1">Official Government ID</Label>
                                <div className="relative p-4 border-2 border-dashed border-slate-200 rounded-xl hover:border-amber-500 transition-colors group">
                                    <Input
                                        type="file"
                                        accept="image/*,.pdf"
                                        required
                                        className="opacity-0 absolute inset-0 cursor-pointer z-10"
                                        onChange={(e) => setFormData({ ...formData, idFile: e.target.files?.[0] || null })}
                                    />
                                    <div className="flex flex-col items-center justify-center gap-1 text-slate-500 group-hover:text-amber-600 transition-colors">
                                        <Camera className="w-6 h-6" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {formData.idFile ? formData.idFile.name : "Upload ID (Front/Back)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold ml-1">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        required
                                        className="h-12 pl-12 rounded-xl border-slate-200 focus:ring-amber-500"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button luxury className="w-full h-14 rounded-xl text-lg shadow-lg shadow-amber-500/10 mt-4" disabled={loading}>
                                {loading ? "Verifying Credentials..." : "Create Account"}
                            </Button>

                            <div className="text-center pt-4">
                                <p className="text-slate-500 text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-amber-600 font-bold hover:underline">
                                        Login here
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </CardContent>
                </Card>
                <p className="text-center text-slate-400 text-xs mt-8 font-light italic">
                    By joining, you agree to our terms of discrete palatial service.
                </p>
            </div>
        </div>
    );
}

export default function SignupPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500">Loading signup...</div>}>
            <SignupContent />
        </Suspense>
    );
}


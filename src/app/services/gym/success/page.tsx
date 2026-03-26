"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircle2, Waves, ArrowRight, UserCircle } from "lucide-react";
import { motion } from "framer-motion";

function MembershipSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const membershipId = searchParams.get("id");

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            <Waves className="absolute -right-20 -bottom-20 w-96 h-96 text-slate-200/50" />
            <Waves className="absolute -left-20 -top-20 w-96 h-96 text-amber-200/20" />

            <div className="max-w-xl w-full relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-0 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] overflow-hidden bg-white text-center">
                        <div className="h-4 bg-amber-500" />
                        <CardContent className="p-12 md:p-16">
                            <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                            </div>

                            <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 mb-4 tracking-tight">Congratulations!</h1>
                            <p className="text-xl text-slate-500 mb-10 italic">You are now a distinguished member of the Africa Wellness Club.</p>

                            <div className="bg-slate-50 rounded-3xl p-8 mb-10 border border-slate-100 flex flex-col items-center">
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Your Digital Membership ID</span>
                                <div className="text-3xl font-mono font-bold text-amber-600 tracking-wider">
                                    {membershipId || "AF-GYM-2026-XXXX"}
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
                                    <UserCircle className="w-4 h-4" />
                                    <span>Status: Pending Verification</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    luxury
                                    className="w-full h-14 rounded-2xl text-lg shadow-xl shadow-amber-500/20"
                                    onClick={() => router.push("/")}
                                >
                                    Home to Palace
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </div>
                            <p className="mt-8 text-xs text-slate-400">Please present this ID at the Wellness Desk for your physical pass.</p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}

export default function MembershipSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-500">Loading your membership status...</div>}>
            <MembershipSuccessContent />
        </Suspense>
    );
}


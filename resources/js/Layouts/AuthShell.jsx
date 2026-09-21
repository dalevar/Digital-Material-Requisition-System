import React from "react";
import { ShieldCheck, Layers, Building2 } from "lucide-react";

/**
 * AuthShell — Isolated Corporate Shell for Authentication Experience
 * PT. Guthrie International Pulau Laut Refinery — Digital Material Requisition System (DMRS)
 *
 * CRITICAL ARCHITECTURE REQUIREMENT:
 * Completely separate from Dashboard AppShell (No sidebars, topbars, breadcrumbs, or business widgets).
 */
export default function AuthShell({ children, title, subtitle }) {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-red-600 selection:text-white">
            {/* Container - Centered split screen desktop canvas */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-5xl bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
                    {/* =================================================================== */}
                    {/* LEFT BRAND & INDUSTRIAL PANEL (approx 42% on desktop) */}
                    {/* =================================================================== */}
                    {/* BACKGROUND: Putih dengan gradasi merah/oranye halus khas logo Guthrie */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-white via-red-50/60 to-orange-100/70 text-slate-800 p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-red-100">
                        {/* Refinery Industrial Texture / Geometry Pattern Overlay */}
                        <div className="absolute inset-0 opacity-15 pointer-events-none text-red-900/20">
                            <svg
                                className="w-full h-full"
                                width="100%"
                                height="100%"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <pattern
                                        id="industrial-grid"
                                        width="32"
                                        height="32"
                                        patternUnits="userSpaceOnUse"
                                    >
                                        <path
                                            d="M 32 0 L 0 0 0 32"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                        />
                                        <circle
                                            cx="16"
                                            cy="16"
                                            r="1.5"
                                            fill="currentColor"
                                        />
                                    </pattern>
                                </defs>
                                <rect
                                    width="100%"
                                    height="100%"
                                    fill="url(#industrial-grid)"
                                />
                            </svg>
                        </div>

                        {/* Glowing Accent Orbs */}

                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />

                        {/* Top Brand Info with Official Guthrie International Logo Asset */}
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3.5">
                                <div className="rounded-lg  p-1 flex items-center justify-center shrink-0 w-64">
                                    <img
                                        src="/images/alt-logo.png"
                                        alt="PT. Guthrie International"
                                        className="w-full h-full object-contain rounded"
                                    />
                                </div>
                                {/* <div>
                                    <h1 className="text-sm font-bold tracking-wider uppercase text-red-700 leading-tight">
                                        PT. Guthrie International
                                    </h1>
                                    <p className="text-[11px] text-slate-600 font-medium">
                                        Pulau Laut Refinery
                                    </p>
                                </div> */}
                            </div>

                            <div className="pt-6 border-t border-red-200/60">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-600/10 text-red-700 border border-red-200 mb-3">
                                    <ShieldCheck className="w-3.5 h-3.5 text-red-600" />{" "}
                                    Enterprise Access System
                                </span>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
                                    Digital Material Requisition System
                                </h2>
                                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                                    Internal enterprise portal for operational
                                    material requisitions, stock verification,
                                    and digital approval workflows.
                                </p>
                            </div>
                        </div>

                        {/* Middle Graphic Feature Points */}
                        <div className="relative z-10 my-8 hidden sm:block space-y-3">
                            <div className="flex items-center gap-3 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-red-200/70 shadow-xs backdrop-blur-xs">
                                <Layers className="w-4 h-4 text-red-600 shrink-0" />
                                <span>
                                    Real-time Material Inventory & SOH Tracking
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-700 bg-white/80 p-2.5 rounded-lg border border-red-200/70 shadow-xs backdrop-blur-xs">
                                <Building2 className="w-4 h-4 text-red-600 shrink-0" />
                                <span>
                                    Role-Based Operational Security Policy
                                </span>
                            </div>
                        </div>

                        {/* Bottom Footer Meta */}
                        <div className="relative z-10 pt-6 border-t border-red-200/60 text-[11px] text-slate-500 flex items-center justify-between font-medium">
                            <span>DMRS v1.5 • Operational</span>
                            <span className="text-slate-400">
                                Secure TLS 1.3
                            </span>
                        </div>
                    </div>

                    {/* =================================================================== */}
                    {/* RIGHT AUTHENTICATION CONTENT PANEL (approx 58% on desktop) */}
                    {/* =================================================================== */}
                    <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
                        <div className="w-full max-w-md mx-auto space-y-6">
                            {/* Header inside Form Panel */}
                            {(title || subtitle) && (
                                <div className="space-y-1">
                                    {title && (
                                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                            {title}
                                        </h2>
                                    )}
                                    {subtitle && (
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Page Form / State Content */}
                            {children}
                        </div>

                        {/* Corporate Security Micro-Footer */}
                        <div className="w-full max-w-md mx-auto mt-8 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-400">
                            Authorized personnel only. All login activities are
                            monitored and audited for compliance.
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Minimal Corporate Footer */}
            <footer className="py-3 px-4 text-center text-[11px] text-slate-500 border-t border-slate-200 bg-slate-50">
                &copy; {new Date().getFullYear()} PT. Guthrie International
                Pulau Laut Refinery. All rights reserved. • DMRS Enterprise
                System
            </footer>
        </div>
    );
}

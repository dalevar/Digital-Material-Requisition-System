import React, { useState } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import {
    LayoutDashboard,
    Package,
    Boxes,
    FileText,
    ClipboardCheck,
    History,
    FileBarChart,
    ShieldCheck,
    Users,
    LogOut,
    Menu,
    X,
    Building2,
    Factory,
    ChevronRight,
    Sparkles,
    Bell,
} from "lucide-react";

export default function AppShell({ children, title, breadcrumbs = [] }) {
    const page = usePage();
    const pageProps = page.props || {};
    const auth = pageProps.auth || {};
    const flash = pageProps.flash || {};
    const user = auth.user || null;
    const currentUrl = page.url || "";

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = (e) => {
        e.preventDefault();
        router.post("/logout");
    };

    const navSections = [
        {
            title: "OVERVIEW",
            items: [
                {
                    name: "Dashboard",
                    href: "/dashboard",
                    icon: LayoutDashboard,
                    show: true,
                },
            ],
        },
        {
            title: "REQUISITIONS & APPROVALS",
            items: [
                {
                    name: "Material Requests",
                    href: "/requests",
                    icon: FileText,
                    show: true,
                },
                {
                    name: "Approval Inbox",
                    href: "/approvals/inbox",
                    icon: ClipboardCheck,
                    show: user?.role === "APPROVER" || user?.role === "ADMIN",
                    badge:
                        pageProps.pendingApprovalsCount > 0
                            ? pageProps.pendingApprovalsCount
                            : null,
                },
            ],
        },
        {
            title: "STOCK & INVENTORY",
            items: [
                {
                    name: "Stock Overview",
                    href: "/inventory/overview",
                    icon: Boxes,
                    show: true,
                },
                {
                    name: "Stock History",
                    href: "/inventory/history",
                    icon: History,
                    show: true,
                },
            ],
        },
        {
            title: "REPORTS",
            items: [
                {
                    name: "Request Report",
                    href: "/reports/requests",
                    icon: FileBarChart,
                    show: user?.role === "ADMIN" || user?.role === "APPROVER",
                },
                {
                    name: "Stock Report",
                    href: "/reports/stock",
                    icon: FileBarChart,
                    show: user?.role === "ADMIN",
                },
                {
                    name: "Approval Report",
                    href: "/reports/approvals",
                    icon: FileBarChart,
                    show: user?.role === "ADMIN" || user?.role === "APPROVER",
                },
            ],
        },
        {
            title: "SYSTEM MANAGEMENT",
            items: [
                {
                    name: "User Management",
                    href: "/admin/users",
                    icon: Users,
                    show: user?.role === "ADMIN",
                },
                {
                    name: "Master Materials",
                    href: "/admin/materials",
                    icon: Package,
                    show: user?.role === "ADMIN",
                },
                {
                    name: "Departments",
                    href: "/admin/departments",
                    icon: Building2,
                    show: user?.role === "ADMIN",
                },
                {
                    name: "Plants",
                    href: "/admin/plants",
                    icon: Factory,
                    show: user?.role === "ADMIN",
                },
                {
                    name: "Material Categories",
                    href: "/admin/categories",
                    icon: Package,
                    show: user?.role === "ADMIN",
                },
                {
                    name: "Audit Trail",
                    href: "/admin/audit-logs",
                    icon: ShieldCheck,
                    show: user?.role === "ADMIN",
                },
            ],
        },
    ];

    const isNavActive = (href) => {
        if (href === "/dashboard") {
            return (
                currentUrl === "/dashboard" || currentUrl.includes("/dashboard")
            );
        }
        return currentUrl === href || currentUrl.startsWith(href + "/");
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
            {/* Topbar (64px) - Clean White Surface */}
            <header className="h-16 bg-white border-b border-slate-200 fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 lg:px-6 shadow-xs">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Toggle Navigation Menu"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>

                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 group"
                    >
                        {/* SD Guthrie Red Brand Badge */}
                        <div className="rounded-lg  p-1 flex items-center justify-center shrink-0 w-32">
                            <img
                                src="/images/alt-logo.png"
                                alt="PT. Guthrie International"
                                className="w-full h-full object-contain rounded"
                            />
                        </div>
                        {/* <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center font-bold text-white text-base tracking-wider shadow-xs group-hover:bg-red-700 transition-colors">
              SDG
            </div> */}
                        {/* <div className="hidden sm:block">
                            <h1 className="text-xs font-extrabold text-slate-900 leading-tight tracking-tight uppercase">
                                PT. Guthrie International
                            </h1>
                            <p className="text-[11px] text-red-700 font-semibold">
                                Pulau Laut Refinery • DMRS
                            </p>
                        </div> */}
                    </Link>
                </div>

                <div className="flex items-center space-x-4">
                    {/* Department & Plant Metadata Pill */}
                    <div className="hidden md:flex items-center space-x-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                        <Building2 className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-medium">
                            {user?.department?.name || "Department"}
                        </span>
                        <span className="text-slate-300">|</span>
                        <Factory className="w-3.5 h-3.5 text-orange-600" />
                        <span className="font-medium">
                            {user?.plant?.name || "PLR-01"}
                        </span>
                    </div>

                    {/* Notification Bell Dropdown Button */}
                    <Link
                        href="/notifications"
                        title="Notifications"
                        className="relative p-2 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        <Bell className="w-5 h-5" />
                        {pageProps.unreadNotificationsCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white">
                                {pageProps.unreadNotificationsCount > 9
                                    ? "9+"
                                    : pageProps.unreadNotificationsCount}
                            </span>
                        )}
                    </Link>

                    {/* User Profile & Logout */}
                    <div className="relative flex items-center space-x-3 pl-3 border-l border-slate-200">
                        <Link
                            href="/profile"
                            className="text-right hidden sm:block group"
                            title="View Profile Settings"
                        >
                            <div className="text-xs font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-tight">
                                {user?.name || "User"}
                            </div>
                            <div className="text-[10px] font-bold text-red-700 uppercase tracking-wider">
                                {user?.role || "USER"}
                            </div>
                        </Link>

                        {user && (
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="p-2 text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <div className="flex pt-16 min-h-screen">
                {/* Mobile Backdrop Overlay */}
                {mobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-20 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar (256px) - Dark Charcoal (#0F172A) */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-20 w-64 bg-[#0F172A] border-r border-slate-800 pt-4 flex flex-col justify-between transition-transform duration-200 ease-in-out shadow-lg ${
                        mobileMenuOpen
                            ? "translate-x-0"
                            : "-translate-x-full lg:translate-x-0"
                    }`}
                >
                    <div className="px-3 space-y-6 overflow-y-auto pt-2">
                        {navSections.map((section, idx) => {
                            const visibleItems = section.items.filter(
                                (item) => item.show,
                            );
                            if (visibleItems.length === 0) return null;

                            return (
                                <div key={idx} className="space-y-1">
                                    <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {section.title}
                                    </div>

                                    {visibleItems.map((item) => {
                                        const Icon = item.icon;
                                        const active = isNavActive(item.href);

                                        return (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className={`flex items-center justify-between px-3 py-2 rounded-r-md text-xs font-semibold transition-colors ${
                                                    active
                                                        ? "bg-red-500/15 border-l-4 border-red-600 text-white"
                                                        : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                                                }`}
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Icon
                                                        className={`w-4 h-4 ${active ? "text-red-500" : "text-slate-400"}`}
                                                    />
                                                    <span>{item.name}</span>
                                                </div>
                                                {item.badge && (
                                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-slate-400 text-center text-[11px] font-medium">
                        <span>DMRS v1.5 • Guthrie Refinery</span>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
                    {/* Breadcrumb Navigation Bar */}
                    <div className="mb-4 flex items-center space-x-2 text-xs text-slate-500 font-medium">
                        <Link
                            href="/dashboard"
                            className="hover:text-red-600 transition-colors"
                        >
                            Home
                        </Link>
                        {breadcrumbs.length > 0
                            ? breadcrumbs.map((crumb, idx) => (
                                  <React.Fragment key={idx}>
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                      {crumb.href ? (
                                          <Link
                                              href={crumb.href}
                                              className="hover:text-red-600 transition-colors"
                                          >
                                              {crumb.title}
                                          </Link>
                                      ) : (
                                          <span className="text-slate-900 font-semibold">
                                              {crumb.title}
                                          </span>
                                      )}
                                  </React.Fragment>
                              ))
                            : title && (
                                  <>
                                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                      <span className="text-slate-900 font-semibold">
                                          {title}
                                      </span>
                                  </>
                              )}
                    </div>

                    {/* Global Flash & Error Alerts */}
                    {flash?.success && (
                        <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                                <span>{flash.success}</span>
                            </div>
                        </div>
                    )}

                    {(flash?.error || pageProps.errors?.error || pageProps.errors?.auth || pageProps.errors?.message) && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center justify-between shadow-xs">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                                <span>{flash?.error || pageProps.errors?.error || pageProps.errors?.auth || pageProps.errors?.message}</span>
                            </div>
                        </div>
                    )}

                    {flash?.warning && (
                        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between shadow-xs">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                                <span>{flash.warning}</span>
                            </div>
                        </div>
                    )}

                    {flash?.info && (
                        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold flex items-center justify-between shadow-xs">
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                                <span>{flash.info}</span>
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}

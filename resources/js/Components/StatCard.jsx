import React from "react";

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    variant = "default", // 'default', 'warning', 'danger', 'success', 'accent', 'info'
}) {
    const getVariantStyles = () => {
        switch (variant) {
            case "danger":
                return {
                    bg: "bg-red-50/70",
                    border: "border-red-200",
                    iconBg: "bg-red-600 text-white",
                    valueColor: "text-red-700",
                };
            case "warning":
                return {
                    bg: "bg-orange-50/70",
                    border: "border-orange-200",
                    iconBg: "bg-orange-600 text-white",
                    valueColor: "text-orange-700",
                };
            case "success":
                return {
                    bg: "bg-emerald-50/70",
                    border: "border-emerald-200",
                    iconBg: "bg-emerald-600 text-white",
                    valueColor: "text-emerald-700",
                };
            case "accent":
                return {
                    bg: "bg-amber-50/70",
                    border: "border-amber-200",
                    iconBg: "bg-amber-600 text-white",
                    valueColor: "text-amber-800",
                };
            case "info":
                return {
                    bg: "bg-blue-50/70",
                    border: "border-blue-200",
                    iconBg: "bg-blue-600 text-white",
                    valueColor: "text-blue-700",
                };
            default:
                return {
                    bg: "bg-white",
                    border: "border-slate-200",
                    iconBg: "bg-slate-100 text-slate-700",
                    valueColor: "text-slate-900",
                };
        }
    };

    const style = getVariantStyles();

    return (
        <div
            className={`p-4 sm:p-5 rounded-lg border ${style.border} ${style.bg} shadow-xs flex items-center justify-between transition-all`}
        >
            <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {title}
                </p>
                <p
                    className={`text-2xl font-extrabold tracking-tight ${style.valueColor}`}
                >
                    {value}
                </p>
                {subtitle && (
                    <p className="text-[11px] font-medium text-slate-500">
                        {subtitle}
                    </p>
                )}
            </div>

            {Icon && (
                <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${style.iconBg} shadow-xs`}
                >
                    <Icon className="w-5 h-5" />
                </div>
            )}
        </div>
    );
}

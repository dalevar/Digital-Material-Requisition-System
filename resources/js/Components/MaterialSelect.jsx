import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, X, Check } from "lucide-react";

export default function MaterialSelect({
    materials = [],
    value = "",
    onChange,
    placeholder = "Select or search material...",
    required = false,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);

    const selectedMaterial = materials.find(
        (m) => String(m.id) === String(value),
    );

    // Hitung posisi floating dropdown saat terbuka atau discroll
    const updatePosition = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener("resize", updatePosition);
            window.addEventListener("scroll", updatePosition, true);
        }
        return () => {
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [isOpen]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredMaterials = materials.filter((m) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        const matNum = (m.material_number || "").toLowerCase();
        const desc = (m.description || "").toLowerCase();
        return matNum.includes(q) || desc.includes(q);
    });

    const handleSelect = (matId) => {
        onChange(matId);
        setIsOpen(false);
        setSearchQuery("");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
        setSearchQuery("");
    };

    return (
        <div className="relative w-full">
            {/* Input Trigger Box */}
            <div
                ref={triggerRef}
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs bg-white border rounded-md cursor-pointer transition-colors ${
                    isOpen
                        ? "border-red-600 ring-1 ring-red-500"
                        : "border-slate-300 hover:border-slate-400"
                }`}
            >
                <div className="flex-1 truncate mr-1">
                    {isOpen ? (
                        <div className="flex items-center">
                            <Search className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                placeholder="Type to search material number or description..."
                                className="w-full bg-transparent text-xs text-slate-900 border-none p-0 focus:outline-none focus:ring-0 placeholder:text-slate-400"
                            />
                        </div>
                    ) : selectedMaterial ? (
                        <span className="text-slate-900 font-medium">
                            <strong className="text-red-700 font-semibold mr-1.5">
                                {selectedMaterial.material_number}
                            </strong>
                            – {selectedMaterial.description}
                        </span>
                    ) : (
                        <span className="text-slate-400">{placeholder}</span>
                    )}
                </div>

                <div className="flex items-center space-x-1 shrink-0">
                    {selectedMaterial && !isOpen && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="p-0.5 text-slate-400 hover:text-red-600 transition-colors"
                            title="Clear material selection"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                            isOpen ? "rotate-180 text-red-600" : ""
                        }`}
                    />
                </div>
            </div>

            {/* Hidden select for standard form validation / accessibility */}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                required={required}
                className="sr-only"
                tabIndex={-1}
            >
                <option value="">Select Material...</option>
                {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                        {m.material_number} - {m.description}
                    </option>
                ))}
            </select>

            {/* Dropdown Options List via Portal */}
            {isOpen &&
                createPortal(
                    <div
                        ref={dropdownRef}
                        style={{
                            position: "absolute",
                            top: `${coords.top + 4}px`,
                            left: `${coords.left}px`,
                            width: `${coords.width}px`,
                            minWidth: "280px", // Memastikan lebar cukup jika sel tabel sempit
                        }}
                        className="z-9999 max-h-60 bg-white border border-slate-200 rounded-md shadow-xl overflow-y-auto"
                    >
                        {filteredMaterials.length > 0 ? (
                            <ul className="py-1 text-xs divide-y divide-slate-100">
                                {filteredMaterials.map((m) => {
                                    const isSelected =
                                        String(m.id) === String(value);
                                    return (
                                        <li
                                            key={m.id}
                                            onClick={() => handleSelect(m.id)}
                                            className={`px-3 py-2 cursor-pointer flex items-center justify-between transition-colors ${
                                                isSelected
                                                    ? "bg-red-50 text-red-900 font-semibold"
                                                    : "hover:bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            <div className="flex-1 pr-2 truncate">
                                                <span className="font-bold text-red-700 font-mono mr-2">
                                                    {m.material_number}
                                                </span>
                                                <span className="text-slate-800">
                                                    {m.description}
                                                </span>
                                            </div>
                                            {isSelected && (
                                                <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <div className="px-3 py-3 text-xs text-slate-400 text-center">
                                No materials found matching "{searchQuery}"
                            </div>
                        )}
                    </div>,
                    document.body,
                )}
        </div>
    );
}

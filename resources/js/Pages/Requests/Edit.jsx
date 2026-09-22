import React from "react";
import { Head, useForm, Link, usePage, router } from "@inertiajs/react";
import AppShell from "@/Layouts/AppShell";
import MaterialSelect from "@/Components/MaterialSelect";
import { Plus, Trash2, Save, ArrowLeft, Info, Edit3, Send } from "lucide-react";

export default function Edit({
    request,
    materials = [],
    approvers = [],
    departments = [],
    plants = [],
    requesters = [],
}) {
    const { auth } = usePage().props;
    const user = auth.user;
    const isAdmin = user.role === "ADMIN";

    const breadcrumbs = [
        { title: "Material Requests", href: "/requests" },
        { title: request.request_no, href: `/requests/${request.id}` },
        { title: "Edit Request", href: null },
    ];

    const initialItems = (request.items || []).map((item) => {
        const selectedMat = materials.find((m) => m.id === item.material_id);
        const soh = selectedMat
            ? parseFloat(selectedMat.soh || 0)
            : parseFloat(item.soh || 0);
        const qty = parseFloat(item.qty || 0);
        return {
            id: item.id,
            material_id: item.material_id,
            description:
                item.description ||
                (selectedMat ? selectedMat.description : ""),
            uom: item.uom || (selectedMat ? selectedMat.uom : ""),
            qty: qty,
            soh: soh,
            balance: soh - qty,
            note: item.note || "",
        };
    });

    const { data, setData, put, processing, errors } = useForm({
        request_date:
            request.request_date || new Date().toISOString().split("T")[0],
        no_doc: request.no_doc || "",
        requester_id: request.requester_id || "",
        department_id: request.department_id || "",
        plant_id: request.plant_id || "",
        gl_account: request.gl_account || "",
        pwo_no: request.pwo_no || "",
        pur_org: request.pur_org || "",
        pur_group: request.pur_group || "",
        cost_center: request.cost_center || "",
        reason: request.reason || "",
        approver_id: request.approver_id || "",
        items:
            initialItems.length > 0
                ? initialItems
                : [
                      {
                          material_id: "",
                          qty: 1,
                          description: "",
                          uom: "",
                          soh: 0,
                          balance: 0,
                          note: "",
                      },
                  ],
    });

    const addItemRow = () => {
        setData("items", [
            ...data.items,
            {
                material_id: "",
                qty: 1,
                description: "",
                uom: "",
                soh: 0,
                balance: 0,
                note: "",
            },
        ]);
    };

    const removeItemRow = (index) => {
        if (data.items.length === 1) return;
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData("items", newItems);
    };

    const handleMaterialChange = (index, materialId) => {
        const selectedMat = materials.find(
            (m) => m.id === parseInt(materialId),
        );
        const newItems = [...data.items];
        if (selectedMat) {
            const soh = parseFloat(selectedMat.soh || 0);
            const qty = parseFloat(newItems[index].qty || 0);
            newItems[index] = {
                ...newItems[index],
                material_id: selectedMat.id,
                description: selectedMat.description,
                uom: selectedMat.uom,
                soh: soh,
                balance: soh - qty,
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                material_id: "",
                description: "",
                uom: "",
                soh: 0,
                balance: 0,
            };
        }
        setData("items", newItems);
    };

    const handleQtyChange = (index, qty) => {
        const newItems = [...data.items];
        const parsedQty = parseFloat(qty) || 0;
        const soh = newItems[index].soh || 0;
        newItems[index].qty = parsedQty;
        newItems[index].balance = soh - parsedQty;
        setData("items", newItems);
    };

    const handleItemNoteChange = (index, note) => {
        const newItems = [...data.items];
        newItems[index].note = note;
        setData("items", newItems);
    };

    const canSubmit = request.status === "DRAFT" && (isAdmin || user.id === request.requester_id);

    const handleSubmit = (e, actionType = "save") => {
        e.preventDefault();
        router.put(`/requests/${request.id}`, {
            ...data,
            action: actionType,
        });
    };

    return (
        <AppShell
            title={`Edit Request ${request.request_no}`}
            breadcrumbs={breadcrumbs}
        >
            <Head title={`Edit ${request.request_no} - DMRS`} />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <Link
                        href={`/requests/${request.id}`}
                        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-red-600 mb-1 transition-colors"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to
                        Request Details
                    </Link>
                    <div className="flex items-center space-x-3">
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                            Edit Material Requisition ({request.request_no})
                        </h1>
                    </div>
                    <p className="text-xs text-slate-500">
                        {isAdmin
                            ? "Administrator Edit Mode: Update header information and requisitioned material items."
                            : "Edit your draft or rejected material requisition."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Header Metadata Section */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        1. Request Header Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {isAdmin && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Requester{" "}
                                    <span className="text-red-600">*</span>
                                </label>
                                <select
                                    value={data.requester_id}
                                    onChange={(e) =>
                                        setData("requester_id", e.target.value)
                                    }
                                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                    required
                                >
                                    <option value="">
                                        Select Requester...
                                    </option>
                                    {requesters.map((req) => (
                                        <option key={req.id} value={req.id}>
                                            {req.name} (
                                            {req.employee_id || "ID: " + req.id}
                                            )
                                        </option>
                                    ))}
                                </select>
                                {errors.requester_id && (
                                    <p className="text-xs text-red-600 mt-1 font-medium">
                                        {errors.requester_id}
                                    </p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Request Date{" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.request_date}
                                onChange={(e) =>
                                    setData("request_date", e.target.value)
                                }
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                required
                            />
                            {errors.request_date && (
                                <p className="text-xs text-red-600 mt-1 font-medium">
                                    {errors.request_date}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Document Archive No (Manual Doc No)
                            </label>
                            <input
                                type="text"
                                value={data.no_doc}
                                onChange={(e) =>
                                    setData("no_doc", e.target.value)
                                }
                                placeholder="e.g. DOC-REF-2026-001"
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Designated Approver (Executive / HoD){" "}
                                <span className="text-red-600">*</span>
                            </label>
                            <select
                                value={data.approver_id}
                                onChange={(e) =>
                                    setData("approver_id", e.target.value)
                                }
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                required
                            >
                                <option value="">Select Approver...</option>
                                {approvers.map((appr) => (
                                    <option key={appr.id} value={appr.id}>
                                        {appr.name} (
                                        {appr.position || "Approver"})
                                    </option>
                                ))}
                            </select>
                            {errors.approver_id && (
                                <p className="text-xs text-red-600 mt-1 font-medium">
                                    {errors.approver_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Department
                            </label>
                            <select
                                value={data.department_id}
                                onChange={(e) =>
                                    setData("department_id", e.target.value)
                                }
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            >
                                <option value="">Select Department...</option>
                                {departments.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Plant
                            </label>
                            <select
                                value={data.plant_id}
                                onChange={(e) =>
                                    setData("plant_id", e.target.value)
                                }
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            >
                                <option value="">Select Plant...</option>
                                {plants.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                G/L Account
                            </label>
                            <input
                                type="text"
                                value={data.gl_account}
                                onChange={(e) =>
                                    setData("gl_account", e.target.value)
                                }
                                placeholder="e.g. 500120"
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                PWO No.
                            </label>
                            <input
                                type="text"
                                value={data.pwo_no}
                                onChange={(e) =>
                                    setData("pwo_no", e.target.value)
                                }
                                placeholder="e.g. PWO-9941"
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Pur. Org / Pur. Group
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={data.pur_org}
                                    onChange={(e) =>
                                        setData("pur_org", e.target.value)
                                    }
                                    placeholder="Pur Org"
                                    className="w-1/2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                                <input
                                    type="text"
                                    value={data.pur_group}
                                    onChange={(e) =>
                                        setData("pur_group", e.target.value)
                                    }
                                    placeholder="Pur Group"
                                    className="w-1/2 px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Cost Center
                            </label>
                            <input
                                type="text"
                                value={data.cost_center}
                                onChange={(e) =>
                                    setData("cost_center", e.target.value)
                                }
                                placeholder="e.g. CC-304"
                                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Reason / Purpose for Requisition
                        </label>
                        <textarea
                            rows="2"
                            value={data.reason}
                            onChange={(e) => setData("reason", e.target.value)}
                            placeholder="Provide reason or operational purpose..."
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                        />
                    </div>
                </div>

                {/* Dynamic Material Items Table */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            2. Requisitioned Material Items List
                        </h2>
                        <button
                            type="button"
                            onClick={addItemRow}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md text-xs font-semibold transition-colors border border-red-200"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Material Item</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700">
                            <thead className="bg-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                                <tr>
                                    <th className="px-3 py-2.5 text-center w-10">
                                        No
                                    </th>
                                    <th className="px-3 py-2.5">
                                        Material{" "}
                                        <span className="text-red-600">*</span>
                                    </th>
                                    <th className="px-3 py-2.5 text-right w-24">
                                        SOH
                                    </th>
                                    <th className="px-3 py-2.5 text-right w-32">
                                        Req Qty{" "}
                                        <span className="text-red-600">*</span>
                                    </th>
                                    <th className="px-3 py-2.5 text-center w-20">
                                        UoM
                                    </th>
                                    <th className="px-3 py-2.5 text-right w-28">
                                        Est. Balance
                                    </th>
                                    <th className="px-3 py-2.5">Notes</th>
                                    <th className="px-3 py-2.5 text-center w-12">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {data.items.map((item, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-slate-50/60"
                                    >
                                        <td className="px-3 py-2.5 text-center font-bold text-slate-400">
                                            {index + 1}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <MaterialSelect
                                                materials={materials}
                                                value={item.material_id}
                                                onChange={(val) =>
                                                    handleMaterialChange(
                                                        index,
                                                        val,
                                                    )
                                                }
                                                required
                                            />
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-700">
                                            {(item.soh || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0.01"
                                                value={item.qty}
                                                onChange={(e) =>
                                                    handleQtyChange(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-28 text-right px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-500 font-mono font-bold text-slate-900"
                                                required
                                            />
                                        </td>
                                        <td className="px-3 py-2.5 text-center font-semibold text-slate-500">
                                            {item.uom || "-"}
                                        </td>
                                        <td
                                            className={`px-3 py-2.5 text-right font-mono font-bold ${
                                                (item.balance || 0) < 0
                                                    ? "text-red-600"
                                                    : "text-emerald-600"
                                            }`}
                                        >
                                            {(item.balance || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <input
                                                type="text"
                                                value={item.note || ""}
                                                onChange={(e) =>
                                                    handleItemNoteChange(
                                                        index,
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Item note..."
                                                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-500"
                                            />
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeItemRow(index)
                                                }
                                                disabled={
                                                    data.items.length === 1
                                                }
                                                className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 transition-colors"
                                                title="Remove item"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <Info className="w-4 h-4 text-red-600" />
                        <span>
                            Estimated Balance is automatically computed:{" "}
                            <code>Balance = SOH - Requested Qty</code>.
                        </span>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={`/requests/${request.id}`}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md shadow-xs transition-all"
                        >
                            Cancel
                        </Link>

                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, "save")}
                            disabled={processing}
                            className="inline-flex items-center space-x-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-md shadow-xs transition-all disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>

                        {canSubmit && (
                            <button
                                type="button"
                                onClick={(e) => handleSubmit(e, "submit")}
                                disabled={processing}
                                className="inline-flex items-center space-x-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-md shadow-xs transition-all disabled:opacity-50"
                            >
                                <Send className="w-4 h-4" />
                                <span>Save & Submit</span>
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </AppShell>
    );
}

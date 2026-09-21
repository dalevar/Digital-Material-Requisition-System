<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Material Requisition Form - {{ $request->request_no }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 12mm 15mm 15mm 15mm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 10px;
            color: #1e293b;
            line-height: 1.35;
            margin: 0;
            padding: 0;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 8px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .company-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .system-subtitle {
            font-size: 9px;
            color: #64748b;
            font-weight: 500;
        }
        .doc-title {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
            text-align: right;
        }
        .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .meta-table td {
            padding: 4px 6px;
            border: 1px solid #cbd5e1;
            font-size: 9.5px;
            vertical-align: top;
        }
        .meta-label {
            background-color: #f8fafc;
            font-weight: bold;
            color: #334155;
            width: 14%;
        }
        .meta-value {
            width: 36%;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            page-break-inside: auto;
        }
        .item-table tr {
            page-break-inside: avoid;
            page-break-after: auto;
        }
        .item-table thead {
            display: table-header-group;
        }
        .item-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-size: 9.5px;
            font-weight: bold;
            padding: 6px 5px;
            text-align: left;
            border: 1px solid #1e3a8a;
        }
        .item-table td {
            padding: 5px;
            border: 1px solid #cbd5e1;
            font-size: 9.5px;
        }
        .history-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            page-break-inside: auto;
        }
        .history-table tr {
            page-break-inside: avoid;
        }
        .history-table th {
            background-color: #475569;
            color: #ffffff;
            font-size: 9px;
            font-weight: bold;
            padding: 5px;
            text-align: left;
            border: 1px solid #475569;
        }
        .history-table td {
            padding: 4px 5px;
            border: 1px solid #cbd5e1;
            font-size: 9px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-mono { font-family: 'Courier', monospace; }
        
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            page-break-inside: avoid;
        }
        .signature-header {
            background-color: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 5px;
            font-weight: bold;
            text-align: center;
            font-size: 9.5px;
            color: #1e293b;
        }
        .signature-box {
            border: 1px solid #cbd5e1;
            height: 65px;
            text-align: center;
            vertical-align: bottom;
            padding-bottom: 6px;
            font-weight: bold;
            font-size: 9.5px;
        }
        .status-stamp {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .status-DRAFT { background-color: #f1f5f9; color: #475569; border: 1px solid #94a3b8; }
        .status-SUBMITTED { background-color: #e0f2fe; color: #0369a1; border: 1px solid #38bdf8; }
        .status-PENDING_APPROVAL { background-color: #fef3c7; color: #b45309; border: 1px solid #f59e0b; }
        .status-APPROVED { background-color: #dcfce7; color: #15803d; border: 1px solid #22c55e; }
        .status-REJECTED { background-color: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; }
        .status-PROCESSING { background-color: #e0e7ff; color: #4338ca; border: 1px solid #6366f1; }
        .status-COMPLETED { background-color: #dcfce7; color: #15803d; border: 1px solid #16a34a; }
        .status-CANCELLED { background-color: #f1f5f9; color: #64748b; border: 1px solid #cbd5e1; }
        .status-CANCELLED_AFTER_APPROVAL { background-color: #fee2e2; color: #991b1b; border: 1px solid #f87171; }

        .alert-box {
            padding: 8px 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-size: 9.5px;
            page-break-inside: avoid;
        }
        .alert-danger {
            background-color: #fee2e2;
            border: 1px solid #ef4444;
            color: #991b1b;
        }
        .section-heading {
            font-size: 11px;
            font-weight: bold;
            color: #1e3a8a;
            margin-top: 15px;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 3px;
        }
    </style>
</head>
<body>

    <script type="text/php">
        if (isset($pdf)) {
            $text = "Page " . $PAGE_NUM . " of " . $PAGE_COUNT;
            $font = $fontMetrics->get_font("helvetica", "bold");
            $size = 8;
            $color = array(0.38, 0.45, 0.55);
            $y = $pdf->get_height() - 25;
            $x = $pdf->get_width() - 95;
            $pdf->page_text($x, $y, $text, $font, $size, $color);

            $leftText = "Printed from DMRS | PT. Guthrie International Pulau Laut Refinery | Audit Ref: {{ $request->request_no }}";
            $pdf->page_text(42, $y, $leftText, $font, $size, $color);
        }
    </script>

    <table class="header-table">
        <tr>
            <td style="width: 22%;">
                @if($logoBase64)
                    <img src="{{ $logoBase64 }}" style="max-height: 48px; max-width: 170px;">
                @else
                    <span style="font-weight: bold; font-size: 14px; color: #1e3a8a;">PT. GUTHRIE</span>
                @endif
            </td>
            <td style="width: 48%;">
                <div class="company-title">PT. Guthrie International Pulau Laut Refinery</div>
                <div class="system-subtitle">Digital Material Requisition System (DMRS)</div>
            </td>
            <td style="width: 30%;" class="doc-title">
                MATERIAL REQUISITION FORM
                <div style="margin-top: 4px;">
                    <span class="status-stamp status-{{ $request->status->value }}">{{ $request->status->label() }}</span>
                </div>
            </td>
        </tr>
    </table>

    <table class="meta-table">
        <tr>
            <td class="meta-label">Request No.</td>
            <td class="meta-value"><strong>{{ $request->request_no }}</strong></td>
            <td class="meta-label">Doc Reference No.</td>
            <td class="meta-value">{{ $request->no_doc ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Request Date</td>
            <td class="meta-value">{{ $request->request_date ? \Carbon\Carbon::parse($request->request_date)->format('d F Y') : '-' }}</td>
            <td class="meta-label">Requester</td>
            <td class="meta-value">
                <strong>{{ $request->requester?->name ?? '-' }}</strong>
                @if($request->requester?->employee_id)
                    <span style="color: #64748b;">({{ $request->requester->employee_id }})</span>
                @endif
                @if($request->requester?->position)
                    <br><span style="font-size: 8.5px; color: #475569;">Pos: {{ $request->requester->position }}</span>
                @endif
            </td>
        </tr>
        <tr>
            <td class="meta-label">Department</td>
            <td class="meta-value">{{ $request->department?->name ?? $request->requester?->department?->name ?? '-' }}</td>
            <td class="meta-label">Plant</td>
            <td class="meta-value">{{ $request->plant?->name ?? $request->requester?->plant?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">G/L Account</td>
            <td class="meta-value">{{ $request->gl_account ?? '-' }}</td>
            <td class="meta-label">PWO No.</td>
            <td class="meta-value">{{ $request->pwo_no ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Pur. Org / Group</td>
            <td class="meta-value">
                @if($request->pur_org || $request->pur_group)
                    {{ $request->pur_org ?? '-' }} / {{ $request->pur_group ?? '-' }}
                @else
                    -
                @endif
            </td>
            <td class="meta-label">Cost Center</td>
            <td class="meta-value">{{ $request->cost_center ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Reason / Usage</td>
            <td colspan="3">{{ $request->reason ?? '-' }}</td>
        </tr>
    </table>

    <div class="section-heading">Material Request Items</div>

    <table class="item-table">
        <thead>
            <tr>
                <th style="width: 4%;" class="text-center">No</th>
                <th style="width: 14%;">Material No</th>
                <th style="width: 36%;">Description</th>
                <th style="width: 9%;" class="text-right">Qty</th>
                <th style="width: 7%;" class="text-center">UoM</th>
                <th style="width: 9%;" class="text-right">SOH</th>
                <th style="width: 9%;" class="text-right">Balance</th>
                <th style="width: 12%;">Notes</th>
            </tr>
        </thead>
        <tbody>
            @forelse($request->items as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="font-mono"><strong>{{ $item->material?->material_number ?? '-' }}</strong></td>
                <td>{{ $item->description }}</td>
                <td class="text-right"><strong>{{ number_format((float)$item->qty, 2) }}</strong></td>
                <td class="text-center">{{ $item->uom }}</td>
                <td class="text-right">{{ $item->soh !== null ? number_format((float)$item->soh, 2) : '-' }}</td>
                <td class="text-right">{{ $item->balance !== null ? number_format((float)$item->balance, 2) : '-' }}</td>
                <td>{{ $item->note ?? '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" class="text-center" style="color: #64748b; padding: 12px;">No material items available.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    @if($request->rejection_reason)
        <div class="alert-box alert-danger">
            <strong>Rejection Reason:</strong> {{ $request->rejection_reason }}
            @if($request->rejected_at)
                <span style="font-size: 8.5px; color: #7f1d1d;"> (Rejected on {{ \Carbon\Carbon::parse($request->rejected_at)->format('d/m/Y H:i') }})</span>
            @endif
        </div>
    @endif

    @if($request->approvalHistories && $request->approvalHistories->isNotEmpty())
        <div class="section-heading">Approval & Workflow Audit Trail</div>
        <table class="history-table">
            <thead>
                <tr>
                    <th style="width: 15%;">Action</th>
                    <th style="width: 25%;">User / Approver</th>
                    <th style="width: 20%;">Date & Time</th>
                    <th style="width: 40%;">Reason / Remarks</th>
                </tr>
            </thead>
            <tbody>
                @foreach($request->approvalHistories as $history)
                <tr>
                    <td><strong>{{ strtoupper($history->action) }}</strong></td>
                    <td>{{ $history->approver?->name ?? 'System' }}</td>
                    <td>{{ $history->action_at ? \Carbon\Carbon::parse($history->action_at)->format('d/m/Y H:i:s') : ($history->created_at ? \Carbon\Carbon::parse($history->created_at)->format('d/m/Y H:i:s') : '-') }}</td>
                    <td>{{ $history->reason ?? '-' }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <table class="signature-table">
        <tr>
            <td class="signature-header" style="width: 33%;">Requested By</td>
            <td class="signature-header" style="width: 33%;">Approved By (Executive / HoD)</td>
            <td class="signature-header" style="width: 33%;">Processed / Issued By (Stock Control)</td>
        </tr>
        <tr>
            <td class="signature-box">
                <div>{{ $request->requester?->name ?? '-' }}</div>
                <div style="font-weight: normal; font-size: 8px; color: #64748b; margin-top: 2px;">
                    Date: {{ $request->created_at ? \Carbon\Carbon::parse($request->created_at)->format('d/m/Y H:i') : '-' }}
                </div>
            </td>
            <td class="signature-box">
                <div>
                    @if(in_array($request->status->value, ['APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED_AFTER_APPROVAL']))
                        {{ $request->approver?->name ?? 'Authorized Approver' }}
                    @elseif($request->status->value === 'REJECTED')
                        {{ $request->approver?->name ?? 'Approver' }} (REJECTED)
                    @else
                        Pending Approval
                    @endif
                </div>
                <div style="font-weight: normal; font-size: 8px; color: #64748b; margin-top: 2px;">
                    @if($request->approved_at)
                        Date: {{ \Carbon\Carbon::parse($request->approved_at)->format('d/m/Y H:i') }}
                    @elseif($request->rejected_at)
                        Date: {{ \Carbon\Carbon::parse($request->rejected_at)->format('d/m/Y H:i') }}
                    @else
                        Status: {{ $request->status->label() }}
                    @endif
                </div>
            </td>
            <td class="signature-box">
                <div>Warehouse & Stock Control</div>
                <div style="font-weight: normal; font-size: 8px; color: #64748b; margin-top: 2px;">Signature / Official Stamp</div>
            </td>
        </tr>
    </table>

</body>
</html>

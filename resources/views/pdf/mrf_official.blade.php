<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Material Requisition Form - {{ $request->request_no }}</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            margin: 0;
            padding: 20px;
        }
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 10px;
        }
        .header-table td {
            vertical-align: middle;
        }
        .company-title {
            font-size: 16px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
        }
        .doc-title {
            font-size: 14px;
            font-weight: bold;
            color: #334155;
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
            font-size: 10px;
        }
        .meta-label {
            background-color: #f1f5f9;
            font-weight: bold;
            color: #334155;
            width: 15%;
        }
        .meta-value {
            width: 35%;
        }
        .item-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
        }
        .item-table th {
            background-color: #1e3a8a;
            color: #ffffff;
            font-size: 10px;
            font-weight: bold;
            padding: 6px;
            text-align: left;
            border: 1px solid #1e3a8a;
        }
        .item-table td {
            padding: 6px;
            border: 1px solid #cbd5e1;
            font-size: 10px;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }
        .signature-box {
            border: 1px solid #cbd5e1;
            height: 70px;
            text-align: center;
            vertical-align: bottom;
            padding-bottom: 5px;
            font-weight: bold;
            font-size: 10px;
        }
        .signature-header {
            background-color: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 4px;
            font-weight: bold;
            text-align: center;
            font-size: 10px;
        }
        .status-stamp {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
        }
        .status-APPROVED { background-color: #dcfce7; color: #15803d; border: 1px solid #22c55e; }
        .status-PENDING_APPROVAL { background-color: #fef3c7; color: #b45309; border: 1px solid #f59e0b; }
        .status-REJECTED { background-color: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; }
        .status-DRAFT { background-color: #f1f5f9; color: #475569; border: 1px solid #94a3b8; }
        .footer {
            margin-top: 40px;
            font-size: 9px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            padding-top: 5px;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td style="width: 20%;">
                @if($logoBase64)
                    <img src="{{ $logoBase64 }}" style="max-height: 50px;">
                @else
                    <span style="font-weight: bold; color: #1e3a8a;">PT. GUTHRIE</span>
                @endif
            </td>
            <td style="width: 50%;">
                <div class="company-title">PT. Guthrie International Pulau Laut Refinery</div>
                <div style="font-size: 10px; color: #64748b;">Digital Material Requisition System (DMRS)</div>
            </td>
            <td style="width: 30%;" class="doc-title">
                MATERIAL REQUISITION FORM
                <br>
                <span class="status-stamp status-{{ $request->status->value }}">{{ $request->status->label() }}</span>
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
            <td class="meta-value">{{ \Carbon\Carbon::parse($request->request_date)->format('d F Y') }}</td>
            <td class="meta-label">Requester</td>
            <td class="meta-value">{{ $request->requester?->name }} ({{ $request->requester?->employee_id }})</td>
        </tr>
        <tr>
            <td class="meta-label">Department</td>
            <td class="meta-value">{{ $request->department?->name ?? '-' }}</td>
            <td class="meta-label">Plant</td>
            <td class="meta-value">{{ $request->plant?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">G/L Account</td>
            <td class="meta-value">{{ $request->gl_account ?? '-' }}</td>
            <td class="meta-label">PWO No.</td>
            <td class="meta-value">{{ $request->pwo_no ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Pur. Org / Group</td>
            <td class="meta-value">{{ $request->pur_org ?? '-' }} / {{ $request->pur_group ?? '-' }}</td>
            <td class="meta-label">Cost Center</td>
            <td class="meta-value">{{ $request->cost_center ?? '-' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Reason / Usage</td>
            <td colspan="3">{{ $request->reason ?? 'General Operational Requisition' }}</td>
        </tr>
    </table>

    <table class="item-table">
        <thead>
            <tr>
                <th style="width: 5%;" class="text-center">No</th>
                <th style="width: 15%;">Material No</th>
                <th style="width: 35%;">Description</th>
                <th style="width: 10%;" class="text-right">Qty</th>
                <th style="width: 8%;" class="text-center">UoM</th>
                <th style="width: 10%;" class="text-right">SOH</th>
                <th style="width: 10%;" class="text-right">Balance</th>
                <th style="width: 7%;">Notes</th>
            </tr>
        </thead>
        <tbody>
            @foreach($request->items as $index => $item)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td><strong>{{ $item->material?->material_number }}</strong></td>
                <td>{{ $item->description }}</td>
                <td class="text-right"><strong>{{ number_format($item->qty, 2) }}</strong></td>
                <td class="text-center">{{ $item->uom }}</td>
                <td class="text-right">{{ number_format($item->soh, 2) }}</td>
                <td class="text-right">{{ number_format($item->balance, 2) }}</td>
                <td>{{ $item->note ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    @if($request->rejection_reason)
        <div style="background-color: #fee2e2; border: 1px solid #ef4444; color: #b91c1c; padding: 8px; margin-bottom: 15px; border-radius: 4px;">
            <strong>Rejection Reason:</strong> {{ $request->rejection_reason }}
        </div>
    @endif

    <table class="signature-table">
        <tr>
            <td class="signature-header" style="width: 33%;">Requested By</td>
            <td class="signature-header" style="width: 33%;">Approved By (Executive / HoD)</td>
            <td class="signature-header" style="width: 33%;">Processed / Issued By (Stock Control)</td>
        </tr>
        <tr>
            <td class="signature-box">
                <div>{{ $request->requester?->name }}</div>
                <div style="font-weight: normal; font-size: 8px; color: #64748b;">Date: {{ \Carbon\Carbon::parse($request->created_at)->format('d/m/Y H:i') }}</div>
            </td>
            <td class="signature-box">
                <div>{{ $request->approver?->name ?? 'Pending Approval' }}</div>
                <div style="font-weight: normal; font-size: 8px; color: #64748b;">
                    @if($request->approved_at)
                        Date: {{ \Carbon\Carbon::parse($request->approved_at)->format('d/m/Y H:i') }}
                    @else
                        Status: {{ $request->status->label() }}
                    @endif
                </div>
            </td>
            <td class="signature-box">
                <div>Warehouse & Stock Control</div>
                <div style="font-weight: normal; font-size: 8px; color: #64748b;">Signature / Stamp</div>
            </td>
        </tr>
    </table>

    <div class="footer">
        Printed from DMRS System on {{ $generatedAt }} | Page 1 of 1 | Audit Ref: {{ $request->request_no }}
    </div>

</body>
</html>

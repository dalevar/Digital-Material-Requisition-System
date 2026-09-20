<?php

namespace App\Services;

use App\Models\MaterialRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Dompdf\Dompdf;
use Illuminate\Http\Response;

class PdfService
{
    public function generateMrfPdf(MaterialRequest $request): Dompdf
    {
        $request->load([
            'requester',
            'department',
            'plant',
            'approver',
            'items.material',
            'approvalHistories.approver',
        ]);

        $logoPath = public_path('sd_guthrie_international_logo.jpg');
        $logoBase64 = null;
        if (file_exists($logoPath)) {
            $logoBase64 = 'data:image/jpeg;base64,'.base64_encode(file_get_contents($logoPath));
        }

        $pdf = Pdf::loadView('pdf.mrf_official', [
            'request' => $request,
            'logoBase64' => $logoBase64,
            'generatedAt' => now()->format('d/m/Y H:i:s'),
        ]);

        $pdf->setPaper('a4', 'portrait');

        return $pdf->getDomPDF();
    }

    public function downloadMrfPdf(MaterialRequest $request): Response
    {
        $pdf = $this->generateMrfPdf($request);
        $filename = "MRF-{$request->request_no}.pdf";

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}

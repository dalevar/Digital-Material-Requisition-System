<?php

use App\Models\MaterialRequest;
use App\Services\PdfService;
use Illuminate\Contracts\Console\Kernel;

require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$materialRequest = MaterialRequest::with([
    'requester.department',
    'requester.plant',
    'department',
    'plant',
    'approver',
    'items.material',
    'approvalHistories.approver',
])->first();

if (! $materialRequest) {
    echo "No MaterialRequest found in DB!\n";
    exit(1);
}

echo "Found MaterialRequest ID: {$materialRequest->id}, Request No: {$materialRequest->request_no}\n";

$svc = new PdfService;
$res = $svc->downloadMrfPdf($materialRequest);
$content = $res->getContent();

echo 'PdfService Output Length: '.strlen($content)." bytes\n";
file_put_contents(__DIR__.'/output.pdf', $content);
echo "Saved generated PDF to scratch/output.pdf\n";

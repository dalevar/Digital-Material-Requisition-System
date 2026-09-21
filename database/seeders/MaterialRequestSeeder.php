<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class MaterialRequestSeeder extends Seeder
{
    // Request number counter (stored as property for reuse)
    private int $requestCounter = 1;

    private array $requestYearCounters = [];

    public function run(): void
    {
        // Fetch pre-requisites
        $userRoleId = DB::table('roles')->where('name', 'USER')->value('id');
        $approverRoleId = DB::table('roles')->where('name', 'APPROVER')->value('id');

        $regularUsers = DB::table('users')
            ->where('role_id', $userRoleId)
            ->where('status', 'ACTIVE')
            ->select('id', 'department_id', 'plant_id', 'approver_id')
            ->get()
            ->toArray();

        if (empty($regularUsers)) {
            $this->command->warn('No active regular users found, skipping MaterialRequestSeeder.');

            return;
        }

        $approverIds = DB::table('users')
            ->where('role_id', $approverRoleId)
            ->pluck('id')
            ->toArray();

        $activeMaterials = DB::table('materials')
            ->where('status', 'ACTIVE')
            ->select('id', 'uom', 'minimum_stock')
            ->get()
            ->toArray();

        $stockBalances = DB::table('stock_balances')
            ->pluck('quantity', 'material_id')
            ->toArray();

        // Status distribution
        $statuses = [
            'DRAFT' => 10,
            'SUBMITTED' => 5,
            'PENDING_APPROVAL' => 15,
            'APPROVED' => 30,
            'REJECTED' => 15,
            'PROCESSING' => 10,
            'COMPLETED' => 10,
            'CANCELLED' => 3,
            'CANCELLED_AFTER_APPROVAL' => 2,
        ];

        // Expand into flat array for cycling
        $statusPool = [];
        foreach ($statuses as $status => $pct) {
            for ($i = 0; $i < $pct; $i++) {
                $statusPool[] = $status;
            }
        }
        shuffle($statusPool);
        $statusPoolCount = count($statusPool);

        $glAccounts = ['GL-501001', 'GL-501002', 'GL-502001', 'GL-503001', 'GL-503002', 'GL-504001', null, null];
        $purOrgs = ['PUR-001', 'PUR-002', 'PUR-003', null, null];
        $purGroups = ['PG-001', 'PG-002', 'PG-003', null, null];
        $costCenters = ['CC-001', 'CC-002', 'CC-003', 'CC-004', 'CC-005', null, null];
        $reasons = [
            'Routine maintenance material request',
            'Emergency repair spare parts',
            'Scheduled preventive maintenance',
            'Production line support material',
            'Workshop consumable replenishment',
            'Project shutdown material',
            'Electrical maintenance support',
            'Annual stock replenishment',
            'Corrective maintenance parts',
            'Safety equipment replacement',
            'Instrument calibration material',
            'Pipe repair emergency request',
            'Pump overhaul spare parts',
            'Motor replacement parts',
            'Lubrication program material',
        ];

        $rejectionReasons = [
            'Stock tidak mencukupi untuk memenuhi permintaan',
            'Informasi request belum lengkap, harap dilengkapi',
            'Material tidak sesuai dengan spesifikasi yang dibutuhkan',
            'Budget periode ini belum tersedia',
            'Request perlu direvisi dan diajukan kembali',
            'Duplikasi request dari departemen yang sama',
            'Permintaan tidak sesuai prosedur pengajuan',
            'Jumlah yang diminta melebihi batas maksimum',
            'Material sudah tersedia di lokasi lain',
            'GL Account tidak sesuai dengan kategori material',
        ];

        $totalRequests = 1000;
        $now = now();

        // Date range: 2025-10-01 to 2026-09-21
        $startDate = Carbon::parse('2025-10-01');
        $endDate = Carbon::parse('2026-09-21');

        $this->command->info("Generating {$totalRequests} material requests...");

        $requestBatch = [];
        $batchSize = 100;

        for ($i = 0; $i < $totalRequests; $i++) {
            $requester = $regularUsers[$i % count($regularUsers)];
            $status = $statusPool[$i % $statusPoolCount];
            $approverId = $requester->approver_id ?? $approverIds[0];

            // Generate realistic date (weighted towards weekdays)
            $requestDate = $this->generateWorkdayDate($startDate, $endDate, $i);

            $year = $requestDate->year;
            if (! isset($this->requestYearCounters[$year])) {
                $this->requestYearCounters[$year] = 1;
            }
            $seqNum = $this->requestYearCounters[$year]++;
            $requestNo = 'MR-'.$year.'-'.str_pad($seqNum, 6, '0', STR_PAD_LEFT);

            $noDoc = null;
            // ~60% have document numbers
            if ($i % 10 < 6) {
                $docSeq = str_pad($i + 1, 6, '0', STR_PAD_LEFT);
                $noDoc = "DOC-{$year}-{$docSeq}";
            }

            $approvedAt = null;
            $rejectedAt = null;
            $rejectionRsn = null;

            if (in_array($status, ['APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED_AFTER_APPROVAL'])) {
                $approvedAt = $requestDate->copy()->addDays(mt_rand(1, 3))->toDateTimeString();
            }

            if ($status === 'REJECTED') {
                $rejectedAt = $requestDate->copy()->addDays(mt_rand(1, 3))->toDateTimeString();
                $rejectionRsn = $rejectionReasons[$i % count($rejectionReasons)];
            }

            $requestBatch[] = [
                'request_no' => $requestNo,
                'no_doc' => $noDoc,
                'request_date' => $requestDate->toDateString(),
                'requester_id' => $requester->id,
                'department_id' => $requester->department_id,
                'plant_id' => $requester->plant_id,
                'gl_account' => $glAccounts[$i % count($glAccounts)],
                'pwo_no' => ($i % 4 === 0) ? 'PWO-'.str_pad($i + 1, 5, '0', STR_PAD_LEFT) : null,
                'pur_org' => $purOrgs[$i % count($purOrgs)],
                'pur_group' => $purGroups[$i % count($purGroups)],
                'cost_center' => $costCenters[$i % count($costCenters)],
                'reason' => $reasons[$i % count($reasons)],
                'status' => $status,
                'approver_id' => $approverId,
                'approved_at' => $approvedAt,
                'rejected_at' => $rejectedAt,
                'rejection_reason' => $rejectionRsn,
                'created_at' => $requestDate->toDateTimeString(),
                'updated_at' => $requestDate->toDateTimeString(),
            ];

            if (count($requestBatch) >= $batchSize) {
                $this->insertRequestBatch($requestBatch);
                $requestBatch = [];
            }
        }

        if (! empty($requestBatch)) {
            $this->insertRequestBatch($requestBatch);
        }

        $total = DB::table('material_requests')->count();
        $this->command->info("MaterialRequestSeeder: {$total} requests seeded.");
    }

    private function insertRequestBatch(array $batch): void
    {
        foreach ($batch as $row) {
            DB::table('material_requests')->updateOrInsert(
                ['request_no' => $row['request_no']],
                $row
            );
        }
    }

    /** Generate a workday-biased random date. */
    private function generateWorkdayDate(Carbon $start, Carbon $end, int $seed): Carbon
    {
        $totalDays = $start->diffInDays($end);
        $dayOffset = mt_rand(0, (int) $totalDays);
        $date = $start->copy()->addDays($dayOffset);

        // If weekend, shift to next Monday (80% chance) or keep (20% chance)
        if ($date->isWeekend() && ($seed % 5 !== 0)) {
            $date->next(Carbon::MONDAY);
            if ($date->gt($end)) {
                $date = $end->copy()->previous(Carbon::FRIDAY);
            }
        }

        return $date;
    }
}

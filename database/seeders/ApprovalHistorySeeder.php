<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ApprovalHistorySeeder extends Seeder
{
    public function run(): void
    {
        $approverRoleId = DB::table('roles')->where('name', 'APPROVER')->value('id');
        $approverIds = DB::table('users')
            ->where('role_id', $approverRoleId)
            ->pluck('id')
            ->toArray();

        // Statuses that require approval history entries
        $terminalStatuses = [
            'APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED',
            'CANCELLED_AFTER_APPROVAL',
        ];

        $requests = DB::table('material_requests')
            ->whereIn('status', $terminalStatuses)
            ->orWhere('status', 'PENDING_APPROVAL')
            ->orWhere('status', 'SUBMITTED')
            ->select('id', 'status', 'approver_id', 'approved_at', 'rejected_at', 'rejection_reason', 'created_at')
            ->get();

        $rejectionReasons = [
            'Stock tidak mencukupi untuk memenuhi permintaan ini',
            'Informasi request belum lengkap, harap dilengkapi terlebih dahulu',
            'Material yang diminta tidak sesuai spesifikasi teknis',
            'Budget periode ini belum tersedia atau sudah habis',
            'Request perlu direvisi dan diajukan ulang',
            'Duplikasi permintaan dari departemen yang sama',
            'Permintaan tidak sesuai prosedur pengajuan material',
            'Jumlah yang diminta melebihi kebutuhan aktual',
            'Material sudah tersedia di lokasi penyimpanan lain',
            'GL Account tidak sesuai dengan kategori material yang diminta',
        ];

        $cancellationReasons = [
            'Request dibatalkan setelah approval karena material tidak lagi dibutuhkan',
            'Pekerjaan yang membutuhkan material telah selesai',
            'Dibatalkan karena telah diganti dengan request baru',
        ];

        $historyBatch = [];
        $batchSize = 200;

        foreach ($requests as $req) {
            $status = $req->status;
            $approverId = $req->approver_id ?? $approverIds[0];
            $reqCreatedAt = Carbon::parse($req->created_at);

            // Check if history already exists for this request
            $exists = DB::table('approval_histories')
                ->where('request_id', $req->id)
                ->exists();

            if ($exists) {
                continue;
            }

            if ($status === 'SUBMITTED' || $status === 'PENDING_APPROVAL') {
                // Just a submitted record, no final action yet — optional
                // We'll add a SUBMITTED note
                $historyBatch[] = [
                    'request_id' => $req->id,
                    'approver_id' => $approverId,
                    'action' => 'SUBMITTED',
                    'reason' => null,
                    'action_at' => $reqCreatedAt->copy()->addHours(mt_rand(1, 4))->toDateTimeString(),
                    'created_at' => $reqCreatedAt->toDateTimeString(),
                    'updated_at' => $reqCreatedAt->toDateTimeString(),
                ];
            }

            if (in_array($status, ['APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED_AFTER_APPROVAL'])) {
                $actionAt = $req->approved_at
                    ? Carbon::parse($req->approved_at)->toDateTimeString()
                    : $reqCreatedAt->copy()->addDays(mt_rand(1, 2))->toDateTimeString();

                $historyBatch[] = [
                    'request_id' => $req->id,
                    'approver_id' => $approverId,
                    'action' => 'APPROVED',
                    'reason' => null,
                    'action_at' => $actionAt,
                    'created_at' => $actionAt,
                    'updated_at' => $actionAt,
                ];

                // CANCELLED_AFTER_APPROVAL also needs a cancellation entry
                if ($status === 'CANCELLED_AFTER_APPROVAL') {
                    $cancelAt = Carbon::parse($actionAt)->addDays(mt_rand(1, 5))->toDateTimeString();
                    $historyBatch[] = [
                        'request_id' => $req->id,
                        'approver_id' => $approverId,
                        'action' => 'CANCELLED',
                        'reason' => $cancellationReasons[array_rand($cancellationReasons)],
                        'action_at' => $cancelAt,
                        'created_at' => $cancelAt,
                        'updated_at' => $cancelAt,
                    ];
                }
            }

            if ($status === 'REJECTED') {
                $actionAt = $req->rejected_at
                    ? Carbon::parse($req->rejected_at)->toDateTimeString()
                    : $reqCreatedAt->copy()->addDays(mt_rand(1, 3))->toDateTimeString();

                $historyBatch[] = [
                    'request_id' => $req->id,
                    'approver_id' => $approverId,
                    'action' => 'REJECTED',
                    'reason' => $req->rejection_reason ?? $rejectionReasons[array_rand($rejectionReasons)],
                    'action_at' => $actionAt,
                    'created_at' => $actionAt,
                    'updated_at' => $actionAt,
                ];
            }

            if (count($historyBatch) >= $batchSize) {
                DB::table('approval_histories')->insert($historyBatch);
                $historyBatch = [];
            }
        }

        if (! empty($historyBatch)) {
            DB::table('approval_histories')->insert($historyBatch);
        }

        $total = DB::table('approval_histories')->count();
        $this->command->info("ApprovalHistorySeeder: {$total} approval histories seeded.");
    }
}

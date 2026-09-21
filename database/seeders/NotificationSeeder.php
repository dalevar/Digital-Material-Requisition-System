<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        $allUsers = DB::table('users')
            ->where('status', 'ACTIVE')
            ->pluck('id')
            ->toArray();

        $approverRoleId = DB::table('roles')->where('name', 'APPROVER')->value('id');
        $approverIds = DB::table('users')
            ->where('role_id', $approverRoleId)
            ->pluck('id')
            ->toArray();

        $userRoleId = DB::table('roles')->where('name', 'USER')->value('id');
        $userIds = DB::table('users')
            ->where('role_id', $userRoleId)
            ->where('status', 'ACTIVE')
            ->pluck('id')
            ->toArray();

        $requests = DB::table('material_requests')
            ->select('id', 'request_no', 'status', 'requester_id', 'approver_id', 'created_at')
            ->limit(500)
            ->get()
            ->toArray();

        $startDate = Carbon::parse('2025-10-01');
        $endDate = Carbon::parse('2026-09-21');

        $notifBatch = [];
        $batchSize = 500;
        $total = 0;
        $targetTotal = 20;

        // ---------------------------------------------------------------
        // 1. Notification from actual request statuses
        // ---------------------------------------------------------------
        foreach ($requests as $idx => $req) {
            $reqDate = Carbon::parse($req->created_at);

            $types = $this->getNotifTypesForStatus($req->status);
            foreach ($types as $notifDef) {
                // Determine recipient
                $recipientId = match ($notifDef['audience']) {
                    'approver' => $req->approver_id ?? ($approverIds[0] ?? null),
                    'requester' => $req->requester_id,
                    default => $req->requester_id,
                };

                if (! $recipientId) {
                    continue;
                }

                $isRead = ($idx % 10 < 7); // 70% read
                $readAt = $isRead ? $reqDate->copy()->addHours(mt_rand(1, 24))->toDateTimeString() : null;
                $notifAt = $reqDate->copy()->addHours(mt_rand(0, 2))->toDateTimeString();

                $notifBatch[] = [
                    'user_id' => $recipientId,
                    'type' => $notifDef['type'],
                    'title' => str_replace(':request_no', $req->request_no, $notifDef['title']),
                    'message' => str_replace(':request_no', $req->request_no, $notifDef['message']),
                    'is_read' => $isRead,
                    'read_at' => $readAt,
                    'metadata' => json_encode(['request_id' => $req->id, 'request_no' => $req->request_no]),
                    'created_at' => $notifAt,
                    'updated_at' => $notifAt,
                ];

                $total++;

                if (count($notifBatch) >= $batchSize) {
                    DB::table('notifications')->insert($notifBatch);
                    $notifBatch = [];
                }
            }

            if ($total >= $targetTotal) {
                break;
            }
        }

        // ---------------------------------------------------------------
        // 2. Pad with stock warning notifications if still under target
        // ---------------------------------------------------------------
        if ($total < $targetTotal) {
            $lowStockMaterials = DB::table('stock_balances')
                ->join('materials', 'materials.id', '=', 'stock_balances.material_id')
                ->where('stock_balances.quantity', '<=', DB::raw('materials.minimum_stock'))
                ->where('materials.status', 'ACTIVE')
                ->select('materials.id', 'materials.material_number', 'materials.description',
                    'stock_balances.quantity', 'materials.minimum_stock')
                ->limit(200)
                ->get();

            $adminIds = DB::table('users')
                ->where('role_id', DB::table('roles')->where('name', 'ADMIN')->value('id'))
                ->pluck('id')
                ->toArray();

            $stockWarningRecipients = array_merge($adminIds, $approverIds);

            foreach ($lowStockMaterials as $mat) {
                if ($total >= $targetTotal) {
                    break;
                }

                foreach ($stockWarningRecipients as $uid) {
                    if ($total >= $targetTotal) {
                        break;
                    }

                    $isOutOfStock = ((float) $mat->quantity <= 0);
                    $notifType = $isOutOfStock ? 'STOCK_OUT_ALERT' : 'STOCK_LOW_ALERT';
                    $titleText = $isOutOfStock
                        ? "OUT OF STOCK: {$mat->material_number}"
                        : "LOW STOCK WARNING: {$mat->material_number}";
                    $msgText = $isOutOfStock
                        ? "Material {$mat->description} telah habis (SOH: {$mat->quantity}). Segera lakukan pembelian."
                        : "Stok material {$mat->description} mendekati batas minimum (SOH: {$mat->quantity}, Min: {$mat->minimum_stock}).";

                    $randomDate = $startDate->copy()->addDays(mt_rand(0, 300))->toDateTimeString();
                    $isRead = (mt_rand(0, 9) < 7);

                    $notifBatch[] = [
                        'user_id' => $uid,
                        'type' => $notifType,
                        'title' => $titleText,
                        'message' => $msgText,
                        'is_read' => $isRead,
                        'read_at' => $isRead ? Carbon::parse($randomDate)->addHours(2)->toDateTimeString() : null,
                        'metadata' => json_encode(['material_id' => $mat->id, 'quantity' => $mat->quantity]),
                        'created_at' => $randomDate,
                        'updated_at' => $randomDate,
                    ];

                    $total++;

                    if (count($notifBatch) >= $batchSize) {
                        DB::table('notifications')->insert($notifBatch);
                        $notifBatch = [];
                    }
                }
            }
        }

        // ---------------------------------------------------------------
        // 3. Additional generic notifications to reach target
        // ---------------------------------------------------------------
        $genericTypes = [
            ['type' => 'SYSTEM_INFO',    'title' => 'Sistem DMRS diperbarui',   'message' => 'Sistem DMRS telah diperbarui ke versi terbaru. Silakan cek changelog.'],
            ['type' => 'SYSTEM_INFO',    'title' => 'Jadwal maintenance sistem', 'message' => 'Sistem akan dilakukan maintenance pada Sabtu pukul 22:00 WIB.'],
            ['type' => 'REMINDER',       'title' => 'Stock opname minggu ini',   'message' => 'Harap lakukan verifikasi stok fisik sebelum akhir minggu.'],
            ['type' => 'REMINDER',       'title' => 'Request belum diproses',    'message' => 'Terdapat beberapa material request yang belum diproses.'],
        ];

        $allUserCount = count($allUsers);
        $idx = 0;
        while ($total < $targetTotal) {
            $notifDef = $genericTypes[$idx % count($genericTypes)];
            $uid = $allUsers[$idx % $allUserCount];
            $randDate = $startDate->copy()->addDays(mt_rand(0, 355))->toDateTimeString();
            $isRead = (mt_rand(0, 9) < 7);

            $notifBatch[] = [
                'user_id' => $uid,
                'type' => $notifDef['type'],
                'title' => $notifDef['title'],
                'message' => $notifDef['message'],
                'is_read' => $isRead,
                'read_at' => $isRead ? Carbon::parse($randDate)->addHours(1)->toDateTimeString() : null,
                'metadata' => null,
                'created_at' => $randDate,
                'updated_at' => $randDate,
            ];

            $total++;
            $idx++;

            if (count($notifBatch) >= $batchSize) {
                DB::table('notifications')->insert($notifBatch);
                $notifBatch = [];
            }
        }

        if (! empty($notifBatch)) {
            DB::table('notifications')->insert($notifBatch);
        }

        $dbTotal = DB::table('notifications')->count();
        $unread = DB::table('notifications')->where('is_read', false)->count();
        $read = DB::table('notifications')->where('is_read', true)->count();
        $this->command->info("NotificationSeeder: {$dbTotal} notifications seeded (read: {$read}, unread: {$unread}).");
    }

    /**
     * @return array<int, array{type: string, title: string, message: string, audience: string}>
     */
    private function getNotifTypesForStatus(string $status): array
    {
        return match ($status) {
            'SUBMITTED', 'PENDING_APPROVAL' => [
                [
                    'type' => 'REQUEST_PENDING',
                    'title' => 'Request :request_no menunggu persetujuan',
                    'message' => 'Material request :request_no telah diajukan dan menunggu persetujuan Anda.',
                    'audience' => 'approver',
                ],
            ],
            'APPROVED' => [
                [
                    'type' => 'REQUEST_APPROVED',
                    'title' => 'Request :request_no disetujui',
                    'message' => 'Material request :request_no telah disetujui. Proses pengambilan material akan segera dilakukan.',
                    'audience' => 'requester',
                ],
            ],
            'REJECTED' => [
                [
                    'type' => 'REQUEST_REJECTED',
                    'title' => 'Request :request_no ditolak',
                    'message' => 'Material request :request_no telah ditolak. Silakan periksa alasan penolakan dan ajukan kembali jika diperlukan.',
                    'audience' => 'requester',
                ],
            ],
            'COMPLETED' => [
                [
                    'type' => 'REQUEST_COMPLETED',
                    'title' => 'Request :request_no selesai',
                    'message' => 'Material request :request_no telah selesai diproses. Material sudah dapat diambil.',
                    'audience' => 'requester',
                ],
            ],
            'CANCELLED', 'CANCELLED_AFTER_APPROVAL' => [
                [
                    'type' => 'REQUEST_CANCELLED',
                    'title' => 'Request :request_no dibatalkan',
                    'message' => 'Material request :request_no telah dibatalkan.',
                    'audience' => 'requester',
                ],
            ],
            'PROCESSING' => [
                [
                    'type' => 'REQUEST_PROCESSING',
                    'title' => 'Request :request_no sedang diproses',
                    'message' => 'Material request :request_no sedang dalam proses pengeluaran material dari gudang.',
                    'audience' => 'requester',
                ],
            ],
            default => [],
        };
    }
}

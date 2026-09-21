<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $allUsers = DB::table('users')
            ->select('id', 'role_id')
            ->get()
            ->toArray();

        $roleNames = DB::table('roles')->pluck('name', 'id')->toArray();

        $startDate = Carbon::parse('2025-10-01');
        $endDate = Carbon::parse('2026-09-21');
        $targetTotal = 20;
        $batchSize = 500;
        $userCount = count($allUsers);

        if ($userCount === 0) {
            $this->command->warn('No users found, skipping AuditLogSeeder.');

            return;
        }

        $ipPool = [
            '192.168.1.10',  '192.168.1.11',  '192.168.1.15',
            '192.168.1.20',  '192.168.2.100', '192.168.2.101',
            '10.0.0.50',     '10.0.0.51',     '10.0.0.55',
            '172.16.0.10',   '172.16.0.11',   '127.0.0.1',
        ];

        $userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0',
        ];

        // Action + module combinations
        $actionModuleCombinations = [
            // AUTH actions
            ['action' => 'LOGIN',    'module' => 'AUTH',     'record_type' => 'User',    'desc' => 'User melakukan login ke sistem'],
            ['action' => 'LOGOUT',   'module' => 'AUTH',     'record_type' => 'User',    'desc' => 'User melakukan logout dari sistem'],
            // MATERIAL actions
            ['action' => 'CREATE',   'module' => 'MATERIAL', 'record_type' => 'Material', 'desc' => 'Material baru ditambahkan ke sistem'],
            ['action' => 'UPDATE',   'module' => 'MATERIAL', 'record_type' => 'Material', 'desc' => 'Data material diperbarui'],
            ['action' => 'DELETE',   'module' => 'MATERIAL', 'record_type' => 'Material', 'desc' => 'Material dihapus dari sistem'],
            // REQUEST actions
            ['action' => 'CREATE',   'module' => 'REQUEST',  'record_type' => 'MaterialRequest', 'desc' => 'Material request baru dibuat'],
            ['action' => 'SUBMIT',   'module' => 'REQUEST',  'record_type' => 'MaterialRequest', 'desc' => 'Material request diajukan untuk approval'],
            ['action' => 'UPDATE',   'module' => 'REQUEST',  'record_type' => 'MaterialRequest', 'desc' => 'Data material request diperbarui'],
            ['action' => 'CANCEL',   'module' => 'REQUEST',  'record_type' => 'MaterialRequest', 'desc' => 'Material request dibatalkan'],
            // APPROVAL actions
            ['action' => 'APPROVE',  'module' => 'APPROVAL', 'record_type' => 'MaterialRequest', 'desc' => 'Material request disetujui oleh approver'],
            ['action' => 'REJECT',   'module' => 'APPROVAL', 'record_type' => 'MaterialRequest', 'desc' => 'Material request ditolak oleh approver'],
            // STOCK actions
            ['action' => 'STOCK_IN', 'module' => 'STOCK',    'record_type' => 'StockTransaction', 'desc' => 'Penerimaan material dari supplier'],
            ['action' => 'STOCK_OUT', 'module' => 'STOCK',    'record_type' => 'StockTransaction', 'desc' => 'Pengeluaran material berdasarkan request'],
            ['action' => 'ADJUSTMENT', 'module' => 'STOCK',   'record_type' => 'StockTransaction', 'desc' => 'Penyesuaian stok berdasarkan hasil opname'],
            ['action' => 'REVERSAL', 'module' => 'STOCK',    'record_type' => 'StockTransaction', 'desc' => 'Pengembalian material ke stok (reversal)'],
            // USER management
            ['action' => 'CREATE',   'module' => 'USER',     'record_type' => 'User',    'desc' => 'User baru ditambahkan ke sistem'],
            ['action' => 'UPDATE',   'module' => 'USER',     'record_type' => 'User',    'desc' => 'Data user diperbarui'],
            // REPORT
            ['action' => 'EXPORT',   'module' => 'REPORT',   'record_type' => 'Report',  'desc' => 'Laporan diekspor ke Excel/PDF'],
            ['action' => 'DOWNLOAD', 'module' => 'REPORT',   'record_type' => 'Report',  'desc' => 'Dokumen diunduh dari sistem'],
            // AUDIT
            ['action' => 'EXPORT',   'module' => 'AUDIT',    'record_type' => 'AuditLog', 'desc' => 'Log audit diekspor'],
        ];

        // Sample old/new value pairs for UPDATE actions
        $updatePairs = [
            [
                'old' => ['cost_center' => 'CC-001'],
                'new' => ['cost_center' => 'CC-002'],
            ],
            [
                'old' => ['gl_account' => 'GL-501001'],
                'new' => ['gl_account' => 'GL-502001'],
            ],
            [
                'old' => ['status' => 'DRAFT'],
                'new' => ['status' => 'SUBMITTED'],
            ],
            [
                'old' => ['status' => 'SUBMITTED'],
                'new' => ['status' => 'PENDING_APPROVAL'],
            ],
            [
                'old' => ['status' => 'APPROVED'],
                'new' => ['status' => 'PROCESSING'],
            ],
            [
                'old' => ['status' => 'PROCESSING'],
                'new' => ['status' => 'COMPLETED'],
            ],
            [
                'old' => ['minimum_stock' => 10],
                'new' => ['minimum_stock' => 15],
            ],
            [
                'old' => ['maximum_stock' => 100],
                'new' => ['maximum_stock' => 150],
            ],
            [
                'old' => ['storage_location' => 'RACK-A1'],
                'new' => ['storage_location' => 'RACK-A2'],
            ],
            [
                'old' => ['position' => 'Field Technician'],
                'new' => ['position' => 'Senior Field Technician'],
            ],
        ];

        $combinationCount = count($actionModuleCombinations);
        $logBatch = [];
        $inserted = 0;

        $this->command->info("Generating {$targetTotal} audit logs...");

        for ($i = 0; $i < $targetTotal; $i++) {
            $combo = $actionModuleCombinations[$i % $combinationCount];
            $user = $allUsers[$i % $userCount];
            $roleName = $roleNames[$user->role_id] ?? 'USER';

            // Random date within range
            $daysOffset = (int) (($i / $targetTotal) * $startDate->diffInDays($endDate));
            $logDate = $startDate->copy()->addDays($daysOffset)->addHours(mt_rand(6, 20))->addMinutes(mt_rand(0, 59));
            $logDateStr = $logDate->toDateTimeString();

            $isUpdate = ($combo['action'] === 'UPDATE');
            $pair = $isUpdate ? $updatePairs[$i % count($updatePairs)] : null;

            $recordId = null;
            if ($combo['record_type'] !== 'Report' && $combo['record_type'] !== 'AuditLog') {
                $recordId = (string) (($i % 500) + 1);
            }

            $logBatch[] = [
                'user_id' => $user->id,
                'role' => $roleName,
                'action' => $combo['action'],
                'module' => $combo['module'],
                'record_type' => $combo['record_type'],
                'record_id' => $recordId,
                'old_value' => $pair ? json_encode($pair['old']) : null,
                'new_value' => $pair ? json_encode($pair['new']) : null,
                'ip_address' => $ipPool[$i % count($ipPool)],
                'user_agent' => $userAgents[$i % count($userAgents)],
                'description' => $combo['desc'],
                'created_at' => $logDateStr,
                'updated_at' => $logDateStr,
            ];

            $inserted++;

            if (count($logBatch) >= $batchSize) {
                DB::table('audit_logs')->insert($logBatch);
                $logBatch = [];
            }
        }

        if (! empty($logBatch)) {
            DB::table('audit_logs')->insert($logBatch);
        }

        $total = DB::table('audit_logs')->count();
        $this->command->info("AuditLogSeeder: {$total} audit logs seeded.");
    }
}

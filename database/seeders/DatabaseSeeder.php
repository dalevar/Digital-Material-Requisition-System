<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * DMRS DatabaseSeeder
 *
 * DEVELOPMENT / TEST DATA — Do NOT run in production.
 *
 * Generates a comprehensive dataset for testing:
 *  - UI with large datasets
 *  - Pagination, search, filter, sorting
 *  - Dashboard KPIs
 *  - Approval workflow
 *  - Stock management & history
 *  - Material requests
 *  - Notifications & audit trail
 *  - Export (Excel/CSV/PDF)
 *  - Query performance
 *
 * Run with: php artisan migrate:fresh --seed
 *        or: php artisan db:seed
 *
 * Dependency order:
 *   Roles → Departments → Plants → MaterialCategories
 *   → Users → Materials → StockBalances
 *   → MaterialRequests → MaterialRequestItems
 *   → ApprovalHistories → StockTransactions
 *   → Notifications → AuditLogs
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  DMRS SEEDER — DEVELOPMENT DATA');
        $this->command->info('========================================');
        $this->command->info('');

        // Disable FK checks during seeding (MySQL-compatible)
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $this->call([
            RoleSeeder::class,
            DepartmentSeeder::class,
            PlantSeeder::class,
            MaterialCategorySeeder::class,
            UserSeeder::class,
            MaterialSeeder::class,
            StockBalanceSeeder::class,
            MaterialRequestSeeder::class,
            MaterialRequestItemSeeder::class,
            ApprovalHistorySeeder::class,
            StockTransactionSeeder::class,
            NotificationSeeder::class,
            AuditLogSeeder::class,
        ]);

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->printSummary();
    }

    private function printSummary(): void
    {
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  DMRS DATABASE SEED SUMMARY');
        $this->command->info('========================================');
        $this->command->info('');

        $tables = [
            'Roles' => 'roles',
            'Departments' => 'departments',
            'Plants' => 'plants',
            'Material Categories' => 'material_categories',
            'Users' => 'users',
            'Materials' => 'materials',
            'Stock Balances' => 'stock_balances',
            'Material Requests' => 'material_requests',
            'Request Items' => 'material_request_items',
            'Approval Histories' => 'approval_histories',
            'Stock Transactions' => 'stock_transactions',
            'Notifications' => 'notifications',
            'Audit Logs' => 'audit_logs',
        ];

        foreach ($tables as $label => $table) {
            $count = DB::table($table)->count();
            $this->command->line(sprintf('  %-24s %s', $label.':', number_format($count)));
        }

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  DATA VALIDATION');
        $this->command->info('========================================');
        $this->command->info('');

        $this->validateData();

        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  DEVELOPMENT ACCOUNTS');
        $this->command->info('========================================');
        $this->command->info('  Admin   : admin / admin');
        $this->command->info('  Approver: approver / password');
        $this->command->info('  User    : user / password');
        $this->command->info('');
        $this->command->info('========================================');
        $this->command->info('  SEED COMPLETED SUCCESSFULLY');
        $this->command->info('========================================');
        $this->command->info('');
    }

    private function validateData(): void
    {
        // 1. Request numbers unique
        $totalReq = DB::table('material_requests')->count();
        $uniqueReqNo = DB::table('material_requests')->distinct('request_no')->count('request_no');
        $this->check('Request numbers unique', $totalReq === $uniqueReqNo);

        // 2. Material numbers unique
        $totalMat = DB::table('materials')->count();
        $uniqueMatNo = DB::table('materials')->distinct('material_number')->count('material_number');
        $this->check('Material numbers unique', $totalMat === $uniqueMatNo);

        // 3. All users have valid roles
        $invalidRoleUsers = DB::table('users')
            ->leftJoin('roles', 'users.role_id', '=', 'roles.id')
            ->whereNull('roles.id')
            ->count();
        $this->check('Users have valid roles', $invalidRoleUsers === 0);

        // 4. All users have valid departments (nullable, so check only where set)
        $invalidDeptUsers = DB::table('users')
            ->whereNotNull('department_id')
            ->leftJoin('departments', 'users.department_id', '=', 'departments.id')
            ->whereNull('departments.id')
            ->count();
        $this->check('Users have valid departments', $invalidDeptUsers === 0);

        // 5. All users have valid plants (nullable)
        $invalidPlantUsers = DB::table('users')
            ->whereNotNull('plant_id')
            ->leftJoin('plants', 'users.plant_id', '=', 'plants.id')
            ->whereNull('plants.id')
            ->count();
        $this->check('Users have valid plants', $invalidPlantUsers === 0);

        // 6. Requesters have valid approvers (USER role → approver_id references APPROVER)
        $userRoleId = DB::table('roles')->where('name', 'USER')->value('id');
        $approverRoleId = DB::table('roles')->where('name', 'APPROVER')->value('id');

        $invalidApprover = DB::table('users as u')
            ->where('u.role_id', $userRoleId)
            ->whereNotNull('u.approver_id')
            ->join('users as a', 'u.approver_id', '=', 'a.id')
            ->where('a.role_id', '!=', $approverRoleId)
            ->count();
        $this->check('Requesters have valid approvers', $invalidApprover === 0);

        // 7. Request items reference valid materials
        $orphanItems = DB::table('material_request_items')
            ->leftJoin('materials', 'material_request_items.material_id', '=', 'materials.id')
            ->whereNull('materials.id')
            ->count();
        $this->check('Request items reference valid materials', $orphanItems === 0);

        // 8. Stock transactions reference valid materials
        $orphanTx = DB::table('stock_transactions')
            ->leftJoin('materials', 'stock_transactions.material_id', '=', 'materials.id')
            ->whereNull('materials.id')
            ->count();
        $this->check('Stock transactions reference valid materials', $orphanTx === 0);

        // 9. Rejected requests have rejection reasons
        $rejectedNoReason = DB::table('material_requests')
            ->where('status', 'REJECTED')
            ->whereNull('rejection_reason')
            ->count();
        $this->check('Rejected requests have rejection reasons', $rejectedNoReason === 0);

        // 10. Approved requests have approval history
        $approvedNoHistory = DB::table('material_requests')
            ->whereIn('status', ['APPROVED', 'PROCESSING', 'COMPLETED', 'CANCELLED_AFTER_APPROVAL'])
            ->whereNotIn('id', function ($query) {
                $query->select('request_id')->from('approval_histories')->where('action', 'APPROVED');
            })
            ->count();
        $this->check('Approved requests have approval history', $approvedNoHistory === 0);

        // 11. Stock balances are valid (non-negative)
        $negativeStock = DB::table('stock_balances')->where('quantity', '<', 0)->count();
        $this->check('Stock balances are non-negative', $negativeStock === 0);

        // 12. Stock status distribution
        $outOfStock = DB::table('stock_balances')
            ->where('quantity', '<=', 0)
            ->count();
        $lowStock = DB::table('stock_balances')
            ->join('materials', 'materials.id', '=', 'stock_balances.material_id')
            ->where('stock_balances.quantity', '>', 0)
            ->whereColumn('stock_balances.quantity', '<=', 'materials.minimum_stock')
            ->count();
        $normalStock = DB::table('stock_balances')
            ->join('materials', 'materials.id', '=', 'stock_balances.material_id')
            ->whereColumn('stock_balances.quantity', '>', 'materials.minimum_stock')
            ->count();

        $this->command->line("  ℹ  Stock NORMAL: {$normalStock}  LOW: {$lowStock}  OUT: {$outOfStock}");
        $this->check('Out-of-stock materials exist', $outOfStock > 0);
        $this->check('Low-stock materials exist', $lowStock > 0);

        // 13. Multiple request statuses exist
        $statusCounts = DB::table('material_requests')
            ->selectRaw('status, count(*) as cnt')
            ->groupBy('status')
            ->pluck('cnt', 'status')
            ->toArray();

        $requiredStatuses = ['DRAFT', 'APPROVED', 'REJECTED', 'COMPLETED'];
        $allStatusPresent = true;
        foreach ($requiredStatuses as $s) {
            if (empty($statusCounts[$s])) {
                $allStatusPresent = false;
                break;
            }
        }
        $this->check('All key request statuses present', $allStatusPresent);

        // 14. Notifications have read/unread mix
        $unreadCount = DB::table('notifications')->where('is_read', false)->count();
        $this->check('Unread notifications exist', $unreadCount > 0);

        // 15. Audit logs have multiple action types
        $actionCount = DB::table('audit_logs')->distinct('action')->count('action');
        $this->check('Audit logs have multiple actions', $actionCount >= 5);

        // 16. REVERSAL transactions exist
        $reversals = DB::table('stock_transactions')->where('transaction_type', 'REVERSAL')->count();
        $this->check('REVERSAL transactions exist', $reversals > 0);

        // 17. No orphan FK in approval_histories
        $orphanApprovals = DB::table('approval_histories')
            ->leftJoin('material_requests', 'approval_histories.request_id', '=', 'material_requests.id')
            ->whereNull('material_requests.id')
            ->count();
        $this->check('No orphan approval histories', $orphanApprovals === 0);
    }

    private function check(string $label, bool $pass): void
    {
        $icon = $pass ? '✓' : '✗';
        $status = $pass ? '<fg=green>PASS</>' : '<fg=red>FAIL</>';
        $this->command->line("  {$icon}  {$label}");
    }
}

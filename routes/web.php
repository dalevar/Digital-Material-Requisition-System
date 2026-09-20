<?php

use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\MaterialCategoryController;
use App\Http\Controllers\MaterialController;
use App\Http\Controllers\MaterialRequestController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PlantController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\StockController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

// System Health Check Endpoint for Render / Load Balancers
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Redirect root to dashboard or login
Route::get('/', function () {
    return auth()->check() ? redirect('/dashboard') : redirect('/login');
});

// Guest Authentication Routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);

    Route::get('/reset-password/{token?}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('/reset-password', [AuthController::class, 'resetPassword'])->name('password.update');
    Route::get('/reset-password/success', [AuthController::class, 'showResetSuccess'])->name('password.success');
});

// Standalone System Auth States (Accessible for session timeouts, unauthorized, & system error views)
Route::get('/session-expired', [AuthController::class, 'showSessionExpired'])->name('session.expired');
Route::get('/unauthorized', [AuthController::class, 'showUnauthorized'])->name('unauthorized');
Route::get('/authentication-error', [AuthController::class, 'showAuthenticationError'])->name('auth.error');

// Protected Authenticated Routes
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Role Routing Dispatcher
    Route::get('/dashboard', function () {
        $user = auth()->user();
        if ($user->isAdmin()) {
            return redirect('/admin/dashboard');
        }
        if ($user->isApprover()) {
            return redirect('/approver/dashboard');
        }

        return app(DashboardController::class)->userDashboard(request());
    })->name('dashboard');

    Route::get('/user/dashboard', [DashboardController::class, 'userDashboard'])->name('user.dashboard');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read-all');

    // User Profile
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');

    // Approval Monitoring & Inbox
    Route::middleware('role:APPROVER,EXECUTIVE,ADMIN')->get('/approvals/inbox', [ApprovalController::class, 'inbox'])->name('approvals.inbox');

    // Approver Dashboard & Decision Actions (Approver / Executive only)
    Route::middleware('role:APPROVER,EXECUTIVE')->group(function () {
        Route::get('/approver/dashboard', [DashboardController::class, 'approverDashboard'])->name('approver.dashboard');
        Route::post('/approvals/{materialRequest}/approve', [ApprovalController::class, 'approve'])->name('approvals.approve');
        Route::post('/approvals/{materialRequest}/reject', [ApprovalController::class, 'reject'])->name('approvals.reject');
    });

    // Admin Routes
    Route::middleware('role:ADMIN')->group(function () {
        Route::get('/admin/dashboard', [DashboardController::class, 'adminDashboard'])->name('admin.dashboard');
        Route::get('/admin/users', [UserController::class, 'index'])->name('admin.users.index');
        Route::post('/admin/users', [UserController::class, 'store'])->name('admin.users.store');
        Route::put('/admin/users/{user}', [UserController::class, 'update'])->name('admin.users.update');
        Route::post('/admin/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('admin.users.reset-password');

        Route::get('/admin/materials', [MaterialController::class, 'index'])->name('admin.materials.index');
        Route::get('/admin/materials/excel', [MaterialController::class, 'exportExcel'])->name('admin.materials.excel');
        Route::post('/admin/materials', [MaterialController::class, 'store'])->name('admin.materials.store');
        Route::put('/admin/materials/{material}', [MaterialController::class, 'update'])->name('admin.materials.update');

        Route::get('/admin/departments', [DepartmentController::class, 'index'])->name('admin.departments.index');
        Route::post('/admin/departments', [DepartmentController::class, 'store'])->name('admin.departments.store');
        Route::put('/admin/departments/{department}', [DepartmentController::class, 'update'])->name('admin.departments.update');

        Route::get('/admin/plants', [PlantController::class, 'index'])->name('admin.plants.index');
        Route::post('/admin/plants', [PlantController::class, 'store'])->name('admin.plants.store');
        Route::put('/admin/plants/{plant}', [PlantController::class, 'update'])->name('admin.plants.update');

        Route::get('/admin/categories', [MaterialCategoryController::class, 'index'])->name('admin.categories.index');
        Route::post('/admin/categories', [MaterialCategoryController::class, 'store'])->name('admin.categories.store');
        Route::put('/admin/categories/{category}', [MaterialCategoryController::class, 'update'])->name('admin.categories.update');

        Route::get('/admin/audit-logs', [AuditLogController::class, 'index'])->name('admin.audit.index');

        // Admin Approved MRF Supplement & Cancellation
        Route::patch('/admin/requests/{materialRequest}/supplement', [MaterialRequestController::class, 'supplement'])->name('admin.requests.supplement');
        Route::post('/admin/requests/{materialRequest}/cancel', [MaterialRequestController::class, 'cancelApproved'])->name('admin.requests.cancel');
        Route::post('/admin/requests/{materialRequest}/issue-stock', [StockController::class, 'issueStockForRequest'])->name('admin.requests.issue-stock');

        // Inventory Routes
        Route::get('/inventory/overview', [StockController::class, 'overview'])->name('inventory.overview');
        Route::get('/inventory/history', [StockController::class, 'history'])->name('inventory.history');
        Route::get('/inventory/history/excel', [StockController::class, 'exportHistoryExcel'])->name('inventory.history.excel');
        Route::post('/inventory/stock-in', [StockController::class, 'stockIn'])->middleware('role:ADMIN')->name('inventory.stock-in');
        Route::post('/inventory/stock-adjustment', [StockController::class, 'stockAdjustment'])->middleware('role:ADMIN')->name('inventory.stock-adjustment');
    });

    // Material Request Core Routes
    Route::get('/requests', [MaterialRequestController::class, 'index'])->name('requests.index');
    Route::get('/requests/create', [MaterialRequestController::class, 'create'])->name('requests.create');
    Route::post('/requests', [MaterialRequestController::class, 'store'])->name('requests.store');
    Route::get('/requests/{materialRequest}', [MaterialRequestController::class, 'show'])->name('requests.show');
    Route::post('/requests/{materialRequest}/submit', [MaterialRequestController::class, 'submit'])->name('requests.submit');
    Route::get('/requests/{materialRequest}/pdf', [MaterialRequestController::class, 'downloadPdf'])->name('requests.pdf');

    // Report Routes
    Route::get('/reports/requests', [ReportController::class, 'requestReport'])->name('reports.requests');
    Route::get('/reports/stock', [ReportController::class, 'stockReport'])->middleware('role:ADMIN,APPROVER,EXECUTIVE')->name('reports.stock');
    Route::get('/reports/stock/excel', [ReportController::class, 'exportStockExcel'])->middleware('role:ADMIN,APPROVER,EXECUTIVE')->name('reports.stock.excel');
    Route::get('/reports/stock-movement', fn() => redirect()->route('reports.stock'))->middleware('role:ADMIN,APPROVER,EXECUTIVE');
    Route::get('/reports/stock-movement/excel', [ReportController::class, 'exportStockExcel'])->middleware('role:ADMIN,APPROVER,EXECUTIVE');
    Route::get('/reports/approvals', [ReportController::class, 'approvalReport'])->middleware('role:ADMIN,APPROVER,EXECUTIVE')->name('reports.approvals');
    Route::get('/reports/requests/excel', [ReportController::class, 'exportRequestExcel'])->name('reports.requests.excel');
    Route::get('/reports/approvals/excel', [ReportController::class, 'exportApprovalExcel'])->middleware('role:ADMIN,APPROVER,EXECUTIVE')->name('reports.approvals.excel');
});

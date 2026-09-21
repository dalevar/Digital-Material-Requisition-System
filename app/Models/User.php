<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'employee_id',
        'username',
        'name',
        'email',
        'password',
        'department_id',
        'plant_id',
        'role_id',
        'approver_id',
        'position',
        'status',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function plant(): BelongsTo
    {
        return $this->belongsTo(Plant::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(User::class, 'approver_id');
    }

    public function materialRequests(): HasMany
    {
        return $this->hasMany(MaterialRequest::class, 'requester_id');
    }

    public function approvalRequests(): HasMany
    {
        return $this->hasMany(MaterialRequest::class, 'approver_id');
    }

    public function approvalHistories(): HasMany
    {
        return $this->hasMany(ApprovalHistory::class, 'approver_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function isAdmin(): bool
    {
        return $this->role?->name === 'ADMIN';
    }

    public function isApprover(): bool
    {
        return $this->role?->name === 'APPROVER' || $this->role?->name === 'EXECUTIVE';
    }

    public function isUser(): bool
    {
        return $this->role?->name === 'USER';
    }
}

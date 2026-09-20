<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'employee_id' => 'EMP-' . fake()->unique()->numberBetween(10000, 99999),
            'username' => fake()->unique()->userName(),
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => static::$password ??= Hash::make('password'),
            'role_id' => Role::firstOrCreate(['name' => 'USER'], ['description' => 'Requester User'])->id,
            'status' => 'ACTIVE',
            'remember_token' => Str::random(10),
        ];
    }
}

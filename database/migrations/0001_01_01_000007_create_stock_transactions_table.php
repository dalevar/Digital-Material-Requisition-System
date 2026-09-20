<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('materials');
            $table->enum('transaction_type', ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'REVERSAL']);
            $table->string('reference_type')->nullable();
            $table->string('reference_id')->nullable();
            $table->string('reference_no')->nullable();
            $table->decimal('qty_in', 12, 2)->default(0);
            $table->decimal('qty_out', 12, 2)->default(0);
            $table->decimal('balance_after', 12, 2)->default(0);
            $table->string('supplier')->nullable();
            $table->string('storage_location')->nullable();
            $table->text('reason')->nullable();
            $table->dateTime('transaction_date');
            $table->foreignId('user_id')->constrained('users');
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transactions');
    }
};

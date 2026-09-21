<?php

namespace App\Exceptions;

use Exception;

class InsufficientStockException extends Exception
{
    public function __construct(
        string $message = 'Insufficient stock available for requisition.',
        public array $details = []
    ) {
        parent::__construct($message);
    }
}

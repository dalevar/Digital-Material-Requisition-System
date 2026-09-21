<?php

namespace App\Exceptions;

use Exception;

class InvalidRequestStateException extends Exception
{
    public function __construct(
        string $message = 'The material request is not in a valid state for this operation.'
    ) {
        parent::__construct($message);
    }
}

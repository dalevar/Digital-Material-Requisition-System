<?php

namespace App\Enums;

enum StockTransactionType: string
{
    case STOCK_IN = 'STOCK_IN';
    case STOCK_OUT = 'STOCK_OUT';
    case ADJUSTMENT = 'ADJUSTMENT';
    case REVERSAL = 'REVERSAL';
}

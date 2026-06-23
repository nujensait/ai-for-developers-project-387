<?php

namespace App\Exception;

class ConflictException extends \RuntimeException
{
    public function __construct(string $message = 'The requested slot is already booked')
    {
        parent::__construct($message);
    }
}

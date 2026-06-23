<?php

namespace App\Service;

use App\DTO\SlotDTO;
use App\Repository\BookingRepository;

class AvailabilityService
{
    public function __construct(
        private readonly BookingRepository $bookingRepository,
        private readonly int $workingHoursStart = 9,
        private readonly int $workingHoursEnd = 21,
        private readonly int $availabilityDays = 14,
        private readonly int $slotInterval = 30,
    ) {
    }

    /**
     * Builds the availability grid for the given period.
     *
     * @return SlotDTO[]
     */
    public function getSlots(string $eventTypeId, \DateTimeImmutable $from, \DateTimeImmutable $to): array
    {
        $utc = new \DateTimeZone('UTC');
        $current = $from->setTimezone($utc)->setTime(0, 0);
        $end = $to->setTimezone($utc)->setTime(0, 0);

        $slots = [];
        $maxDays = $this->availabilityDays;

        while ($current <= $end && $maxDays > 0) {
            $dayStart = $current->setTime($this->workingHoursStart, 0);
            $dayEnd = $current->setTime($this->workingHoursEnd, 0);

            $slotStart = $dayStart;
            while ($slotStart < $dayEnd) {
                $slotEnd = $slotStart->modify(sprintf('+%d minutes', $this->slotInterval));

                $isAvailable = $this->bookingRepository->findConflicting($slotStart, $slotEnd) === null;
                $slots[] = new SlotDTO($slotStart, $slotEnd, $isAvailable);

                $slotStart = $slotEnd;
            }

            $current = $current->modify('+1 day');
            --$maxDays;
        }

        return $slots;
    }
}

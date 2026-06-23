<?php

namespace App\Tests;

class BookingControllerTest extends AbstractWebTestCase
{
    public function testCreateBookingSuccess(): void
    {
        $eventTypeId = $this->createEventType(30);
        $start = $this->futureUtc('+2 days', 10, 0);

        $data = $this->jsonRequest('POST', '/api/bookings', [
            'eventTypeId' => $eventTypeId,
            'guestName' => 'Ivan Petrov',
            'guestEmail' => 'ivan@example.com',
            'startTime' => $start,
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertArrayHasKey('id', $data);
        $this->assertStringStartsWith('bok_', $data['id']);
        $this->assertSame($start, $data['startTime']);
        // 30-minute event => endTime is 10:30
        $this->assertStringContainsString('T10:30:00Z', $data['endTime']);
    }

    public function testCreateBookingConflict(): void
    {
        $eventTypeId = $this->createEventType(30);
        $start = $this->futureUtc('+3 days', 12, 0);

        $payload = [
            'eventTypeId' => $eventTypeId,
            'guestName' => 'First Guest',
            'guestEmail' => 'first@example.com',
            'startTime' => $start,
        ];

        $this->jsonRequest('POST', '/api/bookings', $payload);
        $this->assertResponseStatusCodeSame(201);

        $conflict = $this->jsonRequest('POST', '/api/bookings', [
            'eventTypeId' => $eventTypeId,
            'guestName' => 'Second Guest',
            'guestEmail' => 'second@example.com',
            'startTime' => $start,
        ]);

        $this->assertResponseStatusCodeSame(409);
        $this->assertSame('CONFLICT', $conflict['code']);
    }

    public function testCreateBookingValidationError(): void
    {
        $eventTypeId = $this->createEventType(30);

        $data = $this->jsonRequest('POST', '/api/bookings', [
            'eventTypeId' => $eventTypeId,
            'guestName' => 'No Email',
            'guestEmail' => 'not-an-email',
            'startTime' => $this->futureUtc(),
        ]);

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('VALIDATION_ERROR', $data['code']);
    }

    public function testCreateBookingUnknownEventType(): void
    {
        $data = $this->jsonRequest('POST', '/api/bookings', [
            'eventTypeId' => 'evt_unknown',
            'guestName' => 'Ghost',
            'guestEmail' => 'ghost@example.com',
            'startTime' => $this->futureUtc(),
        ]);

        $this->assertResponseStatusCodeSame(404);
        $this->assertSame('NOT_FOUND', $data['code']);
    }

    public function testAvailabilityReturnsSlots(): void
    {
        $eventTypeId = $this->createEventType(30);
        $from = (new \DateTimeImmutable('+1 day', new \DateTimeZone('UTC')))->format('Y-m-d\T00:00:00\Z');
        $to = (new \DateTimeImmutable('+1 day', new \DateTimeZone('UTC')))->format('Y-m-d\T23:59:59\Z');

        $slots = $this->jsonRequest('GET', sprintf('/api/availability?eventTypeId=%s&from=%s&to=%s', $eventTypeId, $from, $to));

        $this->assertResponseIsSuccessful();
        $this->assertNotEmpty($slots);
        $this->assertArrayHasKey('start', $slots[0]);
        $this->assertArrayHasKey('end', $slots[0]);
        $this->assertArrayHasKey('isAvailable', $slots[0]);
        $this->assertTrue($slots[0]['isAvailable']);
    }

    public function testAvailabilityMissingParams(): void
    {
        $data = $this->jsonRequest('GET', '/api/availability');

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('VALIDATION_ERROR', $data['code']);
    }
}

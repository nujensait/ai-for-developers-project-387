<?php

namespace App\Tests;

class EventTypeControllerTest extends AbstractWebTestCase
{
    public function testListIsEmptyInitially(): void
    {
        $data = $this->jsonRequest('GET', '/api/event-types');

        $this->assertResponseIsSuccessful();
        $this->assertSame([], $data);
    }

    public function testCreateAndRead(): void
    {
        $created = $this->jsonRequest('POST', '/api/event-types', [
            'title' => 'Strategy session',
            'duration' => 60,
            'description' => 'A longer call',
        ]);

        $this->assertResponseStatusCodeSame(201);
        $this->assertArrayHasKey('id', $created);
        $this->assertStringStartsWith('evt_', $created['id']);
        $this->assertSame('Strategy session', $created['title']);
        $this->assertSame(60, $created['duration']);

        $read = $this->jsonRequest('GET', '/api/event-types/'.$created['id']);
        $this->assertResponseIsSuccessful();
        $this->assertSame($created['id'], $read['id']);
    }

    public function testCreateValidationError(): void
    {
        $data = $this->jsonRequest('POST', '/api/event-types', [
            'title' => '',
            'duration' => 17,
        ]);

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('VALIDATION_ERROR', $data['code']);
    }

    public function testUpdate(): void
    {
        $id = $this->createEventType(30, 'Old title');

        $updated = $this->jsonRequest('PUT', '/api/event-types/'.$id, [
            'title' => 'New title',
            'duration' => 45,
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertSame('New title', $updated['title']);
        $this->assertSame(45, $updated['duration']);
    }

    public function testDelete(): void
    {
        $id = $this->createEventType();

        $this->client->request('DELETE', '/api/event-types/'.$id);
        $this->assertResponseStatusCodeSame(204);

        $this->jsonRequest('GET', '/api/event-types/'.$id);
        $this->assertResponseStatusCodeSame(404);
    }

    public function testReadNotFound(): void
    {
        $data = $this->jsonRequest('GET', '/api/event-types/evt_missing');

        $this->assertResponseStatusCodeSame(404);
        $this->assertSame('NOT_FOUND', $data['code']);
    }
}

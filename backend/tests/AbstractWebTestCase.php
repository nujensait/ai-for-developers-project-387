<?php

namespace App\Tests;

use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\Tools\SchemaTool;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

abstract class AbstractWebTestCase extends WebTestCase
{
    protected KernelBrowser $client;

    protected static function getKernelClass(): string
    {
        return \App\Kernel::class;
    }

    protected function setUp(): void
    {
        $this->client = static::createClient();

        $em = static::getContainer()->get(EntityManagerInterface::class);
        $metadata = $em->getMetadataFactory()->getAllMetadata();

        $schemaTool = new SchemaTool($em);
        $schemaTool->dropDatabase();
        if ($metadata !== []) {
            $schemaTool->createSchema($metadata);
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function jsonRequest(string $method, string $uri, ?array $payload = null): array
    {
        $this->client->request(
            $method,
            $uri,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            $payload !== null ? (string) json_encode($payload) : null,
        );

        $content = $this->client->getResponse()->getContent();

        return $content === '' || $content === false ? [] : (json_decode($content, true) ?? []);
    }

    protected function createEventType(int $duration = 30, string $title = 'Intro call'): string
    {
        $data = $this->jsonRequest('POST', '/api/event-types', [
            'title' => $title,
            'duration' => $duration,
            'description' => 'Test event type',
        ]);

        return $data['id'];
    }

    protected function futureUtc(string $modifier = '+2 days', int $hour = 10, int $minute = 0): string
    {
        return (new \DateTimeImmutable($modifier, new \DateTimeZone('UTC')))
            ->setTime($hour, $minute)
            ->format('Y-m-d\TH:i:s\Z');
    }
}

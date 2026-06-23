<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Initial schema: event_types and bookings.
 */
final class Version20260622000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create event_types and bookings tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE event_types (
            id VARCHAR(32) NOT NULL,
            title VARCHAR(100) NOT NULL,
            description VARCHAR(500) DEFAULT NULL,
            duration INTEGER NOT NULL,
            PRIMARY KEY(id)
        )');

        $this->addSql('CREATE TABLE bookings (
            id VARCHAR(32) NOT NULL,
            event_type_id VARCHAR(32) NOT NULL,
            guest_name VARCHAR(100) NOT NULL,
            guest_email VARCHAR(180) NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        )');

        $this->addSql('CREATE INDEX idx_bookings_interval ON bookings (start_time, end_time)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE bookings');
        $this->addSql('DROP TABLE event_types');
    }
}

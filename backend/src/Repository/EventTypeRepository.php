<?php

namespace App\Repository;

use App\Entity\EventType;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EventType>
 */
class EventTypeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EventType::class);
    }

    public function save(EventType $eventType, bool $flush = true): void
    {
        $em = $this->getEntityManager();
        $em->persist($eventType);
        if ($flush) {
            $em->flush();
        }
    }

    public function remove(EventType $eventType, bool $flush = true): void
    {
        $em = $this->getEntityManager();
        $em->remove($eventType);
        if ($flush) {
            $em->flush();
        }
    }

    /**
     * @return EventType[]
     */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('e')
            ->orderBy('e.title', 'ASC')
            ->getQuery()
            ->getResult();
    }
}

<?php

namespace App\Repository;

use App\Entity\Booking;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Booking>
 */
class BookingRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Booking::class);
    }

    public function save(Booking $booking, bool $flush = true): void
    {
        $em = $this->getEntityManager();
        $em->persist($booking);
        if ($flush) {
            $em->flush();
        }
    }

    public function remove(Booking $booking, bool $flush = true): void
    {
        $em = $this->getEntityManager();
        $em->remove($booking);
        if ($flush) {
            $em->flush();
        }
    }

    /**
     * @return Booking[]
     */
    public function findAllOrdered(): array
    {
        return $this->createQueryBuilder('b')
            ->orderBy('b.startTime', 'ASC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Returns the first booking whose interval overlaps [$start, $end).
     *
     * NOTE: This intentionally checks ALL bookings (single owner calendar),
     * fixing the inverted logic from the original specification where
     * same-eventType bookings were skipped.
     */
    public function findConflicting(\DateTimeImmutable $start, \DateTimeImmutable $end): ?Booking
    {
        return $this->createQueryBuilder('b')
            ->andWhere('b.startTime < :end')
            ->andWhere('b.endTime > :start')
            ->setParameter('start', $start)
            ->setParameter('end', $end)
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }
}

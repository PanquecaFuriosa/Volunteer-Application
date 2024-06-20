package com.chiguirongos.backend.repositories;

import java.time.LocalDate;
import java.util.Set;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.works.WorkEntity;

/**
 * Repository interface for managing works.
 * Provides methods for saving and retrieving ApplicationWork objects.
 */
public interface WorkRepository extends CrudRepository<WorkEntity, Long> {

    WorkEntity findByNameAndSupplierId(String name, UserEntity supplierId);

    Boolean existsByNameAndSupplierId(String name, UserEntity supplierId);

    Set<WorkEntity> findBySupplierId(UserEntity supplierId);

    Set<WorkEntity> findAll();

    /**
     * Query to retrieve all the works of a supplier that have at least a session
     * between an end and start date
     * 
     * @param supplierId Supplier of the works to get
     * @param start      Start date
     * @param end        End date
     * @return Works from supplier between start and end date
     */
    @Query("""
            select w
            from WorkEntity w
                where ((w.startDate <= ?2 and ?2 <= w.endDate) or
                       (?2 <= w.startDate and w.startDate <= ?3))
                    and supplierId = ?1
            """)
    Set<WorkEntity> findSupplierWorksBetweenDates(UserEntity supplierId, LocalDate start, LocalDate end);

    /**
     * Query to retrieve all the works of that have at least a session
     * between an end and start date
     * 
     * @param supplierId Supplier of the works to get
     * @param start      Start date
     * @param end        End date
     * @return Works between start and end date
     */
    @Query("""
            select w
            from WorkEntity w
                where (w.startDate <= ?1 and ?1 <= w.endDate) or
                      (?1 <= w.startDate and w.startDate <= ?2)
            """)
    Set<WorkEntity> findWorksBetweenDates(LocalDate start, LocalDate end);
}

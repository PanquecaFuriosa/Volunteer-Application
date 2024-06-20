package com.chiguirongos.backend.repositories;

import java.util.Set;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.chiguirongos.backend.models.postulations.PostulationEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.utils.PostulationStatusEnum;

/**
 * Repository interface for managing postulations.
 * Provides methods to saving and retrieving postulationEntity objects
 */
public interface PostulationRepository
        extends CrudRepository<PostulationEntity, Long>, PagingAndSortingRepository<PostulationEntity, Long> {

    PostulationEntity findByVolunteerAndWork(UserEntity volunteer, WorkEntity work);

    List<PostulationEntity> findByVolunteer(UserEntity volunteer, Pageable pageable);

    List<PostulationEntity> findByWorkSupplierIdAndStatus(
            UserEntity workSupplierId,
            PostulationStatusEnum status,
            Pageable pageable);

    Set<PostulationEntity> findByWorkAndStatus(WorkEntity work, PostulationStatusEnum status);

    Boolean existsByVolunteerAndWorkAndStatusIn(
            UserEntity volunteer,
            WorkEntity work,
            List<PostulationStatusEnum> status);

    /**
     * Finds an user postulations between two dates and with specific states
     * 
     * @param volunteer Volunteer to get postulations from
     * @param start     Start date from the range to get the postulations from
     * @param end       End date from the range to get the postulation from
     * @param status    Status of the postulations to look
     * @return An user postulations between two dates and with specific states
     */
    @Query("""
            select p
            from PostulationEntity as p
            where ((p.startDate <= ?2 and ?2 <= p.endDate) or
                  (?2 <= p.startDate and p.startDate <= ?3)) and
                  p.volunteer = ?1 and p.status in ?4
            """)
    Set<PostulationEntity> findVolunteerPostulationsBetweenDatesAndStatusIn(
            UserEntity volunteer,
            LocalDate start,
            LocalDate end,
            List<PostulationStatusEnum> status);

    /**
     * Finds all the postulations in a supplier's work
     * 
     * @param supplier Creator of the work
     * @param workId   Work id
     * @return All the postulations in a supplier's work
     */
    @Query("""
            select p
            from PostulationEntity as p
            join p.work as w
                where w.workId = ?2 and
                w.supplierId = ?1
            """)
    Set<PostulationEntity> findBySupplierWork(UserEntity supplier, Long workId);

    /**
     * Finds a volunteer's postulation for a specific work
     * 
     * @param volunteer Volunteer to get the postulation from
     * @param workId    Work to get the postulation from
     * @return A volunteer's postulation for a specific work
     */
    @Query("""
            select p
            from PostulationEntity as p
            join p.work as w
                where w.workId = ?2 and
                p.volunteer = ?1
            """)
    PostulationEntity findByVolunteerAndWorkId(UserEntity volunteer, Long workId);

    /**
     * Finds all the postulations that are PENDING and with an end date
     * already in the past.
     * 
     * @return Postulations that cant be accepted anymore because its end date
     *         is in the past.
     */
    @Query("""
            select p
            from PostulationEntity as p
                where p.status like 'PENDING' and
                current_date() > p.endDate
            """)
    Set<PostulationEntity> findExpiredPendingPostulations();

    @Query("""
             select p
             from PostulationEntity as p
                 where p.work.supplierId.userName in ?1 and
                 p.postulationDate >= ?2 and
                 p.postulationDate <= ?3
              order by p.work.name, p.postulationDate asc
            """)
    Set<PostulationEntity> findSupplierWorkPostulationsBetweenDatesOrderByWorkNameAndPostulationDate(
            List<String> suppliers,
            LocalDate start,
            LocalDate end);
}
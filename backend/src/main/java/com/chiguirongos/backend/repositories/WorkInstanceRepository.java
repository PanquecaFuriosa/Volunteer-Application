package com.chiguirongos.backend.repositories;

import java.util.Set;

import org.springframework.data.repository.CrudRepository;

import com.chiguirongos.backend.models.works.WorkInstanceEntity;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.users.UserEntity;

/**
 * Repository interface for managing instances of a work.
 * Provides methods to saving and retrieving WorkInstance objects
 */
public interface WorkInstanceRepository extends CrudRepository<WorkInstanceEntity, Long> {
    Long countByWorkId(WorkEntity workId);
    Set<WorkInstanceEntity> findByWorkId(WorkEntity workId);
    Set<WorkInstanceEntity> findByVolunteerId(UserEntity volunteerId);
}

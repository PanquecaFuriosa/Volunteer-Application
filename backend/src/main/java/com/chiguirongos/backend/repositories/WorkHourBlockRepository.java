package com.chiguirongos.backend.repositories;

import org.springframework.data.repository.CrudRepository;

import com.chiguirongos.backend.models.works.WorkHourBlocks;

public interface WorkHourBlockRepository extends CrudRepository<WorkHourBlocks, Long> {    
}
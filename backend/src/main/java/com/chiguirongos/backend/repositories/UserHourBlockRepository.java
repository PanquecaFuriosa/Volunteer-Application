package com.chiguirongos.backend.repositories;

import org.springframework.data.repository.CrudRepository;

import com.chiguirongos.backend.models.users.UserHourBlocks;

public interface UserHourBlockRepository extends CrudRepository<UserHourBlocks, Long> {    
}
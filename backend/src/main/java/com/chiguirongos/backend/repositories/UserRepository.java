package com.chiguirongos.backend.repositories;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;

import com.chiguirongos.backend.models.users.UserEntity;

public interface UserRepository extends CrudRepository<UserEntity, Long>, PagingAndSortingRepository<UserEntity, Long> {
    
    UserEntity findByUserName(String userName);
    Boolean existsByUserName(String userName);
    List<UserEntity> findByUserNameNotLike(String userName, Pageable pageable);
    List<UserEntity> findByUserNameNotLikeAndRoleIn(String userName, List<String> role, Pageable pageable);
}

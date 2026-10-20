package com.splitx.repository;

import com.splitx.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupRepository extends JpaRepository<Group, Long> {

    List<Group> findByCreatedBy(Long createdBy);

    List<Group> findByIdIn(List<Long> ids);

}
package com.splitx.service.impl;

import com.splitx.dto.CreateGroupRequest;
import com.splitx.entity.Group;
import com.splitx.repository.GroupRepository;
import com.splitx.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;

    @Override
    public String createGroup(CreateGroupRequest request) {

        Group group = Group.builder()
                .groupName(request.getGroupName())
                .description(request.getDescription())
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();

        groupRepository.save(group);

        return "Group Created Successfully";
    }
}
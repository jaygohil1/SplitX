package com.splitx.service.impl;

import com.splitx.dto.CreateGroupRequest;
import com.splitx.entity.Group;
import com.splitx.entity.GroupMember;
import com.splitx.repository.GroupMemberRepository;
import com.splitx.repository.GroupRepository;
import com.splitx.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;

    @Override
    public String createGroup(CreateGroupRequest request) {

        Group group = Group.builder()
                .groupName(request.getGroupName())
                .description(request.getDescription())
                .createdBy(request.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .build();

        groupRepository.save(group);

        // Automatically add the creator as a group member
        if (request.getCreatedBy() != null) {
            GroupMember member = GroupMember.builder()
                    .groupId(group.getId())
                    .userId(request.getCreatedBy())
                    .build();
            groupMemberRepository.save(member);
        }

        return String.valueOf(group.getId());
    }

    @Override
    public Group getGroupById(Long groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
    }

    @Override
    public List<Group> getGroupsByUserId(Long userId) {
        // Collect all group IDs from memberships
        List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
        Set<Long> groupIds = memberships.stream()
                .map(GroupMember::getGroupId)
                .collect(Collectors.toSet());

        // Also add groups created by this user
        List<Group> createdGroups = groupRepository.findByCreatedBy(userId);
        for (Group g : createdGroups) {
            groupIds.add(g.getId());
        }

        if (groupIds.isEmpty()) {
            return Collections.emptyList();
        }

        return groupRepository.findByIdIn(new ArrayList<>(groupIds));
    }
}
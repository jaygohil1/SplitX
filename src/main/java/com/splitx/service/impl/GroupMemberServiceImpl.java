package com.splitx.service.impl;

import com.splitx.dto.AddGroupMemberRequest;
import com.splitx.dto.UserResponse;
import com.splitx.entity.GroupMember;
import com.splitx.entity.User;
import com.splitx.repository.GroupMemberRepository;
import com.splitx.repository.UserRepository;
import com.splitx.service.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupMemberServiceImpl implements GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    @Override
    public String addMember(AddGroupMemberRequest request) {
        if (groupMemberRepository.existsByGroupIdAndUserId(request.getGroupId(), request.getUserId())) {
            return "User is already a member of this group";
        }

        GroupMember member = GroupMember.builder()
                .groupId(request.getGroupId())
                .userId(request.getUserId())
                .build();

        groupMemberRepository.save(member);

        return "Member Added Successfully";
    }

    @Override
    public String addMemberByEmail(Long groupId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (groupMemberRepository.existsByGroupIdAndUserId(groupId, user.getId())) {
            return "User is already a member of this group";
        }

        GroupMember member = GroupMember.builder()
                .groupId(groupId)
                .userId(user.getId())
                .build();

        groupMemberRepository.save(member);
        return "Member Added Successfully";
    }

    @Override
    public List<UserResponse> getMembersByGroupId(Long groupId) {
        List<GroupMember> members = groupMemberRepository.findByGroupId(groupId);
        if (members.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> userIds = members.stream()
                .map(GroupMember::getUserId)
                .collect(Collectors.toList());

        List<User> users = userRepository.findAllById(userIds);
        return users.stream()
                .map(user -> UserResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .phoneNumber(user.getPhoneNumber())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
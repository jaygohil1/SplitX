package com.splitx.service.impl;

import com.splitx.dto.AddGroupMemberRequest;
import com.splitx.entity.GroupMember;
import com.splitx.repository.GroupMemberRepository;
import com.splitx.service.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupMemberServiceImpl implements GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;

    @Override
    public String addMember(AddGroupMemberRequest request) {

        GroupMember member = GroupMember.builder()
                .groupId(request.getGroupId())
                .userId(request.getUserId())
                .build();

        groupMemberRepository.save(member);

        return "Member Added Successfully";
    }
}
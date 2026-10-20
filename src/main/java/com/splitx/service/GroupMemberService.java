package com.splitx.service;

import com.splitx.dto.AddGroupMemberRequest;
import com.splitx.dto.UserResponse;

import java.util.List;

public interface GroupMemberService {

    String addMember(AddGroupMemberRequest request);

    String addMemberByEmail(Long groupId, String email);

    List<UserResponse> getMembersByGroupId(Long groupId);

}
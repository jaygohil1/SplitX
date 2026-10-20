package com.splitx.service;

import com.splitx.dto.CreateGroupRequest;
import com.splitx.entity.Group;

import java.util.List;

public interface GroupService {

    String createGroup(CreateGroupRequest request);

    Group getGroupById(Long groupId);

    List<Group> getGroupsByUserId(Long userId);

}
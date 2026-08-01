package com.splitx.dto;

import lombok.Data;

@Data
public class AddGroupMemberRequest {

    private Long groupId;
    private Long userId;

}
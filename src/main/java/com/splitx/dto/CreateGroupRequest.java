package com.splitx.dto;

import lombok.Data;

@Data
public class CreateGroupRequest {

    private String groupName;
    private String description;
    private Long createdBy;

}
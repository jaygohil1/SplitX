package com.splitx.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddGroupMemberByEmailRequest {

    private Long groupId;
    private String email;

}

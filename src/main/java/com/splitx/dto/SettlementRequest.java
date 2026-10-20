package com.splitx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementRequest {

    private Long expenseId;

    private Long userId;

    private Long groupId;

    private Long payerId;

}
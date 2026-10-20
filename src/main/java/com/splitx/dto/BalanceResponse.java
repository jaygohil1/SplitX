package com.splitx.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BalanceResponse {

    private Long fromUserId;

    private String fromUser;

    private Long toUserId;

    private String toUser;

    private BigDecimal amount;

    public BalanceResponse(String fromUser, String toUser, BigDecimal amount) {
        this.fromUser = fromUser;
        this.toUser = toUser;
        this.amount = amount;
    }

}
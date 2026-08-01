package com.splitx.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class BalanceResponse {

    private String fromUser;

    private String toUser;

    private BigDecimal amount;

}
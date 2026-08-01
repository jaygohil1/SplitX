package com.splitx.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddExpenseShareRequest {

    private Long expenseId;
    private Long userId;
    private BigDecimal shareAmount;

}
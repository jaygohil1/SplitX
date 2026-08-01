package com.splitx.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AddExpenseRequest {

    private Long groupId;

    private Long paidBy;

    private BigDecimal amount;

    private String description;
}
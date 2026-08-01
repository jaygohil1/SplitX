package com.splitx.service.impl;

import com.splitx.dto.AddExpenseRequest;
import com.splitx.entity.Expense;
import com.splitx.repository.ExpenseRepository;
import com.splitx.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Override
    public String addExpense(AddExpenseRequest request) {

        Expense expense = Expense.builder()
                .groupId(request.getGroupId())
                .paidBy(request.getPaidBy())
                .amount(request.getAmount())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        expenseRepository.save(expense);

        return "Expense Added Successfully";
    }
}
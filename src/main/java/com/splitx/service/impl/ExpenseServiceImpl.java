package com.splitx.service.impl;

import com.splitx.dto.AddExpenseRequest;
import com.splitx.entity.Expense;
import com.splitx.repository.ExpenseRepository;
import com.splitx.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    @Override
    public Expense addExpense(AddExpenseRequest request) {

        Expense expense = Expense.builder()
                .groupId(request.getGroupId())
                .paidBy(request.getPaidBy())
                .amount(request.getAmount())
                .description(request.getDescription())
                .createdAt(LocalDateTime.now())
                .build();

        return expenseRepository.save(expense);
    }
    @Override
    public List<Expense> getExpensesByGroupId(Long groupId) {
        return expenseRepository.findByGroupId(groupId);
    }
}
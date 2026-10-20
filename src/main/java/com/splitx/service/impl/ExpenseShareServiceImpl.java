package com.splitx.service.impl;

import com.splitx.dto.AddExpenseShareRequest;
import com.splitx.entity.Expense;
import com.splitx.entity.ExpenseShare;
import com.splitx.repository.ExpenseRepository;
import com.splitx.repository.ExpenseShareRepository;
import com.splitx.service.ExpenseShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseShareServiceImpl implements ExpenseShareService {

    private final ExpenseShareRepository expenseShareRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public String addExpenseShare(AddExpenseShareRequest request) {

        ExpenseShare expenseShare = ExpenseShare.builder()
                .expenseId(request.getExpenseId())
                .userId(request.getUserId())
                .shareAmount(request.getShareAmount())
                .isSettled(false)
                .build();

        expenseShareRepository.save(expenseShare);

        return "Expense Share Added Successfully";
    }

    @Override
    public List<ExpenseShare> getExpenseSharesByExpenseId(Long expenseId) {
        return expenseShareRepository.findByExpenseId(expenseId);
    }

    @Override
    public List<ExpenseShare> getExpenseSharesByGroupId(Long groupId) {
        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        if (expenses.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> expenseIds = expenses.stream()
                .map(Expense::getId)
                .collect(Collectors.toList());

        return expenseShareRepository.findByExpenseIdIn(expenseIds);
    }
}
package com.splitx.service.impl;

import com.splitx.dto.AddExpenseShareRequest;
import com.splitx.entity.ExpenseShare;
import com.splitx.repository.ExpenseShareRepository;
import com.splitx.service.ExpenseShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExpenseShareServiceImpl implements ExpenseShareService {

    private final ExpenseShareRepository expenseShareRepository;

    @Override
    public String addExpenseShare(AddExpenseShareRequest request) {

        ExpenseShare expenseShare = ExpenseShare.builder()
                .expenseId(request.getExpenseId())
                .userId(request.getUserId())
                .shareAmount(request.getShareAmount())
                .build();

        expenseShareRepository.save(expenseShare);

        return "Expense Share Added Successfully";
    }
}
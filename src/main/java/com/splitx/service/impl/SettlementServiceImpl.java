package com.splitx.service.impl;

import com.splitx.dto.SettlementRequest;
import com.splitx.entity.ExpenseShare;
import com.splitx.repository.ExpenseShareRepository;
import com.splitx.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

    private final ExpenseShareRepository expenseShareRepository;

    @Override
    public String settleExpense(SettlementRequest request) {

        ExpenseShare expenseShare =
                expenseShareRepository
                        .findByExpenseIdAndUserId(
                                request.getExpenseId(),
                                request.getUserId())
                        .orElseThrow(() ->
                                new RuntimeException("Expense Share Not Found"));

        expenseShare.setIsSettled(true);

        expenseShareRepository.save(expenseShare);

        return "Settlement Successful";
    }
}
package com.splitx.service.impl;

import com.splitx.dto.SettlementRequest;
import com.splitx.entity.Expense;
import com.splitx.entity.ExpenseShare;
import com.splitx.repository.ExpenseRepository;
import com.splitx.repository.ExpenseShareRepository;
import com.splitx.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SettlementServiceImpl implements SettlementService {

    private final ExpenseShareRepository expenseShareRepository;
    private final ExpenseRepository expenseRepository;

    @Override
    public String settleExpense(SettlementRequest request) {
        if (request.getExpenseId() != null && request.getUserId() != null) {
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
        } else if (request.getGroupId() != null && request.getUserId() != null && request.getPayerId() != null) {
            return settleGroupDebt(request.getGroupId(), request.getUserId(), request.getPayerId());
        } else {
            throw new IllegalArgumentException("Invalid settlement request: provide expenseId & userId or groupId & userId & payerId");
        }
    }

    @Override
    public String settleGroupDebt(Long groupId, Long borrowerId, Long payerId) {
        List<Expense> payerExpenses = expenseRepository.findByGroupId(groupId).stream()
                .filter(e -> e.getPaidBy().equals(payerId))
                .toList();

        boolean anySettled = false;
        for (Expense exp : payerExpenses) {
            Optional<ExpenseShare> shareOpt = expenseShareRepository.findByExpenseIdAndUserId(exp.getId(), borrowerId);
            if (shareOpt.isPresent()) {
                ExpenseShare share = shareOpt.get();
                if (!Boolean.TRUE.equals(share.getIsSettled())) {
                    share.setIsSettled(true);
                    expenseShareRepository.save(share);
                    anySettled = true;
                }
            }
        }

        return anySettled ? "Settlement Successful" : "No pending debt found to settle";
    }
}
package com.splitx.service.impl;

import com.splitx.dto.BalanceResponse;
import com.splitx.entity.Expense;
import com.splitx.entity.ExpenseShare;
import com.splitx.entity.User;
import com.splitx.repository.ExpenseRepository;
import com.splitx.repository.ExpenseShareRepository;
import com.splitx.repository.UserRepository;
import com.splitx.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BalanceServiceImpl implements BalanceService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository expenseShareRepository;
    private final UserRepository userRepository;

//    @Override
    @Override
    public List<BalanceResponse> getBalances(Long groupId) {
        System.out.println(">>> RUNNING UPDATED BALANCE SERVICE <<<"); // Add this line

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        // ... rest of code

//        List<Expense> expenses = expenseRepository.findByGroupId(groupId);
        if (expenses.isEmpty()) {
            return Collections.emptyList();
        }

        // Map structure: borrowerId -> (payerId -> totalAmountOwed)
        Map<Long, Map<Long, Double>> debtMap = new HashMap<>();

        for (Expense expense : expenses) {
            Long payerId = expense.getPaidBy();
            List<ExpenseShare> shares = expenseShareRepository.findByExpenseId(expense.getId());

            for (ExpenseShare share : shares) {
                Long borrowerId = share.getUserId();

                // 1. Skip if debt is already settled
                if (Boolean.TRUE.equals(share.getIsSettled())) {
                    continue;
                }

                // 2. Skip self-debts using Objects.equals for safe Long comparison
                if (Objects.equals(borrowerId, payerId)) {
                    continue;
                }

                // Convert BigDecimal to double safely
                double amount = share.getShareAmount() != null ? share.getShareAmount().doubleValue() : 0.0;

                // Accumulate total debt from borrower to payer
                debtMap.computeIfAbsent(borrowerId, k -> new HashMap<>())
                        .merge(payerId, amount, Double::sum);
            }
        }

        // Net out mutual debts
        List<BalanceResponse> balances = new ArrayList<>();
        Set<String> processedPairs = new HashSet<>();
        Map<Long, User> userCache = new HashMap<>();

        for (Map.Entry<Long, Map<Long, Double>> entry : debtMap.entrySet()) {
            Long userA = entry.getKey();

            for (Map.Entry<Long, Double> subEntry : entry.getValue().entrySet()) {
                Long userB = subEntry.getKey();

                String pairKey = userA < userB ? userA + "-" + userB : userB + "-" + userA;
                if (processedPairs.contains(pairKey)) {
                    continue;
                }
                processedPairs.add(pairKey);

                double aOwesB = debtMap.getOrDefault(userA, Collections.emptyMap()).getOrDefault(userB, 0.0);
                double bOwesA = debtMap.getOrDefault(userB, Collections.emptyMap()).getOrDefault(userA, 0.0);

                double netBalance = aOwesB - bOwesA;

                if (Math.abs(netBalance) > 0.001) {
                    Long borrowerId = netBalance > 0 ? userA : userB;
                    Long payerId = netBalance > 0 ? userB : userA;
                    double finalAmount = Math.abs(netBalance);

                    User borrower = userCache.computeIfAbsent(borrowerId, id -> userRepository.findById(id).orElse(null));
                    User payer = userCache.computeIfAbsent(payerId, id -> userRepository.findById(id).orElse(null));

                    if (borrower != null && payer != null) {
                        balances.add(BalanceResponse.builder()
                                .fromUserId(borrowerId)
                                .fromUser(borrower.getFullName())
                                .toUserId(payerId)
                                .toUser(payer.getFullName())
                                .amount(BigDecimal.valueOf(finalAmount))
                                .build()
                        );
                    }
                }
            }
        }

        return balances;
    }
}
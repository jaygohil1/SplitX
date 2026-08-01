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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BalanceServiceImpl implements BalanceService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseShareRepository expenseShareRepository;
    private final UserRepository userRepository;

    @Override
    public List<BalanceResponse> getBalances(Long groupId) {

        List<BalanceResponse> balances = new ArrayList<>();

        List<Expense> expenses = expenseRepository.findByGroupId(groupId);

        for (Expense expense : expenses) {

            User payer = userRepository.findById(expense.getPaidBy()).orElse(null);

            if (payer == null) {
                continue;
            }

            List<ExpenseShare> shares =
                    expenseShareRepository.findByExpenseId(expense.getId());

            for (ExpenseShare share : shares) {

                if (!share.getUserId().equals(expense.getPaidBy())) {

                    User borrower =
                            userRepository.findById(share.getUserId()).orElse(null);

                    if (borrower == null) {
                        continue;
                    }

                    balances.add(
                            new BalanceResponse(
                                    borrower.getFullName(),
                                    payer.getFullName(),
                                    share.getShareAmount()
                            )
                    );
                }
            }
        }

        return balances;
    }
}
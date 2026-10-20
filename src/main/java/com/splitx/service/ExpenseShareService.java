package com.splitx.service;

import com.splitx.dto.AddExpenseShareRequest;
import com.splitx.entity.ExpenseShare;

import java.util.List;

public interface ExpenseShareService {

    String addExpenseShare(AddExpenseShareRequest request);

    List<ExpenseShare> getExpenseSharesByExpenseId(Long expenseId);

    List<ExpenseShare> getExpenseSharesByGroupId(Long groupId);

}
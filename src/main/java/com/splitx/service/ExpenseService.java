package com.splitx.service;

import com.splitx.dto.AddExpenseRequest;
import com.splitx.entity.Expense;

import java.util.List;

public interface ExpenseService {

    Expense addExpense(AddExpenseRequest request);
    List<Expense> getExpensesByGroupId(Long groupId);

}
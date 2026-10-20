package com.splitx.controller;

import com.splitx.dto.AddExpenseRequest;
import com.splitx.entity.Expense;
import com.splitx.service.ExpenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping("/add")
    public ResponseEntity<Expense> addExpense(@Valid @RequestBody AddExpenseRequest request) {
        Expense response = expenseService.addExpense(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    @GetMapping("/group/{groupId}")
    public ResponseEntity<?> getExpensesByGroup(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseService.getExpensesByGroupId(groupId));
    }
}
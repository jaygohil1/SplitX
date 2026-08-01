package com.splitx.controller;

import com.splitx.dto.AddExpenseRequest;
import com.splitx.service.ExpenseService;
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
    public ResponseEntity<String> addExpense(@RequestBody AddExpenseRequest request) {

        String response = expenseService.addExpense(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
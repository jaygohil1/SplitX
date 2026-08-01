package com.splitx.controller;

import com.splitx.dto.AddExpenseShareRequest;
import com.splitx.service.ExpenseShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/expense-shares")
@RequiredArgsConstructor
public class ExpenseShareController {

    private final ExpenseShareService expenseShareService;

    @PostMapping("/add")
    public ResponseEntity<String> addExpenseShare(@RequestBody AddExpenseShareRequest request) {

        String response = expenseShareService.addExpenseShare(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
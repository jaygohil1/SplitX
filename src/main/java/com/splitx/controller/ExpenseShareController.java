package com.splitx.controller;

import com.splitx.dto.AddExpenseShareRequest;
import com.splitx.entity.ExpenseShare;
import com.splitx.service.ExpenseShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/expense/{expenseId}")
    public ResponseEntity<List<ExpenseShare>> getExpenseSharesByExpenseId(@PathVariable Long expenseId) {
        return ResponseEntity.ok(expenseShareService.getExpenseSharesByExpenseId(expenseId));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<ExpenseShare>> getExpenseSharesByGroupId(@PathVariable Long groupId) {
        return ResponseEntity.ok(expenseShareService.getExpenseSharesByGroupId(groupId));
    }
}
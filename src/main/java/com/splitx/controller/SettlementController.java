package com.splitx.controller;

import com.splitx.dto.SettlementRequest;
import com.splitx.service.SettlementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settlements")
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    @PostMapping("/pay")
    public ResponseEntity<String> settleExpense(
            @RequestBody SettlementRequest request) {

        String response =
                settlementService.settleExpense(request);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
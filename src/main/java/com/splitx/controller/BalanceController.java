package com.splitx.controller;

import com.splitx.dto.BalanceResponse;
import com.splitx.service.BalanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/balances")
@RequiredArgsConstructor
public class BalanceController {

    private final BalanceService balanceService;

    @GetMapping("/group/{groupId}")
    public List<BalanceResponse> getBalances(@PathVariable Long groupId) {

        return balanceService.getBalances(groupId);

    }

}
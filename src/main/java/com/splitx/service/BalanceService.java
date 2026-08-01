package com.splitx.service;

import com.splitx.dto.BalanceResponse;

import java.util.List;

public interface BalanceService {

    List<BalanceResponse> getBalances(Long groupId);

}
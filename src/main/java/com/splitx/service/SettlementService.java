package com.splitx.service;

import com.splitx.dto.SettlementRequest;

public interface SettlementService {

    String settleExpense(SettlementRequest request);

    String settleGroupDebt(Long groupId, Long borrowerId, Long payerId);

}
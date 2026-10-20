package com.splitx.repository;

import com.splitx.entity.ExpenseShare;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseShareRepository extends JpaRepository<ExpenseShare, Long> {

    List<ExpenseShare> findByExpenseId(Long expenseId);
    List<ExpenseShare> findByExpenseIdIn(List<Long> expenseIds);
    List<ExpenseShare> findByUserId(Long userId);
    Optional<ExpenseShare> findByExpenseIdAndUserId(Long expenseId, Long userId);

}
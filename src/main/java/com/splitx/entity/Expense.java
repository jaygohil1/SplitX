package com.splitx.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id", nullable = false)
    private Long groupId;

    @Column(name = "paid_by", nullable = false)
    private Long paidBy;

    @Column(nullable = false)
    private BigDecimal amount;

    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}
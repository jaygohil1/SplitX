package com.splitx.controller;

import com.splitx.dto.LoginUserRequest;
import com.splitx.dto.RegisterUserRequest;
import com.splitx.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<String> registerUser(
            @Valid @RequestBody RegisterUserRequest request) {

        String response = userService.registerUser(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(
            @Valid @RequestBody LoginUserRequest request) {

        String response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }
}
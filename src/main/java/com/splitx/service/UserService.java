package com.splitx.service;

import com.splitx.dto.LoginUserRequest;
import com.splitx.dto.RegisterUserRequest;
import com.splitx.dto.UserResponse;

import java.util.List;

public interface UserService {

    String registerUser(RegisterUserRequest request);

    UserResponse loginUser(LoginUserRequest request);

    UserResponse getUserById(Long id);

    UserResponse getUserByEmail(String email);

    List<UserResponse> searchUsers(String query);

}
package com.splitx.service;

import com.splitx.dto.LoginUserRequest;
import com.splitx.dto.RegisterUserRequest;

public interface UserService {

    String registerUser(RegisterUserRequest request);

    String loginUser(LoginUserRequest request);

}
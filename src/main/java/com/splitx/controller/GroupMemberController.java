package com.splitx.controller;

import com.splitx.dto.AddGroupMemberRequest;
import com.splitx.service.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/group-members")
@RequiredArgsConstructor
public class GroupMemberController {

    private final GroupMemberService groupMemberService;

    @PostMapping("/add")
    public ResponseEntity<String> addMember(@RequestBody AddGroupMemberRequest request) {

        String response = groupMemberService.addMember(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
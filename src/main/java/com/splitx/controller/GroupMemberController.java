package com.splitx.controller;

import com.splitx.dto.AddGroupMemberByEmailRequest;
import com.splitx.dto.AddGroupMemberRequest;
import com.splitx.dto.UserResponse;
import com.splitx.service.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @PostMapping("/add-by-email")
    public ResponseEntity<String> addMemberByEmail(@RequestBody AddGroupMemberByEmailRequest request) {
        String response = groupMemberService.addMemberByEmail(request.getGroupId(), request.getEmail());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<UserResponse>> getMembersByGroupId(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupMemberService.getMembersByGroupId(groupId));
    }
}
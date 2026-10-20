package com.splitx.controller;

import com.splitx.dto.CreateGroupRequest;
import com.splitx.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<String> createGroup(@RequestBody CreateGroupRequest request) {

        String response = groupService.createGroup(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    @GetMapping("/id/{groupId}")
    public ResponseEntity<?> getGroupById(@PathVariable Long groupId) {
        return ResponseEntity.ok(groupService.getGroupById(groupId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getGroupsByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(groupService.getGroupsByUserId(userId));
    }
}
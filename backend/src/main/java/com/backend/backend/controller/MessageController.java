package com.backend.backend.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.backend.backend.helper.AllFunctions;
import com.backend.backend.payloads.Message;
import com.backend.backend.payloads.MessageType;

@Controller

public class MessageController {

    private Map<String, ArrayList<String>> rooms = new HashMap<>();

    @Autowired
    private SimpMessagingTemplate simpMessageCareer;

    AllFunctions fnx = new AllFunctions();

    @MessageMapping("/createRoom")
    private void createRoom(Message message) {
        if (message.getMessageType().equals(MessageType.CREATEROOM)) {

            String roomName = fnx.createRoom(rooms);
            rooms.put(roomName, new ArrayList<String>());
            rooms.get(roomName).add(message.getUsername());
            message.setMessageType(MessageType.ACK);
            message.setMessageString(roomName);
            simpMessageCareer.convertAndSend("/topic/" + message.getUsername(), message);

        } else {
            message.setMessageType(MessageType.ACK);
            message.setMessageString("Error");
            simpMessageCareer.convertAndSend("/topic/" + message.getUsername(), message);

        }
    }

    @MessageMapping("/joinRoom")
    private void joinRoom(Message message) {
        if (message.getMessageType().equals(MessageType.JOINROOM)) {
            String roomName = message.getMessageString();
            if (!rooms.containsKey(roomName)) {
                message.setMessageType(MessageType.ACK);
                message.setMessageString("NO SUCH ROOM");

                simpMessageCareer.convertAndSend("/topic/" + message.getUsername(), message);
            }

            rooms.get(roomName).add(message.getUsername());

            ArrayList<String> userList = rooms.get(roomName);

            message.setMessageType(MessageType.ACK);
            message.setMessageString(userList.toString());

            simpMessageCareer.convertAndSend("/topic/" + message.getUsername(), message);
        } else {
            message.setMessageType(MessageType.ACK);
            message.setMessageString("Error : Invalid call");
            simpMessageCareer.convertAndSend("/topic/" + message.getUsername(), message);
        }
    }

    @MessageMapping("/disconnect")
    private void disconnectRoom(Message message) {
        if (message.getMessageType().equals(MessageType.LEAVE)) {
            String room = message.getMessageString();
            ArrayList<String> users = rooms.get(room);
            String name = message.getUsername();
            users.remove(name);
            rooms.put(room, users);
            message.setMessageType(MessageType.ACK);
            message.setMessageString("Succssfully disconnected ");
            simpMessageCareer.convertAndSend("/topic/" + message.getUsername(), message);
        } else {
            message.setMessageType(MessageType.ACK);
            message.setMessageString("Error : Invalid call");
            simpMessageCareer.convertAndSend("/topic/" + message.getUsername(), message);
        }
    }

    @MessageMapping("/chat")
    private void handlechat(Message message) {
        if (message.getMessageType().equals(MessageType.CHAT)) {
            String room = message.getUsername();
            String text = message.getMessageString();
            message.setMessageType(MessageType.ACK);
            simpMessageCareer.convertAndSend("/topic/" + room, message);
        }
    }

}

import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import Navbar from './Navbar';
import Players from './Players';
import Canvas from './Canvas';
import ChatBox from './ChatBox';

const Login = () => {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [players, setPlayers] = useState([]);
  const [url, setUrl] = useState('');
  const [room, setRoom] = useState('');
  const clientRef = useRef(null); 
  const initialize = () => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        client.subscribe('/topic/msg', (message) => {
        });
        client.subscribe(`/topic/${username}`, (message) => {
           setRoom(JSON.parse(message.body).messageString);
        });
        client.publish({
          destination: '/app/createRoom',
          body: JSON.stringify({
            messageType: 'CREATEROOM',
            messageString: `${username}`,
            username: username,
          }),
        });
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
      },
      onDisconnect: () => {
        console.log('Disconnected');
      },
    });

    client.activate();
    clientRef.current = client; 
  };

  const handleCreate = () => {
    if (username.trim() === '') {
      alert('Please enter a username');
      return;
    }
    initialize();
    setLoggedIn(true);
    
  };

  const handleJoin = (room) => {
    if (username.trim() === '') {
      alert('Please enter a username');
      return;
    }
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        client.subscribe('/topic/msg', (message) => {
          console.log(`Received: ${message.body}`);
        });

        client.subscribe(`/topic/${username}`, (message) => {
          const response = JSON.parse(message.body);
          setPlayers(response.messageString);
          setUrl("/topic/" + room);
        });

        client.subscribe(`/topic/${room}`, (message) => {
        });

        client.publish({
          destination: '/app/joinRoom',
          body: JSON.stringify({
            messageType: 'JOINROOM',
            messageString: `${room}`,
            username: username,
          }),
        });
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      },
      onStompError: (error) => {
        console.error('STOMP error:', error);
      },
      onDisconnect: () => {
        console.log('Disconnected');
      },
    });

    client.activate();
    clientRef.current = client;
    setLoggedIn(true);
  };

  const handleDisconnect = () => {
    if (clientRef.current) {
      clientRef.current.publish({
        destination: '/app/disconnect',
        body: JSON.stringify({
          messageType: 'LEAVE',
          messageString: `${room}`,
          username: `${username}`,
        }),
      });
      setLoggedIn(false);
      setPlayers([]);
      setRoom('');  
      setUrl('');
      setUsername('');
      
      // clientRef.current.deactivate();
    }
    setLoggedIn(false);
    setPlayers([]);
    setUrl('');
    setRoom('');
    setUsername('');
  };

  const handelText = (message) => {
    if (clientRef.current) {
      clientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          messageType: 'CHAT',
          messageString: message,
          username: `${room}`,
        }),
      });
    }
  };

  return (
    <div className="Home">
      {!loggedIn ? (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleCreate}>Create</button>
          <p> Or join by id </p>
          <input type="text" placeholder="Enter room id" value={room} onChange={(e) => setRoom(e.target.value)} />
          <button onClick={() => handleJoin(room)}>Join</button>
        </div>
      ) : (
        <div>
          <Navbar back={handleDisconnect}></Navbar>
          <div className="game">
            <Players></Players>
            <div className="board">
              <Canvas></Canvas>
            </div>
            <div className="chatbox">
              <ChatBox text={handelText}></ChatBox>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

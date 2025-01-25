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
  const [chat, setChat] = useState({});

  const initialize = async () => {
    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: async () => {
        client.subscribe(`/topic/${username}`, async (message) => {
          const response = JSON.parse(message.body);
          if (response.messageType === 'CREATEROOM') {
            setRoom(response.room);
            await new Promise((resolve) => {
              client.subscribe(`/topic/${response.room}`, (roomMessage) => {
                const parsedMessage = JSON.parse(roomMessage.body);
                if(parsedMessage.messageType === 'CHAT'){
                setChat({
                  name: parsedMessage.username,
                  chat: parsedMessage.messageString,
                });
              }
                resolve();
              });
            });
          }
        });

        client.publish({
          destination: '/app/createRoom',
          body: JSON.stringify({
            messageType: 'CREATEROOM',
            messageString: `${username}`,
            username: `${username}`,
            room: 'CREATE',
          }),
        });
      },
      onWebSocketError: (error) => console.error('WebSocket error:', error),
      onStompError: (error) => console.error('STOMP error:', error),
      onDisconnect: () => console.log('Disconnected'),
    });

    client.activate();
    clientRef.current = client;
  };

  const handleCreate = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      alert('Please enter a username');
      return;
    }
    setUsername(trimmedUsername);
    initialize().then(() => setLoggedIn(true));
  };

  const handleJoin = (room) => {
    if (username.trim() === '') {
      alert('Please enter a username');
      return;
    }

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      onConnect: () => {
        client.subscribe(`/topic/${username}`, (message) => {
          const response = JSON.parse(message.body);
          setPlayers(response.players || []);
          setUrl(`/topic/${room}`);
        });

        client.subscribe(`/topic/${room}`, (message) => {
          const parsedMessage = JSON.parse(message.body);
          if (parsedMessage.messageType === 'CHAT') {
            setChat((prevChat) => ({
              ...prevChat,
              name: parsedMessage.username,
              chat: parsedMessage.messageString,
            }));
          }
        });

        client.publish({
          destination: '/app/joinRoom',
          body: JSON.stringify({
            messageType: 'JOINROOM',
            messageString: 'try to join',
            username: `${username}`,
            room: `${room}`,
          }),
        });
      },
      onWebSocketError: (error) => console.error('WebSocket error:', error),
      onStompError: (error) => console.error('STOMP error:', error),
      onDisconnect: () => console.log('Disconnected'),
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
          room: `${room}`,
        }),
      });
      clientRef.current.deactivate();
      clientRef.current = null;
      setLoggedIn(false);
      setPlayers([]);
      setRoom('');
      setUrl('');
      setUsername('');
      setChat({});
    }
  };

  const handleText = (message) => {
    if (clientRef.current) {
      clientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          messageType: 'CHAT',
          messageString: message,
          username: `${username}`,
          room: `${room}`,
        }),
      });
    }
  };

  const handleImage = (image) => {
    if (clientRef.current) {
      clientRef.current.publish({
        destination: '/app/chat',
        body: JSON.stringify({
          messageType: 'IMAGE',
          messageString: image,
          username: `${username}`,
          room: `${room}`,
        }),
      });
    }
  }

  const handleRoomChange = (e) => setRoom(e.target.value);
  const handleUsernameChange = (e) => setUsername(e.target.value);

  return (
    <div className="Home">
      {!loggedIn ? (
        <div>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={handleUsernameChange}
          />
          <button onClick={handleCreate}>Create</button>
          <p>Or join by ID</p>
          <input
            type="text"
            placeholder="Enter room id"
            value={room}
            onChange={handleRoomChange}
          />
          <button onClick={() => handleJoin(room)}>Join</button>
        </div>
      ) : (
        <div>
          <Navbar back={handleDisconnect}></Navbar>
          <div className="game">
            <Players players={players}></Players>
            <div className="board">
              <Canvas sendImage= {handleImage}></Canvas>
            </div>
            <div className="chatbox">
              <ChatBox text={handleText} chat={chat}></ChatBox>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

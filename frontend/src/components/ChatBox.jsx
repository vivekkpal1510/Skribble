import { useEffect, useRef, useState } from "react";

export default function ChatBox({ text, chat }) {
  const [messages, setMessages] = useState([{ }]);
  const messageRef = useRef(null);
  const chatsRef = useRef(null);

  const sendMessage = (e) => {
    e.preventDefault();
    const message = messageRef.current.value.trim();
    if (message) {
      text(message);
      messageRef.current.value = "";
    }
  };

  useEffect(() => {
    if (chat?.name && chat?.chat) {
      setMessages((prevState) => [
        ...prevState,
        {
          name: chat.name,
          text: chat.chat,
        },
      ]);
    }
  }, [chat]);

  useEffect(() => {
    if (chatsRef.current) {
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      <div ref={chatsRef} className="chats">
        {messages.map((message, idx) => (
          <div key={idx} className="message">
            <strong>{message.name}</strong>: <span>{message.text}</span>
          </div>
        ))}
      </div>
      <form className="text" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type your message..."
          ref={messageRef}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

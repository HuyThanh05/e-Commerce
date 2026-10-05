import { Client } from "@stomp/stompjs";

let client;

const websocketUrl = () => {
  const backend = import.meta.env.VITE_BACK_END_URL || "http://localhost:5000";
  return `${backend.replace(/^http/, "ws").replace(/\/$/, "")}/api/ws`;
};

export const connectChat = ({ onMessage, onConnect, onDisconnect }) => {
  if (client?.active) return client;
  client = new Client({
    brokerURL: websocketUrl(),
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe("/user/queue/messages", (frame) => onMessage(JSON.parse(frame.body)));
      onConnect?.();
    },
    onWebSocketClose: () => onDisconnect?.(),
    onStompError: () => onDisconnect?.(),
  });
  client.activate();
  return client;
};

export const disconnectChat = () => {
  const activeClient = client;
  client = undefined;
  return activeClient?.deactivate();
};

export const sendChatMessage = (conversationId, content) => {
  if (!client?.connected) return false;
  client.publish({
    destination: "/app/chat.send",
    body: JSON.stringify({ conversationId, content }),
  });
  return true;
};

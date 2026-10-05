import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/api";
import { connectChat, disconnectChat } from "../../services/chatSocket";

const ChatSocketBridge = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user?.id) return undefined;
    api.get("/chat/unread-count")
      .then(({ data }) => dispatch({ type: "CHAT_UNREAD_COUNT", payload: data.count }))
      .catch(() => dispatch({ type: "CHAT_UNREAD_COUNT", payload: 0 }));

    connectChat({
      onMessage: (message) => {
        dispatch({ type: "CHAT_MESSAGE_RECEIVED", payload: message });
        if (String(message.senderId) !== String(user.id)) {
          api.get("/chat/unread-count")
            .then(({ data }) => dispatch({ type: "CHAT_UNREAD_COUNT", payload: data.count }));
        }
      },
      onConnect: () => dispatch({ type: "CHAT_CONNECTED", payload: true }),
      onDisconnect: () => dispatch({ type: "CHAT_CONNECTED", payload: false }),
    });
    return () => { disconnectChat(); };
  }, [dispatch, user?.id]);

  return null;
};

export default ChatSocketBridge;

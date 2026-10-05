const initialState = { unreadCount: 0, latestMessage: null, connected: false };

export const chatReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CHAT_CONNECTED":
      return { ...state, connected: action.payload };
    case "CHAT_UNREAD_COUNT":
      return { ...state, unreadCount: Number(action.payload || 0) };
    case "CHAT_MESSAGE_RECEIVED":
      return { ...state, latestMessage: action.payload };
    case "LOG_OUT":
      return initialState;
    default:
      return state;
  }
};

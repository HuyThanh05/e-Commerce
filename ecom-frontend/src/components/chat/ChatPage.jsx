import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiArrowLeft, FiImage, FiMessageCircle, FiPaperclip, FiSearch, FiSend, FiShield, FiShoppingBag } from "react-icons/fi";
import api from "../../api/api";
import { sendChatMessage } from "../../services/chatSocket";
import { getImageUrl } from "../../utils/getImageUrl";
import "./chat.css";

const timeLabel = (value) => value ? new Date(value).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";
const initials = (name = "") => name.trim().split(/\s+/).map((word) => word[0]).join("").slice(0, 2).toUpperCase() || "AS";

const ChatPage = () => {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const { connected, latestMessage } = useSelector((state) => state.chat);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedId, setSelectedId] = useState(params.get("conversation"));
  const [search, setSearch] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const endRef = useRef(null);

  const loadConversations = useCallback(async () => {
    const { data } = await api.get("/chat/conversations");
    setConversations(data);
    setSelectedId((current) => current || (data[0]?.conversationId ? String(data[0].conversationId) : null));
  }, []);

  useEffect(() => {
    setLoading(true);
    loadConversations().catch(() => toast.error("Không thể tải danh sách trò chuyện."))
      .finally(() => setLoading(false));
  }, [loadConversations]);

  useEffect(() => {
    if (!selectedId) return;
    setParams({ conversation: selectedId }, { replace: true });
    Promise.all([
      api.get(`/chat/conversations/${selectedId}/messages`),
      api.put(`/chat/conversations/${selectedId}/read`),
    ]).then(([response]) => {
      setMessages(response.data);
      api.get("/chat/unread-count").then(({ data }) => dispatch({ type: "CHAT_UNREAD_COUNT", payload: data.count }));
      loadConversations();
    }).catch(() => toast.error("Không thể tải nội dung trò chuyện."));
  }, [selectedId, setParams, dispatch, loadConversations]);

  useEffect(() => {
    if (!latestMessage) return;
    loadConversations();
    if (String(latestMessage.conversationId) === String(selectedId)) {
      setMessages((current) => current.some((item) => item.messageId === latestMessage.messageId) ? current : [...current, latestMessage]);
      if (String(latestMessage.senderId) !== String(user?.id)) {
        api.put(`/chat/conversations/${selectedId}/read`).then(() => {
          api.get("/chat/unread-count").then(({ data }) => dispatch({ type: "CHAT_UNREAD_COUNT", payload: data.count }));
        });
      }
    }
  }, [latestMessage, selectedId, user?.id, loadConversations, dispatch]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const selected = conversations.find((item) => String(item.conversationId) === String(selectedId));
  const visibleConversations = useMemo(() => conversations.filter((item) => item.otherUserName.toLowerCase().includes(search.toLowerCase())), [conversations, search]);
  const isSeller = user?.roles?.includes("ROLE_SELLER");

  const send = (event, suggested) => {
    event?.preventDefault();
    const text = (suggested || content).trim();
    if (!text || !selectedId) return;
    if (!sendChatMessage(Number(selectedId), text)) {
      toast.error("Đang kết nối lại chat, vui lòng thử lại.");
      return;
    }
    setContent("");
  };

  if (loading) return <main className="chat-page"><div className="chat-loading">Đang tải tin nhắn...</div></main>;

  return <main className={`chat-page ${isSeller ? "chat-page--seller" : ""}`}>
    <section className="chat-layout">
      <aside className="chat-sidebar">
        <header><h1>Tin nhắn</h1><span>•••</span></header>
        <label className="chat-search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm hội thoại" /></label>
        <div className="conversation-list">
          {visibleConversations.map((conversation) => <button key={conversation.conversationId} className={String(conversation.conversationId) === String(selectedId) ? "active" : ""} onClick={() => setSelectedId(String(conversation.conversationId))}>
            <span className="chat-avatar">{initials(conversation.otherUserName)}<i /></span>
            <span className="conversation-copy"><strong>{conversation.otherUserName}</strong><small>{conversation.lastMessage}</small></span>
            <span className="conversation-meta"><small>{timeLabel(conversation.lastMessageAt)}</small>{conversation.unreadCount > 0 && <b>{conversation.unreadCount}</b>}</span>
          </button>)}
          {!visibleConversations.length && <div className="chat-empty-small"><FiMessageCircle /><p>Chưa có cuộc trò chuyện</p><Link to="/products">Khám phá sản phẩm</Link></div>}
        </div>
      </aside>

      <section className="chat-main">
        {selected ? <>
          <header className="chat-main-header"><FiArrowLeft /><span className="chat-avatar small">{initials(selected.otherUserName)}<i /></span><div><strong>{selected.otherUserName}</strong><small><i /> Đang hoạt động</small></div></header>
          {selected.productId && <div className="chat-product"><img src={getImageUrl(selected.productImage)} alt={selected.productName}/><div><strong>{selected.productName}</strong><span>Trao đổi về sản phẩm này</span></div><Link to={`/products/${selected.productId}`}>Xem sản phẩm</Link></div>}
          <div className="message-area"><span className="message-day">Hôm nay</span>{messages.map((message) => {
            const own = String(message.senderId) === String(user?.id);
            return <div className={`message-row ${own ? "own" : ""}`} key={message.messageId}>{!own && <span className="chat-avatar tiny">{initials(message.senderName)}</span>}<div><p>{message.content}</p><small>{timeLabel(message.sentAt)}</small></div></div>;
          })}<div ref={endRef}/></div>
          {!isSeller && <div className="chat-suggestions">{["Sản phẩm còn hàng không?", "Khi nào shop giao hàng?", "Có được kiểm hàng không?"].map((suggestion) => <button key={suggestion} onClick={(event) => send(event, suggestion)}>{suggestion}</button>)}</div>}
          <form className="chat-composer" onSubmit={send}><button type="button" aria-label="Gửi ảnh"><FiImage /></button><button type="button" aria-label="Đính kèm"><FiPaperclip /></button><input value={content} onChange={(event) => setContent(event.target.value)} placeholder={connected ? "Nhập nội dung tin nhắn..." : "Đang kết nối chat..."}/><button className="send-button" disabled={!content.trim() || !connected}><FiSend /></button></form>
        </> : <div className="chat-empty-main"><FiMessageCircle /><h2>Chọn một cuộc trò chuyện</h2><p>Tin nhắn với người bán hoặc khách hàng sẽ hiển thị tại đây.</p></div>}
      </section>

      <aside className="chat-profile">
        {selected && <><div className="chat-profile-summary"><span className="chat-avatar large">{initials(isSeller ? selected.customerName : selected.sellerName)}<i /></span><h2>{isSeller ? selected.customerName : selected.sellerName}</h2><small><FiShield /> {isSeller ? "Khách hàng Amazing" : "Shop đã xác minh"}</small>{!isSeller && <Link to={`/shops/${selected.sellerId}`}>Xem trang shop</Link>}</div><div className="chat-profile-options"><h3>Tùy chọn hội thoại</h3><button><FiImage /> Ảnh và tệp đã gửi <span>›</span></button><button><FiSearch /> Tìm trong cuộc trò chuyện <span>›</span></button><button><FiShoppingBag /> Đơn hàng liên quan <span>›</span></button></div><button className="chat-report">Báo cáo tài khoản</button></>}
      </aside>
    </section>
  </main>;
};

export default ChatPage;

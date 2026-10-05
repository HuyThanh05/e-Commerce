import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FiBox, FiCheck, FiClock, FiMapPin, FiMessageCircle, FiPackage, FiTruck } from "react-icons/fi";
import api from "../../api/api";
import { formatPrice } from "../../utils/formatPrice";
import { getImageUrl } from "../../utils/getImageUrl";
import "./customer-orders.css";

const normalize = (status = "") => ({ Accepted: "Confirmed", Shipped: "Shipping", Processing: "Preparing" }[status] || status);
const labels = { Pending: "Chờ xác nhận", Confirmed: "Đã xác nhận", Preparing: "Đang chuẩn bị", Shipping: "Đang giao", Delivered: "Hoàn thành", Cancelled: "Đã hủy", "Delivery Failed": "Giao thất bại" };
const tabs = [
  ["all", "Tất cả"], ["Pending", "Chờ xác nhận"], ["Preparing", "Đang chuẩn bị"],
  ["Shipping", "Đang giao"], ["Delivered", "Hoàn thành"], ["Cancelled", "Đã hủy"],
];
const stepIndex = (status) => ({ Pending: 0, Confirmed: 1, Preparing: 1, Shipping: 2, Delivered: 3 }[normalize(status)] ?? 0);
const dateLabel = (value) => value ? new Date(value).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" }) : "Chưa cập nhật";

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeTab = params.get("status") || "all";
  const selectedId = params.get("order");

  const loadOrders = async () => {
    try {
      const { data } = await api.get("/orders/me");
      setOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải đơn hàng.");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, []);
  const filtered = useMemo(() => orders.filter((order) => {
    const status = normalize(order.orderStatus);
    if (activeTab === "all") return true;
    if (activeTab === "Preparing") return status === "Confirmed" || status === "Preparing";
    if (activeTab === "Cancelled") return status === "Cancelled" || status === "Delivery Failed";
    return status === activeTab;
  }), [orders, activeTab]);
  const selected = orders.find((order) => String(order.orderId) === String(selectedId)) || filtered[0];

  const selectTab = (status) => setParams(status === "all" ? {} : { status });
  const selectOrder = (id) => setParams(activeTab === "all" ? { order: id } : { status: activeTab, order: id });
  const cancelOrder = async () => {
    if (!selected || !window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;
    try {
      await api.put(`/orders/me/${selected.orderId}/cancel`);
      toast.success("Đã hủy đơn hàng. Tồn kho đã được hoàn lại.");
      await loadOrders();
    } catch (error) { toast.error(error.response?.data?.message || "Không thể hủy đơn hàng."); }
  };
  const chatSeller = async (productId) => {
    try {
      const { data } = await api.post("/chat/conversations", { productId });
      navigate(`/messages?conversation=${data.conversationId}`);
    } catch (error) { toast.error(error.response?.data?.message || "Không thể mở trò chuyện."); }
  };

  if (loading) return <main className="customer-orders-page"><div className="orders-loading">Đang tải đơn hàng...</div></main>;
  return <main className="customer-orders-page"><div className="customer-orders-shell">
    <div className="order-tabs">{tabs.map(([value, label]) => <button key={value} className={activeTab === value ? "active" : ""} onClick={() => selectTab(value)}>{label}</button>)}</div>
    {!filtered.length ? <div className="orders-empty"><FiPackage/><h2>Chưa có đơn hàng</h2><p>Không có đơn hàng nào trong trạng thái này.</p><Link to="/products">Tiếp tục mua sắm</Link></div> : <div className="orders-page-grid">
      <aside className="order-list"><h2>Đơn mua của tôi</h2>{filtered.map((order) => <button className={selected?.orderId === order.orderId ? "active" : ""} key={order.orderId} onClick={() => selectOrder(order.orderId)}><div><strong>Đơn #{order.orderId}</strong><span>{order.orderDate}</span></div><b>{labels[normalize(order.orderStatus)] || order.orderStatus}</b><strong>{formatPrice(order.totalAmount)}</strong></button>)}</aside>
      {selected && <section className="order-detail">
        <div className={`order-status-hero status-${normalize(selected.orderStatus).toLowerCase().replaceAll(" ", "-")}`}><span>● {labels[normalize(selected.orderStatus)] || selected.orderStatus}</span><h1>{normalize(selected.orderStatus) === "Shipping" ? "Đơn hàng đang đến với bạn" : `Đơn hàng #${selected.orderId}`}</h1><p>Cập nhật gần nhất: {dateLabel(selected.statusUpdatedAt || selected.orderDate)}</p><FiTruck/></div>
        {!(["Cancelled", "Delivery Failed"].includes(normalize(selected.orderStatus))) && <div className="order-progress">{[
          ["Đã đặt", selected.orderDate, FiCheck], ["Đã xác nhận", selected.confirmedAt, FiBox], ["Đang giao", selected.shippedAt, FiTruck], ["Đã nhận", selected.deliveredAt, FiMapPin],
        ].map(([label, date, Icon], index) => <div className={index <= stepIndex(selected.orderStatus) ? "done" : ""} key={label}><span><Icon/></span><strong>{label}</strong><small>{date ? dateLabel(date) : "Đang chờ"}</small></div>)}</div>}
        <div className="order-content-grid"><div className="order-journey"><header><div><small>ĐƠN VỊ VẬN CHUYỂN</small><strong><FiTruck/> Amazing Express</strong></div><span>Mã vận đơn: AS{String(selected.orderId).padStart(7,"0")}</span></header><h2>Lịch sử đơn hàng</h2><div className="journey-list"><div className="current"><i/><time>{dateLabel(selected.statusUpdatedAt || selected.orderDate)}</time><strong>{labels[normalize(selected.orderStatus)] || selected.orderStatus}</strong><p>Trạng thái mới nhất của đơn hàng.</p></div>{selected.shippedAt && normalize(selected.orderStatus) !== "Shipping" && <div><i/><time>{dateLabel(selected.shippedAt)}</time><strong>Đơn hàng bắt đầu được vận chuyển</strong></div>}{selected.preparingAt && <div><i/><time>{dateLabel(selected.preparingAt)}</time><strong>Người bán đang chuẩn bị hàng</strong></div>}{selected.confirmedAt && <div><i/><time>{dateLabel(selected.confirmedAt)}</time><strong>Người bán đã xác nhận đơn</strong></div>}<div><i/><time>{selected.orderDate}</time><strong>Đơn hàng đã được đặt thành công</strong></div></div>{normalize(selected.orderStatus) === "Pending" && <button className="cancel-order" onClick={cancelOrder}>Hủy đơn hàng</button>}</div>
          <aside className="order-summary"><div className="delivery-address"><small>NGƯỜI NHẬN</small><strong>{selected.email}</strong><p><FiMapPin/> {selected.address ? `${selected.address.buildingName}, ${selected.address.street}, ${selected.address.city}, ${selected.address.state}` : "Địa chỉ nhận hàng"}</p></div><div className="ordered-products"><header><strong>Amazing Seller</strong><button onClick={() => chatSeller(selected.orderItems[0]?.product?.productId)}><FiMessageCircle/> Chat</button></header>{selected.orderItems.map((item) => <article key={item.orderItemId}><img src={getImageUrl(item.product?.image)} alt={item.product?.productName}/><div><strong>{item.product?.productName}</strong><small>x{item.quantity}</small></div><b>{formatPrice(item.orderedProductPrice * item.quantity)}</b></article>)}<footer><span>Tổng tiền hàng</span><strong>{formatPrice(selected.totalAmount)}</strong><span>Phí vận chuyển</span><strong>Miễn phí</strong><b>Thành tiền</b><b>{formatPrice(selected.totalAmount)}</b></footer></div><div className="order-help"><FiClock/><div><strong>Bạn cần hỗ trợ?</strong><p>Hãy trò chuyện với người bán nếu đơn hàng có vấn đề.</p></div></div></aside>
        </div>
      </section>}
    </div>}
  </div></main>;
};
export default CustomerOrders;

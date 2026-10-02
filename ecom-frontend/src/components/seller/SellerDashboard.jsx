import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiAlertTriangle, FiArrowRight, FiBox, FiDollarSign, FiPackage, FiShoppingBag } from "react-icons/fi";
import { dashboardProductsAction, getOrdersForDashboard } from "../../store/actions";
import { formatPrice } from "../../utils/formatPrice";
import "./seller-dashboard.css";

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products, pagination: productPagination } = useSelector((state) => state.products);
  const { adminOrder: orders, pagination: orderPagination } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(dashboardProductsAction("pageNumber=0&pageSize=50&sortBy=productId&sortOrder=desc", false));
    dispatch(getOrdersForDashboard("pageNumber=0&pageSize=50&sortBy=orderDate&sortOrder=desc", false));
  }, [dispatch]);

  const productList = products || [];
  const orderList = orders || [];
  const lowStock = productList.filter((product) => Number(product.quantity) <= 10).length;
  const revenue = orderList.reduce((total, order) => total + Number(order.totalAmount || 0), 0);
  const recentOrders = orderList.slice(0, 5);

  const metrics = [
    { label: "Sản phẩm", value: productPagination.totalElements ?? productList.length, icon: FiPackage, tone: "blue" },
    { label: "Đơn hàng", value: orderPagination.totalElements ?? orderList.length, icon: FiShoppingBag, tone: "coral" },
    { label: "Doanh thu", value: formatPrice(revenue), icon: FiDollarSign, tone: "green" },
    { label: "Sắp hết hàng", value: lowStock, icon: FiAlertTriangle, tone: "yellow" },
  ];

  return <div className="seller-dashboard">
    <section className="seller-welcome"><div><span>TỔNG QUAN CỬA HÀNG</span><h1>Xin chào, {user?.username}</h1><p>Theo dõi sản phẩm, đơn hàng và hoạt động bán hàng của bạn tại một nơi.</p></div><div className="seller-welcome-actions"><Link className="secondary" to={`/shops/${user?.id}`}>Xem cửa hàng</Link><Link to="/seller/products?new=true">Thêm sản phẩm <FiArrowRight /></Link></div></section>
    <section className="seller-metrics">{metrics.map(({ label, value, icon: Icon, tone }) => <article key={label}><span className={`seller-metric-icon ${tone}`}><Icon /></span><div><small>{label}</small><strong>{value}</strong></div></article>)}</section>
    <section className="seller-dashboard-grid">
      <article className="seller-panel"><header><div><span>ĐƠN HÀNG</span><h2>Đơn hàng gần đây</h2></div><Link to="/seller/orders">Xem tất cả <FiArrowRight /></Link></header>{recentOrders.length ? <div className="seller-orders">{recentOrders.map((order) => <div key={order.orderId}><span className="seller-order-id">#{order.orderId}</span><div><strong>{order.email || "Khách hàng"}</strong><small>{order.orderDate || "Đang cập nhật"}</small></div><span className="seller-order-status">{order.orderStatus || "Đang xử lý"}</span><strong>{formatPrice(order.totalAmount)}</strong></div>)}</div> : <div className="seller-empty"><FiShoppingBag /><strong>Chưa có đơn hàng</strong><span>Đơn hàng mới sẽ xuất hiện tại đây.</span></div>}</article>
      <aside className="seller-panel seller-quick"><header><div><span>QUẢN LÝ NHANH</span><h2>Công việc bán hàng</h2></div></header><Link to="/seller/products"><FiBox /><div><strong>Quản lý sản phẩm</strong><small>Thêm, sửa, cập nhật ảnh và tồn kho</small></div><FiArrowRight /></Link><Link to="/seller/orders"><FiShoppingBag /><div><strong>Xử lý đơn hàng</strong><small>Kiểm tra và cập nhật trạng thái đơn</small></div><FiArrowRight /></Link>{lowStock > 0 && <div className="seller-stock-warning"><FiAlertTriangle /><span><strong>{lowStock} sản phẩm sắp hết hàng</strong><small>Hãy cập nhật tồn kho để không bỏ lỡ đơn hàng.</small></span></div>}</aside>
    </section>
  </div>;
};

export default SellerDashboard;

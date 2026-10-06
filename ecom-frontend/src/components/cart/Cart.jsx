import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiCheck, FiCreditCard, FiGift, FiShield, FiTruck } from "react-icons/fi";
import ItemContent from "./ItemContent";
import CartEmpty from "./CartEmpty";
import { formatPrice } from "../../utils/formatPrice";
import "./cart.css";

const Cart = () => {
  const dispatch = useDispatch();
  const { cart, selectedProductIds = [] } = useSelector((state) => state.carts);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const selectedItems = useMemo(() => (cart || []).filter((item) => selectedProductIds.includes(item.productId)), [cart, selectedProductIds]);
  const subtotal = useMemo(() => selectedItems.reduce((sum, item) => sum + Number(item.specialPrice || item.price) * Number(item.quantity), 0), [selectedItems]);
  const allSelected = cart?.length > 0 && selectedItems.length === cart.length;

  useEffect(() => localStorage.setItem("selectedCartIds", JSON.stringify(selectedProductIds)), [selectedProductIds]);
  const toggleItem = (productId) => dispatch({ type: "TOGGLE_CART_SELECTION", payload: productId });
  const toggleAll = () => dispatch({ type: "SELECT_ALL_CART_ITEMS", payload: !allSelected });

  if (!cart?.length) return <CartEmpty />;
  const applyCoupon = () => setCouponMessage(coupon.trim() ? "Mã chưa áp dụng cho đơn hàng này" : "Vui lòng nhập mã ưu đãi");

  return <main className="cart-page">
    <div className="cart-shell">
      <div className="cart-title"><Link to="/products"><FiArrowLeft /></Link><div><span>AMAZING CART</span><h1>Giỏ hàng của bạn</h1></div></div>
      <div className="cart-layout">
        <div className="cart-left">
          <div className="cart-list-header"><div><button type="button" className={`cart-check ${allSelected ? "is-selected" : ""}`} onClick={toggleAll} aria-label={allSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}>{allSelected && <FiCheck />}</button><strong>Tất cả ({cart.length} sản phẩm)</strong></div><small>Đơn giá · Số lượng · Thành tiền</small></div>
          <section className="cart-store">
            <header><div><span>MALL</span><strong>Amazing Official Store</strong></div><small>Freeship extra</small></header>
            {cart.map((item) => <ItemContent key={item.productId} {...item} selected={selectedProductIds.includes(item.productId)} onToggle={() => toggleItem(item.productId)} />)}
          </section>
          <div className="cart-shipping-note"><FiTruck /><span><strong>Miễn phí vận chuyển</strong> cho đơn hàng tại Amazing Official Store.</span></div>
          <Link className="cart-continue" to="/products"><FiArrowLeft /> Tiếp tục mua sắm</Link>
        </div>

        <aside className="cart-sidebar">
          <section className="coupon-card"><h2><FiGift /> Mã ưu đãi</h2><div><input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Nhập mã ưu đãi"/><button onClick={applyCoupon}>Áp dụng</button></div>{couponMessage && <small>{couponMessage}</small>}</section>
          <section className="order-summary"><h2>Tóm tắt đơn hàng</h2><div className="summary-line"><span>Tạm tính ({selectedItems.length} sản phẩm)</span><strong>{formatPrice(subtotal)}</strong></div><div className="summary-line"><span>Phí vận chuyển</span><strong className="free">Miễn phí</strong></div><div className="summary-line"><span>Giảm giá</span><strong className="free">-{formatPrice(0)}</strong></div><div className="summary-total"><div><span>Tổng cộng</span><small>Đã bao gồm VAT</small></div><strong>{formatPrice(subtotal)}</strong></div>{selectedItems.length ? <Link to="/checkout"><button className="checkout-button"><FiCreditCard /> Thanh toán ({selectedItems.length})</button></Link> : <button className="checkout-button" disabled><FiCreditCard /> Chọn sản phẩm để thanh toán</button>}<p><FiShield /> Thanh toán an toàn và bảo mật</p></section>
        </aside>
      </div>
    </div>
  </main>;
};

export default Cart;

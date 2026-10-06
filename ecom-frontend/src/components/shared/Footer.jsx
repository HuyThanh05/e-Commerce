import { Link, useLocation } from "react-router-dom";
import { FiFacebook, FiInstagram, FiMail, FiMapPin, FiPhone, FiYoutube } from "react-icons/fi";
import "./footer.css";
import { useSelector } from "react-redux";

const Footer = () => {
  const { pathname } = useLocation();
  const isSeller = useSelector((state) => state.auth.user?.roles?.includes("ROLE_SELLER"));
  if (pathname.startsWith("/admin") || pathname.startsWith("/seller") || pathname === "/messages") return null;
  return <footer className="site-footer"><div className="footer-shell"><div className="footer-brand"><Link to="/" className="footer-logo"><span>as</span><strong>Amazing.</strong></Link><p>Marketplace hiện đại cho trải nghiệm mua sắm dễ dàng, an toàn và đầy cảm hứng.</p><div className="footer-social"><a href="#facebook"><FiFacebook/></a><a href="#instagram"><FiInstagram/></a><a href="#youtube"><FiYoutube/></a></div></div><div><h3>{isSeller ? "Kênh bán hàng" : "Mua sắm"}</h3><Link to="/products">Tất cả sản phẩm</Link>{isSeller ? <><Link to="/seller/products">Sản phẩm của tôi</Link><Link to="/seller/orders">Đơn bán</Link></> : <><Link to="/products?category=Điện tử">Điện tử</Link><Link to="/products?category=Thời trang">Thời trang</Link><Link to="/cart">Giỏ hàng</Link></>}</div><div><h3>Về Amazing</h3><Link to="/about">Giới thiệu</Link><Link to="/contact">Liên hệ</Link>{!isSeller && <Link to="/register">Trở thành thành viên</Link>}<a href="#policy">Chính sách bảo mật</a></div><div><h3>Hỗ trợ khách hàng</h3><span><FiPhone/> 1900 1234</span><span><FiMail/> support@amazingshop.vn</span><span><FiMapPin/> TP. Hồ Chí Minh, Việt Nam</span></div></div><div className="footer-bottom"><span>© 2026 Amazing Shop. Mua vui, sống chất.</span><span>Điều khoản sử dụng · Chính sách bảo mật</span></div></footer>;
};
export default Footer;

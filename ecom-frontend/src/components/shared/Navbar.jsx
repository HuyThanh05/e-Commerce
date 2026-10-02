import { useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMenu, FiSearch, FiShoppingCart, FiUser, FiX, FiZap } from "react-icons/fi";
import UserMenu from "../UserMenu";
import "./navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const { cart } = useSelector((state) => state.carts);
  const { user } = useSelector((state) => state.auth);
  const { items: wishlist } = useSelector((state) => state.wishlist);
  const cartCount = cart?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  const search = (event) => {
    event.preventDefault();
    navigate(keyword.trim() ? `/products?keyword=${encodeURIComponent(keyword.trim())}` : "/products");
  };

  return <header className="market-header">
    <div className="market-main market-shell">
      <Link to="/" className="market-logo"><span>as</span><strong>Amazing.</strong></Link>
      <form className="market-search" onSubmit={search}><FiSearch /><input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Tìm sản phẩm, thương hiệu và danh mục..."/><button>Tìm kiếm</button></form>
      <div className="market-actions"><Link to="/wishlist" className="wishlist-action" aria-label="Yêu thích"><FiHeart />{wishlist.length > 0 && <span>{wishlist.length}</span>}</Link>{user?.id ? <UserMenu /> : <Link to="/login" aria-label="Tài khoản"><FiUser /></Link>}<Link to="/cart" className="cart-action" aria-label="Giỏ hàng"><FiShoppingCart />{cartCount > 0 && <span>{cartCount}</span>}</Link><button className="market-menu-button" onClick={() => setOpen(!open)}>{open ? <FiX /> : <FiMenu />}</button></div>
    </div>
    <div className={`market-nav ${open ? "market-nav--open" : ""}`}><div className="market-shell"><Link to="/">Trang chủ</Link><div className="market-products-menu"><Link to="/products">Sản phẩm <span>⌄</span></Link><div className="market-products-dropdown"><Link to="/products">Tất cả sản phẩm</Link><Link to="/products?category=Điện tử">Điện tử</Link><Link to="/products?category=Điện thoại">Điện thoại</Link><Link to="/products?category=Thời trang">Thời trang</Link><Link to="/products?category=Nhà cửa">Nhà cửa</Link><Link to="/products?category=Phụ kiện">Phụ kiện</Link></div></div><Link to="/about">Về chúng tôi</Link><Link to="/contact">Liên hệ</Link><Link className="flash-link" to="/products"><FiZap /> Flash Sale</Link></div></div>
  </header>;
};

export default Navbar;

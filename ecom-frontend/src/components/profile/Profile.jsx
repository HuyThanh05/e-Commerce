import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiChevronRight, FiHome, FiMail, FiMapPin, FiShoppingBag, FiShoppingCart, FiShield, FiUser } from "react-icons/fi";
import { getUserAddresses } from "../../store/actions";
import "./profile.css";

const Profile = () => {
  const dispatch = useDispatch();
  const { user, address } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.carts);
  useEffect(() => { dispatch(getUserAddresses()); }, [dispatch]);
  const role = user?.roles?.includes("ROLE_ADMIN") ? "Quản trị viên" : user?.roles?.includes("ROLE_SELLER") ? "Người bán" : "Thành viên";

  return <main className="profile-page"><div className="profile-shell">
    <nav className="profile-breadcrumb"><Link to="/">Trang chủ</Link><FiChevronRight/><strong>Tài khoản</strong></nav>
    <section className="profile-banner"><div className="profile-avatar">{user?.username?.charAt(0)?.toUpperCase() || <FiUser/>}</div><div><span>AMAZING MEMBER</span><h1>Xin chào, {user?.username}</h1><p>Quản lý thông tin tài khoản và địa chỉ nhận hàng của bạn.</p></div></section>
    <div className="profile-layout">
      <aside className="profile-menu"><a className="active" href="#account"><FiUser/> Tài khoản</a><a href="#addresses"><FiMapPin/> Địa chỉ nhận hàng</a><Link to="/orders"><FiShoppingBag/> Đơn mua của tôi</Link><Link to="/cart"><FiShoppingCart/> Giỏ hàng <span>{cart?.length || 0}</span></Link><Link to="/products"><FiShoppingBag/> Tiếp tục mua sắm</Link></aside>
      <div className="profile-content">
        <section id="account" className="profile-card"><div className="profile-card__heading"><div><span>THÔNG TIN CÁ NHÂN</span><h2>Hồ sơ của tôi</h2></div><FiShield/></div><div className="profile-fields"><div><label><FiUser/> Tên đăng nhập</label><strong>{user?.username || "Chưa cập nhật"}</strong></div><div><label><FiMail/> Email</label><strong>{user?.email || "Chưa cập nhật"}</strong></div><div><label><FiShield/> Loại tài khoản</label><strong>{role}</strong></div><div><label>Trạng thái</label><strong className="profile-status">Đang hoạt động</strong></div></div><p className="profile-note">Tên đăng nhập và email đang được quản lý bởi hệ thống xác thực để bảo vệ tài khoản của bạn.</p></section>
        <section id="addresses" className="profile-card"><div className="profile-card__heading"><div><span>GIAO HÀNG</span><h2>Địa chỉ của tôi</h2></div><FiHome/></div>{address?.length ? <div className="address-grid">{address.map((item,index)=><article key={item.addressId}><span>{index===0?"Mặc định":`Địa chỉ ${index+1}`}</span><h3>{item.buildingName}</h3><p>{item.street}, {item.city}</p><p>{item.state}, {item.country} · {item.pincode}</p></article>)}</div> : <div className="profile-empty"><FiMapPin/><h3>Chưa có địa chỉ</h3><p>Bạn có thể thêm địa chỉ trong bước thanh toán.</p><Link to="/cart">Đi đến giỏ hàng</Link></div>}</section>
      </div>
    </div>
  </div></main>;
};
export default Profile;

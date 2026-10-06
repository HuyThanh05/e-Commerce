import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiArrowRight, FiBox, FiClock, FiHeadphones, FiHeart, FiRefreshCw, FiShield, FiShoppingCart, FiTruck } from "react-icons/fi";
import { fetchProducts, addToCart } from "../../store/actions";
import { formatPrice } from "../../utils/formatPrice";
import { getImageUrl } from "../../utils/getImageUrl";
import HeroBanner from "./HeroBanner";
import Loader from "../shared/Loader";
import "./home.css";
import { toggleWishlist } from "../../store/actions/wishlistActions";

const categories = [
  { label: "Điện thoại", category: "Điện thoại", image: "phone-real.jpg" },
  { label: "Thời trang", category: "Thời trang", image: "sneaker-real.jpg" },
  { label: "Điện tử", category: "Điện tử", image: "headphones-real.jpg" },
  { label: "Nhà cửa & Đời sống", category: "Nhà cửa", image: "lamp-real.jpg" },
  { label: "Máy tính & Phụ kiện", category: "Điện tử", image: "keyboard-real.jpg" },
  { label: "Đồng hồ thông minh", category: "Phụ kiện", image: "watch-real.jpg" },
  { label: "Âm thanh", category: "Điện tử", image: "speaker-real.jpg" },
  { label: "Giày dép", category: "Thời trang", image: "sneaker-real.jpg" },
  { label: "Balo & Túi xách", category: "Thời trang", image: "backpack-real.jpg" },
  { label: "Tất cả sản phẩm", category: "", image: "phone-real.jpg" },
];
const benefits = [
  { icon: FiShield, title: "Hàng chính hãng", text: "Cam kết 100% nguồn gốc" },
  { icon: FiTruck, title: "Miễn phí vận chuyển", text: "Đơn hàng đủ điều kiện" },
  { icon: FiRefreshCw, title: "Đổi trả trong 15 ngày", text: "Nhanh chóng, dễ dàng" },
  { icon: FiHeadphones, title: "Hỗ trợ 24/7", text: "Luôn sẵn sàng lắng nghe" },
];

const HomeProductCard = ({ product, onAdd }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wished = useSelector((state) => state.wishlist.items.some((item) => item.productId === product.productId));
  const isSeller = useSelector((state) => state.auth.user?.roles?.includes("ROLE_SELLER"));
  const finalPrice = product.specialPrice || product.price;
  const available = Number(product.quantity) > 0;
  return <article className="deal-card">
    <div className="deal-card__image">
      {product.discount > 0 && <span>-{Math.round(product.discount)}%</span>}
      {!isSeller && <button type="button" className={wished ? "is-wished" : ""} onClick={() => dispatch(toggleWishlist(product, toast))} aria-label={wished ? "Bỏ yêu thích" : "Thêm yêu thích"}><FiHeart /></button>}
      <img onClick={() => navigate(`/products/${product.productId}`)} src={getImageUrl(product.image)} alt={product.productName} />
    </div>
    <div className="deal-card__body">
      <div className="deal-card__rating">{product.reviewCount > 0 ? `★ ${Number(product.averageRating).toFixed(1)}` : "☆ Chưa có đánh giá"} <small>· Đã bán {product.soldQuantity || 0}</small></div>
      <h3 onClick={() => navigate(`/products/${product.productId}`)}>{product.productName}</h3>
      <div className="deal-card__price"><strong>{formatPrice(finalPrice)}</strong>{product.specialPrice > 0 && <del>{formatPrice(product.price)}</del>}</div>
      {!isSeller && <button type="button" disabled={!available} onClick={() => onAdd(product)}><FiShoppingCart /> {available ? "Thêm vào giỏ" : "Hết hàng"}</button>}
    </div>
  </article>;
};

const Home = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  useEffect(() => { dispatch(fetchProducts()); }, [dispatch]);
  const handleAddToCart = (product) => dispatch(addToCart(product, 1, toast));

  return <main className="home-page">
    <div className="home-container">
      <HeroBanner />
      <section className="home-section category-section">
        <div className="home-section__heading category-heading"><div><h2>Danh mục</h2></div><Link to="/products">Xem tất cả <FiArrowRight /></Link></div>
        <div className="category-grid">{categories.map(({ label, category, image }) => <Link to={category ? `/products?category=${encodeURIComponent(category)}` : "/products"} className="category-item" key={label}><span className="category-item__image"><img src={`/sample-products/${image}`} alt="" /></span><strong>{label}</strong></Link>)}</div>
      </section>
      <section className="home-section deals-section">
        <div className="home-section__heading deals-heading"><div><span><FiClock /> ƯU ĐÃI GIỚI HẠN</span><h2>Deal đang cháy hàng</h2></div><div className="deal-tabs"><button className="active">Phổ biến</button><button>Bán chạy</button><button>Mới nhất</button></div></div>
        {isLoading ? <Loader /> : errorMessage ? <div className="home-state"><FiBox /><h3>Chưa thể tải sản phẩm</h3><p>{errorMessage}</p></div> : products?.length ? <div className="deals-grid">{products.slice(0, 5).map((product) => <HomeProductCard key={product.productId} product={product} onAdd={handleAddToCart} />)}</div> : <div className="home-state"><FiBox /><h3>Gian hàng đang được cập nhật</h3><p>Hãy thêm sản phẩm trong trang quản trị để hiển thị tại đây.</p></div>}
      </section>
      <section className="benefits">{benefits.map(({ icon: Icon, title, text }) => <div className="benefit" key={title}><span><Icon /></span><div><strong>{title}</strong><small>{text}</small></div></div>)}</section>
    </div>
  </main>;
};

export default Home;

import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiChevronRight, FiHeart, FiMinus, FiPlus, FiRefreshCw, FiShield, FiShoppingCart, FiTruck } from "react-icons/fi";
import api from "../../api/api";
import { addToCart } from "../../store/actions";
import { formatPrice } from "../../utils/formatPrice";
import { getImageUrl } from "../../utils/getImageUrl";
import Loader from "../shared/Loader";
import "./product-details.css";
import { toggleWishlist } from "../../store/actions/wishlistActions";

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const wished = useSelector((state) => state.wishlist.items.some((item) => String(item.productId) === String(productId)));
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    Promise.all([
      api.get(`/public/products/${productId}`),
      api.get("/public/products?pageNumber=0&pageSize=8&sortBy=productId&sortOrder=desc"),
    ]).then(([productResponse, productsResponse]) => {
      setProduct(productResponse.data);
      setRelated((productsResponse.data.content || []).filter((item) => String(item.productId) !== String(productId)).slice(0, 4));
      setError("");
    }).catch(() => setError("Không tìm thấy sản phẩm hoặc backend chưa sẵn sàng."))
      .finally(() => setLoading(false));
  }, [productId]);

  const discount = Math.round(Number(product?.discount || 0));
  const finalPrice = product?.specialPrice || product?.price || 0;
  const available = Number(product?.quantity || 0) > 0;
  const savings = useMemo(() => Math.max(0, Number(product?.price || 0) - Number(finalPrice)), [product, finalPrice]);

  const add = () => dispatch(addToCart(product, quantity, toast));
  const buyNow = () => { add(); navigate("/cart"); };

  if (loading) return <div className="product-detail-loading"><Loader /></div>;
  if (error || !product) return <div className="product-detail-error"><h2>Không thể mở sản phẩm</h2><p>{error}</p><Link to="/products">Quay lại sản phẩm</Link></div>;

  return <main className="product-detail-page">
    <div className="product-detail-shell">
      <nav className="product-breadcrumb"><Link to="/">Trang chủ</Link><FiChevronRight /><Link to="/products">Sản phẩm</Link><FiChevronRight /><strong>{product.productName}</strong></nav>

      <section className="product-overview">
        <div className="product-gallery">
          <div className="product-thumbs">{[0,1,2].map((item) => <button className={item === 0 ? "active" : ""} key={item}><img src={getImageUrl(product.image)} alt="" /></button>)}</div>
          <div className="product-main-image">{discount > 0 && <span>-{discount}%</span>}<button className={wished ? "is-wished" : ""} onClick={() => dispatch(toggleWishlist(product, toast))} aria-label={wished ? "Bỏ yêu thích" : "Thêm yêu thích"}><FiHeart /></button><img src={getImageUrl(product.image)} alt={product.productName} /></div>
        </div>

        <div className="product-summary">
          <div className="product-meta"><span>HÀNG CHÍNH HÃNG</span><b>★ 4.9</b><small>1.2k đánh giá</small><small>Đã bán 2.1k</small></div>
          <h1>{product.productName}</h1><p className="product-description">{product.description}</p>
          <div className="product-price-box"><div><strong>{formatPrice(finalPrice)}</strong>{product.specialPrice > 0 && <del>{formatPrice(product.price)}</del>}{discount > 0 && <span>TIẾT KIỆM {formatPrice(savings)}</span>}</div><small>⚡ Giá ưu đãi chỉ còn hôm nay</small></div>
          <div className="product-option"><label>Số lượng</label><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button><strong>{quantity}</strong><button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}><FiPlus /></button></div><small>Còn {product.quantity} sản phẩm</small></div>
          <div className="shipping-row"><label>Vận chuyển</label><FiTruck /><div><strong>Miễn phí vận chuyển</strong><small>Nhận hàng dự kiến trong 2–4 ngày</small></div></div>
          <div className="product-actions"><button disabled={!available} onClick={add}><FiShoppingCart /> Thêm vào giỏ</button><button disabled={!available} onClick={buyNow}>Mua ngay</button></div>
          <div className="product-assurance"><span><FiShield /> Bảo hành 12 tháng</span><span><FiRefreshCw /> Đổi trả 15 ngày</span></div>
        </div>
      </section>

      <section className="product-information"><div><h2>Thông tin sản phẩm</h2><h3>Đặc điểm nổi bật</h3><ul><li>Thiết kế hiện đại, phù hợp nhu cầu sử dụng hằng ngày.</li><li>Sản phẩm chính hãng với chất lượng được kiểm tra.</li><li>Đóng gói an toàn và hỗ trợ đổi trả trong 15 ngày.</li><li>{product.description}</li></ul></div><aside><span>AMAZING MEMBER</span><h2>Mua càng nhiều,<br/>ưu đãi càng lớn</h2><p>Tích điểm và nhận voucher độc quyền mỗi tháng.</p><Link to="/register">Tìm hiểu thêm <FiChevronRight /></Link></aside></section>

      {related.length > 0 && <section className="related-products"><div className="related-heading"><div><span>CÓ THỂ BẠN SẼ THÍCH</span><h2>Sản phẩm tương tự</h2></div><Link to="/products">Xem tất cả <FiChevronRight /></Link></div><div className="related-grid">{related.map((item) => <article key={item.productId} onClick={() => navigate(`/products/${item.productId}`)}><img src={getImageUrl(item.image)} alt={item.productName}/><div><h3>{item.productName}</h3><strong>{formatPrice(item.specialPrice || item.price)}</strong></div></article>)}</div></section>}
    </div>
  </main>;
};

export default ProductDetails;

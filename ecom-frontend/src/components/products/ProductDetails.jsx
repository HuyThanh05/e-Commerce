import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { FiChevronRight, FiHeart, FiMessageCircle, FiMinus, FiPlus, FiRefreshCw, FiShield, FiShoppingCart, FiTruck } from "react-icons/fi";
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
  const user = useSelector((state) => state.auth.user);
  const isSeller = user?.roles?.includes("ROLE_SELLER");
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    setLoading(true);
    setQuantity(1);
    Promise.all([
      api.get(`/public/products/${productId}`),
      api.get("/public/products?pageNumber=0&pageSize=8&sortBy=productId&sortOrder=desc"),
      api.get(`/public/products/${productId}/reviews`),
    ]).then(([productResponse, productsResponse, reviewsResponse]) => {
      setProduct(productResponse.data);
      setRelated((productsResponse.data.content || []).filter((item) => String(item.productId) !== String(productId)).slice(0, 4));
      setReviews(reviewsResponse.data || []);
      setError("");
    }).catch(() => setError("Không tìm thấy sản phẩm hoặc backend chưa sẵn sàng."))
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    if (!user?.id || isSeller) { setCanReview(false); return; }
    api.get(`/reviews/products/${productId}/eligibility`)
      .then(({ data }) => setCanReview(Boolean(data.eligible)))
      .catch(() => setCanReview(false));
  }, [productId, user?.id, isSeller]);

  const discount = Math.round(Number(product?.discount || 0));
  const finalPrice = product?.specialPrice || product?.price || 0;
  const available = Number(product?.quantity || 0) > 0;
  const savings = useMemo(() => Math.max(0, Number(product?.price || 0) - Number(finalPrice)), [product, finalPrice]);

  const add = () => dispatch(addToCart(product, quantity, toast));
  const buyNow = () => { add(); navigate("/cart"); };
  const chatWithSeller = async () => {
    if (!product.sellerId) {
      toast.error("Sản phẩm này chưa được gán cho người bán.");
      return;
    }
    if (!user?.id) {
      navigate("/login");
      return;
    }
    if (String(user.id) === String(product.sellerId)) {
      toast.error("Đây là sản phẩm của bạn.");
      return;
    }
    try {
      const { data } = await api.post("/chat/conversations", { productId: product.productId });
      navigate(`/messages?conversation=${data.conversationId}`);
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Không thể bắt đầu cuộc trò chuyện.");
    }
  };
  const submitReview = async (event) => {
    event.preventDefault();
    if (!user?.id) { navigate("/login"); return; }
    try {
      setReviewing(true);
      await api.post(`/reviews/products/${product.productId}`, { rating: reviewRating, comment: reviewComment });
      const [productResponse, reviewsResponse] = await Promise.all([
        api.get(`/public/products/${product.productId}`),
        api.get(`/public/products/${product.productId}/reviews`),
      ]);
      setProduct(productResponse.data);
      setReviews(reviewsResponse.data);
      setReviewComment("");
      toast.success("Đánh giá của bạn đã được ghi nhận.");
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || "Bạn chỉ có thể đánh giá sau khi đơn hàng đã giao thành công.");
    } finally { setReviewing(false); }
  };

  if (loading) return <div className="product-detail-loading"><Loader /></div>;
  if (error || !product) return <div className="product-detail-error"><h2>Không thể mở sản phẩm</h2><p>{error}</p><Link to="/products">Quay lại sản phẩm</Link></div>;

  return <main className="product-detail-page">
    <div className="product-detail-shell">
      <nav className="product-breadcrumb"><Link to="/">Trang chủ</Link><FiChevronRight /><Link to="/products">Sản phẩm</Link><FiChevronRight /><strong>{product.productName}</strong></nav>

      <section className="product-overview">
        <div className="product-gallery">
          <div className="product-thumbs">{[0,1,2].map((item) => <button className={item === 0 ? "active" : ""} key={item}><img src={getImageUrl(product.image)} alt="" /></button>)}</div>
          <div className="product-main-image">{discount > 0 && <span>-{discount}%</span>}{!isSeller && <button className={wished ? "is-wished" : ""} onClick={() => dispatch(toggleWishlist(product, toast))} aria-label={wished ? "Bỏ yêu thích" : "Thêm yêu thích"}><FiHeart /></button>}<img src={getImageUrl(product.image)} alt={product.productName} /></div>
        </div>

        <div className="product-summary">
          <div className="product-meta"><span>HÀNG CHÍNH HÃNG</span><b>{product.reviewCount > 0 ? `★ ${Number(product.averageRating).toFixed(1)}` : "☆ Chưa có đánh giá"}</b><small>{product.reviewCount || 0} đánh giá</small><small>Đã bán {product.soldQuantity || 0}</small></div>
          <h1>{product.productName}</h1><p className="product-description">{product.description}</p>
          <div className="product-price-box"><div><strong>{formatPrice(finalPrice)}</strong>{product.specialPrice > 0 && <del>{formatPrice(product.price)}</del>}{discount > 0 && <span>TIẾT KIỆM {formatPrice(savings)}</span>}</div><small>⚡ Giá ưu đãi chỉ còn hôm nay</small></div>
          <div className="product-option"><label>Số lượng</label><div className="quantity-control"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><FiMinus /></button><strong>{quantity}</strong><button onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}><FiPlus /></button></div><small>Còn {product.quantity} sản phẩm</small></div>
          <div className="shipping-row"><label>Vận chuyển</label><FiTruck /><div><strong>Miễn phí vận chuyển</strong><small>Nhận hàng dự kiến trong 2–4 ngày</small></div></div>
          <div className="product-seller"><div><span>Được bán bởi</span><strong>{product.sellerName || "Amazing Seller"}</strong></div>{!isSeller && <button onClick={chatWithSeller}><FiMessageCircle /> Chat với người bán</button>}</div>
          {!isSeller && <div className="product-actions"><button disabled={!available} onClick={add}><FiShoppingCart /> Thêm vào giỏ</button><button disabled={!available} onClick={buyNow}>Mua ngay</button></div>}
          <div className="product-assurance"><span><FiShield /> Bảo hành 12 tháng</span><span><FiRefreshCw /> Đổi trả 15 ngày</span></div>
        </div>
      </section>

      <section className="product-reviews"><div className="product-reviews-heading"><div><span>ĐÁNH GIÁ THỰC TẾ</span><h2>Đánh giá sản phẩm</h2><p>{product.reviewCount > 0 ? `${Number(product.averageRating).toFixed(1)}/5 từ ${product.reviewCount} khách hàng đã mua` : "Sản phẩm chưa có đánh giá nào."}</p></div><strong>{product.reviewCount > 0 ? `★ ${Number(product.averageRating).toFixed(1)}` : "☆"}</strong></div>{canReview && <form onSubmit={submitReview}><label>Đánh giá của bạn</label><div className="review-stars">{[1,2,3,4,5].map((star) => <button type="button" className={star <= reviewRating ? "active" : ""} onClick={() => setReviewRating(star)} key={star}>★</button>)}</div><textarea value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength={1000} placeholder="Chia sẻ trải nghiệm thực tế về sản phẩm..."/><button type="submit" disabled={reviewing}>{reviewing ? "Đang gửi..." : "Gửi đánh giá"}</button><small>Đơn hàng đã được giao — bạn có thể đánh giá sản phẩm này.</small></form>}<div className="review-list">{reviews.map((review) => <article key={review.reviewId}><div><span>{review.userName?.charAt(0)?.toUpperCase()}</span><div><strong>{review.userName}</strong><b>{"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}</b></div><time>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</time></div><p>{review.comment || "Khách hàng không để lại nhận xét."}</p></article>)}</div></section>

      <section className="product-information"><div><h2>Thông tin sản phẩm</h2><h3>Đặc điểm nổi bật</h3><ul><li>Thiết kế hiện đại, phù hợp nhu cầu sử dụng hằng ngày.</li><li>Sản phẩm chính hãng với chất lượng được kiểm tra.</li><li>Đóng gói an toàn và hỗ trợ đổi trả trong 15 ngày.</li><li>{product.description}</li></ul></div><aside><span>AMAZING MEMBER</span><h2>Mua càng nhiều,<br/>ưu đãi càng lớn</h2><p>Tích điểm và nhận voucher độc quyền mỗi tháng.</p><Link to="/register">Tìm hiểu thêm <FiChevronRight /></Link></aside></section>

      {related.length > 0 && <section className="related-products"><div className="related-heading"><div><span>CÓ THỂ BẠN SẼ THÍCH</span><h2>Sản phẩm tương tự</h2></div><Link to="/products">Xem tất cả <FiChevronRight /></Link></div><div className="related-grid">{related.map((item) => <article key={item.productId} onClick={() => navigate(`/products/${item.productId}`)}><img src={getImageUrl(item.image)} alt={item.productName}/><div><h3>{item.productName}</h3><strong>{formatPrice(item.specialPrice || item.price)}</strong></div></article>)}</div></section>}
    </div>
  </main>;
};

export default ProductDetails;

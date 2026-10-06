import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { addToCart } from "../../store/actions";
import { formatPrice } from "../../utils/formatPrice";
import { getImageUrl } from "../../utils/getImageUrl";
import truncateText from "../../utils/truncateText";
import "./product-card.css";
import { toggleWishlist } from "../../store/actions/wishlistActions";

const ProductCard = ({ productId, productName, image, description, quantity, price, discount, specialPrice, soldQuantity = 0, averageRating = 0, reviewCount = 0, about = false }) => {
  const dispatch = useDispatch(); const navigate = useNavigate(); const available = Number(quantity) > 0; const finalPrice = specialPrice || price;
  const wished = useSelector((state) => state.wishlist.items.some((item) => item.productId === productId));
  const isSeller = useSelector((state) => state.auth.user?.roles?.includes("ROLE_SELLER"));
  const product = { productId,productName,image,description,quantity,price,discount,specialPrice };
  const open = () => !about && navigate(`/products/${productId}`);
  const add = (event) => { event.stopPropagation(); dispatch(addToCart(product,1,toast)); };
  const toggleWish = (event) => { event.stopPropagation(); dispatch(toggleWishlist(product, toast)); };
  return <article className="market-product-card">
    <div className="market-product-card__image" onClick={open}>{discount > 0 && <span>-{Math.round(discount)}%</span>}{!isSeller && <button className={wished ? "is-wished" : ""} onClick={toggleWish} aria-label={wished ? "Bỏ yêu thích" : "Thêm yêu thích"}><FiHeart/></button>}<img src={getImageUrl(image)} alt={productName}/></div>
    <div className="market-product-card__body"><div className="market-product-card__rating">{reviewCount > 0 ? `★ ${Number(averageRating).toFixed(1)}` : "☆ Chưa có đánh giá"} <small>· Đã bán {soldQuantity}</small></div><h3 onClick={open}>{truncateText(productName,55)}</h3><p>{truncateText(description,65)}</p><div className="market-product-card__prices"><strong>{formatPrice(finalPrice)}</strong>{specialPrice > 0 && <del>{formatPrice(price)}</del>}</div>{!about && !isSeller && <button disabled={!available} onClick={add}><FiShoppingCart/>{available ? "Thêm vào giỏ" : "Hết hàng"}</button>}</div>
  </article>;
};
export default ProductCard;

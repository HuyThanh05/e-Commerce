import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiArrowRight, FiHeart, FiShield } from "react-icons/fi";
import ProductCard from "../shared/ProductCard";
import "./wishlist.css";

const Wishlist = () => {
  const { items } = useSelector((state) => state.wishlist);
  return <main className="wishlist-page"><section className="wishlist-hero"><div><span>SẢN PHẨM ĐÃ LƯU</span><h1>Danh sách yêu thích</h1><p>Lưu lại những sản phẩm bạn quan tâm và quay lại mua bất cứ lúc nào.</p></div><FiHeart/></section><div className="wishlist-shell"><div className="wishlist-heading"><div><h2>Sản phẩm của bạn</h2><p>{items.length} sản phẩm đang được lưu</p></div><span><FiShield/> Được lưu an toàn trên thiết bị</span></div>{items.length ? <div className="wishlist-grid">{items.map((item)=><ProductCard key={item.productId} {...item}/>)}</div> : <section className="wishlist-empty"><span><FiHeart/></span><h2>Chưa có sản phẩm yêu thích</h2><p>Nhấn biểu tượng trái tim trên sản phẩm để lưu vào danh sách này.</p><Link to="/products">Khám phá sản phẩm <FiArrowRight/></Link></section>}</div></main>;
};
export default Wishlist;

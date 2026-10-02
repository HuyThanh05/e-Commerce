import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import heroImage from "../../assets/sliders/s_2.webp";

const HeroBanner = () => (
  <section className="home-hero">
    <div className="home-hero__content">
      <span className="home-hero__eyebrow">ƯU ĐÃI CÔNG NGHỆ THÁNG NÀY</span>
      <h1>Deal chất ngất.<br />Giá giảm <em>hết cỡ.</em></h1>
      <p>Khám phá hàng ngàn sản phẩm chính hãng, ưu đãi hấp dẫn và giao hàng nhanh chóng trên toàn quốc.</p>
      <Link to="/products" className="home-primary-button">Khám phá ngay <FiArrowRight /></Link>
    </div>
    <div className="home-hero__visual" aria-hidden="true">
      <span className="home-hero__shape" />
      <img src={heroImage} alt="" />
      <div className="home-hero__price-tag">Chỉ từ <strong>999K</strong></div>
    </div>
  </section>
);

export default HeroBanner;

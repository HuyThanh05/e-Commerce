import { FiAward, FiHeart, FiShield, FiTruck } from "react-icons/fi";
import heroImage from "../assets/sliders/s_1.webp";
import "./market-pages.css";

const About = () => <main className="brand-page"><div className="brand-shell">
  <section className="brand-hero"><div className="brand-hero__copy"><span className="brand-kicker">VỀ AMAZING SHOP</span><h1>Mua sắm dễ dàng,<br/>an tâm mỗi ngày</h1><p>Amazing Shop là nền tảng thương mại điện tử dành cho người mua và người bán Việt Nam. Chúng tôi tập trung vào sản phẩm chính hãng, mức giá minh bạch và trải nghiệm mua sắm thuận tiện từ lúc tìm kiếm đến khi nhận hàng.</p></div><div className="brand-hero__visual"><img src={heroImage} alt="Khách hàng của Amazing Shop"/></div></section>
  <section className="brand-values"><article className="brand-value"><span><FiShield/></span><h3>Mua sắm an tâm</h3><p>Sản phẩm được kiểm soát nguồn gốc và thông tin hiển thị rõ ràng.</p></article><article className="brand-value"><span><FiTruck/></span><h3>Giao hàng tiện lợi</h3><p>Hỗ trợ vận chuyển toàn quốc, theo dõi đơn hàng dễ dàng.</p></article><article className="brand-value"><span><FiHeart/></span><h3>Khách hàng là trung tâm</h3><p>Đội ngũ hỗ trợ luôn lắng nghe và đồng hành trong suốt quá trình mua sắm.</p></article></section>
  <section className="brand-story"><div><span className="brand-kicker"><FiAward/> CAM KẾT CỦA CHÚNG TÔI</span><h2>Marketplace hiện đại dành cho mọi nhu cầu</h2></div><p>Từ điện tử, thời trang đến đồ dùng gia đình, Amazing Shop hướng đến một gian hàng trực tuyến đa dạng và đáng tin cậy. Chúng tôi liên tục cải thiện công nghệ để việc tìm kiếm, đặt hàng và thanh toán trở nên nhanh chóng, an toàn hơn.</p></section>
</div></main>;
export default About;

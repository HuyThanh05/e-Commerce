import { useState } from "react";
import toast from "react-hot-toast";
import { FiMail, FiMapPin, FiMessageCircle, FiPhone } from "react-icons/fi";
import "./market-pages.css";

const Contact = () => {
  const [form,setForm]=useState({name:"",email:"",message:""});
  const submit=(e)=>{e.preventDefault();toast.success("Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm.");setForm({name:"",email:"",message:""})};
  return <main className="brand-page"><div className="brand-shell"><div className="contact-layout">
    <section className="contact-info"><span>TRUNG TÂM HỖ TRỢ</span><h1>Chúng tôi luôn<br/>sẵn sàng lắng nghe</h1><p>Bạn cần hỗ trợ về sản phẩm, đơn hàng hay thanh toán? Hãy để lại thông tin, đội ngũ Amazing Shop sẽ liên hệ trong thời gian sớm nhất.</p><div className="contact-cards"><div className="contact-card"><span><FiPhone/></span><div><strong>Hotline</strong><small>1900 1234 · 08:00–22:00</small></div></div><div className="contact-card"><span><FiMail/></span><div><strong>Email</strong><small>support@amazingshop.vn</small></div></div><div className="contact-card"><span><FiMapPin/></span><div><strong>Văn phòng</strong><small>TP. Hồ Chí Minh, Việt Nam</small></div></div></div></section>
    <form className="contact-form" onSubmit={submit}><h2><FiMessageCircle/> Gửi yêu cầu hỗ trợ</h2><div className="contact-form__row"><div className="contact-form__field"><label>Họ và tên</label><input required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} placeholder="Nguyễn Văn A"/></div><div className="contact-form__field"><label>Email</label><input type="email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} placeholder="email@example.com"/></div></div><div className="contact-form__field"><label>Nội dung cần hỗ trợ</label><textarea rows="7" required value={form.message} onChange={(e)=>setForm({...form,message:e.target.value})} placeholder="Hãy mô tả vấn đề của bạn..."/></div><button>Gửi yêu cầu</button></form>
  </div></div></main>;
};
export default Contact;

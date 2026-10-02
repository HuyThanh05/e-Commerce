import { MdArrowBack, MdShoppingCart } from "react-icons/md";
import { Link } from "react-router-dom";

const CartEmpty = () => {
  return (
    <div className="min-h-[650px] bg-[#f5f7fa] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center bg-white border border-slate-200 rounded-3xl shadow-lg px-16 py-12 text-center">
        <div className="w-24 h-24 rounded-full bg-red-50 grid place-items-center mb-5">
          <MdShoppingCart size={48} className="text-[#ff4e5e]" />
        </div>
        <div className="text-2xl font-bold text-slate-800">
          Giỏ hàng đang trống
        </div>
        <div className="text-sm text-slate-500 mt-2">
          Hãy thêm sản phẩm bạn yêu thích để bắt đầu mua sắm.
        </div>
        <Link
          to="/products"
          className="mt-7 flex gap-2 items-center bg-[#14213d] text-white px-6 py-3 rounded-xl hover:bg-slate-700 transition"
        >
          <MdArrowBack size={18} />
          <span className="text-sm font-semibold">Bắt đầu mua sắm</span>
        </Link>
      </div>
    </div>
  );
};

export default CartEmpty;

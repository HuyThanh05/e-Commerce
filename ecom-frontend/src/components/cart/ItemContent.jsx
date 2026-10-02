import { useState } from "react";
import { FiCheck, FiTrash2 } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { decreaseCartQuantity, increaseCartQuantity, removeFromCart } from "../../store/actions";
import toast from "react-hot-toast";
import { formatPrice } from "../../utils/formatPrice";
import { getImageUrl } from "../../utils/getImageUrl";
import SetQuantity from "./SetQuantity";

const ItemContent = ({ productId, productName, image, description, quantity, price, specialPrice }) => {
  const [currentQuantity, setCurrentQuantity] = useState(quantity);
  const dispatch = useDispatch();
  const item = { image, productName, description, specialPrice, price, productId, quantity };
  const unitPrice = Number(specialPrice || price);
  const increase = () => dispatch(increaseCartQuantity(item, toast, currentQuantity, setCurrentQuantity));
  const decrease = () => currentQuantity > 1 && dispatch(decreaseCartQuantity(item, currentQuantity - 1, toast, setCurrentQuantity));
  const remove = () => dispatch(removeFromCart(item, toast));

  return <article className="cart-item">
    <span className="fake-check"><FiCheck /></span>
    <img className="cart-item__image" src={getImageUrl(image)} alt={productName}/>
    <div className="cart-item__info"><h3>{productName}</h3><span>Phân loại: Tiêu chuẩn</span></div>
    <div className="cart-item__price"><strong>{formatPrice(unitPrice)}</strong>{specialPrice > 0 && <del>{formatPrice(price)}</del>}</div>
    <SetQuantity quantity={currentQuantity} handeQtyIncrease={increase} handleQtyDecrease={decrease}/>
    <div className="cart-item__total"><strong>{formatPrice(unitPrice * currentQuantity)}</strong><button onClick={remove}><FiTrash2 /> Xóa</button></div>
  </article>;
};

export default ItemContent;

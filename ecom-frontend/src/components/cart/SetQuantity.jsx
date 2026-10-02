import { FiMinus, FiPlus } from "react-icons/fi";

const SetQuantity = ({ quantity, handeQtyIncrease, handleQtyDecrease }) => <div className="cart-quantity"><button disabled={quantity <= 1} onClick={handleQtyDecrease}><FiMinus /></button><strong>{quantity}</strong><button onClick={handeQtyIncrease}><FiPlus /></button></div>;

export default SetQuantity;

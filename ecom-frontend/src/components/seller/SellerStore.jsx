import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiArrowLeft, FiPackage, FiPlus, FiShield, FiShoppingBag } from "react-icons/fi";
import api from "../../api/api";
import ProductCard from "../shared/ProductCard";
import Loader from "../shared/Loader";
import "../products/products.css";
import "./seller-store.css";

const SellerStore = () => {
  const { sellerId } = useParams();
  const { user } = useSelector((state) => state.auth);
  const isOwner = String(user?.id) === String(sellerId) && user?.roles?.includes("ROLE_SELLER");
  const [state, setState] = useState({ products: [], loading: true, error: "" });

  useEffect(() => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    api.get(`/public/sellers/${sellerId}/products?pageNumber=0&pageSize=50&sortBy=productId&sortOrder=desc`)
      .then(({ data }) => setState({ products: data.content || [], loading: false, error: "" }))
      .catch((error) => setState({ products: [], loading: false, error: error?.response?.data?.message || "Không thể tải cửa hàng" }));
  }, [sellerId]);

  return <main className="seller-store-page">
    <section className="seller-store-hero"><div className="products-shell"><div className="seller-store-avatar">{isOwner ? user?.username?.slice(0, 1)?.toUpperCase() : "S"}</div><div><span>AMAZING SELLER</span><h1>{isOwner ? `Cửa hàng của ${user.username}` : "Cửa hàng người bán"}</h1><p>Sản phẩm được đăng và quản lý trực tiếp bởi người bán.</p></div>{isOwner && <div className="seller-store-owner-actions"><Link to="/seller"><FiArrowLeft /> Seller Center</Link><Link className="primary" to="/seller/products?new=true"><FiPlus /> Thêm sản phẩm</Link></div>}</div></section>
    <div className="products-shell seller-store-content"><div className="seller-store-trust"><span><FiShield /> Người bán đã xác thực</span><span><FiShoppingBag /> Mua sắm an toàn</span><span><FiPackage /> {state.products.length} sản phẩm</span></div><div className="products-result-title"><div><span>DANH MỤC CỬA HÀNG</span><h2>Sản phẩm đang bán</h2></div></div>{state.loading ? <Loader /> : state.error ? <div className="products-state"><FiPackage /><h3>{state.error}</h3></div> : state.products.length ? <div className="products-grid">{state.products.map((product) => <ProductCard key={product.productId} {...product} />)}</div> : <div className="products-state"><FiPackage /><h3>Cửa hàng chưa có sản phẩm</h3><p>Người bán đang chuẩn bị sản phẩm mới.</p></div>}</div>
  </main>;
};

export default SellerStore;

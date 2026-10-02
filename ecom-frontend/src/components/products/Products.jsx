import { FiAlertTriangle, FiGrid, FiPackage, FiShield, FiTruck } from "react-icons/fi";
import ProductCard from "../shared/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchCategories } from "../../store/actions";
import Filter from "./Filter";
import useProductFilter from "../../hooks/useProductFilter";
import Loader from "../shared/Loader";
import Paginations from "../shared/Paginations";
import "./products.css";

const Products = () => {
  const { isLoading, errorMessage } = useSelector((state) => state.errors);
  const { products, categories, pagination } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  useProductFilter();
  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);

  return <main className="products-page">
    <section className="market-page-hero"><div><span>KHO SẢN PHẨM CHÍNH HÃNG</span><h1>Mua sắm mọi thứ<br/>bạn yêu thích</h1><p>Khám phá sản phẩm chất lượng, giá tốt và giao hàng nhanh chóng.</p></div><FiPackage /></section>
    <div className="products-shell">
      <div className="products-benefits"><span><FiShield/> Hàng chính hãng</span><span><FiTruck/> Giao hàng toàn quốc</span><span><FiGrid/> Đa dạng danh mục</span></div>
      <Filter categories={categories || []}/>
      <div className="products-result-title"><div><span>GỢI Ý HÔM NAY</span><h2>Sản phẩm dành cho bạn</h2></div><small>{pagination?.totalElements || 0} sản phẩm</small></div>
      {isLoading ? <Loader/> : errorMessage ? <div className="products-state"><FiAlertTriangle/><h3>Chưa thể tải sản phẩm</h3><p>{errorMessage}</p></div> : <><div className="products-grid">{products?.map((item) => <ProductCard key={item.productId} {...item}/>)}</div><div className="products-pagination"><Paginations numberOfPage={pagination?.totalPages} totalProducts={pagination?.totalElements}/></div></>}
    </div>
  </main>;
};
export default Products;

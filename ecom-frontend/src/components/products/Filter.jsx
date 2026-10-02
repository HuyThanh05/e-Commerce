import { FiArrowDown, FiArrowUp, FiRefreshCw, FiSearch, FiSliders } from "react-icons/fi";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const Filter = ({ categories }) => {
  const [searchParams] = useSearchParams(); const navigate = useNavigate(); const pathname = useLocation().pathname;
  const [searchTerm, setSearchTerm] = useState(searchParams.get("keyword") || "");
  const category = searchParams.get("category") || "all"; const sortOrder = searchParams.get("sortby") || "asc";
  const update = (name, value) => { const params = new URLSearchParams(searchParams); value && value !== "all" ? params.set(name,value) : params.delete(name); params.delete("page"); navigate(`${pathname}?${params}`); };
  useEffect(() => { const timer = setTimeout(() => update("keyword", searchTerm.trim()), 500); return () => clearTimeout(timer); }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps
  return <section className="product-filter"><div className="filter-search"><FiSearch/><input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Tìm trong tất cả sản phẩm..."/></div><div className="filter-controls"><span><FiSliders/> Bộ lọc</span><select value={category} onChange={(e)=>update("category",e.target.value)}><option value="all">Tất cả danh mục</option>{categories.map(item=><option key={item.categoryId} value={item.categoryName}>{item.categoryName}</option>)}</select><button onClick={()=>update("sortby",sortOrder === "asc" ? "desc" : "asc")}>Giá {sortOrder === "asc" ? <FiArrowUp/> : <FiArrowDown/>}</button><button className="filter-reset" onClick={()=>{setSearchTerm("");navigate(pathname)}}><FiRefreshCw/> Đặt lại</button></div></section>;
};
export default Filter;

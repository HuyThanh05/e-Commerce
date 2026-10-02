import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { adminNavigation, sellerNavigation } from "../../utils";
import classNames from "classnames";

const Sidebar = ({ isProfileLayout = false }) => {
  const pathName = useLocation().pathname;
  const { user } = useSelector((state) => state.auth);

  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");

  const sideBarLayout = isAdmin ? adminNavigation : sellerNavigation;

  return (
    <div className="management-sidebar flex grow flex-col gap-y-7 overflow-y-auto px-6 pb-4">
      <div className="management-brand flex h-20 shrink-0 gap-x-3 pt-4">
        <span>as</span>
        <div><h1>{isAdmin ? "Admin Center" : "Seller Center"}</h1><small>Amazing Shop</small></div>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-4">
              {sideBarLayout.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={classNames(
                      pathName === item.href
                        ? "management-link active"
                        : "management-link",
                      "group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6",
                    )}
                  >
                    <item.icon className="text-2xl" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
      <Link to={isAdmin ? "/" : `/shops/${user?.id}`} className="management-store-link"><FaArrowLeft /> {isAdmin ? "Về trang chủ" : "Xem cửa hàng"}</Link>
    </div>
  );
};

export default Sidebar;

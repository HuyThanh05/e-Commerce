import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../api/api";

const OAuth2Redirect = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error")) {
      toast.error("Không thể đăng nhập bằng Google");
      navigate("/login", { replace: true });
      return;
    }

    api
      .get("/auth/user")
      .then(({ data }) => {
        dispatch({ type: "LOGIN_USER", payload: data });
        localStorage.setItem("auth", JSON.stringify(data));
        toast.success("Đăng nhập Google thành công");
        navigate("/", { replace: true });
      })
      .catch(() => {
        toast.error("Không thể hoàn tất đăng nhập Google");
        navigate("/login", { replace: true });
      });
  }, [dispatch, navigate, searchParams]);

  return <div className="min-h-[60vh] flex items-center justify-center">Đang đăng nhập...</div>;
};

export default OAuth2Redirect;

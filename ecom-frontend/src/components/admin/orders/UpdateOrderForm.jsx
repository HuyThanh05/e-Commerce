import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import React, { useState } from "react";
import Spinners from "../../shared/Spinners";
import { useDispatch, useSelector } from "react-redux";
import { updateOrderStatusFromDashboard } from "../../../store/actions";
import toast from "react-hot-toast";

const ALL_ORDER_STATUSES = ["Pending", "Confirmed", "Preparing", "Shipping", "Delivered", "Cancelled", "Delivery Failed"];
const NEXT_STATUS = {
  Pending: ["Confirmed"], Accepted: ["Preparing"], Confirmed: ["Preparing"],
  Processing: ["Shipping"], Preparing: ["Shipping"], Shipped: ["Delivered", "Delivery Failed"],
  Shipping: ["Delivered", "Delivery Failed"], Delivered: [], Cancelled: [], "Delivery Failed": [],
};

const UpdateOrderForm = ({
  setOpen,
  selectedId,
  selectedItem,
  loader,
  setLoader,
}) => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user && user?.roles?.includes("ROLE_ADMIN");
  const availableStatuses = isAdmin ? ALL_ORDER_STATUSES : (NEXT_STATUS[selectedItem?.status] || []);
  const [orderStatus, setOrderStatus] = useState(
    isAdmin ? selectedItem?.status || "Pending" : availableStatuses[0] || "",
  );
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const updateOrderStatus = (e) => {
    e.preventDefault();
    if (!orderStatus) {
      setError("Order status is required");
      return;
    }
    dispatch(
      updateOrderStatusFromDashboard(
        selectedId,
        orderStatus,
        toast,
        setLoader,
        isAdmin,
      ),
    );
  };

  return (
    <div className="py-5 relative h-full">
      <form className="space-y-4" onSubmit={updateOrderStatus}>
        <FormControl fullWidth variant="outlined" error={!!error}>
          <InputLabel id="order-status-label">Order Status</InputLabel>
          <Select
            labelId="order-status-label"
            label="Order Status"
            value={orderStatus}
            onChange={(e) => {
              setOrderStatus(e.target.value);
              setError("");
            }}
          >
            {availableStatuses.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>

          {error && <FormHelperText>{error}</FormHelperText>}
          {!isAdmin && availableStatuses.length === 0 && <FormHelperText>Đơn hàng đã ở trạng thái cuối.</FormHelperText>}
        </FormControl>

        <div className="flex w-full justify-between items-center absolute bottom-14">
          <Button
            disabled={loader}
            onClick={() => setOpen(false)}
            variant="outlined"
            className="text-white py-[10px] px-4 text-sm font-medium"
          >
            Cancel
          </Button>

          <Button
            disabled={loader || !orderStatus}
            type="submit"
            variant="contained"
            color="primary"
            className="bg-custom-blue text-white  py-[10px] px-4 text-sm font-medium"
          >
            {loader ? (
              <div className="flex gap-2 items-center">
                <Spinners /> Loading...
              </div>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UpdateOrderForm;

import React from "react";
import { useDispatch } from "react-redux";
// import authService from "../../appwrite/auth";
import { logout } from "../../store/authSlice";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";

function LogoutBtn() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const logoutHandler = async () => {
    try {
      // Get the access token from cookies
      // const token = Cookies.get("accessToken");

      // if (!token) {
      //   throw new Error("No access token found");
      // }

      const response = await axios.post(
        "http://localhost:5000/api/v1/users/logout",
        {}, // body can be empty
        {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
          withCredentials: true, // ensures cookies are sent with the request
        }
      );

      // console.log("response", response.data);

      if (response.status === 200) {
        dispatch(logout());
        navigate("/login");
      } else {
        console.error("Logout request failed:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };
  return (
    <button
      className="inline-bock px-6 py-2 duration-200 hover:bg-blue-100 rounded-full"
      onClick={logoutHandler}
    >
      Logout
    </button>
  );
}

export default LogoutBtn;

import { useEffect, useState } from "react";
import Header from "./components/header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";
import { Outlet } from "react-router-dom";
// import './App.css'
import axios from "axios";
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/v1/users/current-user",
          {
            withCredentials: true, // ensures cookies are sent with the request
          }
        );

        if (response.data) {
          dispatch(login({ userData: response.data }));
        } else {
          dispatch(logout());
        }
        console.log(response); // handle the response data
        setLoading(false); // set loading to false after fetching the data
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If the user is not found, we log out and proceed normally
          dispatch(logout());
        } else {
          // Log other errors
          console.error("Error fetching current user:", error);
        }
      } finally {
        setLoading(false); // Ensure loading is set to false in both success and error cases
      }
    };

    fetchCurrentUser();
  }, []);

  return !loading ? (
    <>
      <div
        className="min-h-screen flex flex-wrap
      content-between bg-gray-100"
      >
        <div className="w-full block">
          <Header />
          <main>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </>
  ) : null;
}

export default App;

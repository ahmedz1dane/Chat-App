import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as authLogin } from "../store/authSlice";
import Logoii from "../components/Logoii.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input";
import { useDispatch } from "react-redux";
// import authservice from "../appwrite/auth";
import { useForm } from "react-hook-form";
import Cookies from "js-cookie";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");

  const login = async (data) => {
    // console.log(data);
    // consolelog and find what is data !!!!!!
    // ANS: Data will be the email and password cause
    //      we can see that this function named login is passed
    //      as onSubmit in the form , therefore the parameter that
    //      we used as parameter in this function named as data
    //      is an object that contain the components of the form
    //      which are email and password

    setError(""); // Clear any previous error

    try {
      //   const session = await authservice.login(data); // Attempt to log in
      //   if (session) {
      //     // If login is successful (session is truthy)
      //     const userData = await authservice.getCurrentuser(); // Fetch current user's data
      //     if (userData) {
      //       // If userData is available, dispatch an action (authLogin) with userData
      //       dispatch(authLogin({ userData }));
      //     }
      //     // DOUBT : here what and all will be there in userData

      setError("");
      const formData = new FormData();
      // Append JSON data
      Object.entries(data).forEach(([key, value]) => {
        // DOUBT: tell me the purpose of
        //        Object.entries(data) ?
        // ANS:
        // it will create an array that contains key ,value
        // pair as elements

        // console.log("key: " + key + " value: " + value);

        formData.append(key, value);
      });

      // Append files
      // console.log(formData);

      const response = await fetch("http://localhost:5000/api/v1/users/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const userData = await response.json();

      if (response.ok) {
        dispatch(authLogin({ userData }));

        // Access the cookie
        const accessToken = Cookies.get("accessToken");

        navigate("/home");

        // console.log("Haaai");
      } else {
        throw new Error(userData.message || "Login failed");
      }
    } catch (error) {
      // Handle error (e.g., display error message)
      setError(error.message);
    }
  };

  return (
    <div
      className="flex items-center justify-center w-full "
      style={{
        backgroundColor: "#1e1e1e",
        height: "95vh",
      }}
    >
      <div
        className={`mx-auto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10`}
      >
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px] ">
            <Logoii width="100%" />
          </span>
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-base text-black/60">
          Don&apos;t have any account?&nbsp;
          <Link
            to="/signup"
            className="font-medium text-primary transition-all duration-200 hover:underline"
          >
            Sign Up
          </Link>
        </p>
        {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

        <form onSubmit={handleSubmit(login)} className="mt-8">
          <div className="space-y-5">
            <Input
              label="Username: "
              placeholder="Enter your username"
              type="text"
              {...register("username", {
                required: true,
                // validate: {
                //   matchPatern: (value) =>
                //     /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                //     "Email address must be a valid address",
                // },
                //  here register is used to register
                //  the input field to the state managed
                //  by react-hook-form , and each input
                //  field must have separate register!!!
              })}
            />

            <Input
              label="Password: "
              type="password"
              placeholder="Enter your password"
              {...register("password", {
                required: true,
              })}
            />

            <Button type="submit" className="w-full">
              Sign-in
            </Button>
            {/* DOUBT: find what is children that is
             mentioned in the button component , 
             and also find why isnt it used in
            this button tag that is mentioned above */}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;

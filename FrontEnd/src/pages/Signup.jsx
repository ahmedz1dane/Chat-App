import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../store/authSlice";
import Logoii from "../components/Logoii.jsx";
import Input from "../components/Input.jsx";
import Button from "../components/Button.jsx";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { login as authLogin } from "../store/authSlice";

function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm();

  const create = async (data) => {
    setError("");
    // REGISTERING USER
    try {
      const formData = new FormData();
      // Append JSON data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      // Append files
      formData.append("avatar", data.avatar[0]);
      formData.append("coverImage", data.coverImage[0]);

      const response = await fetch(
        "http://localhost:5000/api/v1/users/register",
        {
          method: "POST",
          body: formData,
          // credentials: "include",
        }
      );
      const userData = await response.json();

      if (!response.ok) {
        throw new Error("Registration failed");
      }
      // LOGGING IN
      try {
        setError("");
        const formData = new FormData();
        // Append JSON data
        Object.entries(data).forEach(([key, value]) => {
          if (key == "username") formData.append(key, value);
          if (key == "password") formData.append(key, value);
        });

        // Append files
        // console.log(formData);

        const response = await fetch(
          "http://localhost:5000/api/v1/users/login",
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );
        const userData = await response.json();

        if (response.ok) {
          dispatch(authLogin({ userData }));

          // Access the cookie
          const accessToken = Cookies.get("accessToken");

          navigate("/home");
        } else {
          throw new Error(userData.message || "Login failed");
        }
      } catch (error) {
        // Handle error (e.g., display error message)
        setError(error.message);
      }
    } catch (error) {
      // Handle error (e.g., display error message)
      setError(error.message);
    }
  };

  return (
    <>
      <style>
        {`
      .custom-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `}
      </style>

      <div
        className="flex items-center justify-center "
        style={{
          marginTop: "80px",
          backgroundImage: `url('https://cdn.pixabay.com/photo/2013/08/20/15/47/poppies-174276_1280.jpg')`, // Replace this URL with your image URL
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "86vh",
        }}
      >
        <div
          className={`mx-aauto w-full max-w-lg bg-gray-100 rounded-xl p-10 border border-black/10 overflow-y-auto custom-scrollbar`}
          style={{
            // marginTop: "10px",
            maxHeight: "74vh",
          }}
        >
          <div className="mb-2 flex justify-center">
            <span className="inline-block w-full max-w-[100px]">
              <Logoii width="100%" />
            </span>
          </div>
          <h2 className="text-center text-2xl font-bold leading-tight">
            Sign up to create account
          </h2>
          <p className="mt-2 text-center text-base text-black/60">
            Already have an account?&nbsp;
            <Link
              to="/login"
              className="font-medium text-primary transition-all duration-200 hover:underline"
            >
              Sign In
            </Link>
          </p>
          {error && <p className="text-red-600 mt-8 text-center">{error}</p>}

          <form onSubmit={handleSubmit(create)}>
            <div className="space-y-5">
              <Input
                label="Full Name: "
                placeholder="Enter your full name"
                {...register("fullName", {
                  required: true,
                })}
              />
              <Input
                label="Username:"
                placeholder="Enter your username"
                {...register("username", {
                  required: true,
                })}
              />
              <Input
                label="Email: "
                placeholder="Enter your email"
                type="email"
                {...register("email", {
                  required: true,
                  validate: {
                    matchPatern: (value) =>
                      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                        value
                      ) || "Email address must be a valid address",
                  },
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
              <Input
                label="Avatar: "
                placeholder=""
                type="file"
                {...register("avatar", {
                  required: true,
                })}
              />
              <Input
                label="Cover Image "
                placeholder=""
                type="file"
                {...register("coverImage", {
                  required: true,
                })}
              />
              <Button type="submit" className="w-full">
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Signup;

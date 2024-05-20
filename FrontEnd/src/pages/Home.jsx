import React, { useEffect, useState } from "react";
// import appwriteService from "../appwrite/config";
// import { Container, PostCard } from "../components";
import Container from "../components/Container.jsx";
import { useSelector } from "react-redux";
import HomeLeft from "./HomeLeft.jsx";
import HomeRight from "./HomeRight.jsx";

function Home() {
  const [posts, setPosts] = useState([]);

  const userData = useSelector((state) => state.auth.userData);

  return (
    <div
      className="w-full h-screen text-center flex"
      style={{
        height: "86vh",
        marginTop: "75px",
      }}
    >
      <div
        style={{
          height: "97vh",
          width: "40vw",
          backgroundColor: "red",
        }}
      >
        <HomeLeft />
      </div>
      <div
        style={{
          height: "97vh",
          width: "60vw",
          backgroundColor: "blue",
        }}
      >
        <HomeRight />
      </div>
    </div>
  );
}

export default Home;

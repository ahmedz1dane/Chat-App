import React from "react";
import Container from "../Container.jsx";
import Logo from "../Logo.jsx";
import LogoutBtn from "./LogoutBtn.jsx";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

function Header() {
  const authStatus = useSelector((state) => state.auth.status);

  const navigate = useNavigate();

  const navItems = [
    {
      name: "Login",
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Signup",
      slug: "/signup",
      active: !authStatus,
    },
    // {
    //   name: "All Posts",
    //   slug: "/all-posts",
    //   active: authStatus,
    // },
    // {
    //   name: "Add Post",
    //   slug: "/add-post",
    //   active: authStatus,
    // },
  ];

  return (
    <header
      className="py-3 shadow bg-gray-200 "
      style={{
        position: "fixed",
        width: "100%",
        top: "0",
        zIndex: "100",
        backgroundColor: "#1e1e1e",
      }}
    >
      <Container>
        <nav className="flex">
          <div className="mr-4">
            <Link to="/">
              <Logo width="70px" />
            </Link>
          </div>

          <ul className="flex ml-auto text-white">
            {navItems.map((item) =>
              item.active ? (
                <li key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className="inline-bock px-6 py-2 duration-200 hover:bg-blue-100 rounded-full"
                  >
                    {item.name}
                  </button>
                </li>
              ) : null
            )}

            {authStatus && (
              <li>
                <LogoutBtn />
              </li>
            )}
          </ul>
        </nav>
      </Container>
    </header>
  );
}

export default Header;

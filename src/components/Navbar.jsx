import React from "react";

const Navbar = () => {
  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="" />
        <p className="font-bold">Huseyin Gobekli</p>
        <ul>
          {[
            {
              id: 1,
              name: "Home",
            },
            {
              id: 2,
              name: "Contact",
            },
            {
              id: 3,
              name: "Projects",
            },
          ].map((item) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

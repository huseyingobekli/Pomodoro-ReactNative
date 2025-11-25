import { navLinks, navIcons } from "#constants";
import React from "react";
import dayjs from "dayjs";

const Navbar = () => {
  return (
    <nav>
      <div>
        <img src="/images/logo.svg" alt="" />
        <p className="font-bold">Huseyin Gobekli</p>
        <ul>
          {navLinks.map(({ id, name }) => (
            <li key={id}>
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img src={img} alt={`icon-${id}`} className="icon-hover" />
            </li>
          ))}
        </ul>
        <time>{dayjs().format("ddd MMM D h:mm A")}</time>
      </div>
    </nav>
  );
};

export default Navbar;

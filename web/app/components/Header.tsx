import { Menu, MenuButton } from "@reach/menu-button";
import { Link } from "@remix-run/react";
import clsx from "clsx";
import Icon from "~/components/Icon";
import type { CommonProps } from "~/types";

const Logo = () => (
  <div className="inline-flex flex-col text-base font-semibold">
    <span className="text-orange">OVER</span>
    <span className="decor-caret">
      ENGINEER
      <span className="text-red">ING</span>
    </span>
  </div>
);

type HeaderProps = CommonProps;
const Header = (props: HeaderProps) => (
  <header
    className={clsx(
      "flex items-center justify-between",
      "px-4 py-2",
      "bg-stone",
      props.className
    )}
  >
    <Link to="/" className="ml-4">
      <Logo />
    </Link>

    <Menu>
      <MenuButton aria-label="open navigation">
        <Icon.Menu className="h-6 w-6" />
      </MenuButton>
    </Menu>
  </header>
);

export default Header;

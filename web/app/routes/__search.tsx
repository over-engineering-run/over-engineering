import clsx from "clsx";
import { Outlet } from "@remix-run/react";
import { Menu, MenuButton } from "@reach/menu-button";
import { Link } from "@remix-run/react";
import Icon from "~/components/Icon";
import Logo from "~/components/Logo";
import Search from "~/components/Search";
import type { CommonProps } from "~/types";

type HeaderProps = CommonProps;
const Header = (props: HeaderProps) => (
  <header className={clsx("border-b", props.className)}>
    <div className="relative flex items-center lg:ml-44">
      <div className="w-full space-y-4 p-4 lg:hidden">
        <div className="flex justify-between">
          <Link to="/">
            <Logo />
          </Link>

          <Menu>
            <MenuButton aria-label="open navigation">
              <Icon.Menu className="h-6 w-6" />
            </MenuButton>
          </Menu>
        </div>

        <Search />
      </div>

      <div
        className={clsx(
          "px-0 py-6",
          "w-full max-w-screen-md",
          "items-center",
          "hidden lg:flex"
        )}
      >
        <Link
          to="/"
          className="left-0 xl:absolute xl:-ml-2 xl:-translate-x-full"
        >
          <Logo />
        </Link>

        <Search />
      </div>
    </div>
  </header>
);

const Layout = () => (
  <main>
    <Header />

    <Outlet />
  </main>
);

export default Layout;

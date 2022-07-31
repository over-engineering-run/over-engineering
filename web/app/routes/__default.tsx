import clsx from "clsx";
import { Outlet } from "@remix-run/react";
import { Link } from "@remix-run/react";
import Logo from "~/components/Logo";
import type { CommonProps } from "~/types";

type HeaderProps = CommonProps;
const Header = (props: HeaderProps) => (
  <header className={clsx("border-b", props.className)}>
    <div className="relative flex items-center">
      <div
        className={clsx(
          "py-6 px-0",
          "container mx-auto",
          "items-center",
          "hidden lg:flex"
        )}
      >
        <Link to="/" className="my-0.5">
          <Logo />
        </Link>
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

import clsx from "clsx";
import { Outlet } from "@remix-run/react";
import { Link } from "@remix-run/react";
import Logo from "~/components/Logo";
import type { CommonProps } from "~/types";

type HeaderProps = CommonProps;
const Header = (props: HeaderProps) => (
  <header
    className={clsx(
      "border-b",
      "fixed left-0 top-0 z-20 w-full bg-primary",
      props.className
    )}
  >
    <div className="relative flex items-center">
      <div
        className={clsx(
          "p-4",
          "lg:py-6 xl:px-0",
          "container mx-auto",
          "flex items-center"
        )}
      >
        <Link to="/" className="my-0.5">
          <Logo />
        </Link>

        <div className="ml-auto text-base font-semibold">
          <Link to="/trends">Trends</Link>
        </div>
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

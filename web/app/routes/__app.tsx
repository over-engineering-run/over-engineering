import { Outlet } from "@remix-run/react";
import Header from "~/components/Header";

const Layout = () => (
  <main>
    <Header className="fixed top-0 z-10 w-full [&~*]:pt-16" />

    <Outlet />
  </main>
);

export default Layout;

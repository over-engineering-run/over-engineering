import qs from "qs";
import { forwardRef } from "react";
import is from "@sindresorhus/is";
import { NavLink } from "@remix-run/react";
import type { NavLinkProps } from "@remix-run/react";
import type { ComponentPropsWithRef } from "react";

const __DEV__ = process.env.NODE_ENV === "development";

type Ref = HTMLAnchorElement;
type BaseAnchorProps = ComponentPropsWithRef<"a">;

// ===============================================================
type ExternalProps = BaseAnchorProps & { type: "external" };
export const External = forwardRef<Ref, ExternalProps>(
  ({ children, ...props }, ref) => (
    <a {...props} ref={ref}>
      {children}
    </a>
  )
);

if (__DEV__) {
  External.displayName = "External";
}
// ===============================================================
type TabProps = BaseAnchorProps & { type: "tab" };
export const Tab = forwardRef<Ref, TabProps>(({ children, ...props }, ref) => (
  <a {...props} target="_blank" rel="noopener noreferrer" ref={ref}>
    {children}
  </a>
));

if (__DEV__) {
  Tab.displayName = "Tab";
}
// ===============================================================
type To = Partial<{
  pathname: string;
  search: Record<string, string | undefined> | string;
  hash: string;
}>;
type NavProps = Omit<NavLinkProps, "to"> & {
  type?: "nav";
  href: To | string;
};
const handle_href = (props: NavProps) => {
  if (is.string(props.href)) {
    return props.href;
  }

  if (is.plainObject(props.href)) {
    return {
      ...props.href,
      search: qs.stringify(props.href.search),
    };
  }

  throw new Error(`not support href type: ${props.type} ${props.href}`);
};

export const Nav = forwardRef<Ref, NavProps>((props, ref) => (
  <NavLink {...props} to={handle_href(props)} ref={ref}>
    {props.children}
  </NavLink>
));

if (__DEV__) {
  Nav.displayName = "Nav";
}
// ===============================================================

const onClick = () => {
  document.documentElement.classList.add("scroll-smooth");
  setTimeout(() => {
    document.documentElement.classList.remove("scroll-smooth");
  });
};
type AnchorProps = Omit<NavLinkProps, "to"> & {
  type: "anchor";
  href: To | string;
};
export const Anchor = forwardRef<Ref, AnchorProps>(
  ({ type, ...props }, ref) => <Nav {...props} ref={ref} onClick={onClick} />
);

if (__DEV__) {
  Anchor.displayName = "Anchor";
}
// ===============================================================
type LinkProps = NavProps | ExternalProps | TabProps | AnchorProps;
export const Link = forwardRef<Ref, LinkProps>((props, ref) => {
  if (props.type === "tab") {
    return <Tab {...props} ref={ref} />;
  }

  if (props.type === "external") {
    return <External {...props} ref={ref} />;
  }

  if (props.type === "anchor") {
    return <Anchor {...props} ref={ref} />;
  }

  return <Nav {...props} ref={ref} />;
});

if (__DEV__) {
  Link.displayName = "Link";
}
// ===============================================================
export default Link;

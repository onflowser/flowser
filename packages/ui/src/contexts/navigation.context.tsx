import { createContext, ReactNode, useContext } from "react";
import { UIMatch, RelativeRoutingType } from "react-router-dom";

type RouteParams = Record<string, string | string[]>;

interface Path {
  /**
   * A URL pathname, beginning with a /.
   */
  pathname: string;

  /**
   * A URL search string, beginning with a ?.
   */
  search: URLSearchParams;

  /**
   * A URL fragment identifier, beginning with a #.
   */
  hash: string;
}

interface NavigateFunction {
  (to: string, options?: NavigateOptions): void;
  (delta: number): void;
}

interface NavigateOptions {
  replace?: boolean;
  state?: any;
  preventScrollReset?: boolean;
  relative?: RelativeRoutingType;
}

type NavigationController = {
  location: Path;
  navigate: NavigateFunction;
  params: RouteParams;
  matches: UIMatch[];
}

const Context = createContext<NavigationController>(undefined as never);

export function NavigationProvider(props: {
  children: ReactNode;
  controller: NavigationController;
}) {
  return (
    <Context.Provider value={props.controller}>
      {props.children}
    </Context.Provider>
  )
}

function useNavigationProvider() {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Flowser navigation context not found")
  }

  return context;
}

export function useNavigate(): NavigateFunction {
  return useNavigationProvider().navigate;
}

export function useLocation(): Path {
  return useNavigationProvider().location;
}

export function useParams(): RouteParams {
  return useNavigationProvider().params;
}

export function useMatches(): UIMatch[] {
  return useNavigationProvider().matches;
}

import React from "react";

const useHashRoute = () => {
  const [route, setRoute] = React.useState(() => {
    if (typeof window !== "undefined") {
      return window.location.hash.slice(1) || "/methods";
    }
    return "/methods";
  });

  React.useEffect(() => {
    const onChange = () => setRoute(window.location.hash.slice(1) || "/methods");
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
};

if (typeof window !== "undefined") {
  window.useHashRoute = useHashRoute;
  window.pgo = (r) => { window.location.hash = r; window.scrollTo(0, 0); };
}

export default useHashRoute;

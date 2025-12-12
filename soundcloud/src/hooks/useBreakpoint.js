import { useEffect, useState } from "react";

const getMatches = (maxWidth) => {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
};

const useBreakpoint = (maxWidth = 640) => {
  const [isMatch, setIsMatch] = useState(() => getMatches(maxWidth));

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const handleChange = (event) => setIsMatch(event.matches);
    handleChange(query);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, [maxWidth]);

  return isMatch;
};

export default useBreakpoint;

import { useWindowDimensions } from "react-native";

const BREAKPOINTS = {
  mobile: 480,
  tablet: 768,
  desktop: 1024,
};

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isMobile: width < BREAKPOINTS.tablet,
    isTablet: width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
  };
}

import { useTheme } from "@mui/material/styles";

/**
 * Hook to access RTL positioning utilities from the theme
 * Returns functions that automatically use the theme's direction
 */
export const useRTL = () => {
  const theme = useTheme();
  const isRTL = theme.direction === "rtl";

  /**
   * Returns an object with both left and right properties set correctly for RTL
   * @param value - CSS value for the primary side
   * @param oppositeValue - CSS value for the opposite side (defaults to "auto")
   * @returns Object with 'left' and 'right' properties
   */
  const getPosition = (
    value: string | number,
    oppositeValue: string | number = "auto"
  ): { left: string | number; right: string | number } => {
    return isRTL
      ? { right: value, left: oppositeValue }
      : { left: value, right: oppositeValue };
  };

  /**
   * Returns an object with opposite positioning (left in RTL, right in LTR)
   * @param value - CSS value for the primary side
   * @param oppositeValue - CSS value for the opposite side (defaults to "auto")
   * @returns Object with 'left' and 'right' properties (opposite of getPosition)
   */
  const getOppositePosition = (
    value: string | number,
    oppositeValue: string | number = "auto"
  ): { left: string | number; right: string | number } => {
    return isRTL
      ? { left: value, right: oppositeValue }
      : { right: value, left: oppositeValue };
  };

  /**
   * Returns the correct horizontal position property key
   * @returns 'left' or 'right' string
   */
  const getProperty = (): "left" | "right" => {
    return isRTL ? "right" : "left";
  };

  /**
   * Returns the opposite horizontal position property key
   * @returns 'right' or 'left' string
   */
  const getOppositeProperty = (): "left" | "right" => {
    return isRTL ? "left" : "right";
  };

  return {
    isRTL,
    getPosition,
    getOppositePosition,
    getProperty,
    getOppositeProperty,
  };
};


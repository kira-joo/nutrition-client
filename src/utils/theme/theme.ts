import { Locale } from "@/constant/Locale.enum";
import { createTheme, Theme } from "@mui/material/styles";

export const createAppTheme = (locale: Locale): Theme => {
  const isRTL = locale === Locale.AR;

  return createTheme({
    direction: isRTL ? "rtl" : "ltr",
    components: {
      MuiTextField: {
        styleOverrides: {
          root: isRTL
            ? {
                "& .MuiInputLabel-root": {
                  right: 25,
                  left: "auto",
                  transformOrigin: "top right",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  right: 25,
                  left: "auto",
                  transformOrigin: "top right",
                },
                "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                  right: 30,
                  left: "auto",
                  transformOrigin: "top right",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    textAlign: "right",
                  },
                },
                "& .MuiInputBase-input": {
                  textAlign: "right",
                  direction: "rtl",
                },
                "& .MuiFormHelperText-root": {
                  textAlign: "right",
                },
              }
            : {},
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: isRTL
            ? {
                "& .MuiInputLabel-root": {
                  right: 25,
                  left: "auto",
                  transformOrigin: "top right",
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  right: 25,
                  left: "auto",
                  transformOrigin: "top right",
                },
                "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                  right: 30,
                  left: "auto",
                  transformOrigin: "top right",
                },
                "& .MuiSelect-select": {
                  textAlign: "right",
                  direction: "rtl",
                  paddingRight: "14px",
                  paddingLeft: "32px",
                },
                "& .MuiOutlinedInput-notchedOutline": { textAlign: "right" },
                "& .MuiSelect-icon": {
                  right: "auto",
                  left: 7,
                },
              }
            : {},
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: isRTL
            ? {
                "& .MuiSelect-select": {
                  textAlign: "right",
                  direction: "rtl",
                  paddingRight: "14px",
                  paddingLeft: "32px",
                },
                "& .MuiSelect-icon": {
                  right: "auto",
                  left: 7,
                },
              }
            : {},
        },
      },
      MuiButton: {
        styleOverrides: {
          root: isRTL
            ? {
                flexDirection: "row-reverse",
                "& .MuiButton-startIcon": {
                  marginRight: 0,
                  marginLeft: 8,
                  order: 2,
                },
                "& .MuiButton-endIcon": {
                  marginLeft: 0,
                  marginRight: 8,
                  order: 0,
                },
              }
            : {},
        },
      },
      MuiList: {
        styleOverrides: {
          root: isRTL
            ? {
                direction: "rtl",
              }
            : {},
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: isRTL
            ? {
                flexDirection: "row-reverse",
                "& .MuiListItemText-root": {
                  textAlign: "right",
                  "& .MuiListItemText-primary": {
                    direction: "rtl",
                    textAlign: "right",
                  },
                },
              }
            : {},
        },
      },
    },
  });
};

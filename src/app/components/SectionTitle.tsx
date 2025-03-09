import { Box, Typography } from "@mui/material";

interface SectionTitleProps {
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return (
    <Box sx={{ textAlign: "center", mb: -2 }}>
      <Typography
        variant="h4" // Larger size for the title
        sx={{
          fontWeight: "bold",
          background: "#000",
          backgroundClip: "text",
          color: "transparent",
          position: "relative",
          display: "inline-block",
        }}
      >
        {title}
        <Box
          sx={{
            height: "6px", // Taller line height
            width: "1150px", // Full width of the parent
            maxWidth: "1100px", // Limit width for larger screens
            backgroundColor: "#000",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)", // Center the line below the title
            borderRadius: "3px", // Rounded edges for the line
          }}
        />
      </Typography>
    </Box>
  );
};

export default SectionTitle;

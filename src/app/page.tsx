import { Box, Container, Typography } from "@mui/material"; // Import Box for layout
import Faq from "./[locale]/faq/page";
import SendMessage from "./[locale]/forms/page";
import Videos from "./[locale]/videos/page";
import ImageN from "./image";

const HomePage = () => {
  return (
    <>
      <Box className="image-section">
        <ImageN />
      </Box>

      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          Videos
        </Typography>
        <Videos />
      </Box>

      <SendMessage />

      <Container>
        <Box sx={{ marginTop: 4 }}>
          <Faq />
        </Box>
      </Container>
    </>
  );
};
export default HomePage;

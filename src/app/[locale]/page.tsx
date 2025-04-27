"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { Box, Container, Typography } from "@mui/material";
import Faq from "./faq/page";
import ImageN from "./image";
import SendMessage from "./send-message/page";
import Videos from "./videos/page";

const HomePage = () => {
  const { t } = useI18n(DictionaryFiles.Home);
  return (
    <>
      <Box className="image-section">
        <ImageN />
      </Box>

      <Box sx={{ padding: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          {t("video")}
        </Typography>
        <Videos />
      </Box>
      <Box sx={{ padding: 2, justifyContent: "center", display: "flex" }}>
        <SendMessage />
      </Box>
      <Container>
        <Box sx={{ marginTop: 4 }}>
          <Faq />
        </Box>
      </Container>
    </>
  );
};
export default HomePage;

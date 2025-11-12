"use client";
import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import { Box, Container } from "@mui/material";
import Faq from "./faq/page";
import ImageN from "./image";
import Packages from "./packages/page";
import SendMessage from "./send-message/page";

const HomePage = () => {
  const { t } = useI18n(DictionaryFiles.Home);
  return (
    <>
      <Box className="image-section">
        <ImageN />
      </Box>

      <Box sx={{ padding: 2, justifyContent: "center", display: "flex" }}>
        <SendMessage />
      </Box>

      <Packages />
      <Container>
        <Box sx={{ marginTop: 4 }}>
          <Faq />
        </Box>
      </Container>
    </>
  );
};
export default HomePage;

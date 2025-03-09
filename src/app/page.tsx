import Faq from "./faq/page";
import { Container } from "@mui/material"; // Import Box for layout

import ImageN from "./image";

export default function HomePage() {
  return (
    <>
      {/* Container for the image */}
      <ImageN />

      {/* FAQ Section */}
      <Container>
        <Faq />
      </Container>
    </>
  );
}

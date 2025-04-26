import { Container } from "@mui/material"; // Import Box for layout
import Faq from "./[locale]/faq/page";
import SendMessage from "./[locale]/forms/page";
import Videos from "./[locale]/videos/page";
import ImageN from "./image";

export default function HomePage() {
  return (
    <>
      <div className="image-section">
        <ImageN />
      </div>

      <Container>
        <section className="videos-section">
          <h2>Videos</h2>
          <Videos />
        </section>

        <SendMessage />

        <section className="faq-section">
          <Faq />
        </section>
      </Container>
    </>
  );
}

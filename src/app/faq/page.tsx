import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  Typography,
} from "@mui/material";
import faqData from "../constant/FAQ.json"; // Adjust the path to your FAQ JSON file
import TitleAndBodyComponent from "./TitleAndBodyComponent";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Faq = () => {
  // Retrieve FAQ data for English (EN)
  const textFaq = faqData.EN;

  if (!textFaq || !textFaq.faqs) {
    return (
      <Box sx={{ width: "100%", textAlign: "center", marginBottom: "16px" }}>
        <Typography variant="body1">Error fetching FAQ data.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", marginBottom: "16px" }}>
      {/* Center the TitleAndBodyComponent */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "24px", // Adjust space between title and FAQ
        }}
      >
        <TitleAndBodyComponent
          Title={textFaq.faqAsked}
          Body={textFaq.faqCheck}
        />
      </Box>

      {/* Render each section of FAQs as an Accordion */}
      {textFaq.faqs.map((section, sectionIndex) => (
        <Accordion
          key={sectionIndex}
          sx={{
            border: "2px solid #66b2a0",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${sectionIndex}-content`}
            id={`panel${sectionIndex}-header`}
          >
            <Typography variant="h5">{section.section}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {section.faqs.map((faq, faqIndex) => (
              <Accordion
                key={faqIndex}
                sx={{
                  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
                  borderRadius: "10px",
                  border: "2px solid #66b2a0",
                  marginBottom: "16px",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`panel${sectionIndex}-${faqIndex}-content`}
                  id={`panel${sectionIndex}-${faqIndex}-header`}
                >
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ textAlign: "start" }}>
                    {faq.answer}
                  </Typography>
                  {faq.sources && faq.sourceUrl && (
                    <Typography
                      variant="caption"
                      sx={{ display: "block", marginTop: "8px" }}
                    >
                      Sources:{" "}
                      <Link
                        href={faq.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ marginLeft: "4px" }}
                      >
                        {faq.sources}
                      </Link>
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default Faq;

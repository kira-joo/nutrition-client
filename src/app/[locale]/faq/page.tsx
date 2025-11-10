"use client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Typography,
} from "@mui/material";

import { DictionaryFiles } from "@/constant/DictionaryFiles";
import useI18n from "@/hooks/useI18n";
import TitleAndBodyComponent from "./TitleAndBodyComponent";

const Faq = () => {
  const { t } = useI18n(DictionaryFiles.Faq);

  const sections = [
    {
      title: t("section1.title"),
      faqs: [
        {
          question: t("section1.q1.question"),
          answer: t("section1.q1.answer"),
        },
        {
          question: t("section1.q2.question"),
          answer: t("section1.q2.answer"),
        },
        {
          question: t("section1.q3.question"),
          answer: t("section1.q3.answer"),
        },
      ],
    },
    {
      title: t("section2.title"),
      faqs: [
        {
          question: t("section2.q1.question"),
          answer: t("section2.q1.answer"),
        },
        {
          question: t("section2.q2.question"),
          answer: t("section2.q2.answer"),
        },
        {
          question: t("section2.q3.question"),
          answer: t("section2.q3.answer"),
        },
        {
          question: t("section2.q4.question"),
          answer: t("section2.q4.answer"),
        },
      ],
    },
  ];

  if (!sections) {
    return (
      <Box sx={{ width: "100%", textAlign: "center", marginBottom: "16px" }}>
        <Typography variant="body1">Error fetching FAQ data.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", marginBottom: "16px" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <TitleAndBodyComponent Title={t("faqAsked")} Body={t("faqCheck")} />
      </Box>

      {sections.map((section, i) => (
        <Accordion
          key={i}
          sx={{
            border: "2px solid #66b2a0",
            borderRadius: "10px",
            marginBottom: "20px",
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${i}-content`}
            id={`panel${i}-header`}
          >
            <Typography variant="h5">{section.title}</Typography>
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
                  aria-controls={`panel${i}-${faqIndex}-content`}
                  id={`panel${i}-${faqIndex}-header`}
                >
                  <Typography variant="h6">{faq.question}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" sx={{ textAlign: "start" }}>
                    {faq.answer}
                  </Typography>
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

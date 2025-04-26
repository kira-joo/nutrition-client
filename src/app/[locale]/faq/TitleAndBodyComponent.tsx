import Typography from "@mui/material/Typography";

interface TitleAndBodyProps {
  Title: string;
  Body: string;
}

const TitleAndBodyComponent: React.FC<TitleAndBodyProps> = ({
  Title,
  Body,
}) => {
  return (
    <>
      <Typography variant="h5">{Title}</Typography>
      <Typography variant="body1" style={{ maxWidth: 680, marginTop: "15px" }}>
        {Body}
      </Typography>
    </>
  );
};

export default TitleAndBodyComponent;

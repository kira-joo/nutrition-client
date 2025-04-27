"use client";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";

import { DataI } from "@/app/interfaces/data.interface";
import { fetchAllMessages } from "@/utils/Messages";

const DataPage = () => {
  const [data, setData] = useState<DataI[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(
    null
  );
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetchAllMessages();
        setData(response);
        setLoading(false);
      } catch (err) {
        setError("There is something wrong, try again later");
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const handleDeleteMessage = async () => {
    if (selectedMessageId) {
      try {
        const response = await fetch(
          `http://localhost:3333/mail/${selectedMessageId}`,
          {
            method: "DELETE",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete the message.");
        }

        setData((prevData) =>
          prevData.filter((item) => item._id.toString() !== selectedMessageId)
        );
        setLoading(false);
        setOpenDialog(false); // Close the dialog
      } catch (error) {
        console.error("Error deleting message:", error);
        setError(
          "There is something wrong, You can not delete this message, please try again later"
        );
        setOpenDialog(false); // Close the dialog
      }
    }
  };

  const handleOpenDialog = (messageId: string) => {
    setSelectedMessageId(messageId);
    setOpenDialog(true); // Open the dialog when delete is clicked
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); // Close the dialog without deleting
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container
      sx={{
        background:
          "linear-gradient(135deg, #4e4b5c, #a37871, #bea2c2, #bdadea, #4381c1)",
        borderRadius: 4,
        p: 4,
        boxShadow: 3,
      }}
      style={{ flex: 1 }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Messages
      </Typography>
      {data.length === 0 ? (
        <Typography variant="body1" align="center" color="textSecondary">
          No messages available
        </Typography>
      ) : (
        <List>
          {data.map((item) => (
            <ListItem
              key={item._id.toString()}
              sx={{
                border: "1px solid #ddd",
                mb: 2,
                background:
                  "linear-gradient(135deg, #3d3a4b, #8c625a, #a78fa3, #a49bbd, #356093)",

                borderRadius: 4,
                p: 4,
                boxShadow: 3,
                bgcolor: item.read ? "#f9f9f9" : "#f2f2f2",
              }}
            >
              <Box
                sx={{ flex: 1 }} // word word
                // width="100%" // character character
              >
                <Typography
                  variant="body1"
                  sx={{
                    wordWrap: "break-word",
                    mb: 1.5,
                    fontSize: { xs: "0.9rem", md: "1.1rem" },
                  }}
                >
                  From: {item.from}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    wordWrap: "break-word",
                    mb: 1.5,
                    fontSize: { xs: "0.9rem", md: "1.1rem" },
                  }}
                >
                  To: {item.to}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    wordWrap: "break-word",
                    mb: 1.5,
                    fontSize: { xs: "0.9rem", md: "1.1rem" },
                  }}
                >
                  Message: {item.text}
                </Typography>
                {item.phone && (
                  <Typography
                    sx={{ fontSize: { xs: "0.9rem", md: "1.1rem" }, mt: 1.5 }}
                    variant="body1"
                  >
                    Phone: {item.phone}
                  </Typography>
                )}
                <Divider sx={{ mt: 2 }} />
                <Tooltip title="Delete message">
                  <IconButton
                    onClick={() => handleOpenDialog(item._id.toString())}
                    style={{ textAlign: "right", marginRight: "auto" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
        </List>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="confirm-delete-dialog"
      >
        <DialogTitle id="confirm-delete-dialog">Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this message?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteMessage} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DataPage;

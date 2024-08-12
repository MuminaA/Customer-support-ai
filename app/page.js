"use client";
// import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Box, Stack, TextField, Button, Typography } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { styled, alpha } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import SearchIcon from "@mui/icons-material/Search";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: `assistant`,
      content: `Hi I'm the Headstarter Support Agent, how can I assist you today?`,
    },
  ]);

  // auto scroll to current message
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: " #e6e6e6",
    // "&:hover": {
    //   backgroundColor: '#f2f2f2',
    // },
    // marginLeft: 0,
    // width: "100%",
    // [theme.breakpoints.up("sm")]: {
    //   marginLeft: theme.spacing(1),
    //   width: "auto",
    // },
  }));

  const SearchIconWrapper = styled("div")(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  }));

  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: "inherit",
    width: "100%",
    "& .MuiInputBase-input": {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      // transition: theme.transitions.create("width"),
      // [theme.breakpoints.up("sm")]: {
      //   width: "12ch",
      //   "&:focus": {
      //     width: "20ch",
      //   },
      // },
    },
  }));

  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    setMessage(""); // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message }, // Add the user's message to the chat
      { role: "assistant", content: "" }, // Add a placeholder for the assistant's response
    ]);

    // Send the message to the server
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader(); // Get a reader to read the response body
      const decoder = new TextDecoder(); // Create a decoder to decode the response text

      let result = "";
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), {
          stream: true,
        }); // Decode the text
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]; // Get the last message (assistant's placeholder)
          let otherMessages = messages.slice(0, messages.length - 1); // Get all other messages
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text }, // Append the decoded text to the assistant's message
          ];
        });
        return reader.read().then(processText); // Continue reading the next chunk of the response
      });
    });
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      // flexDirection="column"
      // justifyContent="center"
      alignItems="center"
      // backgroundColor="yellow"
    >
      <Stack
        height="100vh"
        width="250px"
        border="1px solid #e6e6e6"
        // backgroundColor="red"
        display="flex"
        flexDirection="column"
      >
        <Stack
          height="40px"
          display="flex"
          alignItems="center"
          flexDirection="row"
          borderBottom="1px solid #e6e6e6"
          gap={1}
          padding="0 10px"
          // backgroundColor="blue"
        >
          <SmartToyIcon />
          <Typography fontWeight="bold">ChatAI</Typography>
        </Stack>
        <Stack
          display="flex"
          gap={1.5}
          margin="15px 10px"
          // backgroundColor="purple"
          flexGrow={1}
        >
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#6666ff",
              display: "flex",
              justifyContent: "flex-start",
              padding: "8px 16px",
              width: "100%",
              "&:hover": {
                backgroundColor: "#8080ff",
              },
            }}
          >
            <Typography fontWeight="bold" marginRight="23px">
              +
            </Typography>{" "}
            New chat
          </Button>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        </Stack>
        <Stack
          // backgroundColor="yellow"
          height="60px"
          borderTop="1px solid #e6e6e6"
          display="flex"
          flexDirection="row"
          alignItems="center"
          gap={2}
          paddingLeft="10px"
        >
          <AccountCircleIcon fontSize="large" />
          <Stack>
            <Typography fontWeight="bold" fontSize="">
              Victony Simmons
            </Typography>
            <Typography fontSize=".8rem" color='#a6a6a6'>Portal</Typography>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        // width="100vh"
        flex={1}
        height="100vh"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        backgroundColor="#f2f2f2"
      >
        <Stack
          direction="column"
          width="800px"
          // height="700px"
          // width="100vh"
          height="100vh"
          marginTop="15px"
          // border="1px solid black"
          p={2}
          spacing={3}
          sx={{ borderRadius: 6 }}
          // backgroundColor="red"
        >
          <Stack
            direction="column"
            spacing={2}
            flexGrow={1}
            overflow="auto"
            maxHeight="100%"
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={
                  message.role === "assistant" ? "flex-start" : "flex-end"
                }
              >
                <Box
                  bgcolor={message.role === "assistant" ? "white" : "#ffe6cc"}
                  color="black"
                  borderRadius={3}
                  p={3}
                >
                  <strong>
                    {message.role === "assistant" ? "Bot: " : "You: "}
                  </strong>
                  {message.content}
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
          <Stack>
            <Stack
              display="flex"
              justifyContent="center"
              alignItems="center"
              direction={"row"}
              spacing={2}
              sx={{
                border: "1px solid #f2f2f2",
                borderRadius: "50px",
                paddingRight: "10px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
            >
              <TextField
                placeholder="Type your prompt here..."
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      border: "none",
                    },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                disabled={message.trim() === ""}
                sx={{
                  backgroundColor: "#33cc33",
                  borderRadius: "50%", // Make the button circular
                  minWidth: "40px", // Adjust the width and height to make it a circle
                  height: "40px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    backgroundColor: "#2eb82e", // Keep the color the same on hover
                  },
                  "&:disabled": {
                    backgroundColor: "#cccccc", // Change color when disabled
                    cursor: "not-allowed",
                  },
                }}
              >
                <SendIcon />
              </Button>
            </Stack>
            <Typography display='flex' justifyContent='center' marginTop='20px' color='#bfbfbf'>
              ChatAI has the potential to generate Incorrect Information.
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
}

import React from "react";
import { Box, Paper, Container } from "@mui/material";
import IVRConfig from "./IVRConfig";

export default function IVRConfigPage() {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 70px)",
        background: "var(--bg-color)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <IVRConfig />
        </Paper>
      </Container>
    </Box>
  );
}

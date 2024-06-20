import React from "react";
import { CircularProgress, Backdrop } from "@mui/material";

function LoadSpinner() {
  return (
    <Backdrop open={true}>
      <CircularProgress />
    </Backdrop>
  );
}

export default LoadSpinner;

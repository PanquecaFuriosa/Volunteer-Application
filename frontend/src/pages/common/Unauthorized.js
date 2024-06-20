import React from 'react';
import { Box, Typography } from "@mui/material";
import '../../styles/Form.css';

/**
 * Page shown when an user tries to access a route that
 * he is not authorized to go
 */
const Unauthorized = () => {
  return (
    <Box className="custom-box-bg custom-box-form">
      <Typography variant="h1" color="textPrimary">Unauthorized</Typography>
    </Box>
  );
};
  
  export default Unauthorized;
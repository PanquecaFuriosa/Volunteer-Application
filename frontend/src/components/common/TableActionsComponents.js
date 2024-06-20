import { Grid, IconButton, Tooltip } from "@mui/material";

const TableActionsComponents = ({ iconButtons = [] }) => {
    return (
        <Grid
            container
            columns={4}
            spacing={1.5}
            sx={{ justifyContent: "center" }}
        >
            {iconButtons.map((iconButton, index) => {
                return (
                    <Grid item xs={1} align="center" key={index}>
                        <Tooltip title={iconButton.title} arrow>
                            <IconButton
                                color="primary"
                                onClick={iconButton.onClick}
                            >
                                <i className={iconButton.icon}></i>
                            </IconButton>
                        </Tooltip>
                    </Grid>
                );
            })}
        </Grid>
    );
};

export default TableActionsComponents;

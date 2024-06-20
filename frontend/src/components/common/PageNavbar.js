import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const PageNavbar = ({ barTitle, buttons = [], logout = undefined }) => {
    return (
        <>
            <AppBar position="fixed">
                <Toolbar className="navbar">
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        {`${barTitle} Dahsboard`}
                    </Typography>
                    {buttons.map((button, index) => (
                        <Button
                            key={index}
                            className="navbar-button"
                            onClick={button.onClick}
                            color="inherit"
                            endIcon={<i className={button.endIcon}></i>}
                        >
                            <Typography>{button.text}</Typography>
                        </Button>
                    ))}
                    {logout !== undefined && logout}
                </Toolbar>
            </AppBar>
        </>
    );
};

export default PageNavbar;

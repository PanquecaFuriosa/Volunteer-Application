import {
    Box,
    Chip,
    Container,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Tooltip,
} from "@mui/material";
import {
    ThemeProvider,
    createTheme,
    responsiveFontSizes,
} from "@mui/material/styles";
import { useState } from "react";
import WorkModal from "./WorkModal";

/**
 * Configures a block's worklist item with its edit and delete modals
 *
 * @param {*} work work list item
 * @param {*} pos work position in the list
 * @param {*} workListItemProps work's propertys
 * @returns The block's worklist item with its edit and delete modals
 */
const WorkListItem = (work, pos, workListItemProps) => {
    const {
        showWork,
        setShowWork,
        workSelected,
        setWorkSelected,
        setPostulationChanged,
    } = workListItemProps;

    /**
     * Insert the tags of a work
     * @returns a box with the work tags of the work list item
     */
    const listTags = () => {
        return (
            <Box
                sx={{
                    marginLeft: "30px",
                    maxWidth: 220,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                {work.tags.length !== 0
                    ? work.tags.map((tag, index) => (
                          <Chip
                              key={index}
                              label={tag}
                              variant="outlines"
                              style={{
                                  marginRight: 5,
                                  fontSize: 17,
                              }}
                          />
                      ))
                    : ""}
            </Box>
        );
    };

    return (
        <>
            {showWork && workSelected === pos && (
                <WorkModal
                    work={work}
                    showWork={showWork}
                    setShowWork={setShowWork}
                    postulate={true}
                    setPostulationChanged={setPostulationChanged}
                />
            )}
            <ListItem
                disablePadding
                divider
                sx={{
                    backgroundColor: pos % 2 === 1 ? "whitesmoke" : "",
                    ":hover": {
                        backgroundColor: "lightgray",
                    },
                }}
            >
                <Box
                    display="flex"
                    width="100%"
                    justifyContent="left"
                    flexDirection="row"
                >
                    <Tooltip title={"Show work details"} arrow>
                        <ListItemButton
                            onClick={(_) => {
                                setWorkSelected(pos);
                                setShowWork(true);
                            }}
                        >
                            <ListItemIcon
                                sx={
                                    work.isPostulated
                                        ? {
                                              minWidth: "1rem",
                                          }
                                        : {
                                              minWidth: "20px",
                                          }
                                }
                            >
                                <i className="bi bi-clipboard work-icon" />
                            </ListItemIcon>
                            {work.isPostulated && (
                                <ListItemIcon
                                    sx={{
                                        minWidth: "10px",
                                    }}
                                >
                                    <i className="bi bi-person-fill work-postulation-icon" />
                                </ListItemIcon>
                            )}
                            <ListItemText>{work.name}</ListItemText>
                            <ListItemText>{listTags()}</ListItemText>
                        </ListItemButton>
                    </Tooltip>
                </Box>
            </ListItem>
        </>
    );
};

/**
 * Create the components to show the work list
 * 
 * @param {*} data the work list tho show
 * @param {*} setPostulationChanged function to do if the postulation of a work is changed
 * @returns The components to show the work list
 */
const WorkList = ({ data = [], setPostulationChanged = undefined }) => {
    const works = data;
    let theme = createTheme();
    theme = responsiveFontSizes(theme);

    const [showWork, setShowWork] = useState(false); // Visualization of the show work modal
    const [workSelected, setWorkSelected] = useState(-1); // Work selected

    // Properties of a work in a work list
    const workListItemProps = {
        showWork,
        setShowWork,
        workSelected,
        setWorkSelected,
        setPostulationChanged,
    };

    return (
        <>
            <Container sx={{ maxHeight: "619px", overflowY: "scroll" }}>
                <ThemeProvider theme={theme}>
                    <Typography noWrap align="left" sx={{ fontWeight: "bold" }}>
                        Works available
                    </Typography>
                </ThemeProvider>
                <Divider />
                <List>
                    {works.map((w, i) => WorkListItem(w, i, workListItemProps))}
                </List>
            </Container>
            <Typography className="legends">Legend</Typography>
            <Typography className="legends">
                <i className="bi bi-clipboard work-icon" /> Work without
                postulation
            </Typography>
            <Typography className="legends">
                <i className="bi bi-clipboard work-icon" />
                <i className="bi bi-person-fill work-postulation-icon" /> Work
                with postulation
            </Typography>
        </>
    );
};

export default WorkList;

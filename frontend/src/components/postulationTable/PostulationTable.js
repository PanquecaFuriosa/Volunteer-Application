import { useState } from "react";
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
} from "@mui/material";
import TableRowStyle from "../common/TableRowStyle";
import TableCellStyle from "../common/TableCellStyle";
import dayjs from "dayjs";

const PostulationTable = ({
    columns,
    filteredRows = [],
    postulations,
    onPageChange = undefined,
    onSizeChange = undefined,
}) => {
    const [page, setPage] = useState(0); // List page
    const [rowsPerPage, setRowsPerPage] = useState(5); // Number of rows to show

    /**
     * Calculates the page number for a given first user index based on the new number of rows per page.
     * @param {String} firstUserIndex - The index of the first user being displayed.
     * @param {String} newRowsPerPage - The new number of users per page.
     * @returns the page number where the first user will be located after changing the number of rows per page.
     */
    const calculateOnResizePage = (firstUserIndex, newRowsPerPage) => {
        return Math.floor(firstUserIndex / newRowsPerPage);
    };

    /**
     * Handles the page change event and updates the current page state.
     */
    const handlePageChange = (e, newPage) => {
        setPage(newPage);
        if (onPageChange !== undefined) onPageChange(newPage);
    };

    /**
     * Handles the rows per page change event and updates the current page state and rows per page.
     */
    const handleRowsPerPageChange = (event) => {
        const newRowsPerPage = parseInt(event.target.value, 10);
        const newPage = calculateOnResizePage(
            page * rowsPerPage,
            newRowsPerPage
        );
        setRowsPerPage(newRowsPerPage);
        setPage(newPage);

        if (onSizeChange !== undefined) onSizeChange(newRowsPerPage);

        if (onPageChange !== undefined) onPageChange(newPage);
    };

    return (
        <>
            <TableContainer component={Paper} sx={{ marginTop: "10px" }}>
                <Table sx={{ minWidth: 700 }} aria-label="customized table">
                    <TableHead>
                        <TableRow>
                            {columns.map((column, index) => (
                                <TableCellStyle
                                    sx={
                                        column === "Actions" ||
                                        column === "Tags"
                                            ? { textAlign: "center" }
                                            : {}
                                    }
                                    key={index}
                                >
                                    {column}
                                </TableCellStyle>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredRows &&
                            filteredRows.map((row, key) => (
                                <TableRowStyle key={key}>
                                    <TableCellStyle align="left">
                                        {row.workName}
                                    </TableCellStyle>
                                    <TableCellStyle align="left">
                                        {row.supplierUsername}
                                    </TableCellStyle>
                                    <TableCellStyle align="left">
                                        {dayjs(
                                            row.startDate,
                                            "DD-MM-YYYY"
                                        ).format("DD-MM-YYYY")}
                                    </TableCellStyle>
                                    <TableCellStyle align="left">
                                        {dayjs(
                                            row.endDate,
                                            "DD-MM-YYYY"
                                        ).format("DD-MM-YYYY")}
                                    </TableCellStyle>
                                    <TableCellStyle align="left">
                                        {row.status}
                                    </TableCellStyle>
                                    <TableCellStyle align="center">
                                        {row.actions}
                                    </TableCellStyle>
                                </TableRowStyle>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={-1}
                page={page}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                onPageChange={handlePageChange}
                onRowsPerPageChange={handleRowsPerPageChange}
                labelRowsPerPage={"Rows per page"}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to}`}
                nextIconButtonProps={{
                    disabled: postulations.length < rowsPerPage,
                }}
            />
        </>
    );
};

export default PostulationTable;

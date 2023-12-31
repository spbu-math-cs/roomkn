import React, {useEffect, useState} from "react";
import {Pagination, Stack, useTheme} from "@mui/material";
import useSomeAPI from "../api/FakeAPI";


export function PaginatedList({children, endpoint, resultHandler, additional_deps, limit=5, fetchFlag}) {

    const [draw_list, setDrawList] = useState([])

    const [page, setPage] = React.useState(1);
    const [pageCount, setPageCount] = React.useState(2);
    const [size, setSize] = React.useState(0);
    const [elementsOnPage, setElementsOnPage] = React.useState(limit);
    const [offset, setOffset] = React.useState(0);


    useEffect(() => {
        setPageCount(Math.ceil(size / limit))
        if (size - offset >= limit) {
            setElementsOnPage(limit)
        } else {
            setElementsOnPage(size - offset)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size, offset, limit])

    const [result, setResult] = React.useState(null);
    const [statusCode, setStatusCode] = React.useState(null);


    function getSizeCallback(sizeResult, sizeStatusCode) {
        console.log("result: " + sizeResult)
        console.log("statusCode:"  + sizeStatusCode)
        if (sizeStatusCode === 200 && sizeResult != null) {
            setSize(sizeResult);
        }
    }

    const pagination_query = `?offset=${offset}&limit=${limit}`
    let {triggerFetch: triggerFetchSize} = useSomeAPI(endpoint + '/size', null, 'GET', getSizeCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetchSize(), [fetchFlag])

    function getListCallback(listResult, listStatusCode) {
        setStatusCode(listStatusCode)
        console.log("result: " + listResult)
        console.log("statusCode:"  + listStatusCode)
        console.log("page:"  + page)
        if (listStatusCode === 200 && listResult != null) {
            setResult(listResult);
        }
    }

    // result handler

    useEffect(() => {
        const newDrawList = resultHandler(result, statusCode, elementsOnPage)
        setDrawList(newDrawList)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [result, additional_deps])

    let {triggerFetch: triggerFetchList} = useSomeAPI(endpoint + pagination_query, null, 'GET', getListCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetchList(), [page, fetchFlag])

    const handleChangePage = (event, value) => {
        setPage(value);
        setOffset((value - 1) * limit)
    };

    const theme = useTheme()

    return (
        <>
            <Stack spacing={theme.spacing()} direction = "column" sx={{paddingBottom: 2}}>
                {children}
                {draw_list}
            </Stack>
            <Stack alignItems="center">
                <Pagination count={pageCount} page={page} onChange={handleChangePage} sx={{justifyContent:"center"}} data-test-id="pagination-input"/>
            </Stack>
        </>
    )
}

export default PaginatedList;
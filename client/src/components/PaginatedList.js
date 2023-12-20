import React, {useEffect, useState} from "react";
import {Pagination, Stack} from "@mui/material";
import useSomeAPI from "../api/FakeAPI";


export function PaginatedList({children, endpoint, resultHandler, additional_deps, limit=5}) {

    const [draw_list, setDrawList] = useState([])

    const [page, setPage] = React.useState(1);
    const [pageCount, setPageCount] = React.useState(2);
    const [size, setSize] = React.useState(20);
    const [elementsOnPage, setElementsOnPage] = React.useState(limit);

    useEffect(() => {
        setPageCount(Math.ceil(size / limit))
        if (size - offset > limit) {
            setElementsOnPage(limit)
        } else {
            setElementsOnPage(size - offset)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size])

    const [offset, setOffset] = React.useState(0);

    const [result, setResult] = React.useState(null);
    const [statusCode, setStatusCode] = React.useState(null);


    function getSizeCallback(result, statusCode) {
        console.log("result: " + result)
        console.log("statusCode:"  + statusCode)
        if (statusCode === 200 && result != null) {
            setSize(result);
        }
    }

    const pagination_query = `?offset=${offset}&limit=${limit}`
    let {triggerFetch: triggerFetchSize} = useSomeAPI(endpoint + '/size', null, 'GET', getSizeCallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => triggerFetchSize(), [])

    function getListCallback(result, statusCode) {
        setStatusCode(statusCode)
        console.log("result: " + result)
        console.log("statusCode:"  + statusCode)
        console.log("page:"  + page)
        if (statusCode === 200 && result != null) {
            setResult(result);

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
    useEffect(() => triggerFetchList(), [page])

    const handleChangePage = (event, value) => {
        setPage(value);
        setOffset((value - 1) * limit)
    };

    return (
        <>
            <Stack direction = "column" sx={{paddingBottom: 2}}>
                {children}
                {draw_list}
            </Stack>
            <Stack alignItems="center">
                <Pagination count={pageCount} page={page} onChange={handleChangePage} sx={{justifyContent:"center"}} />
            </Stack>
        </>
    )
}

export default PaginatedList;
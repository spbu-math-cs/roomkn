import useAPI from './API';
import {useEffect, useState} from "react";

export function useSomeAPI(url, data=null, method='GET') {
    return useAPI(url, data, method);
    // return useFakeAPI(url, data, method);
}

function useFakeAPI(url, data=null, method='GET') {

    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const [statusCode, setStatus] = useState(0);
    const [fetchFlag, setFetchFlag] = useState(0)
    const [headers, setHeaders] = useState({})


    // dummy room list
    // useEffect(() => {
    useEffect(() => {
        if (fetchFlag === 0) return

        console.log(method, url, data)

        const roomList = [
            {
                id: "1",
                name: "OK room",
                description: "OK to all reservations"
            }
            ,
            {
                id: "2",
                name: "error room",
                description: "400 to all reservations"
            }
            ,
            {
                id: "3",
                name: "conflict room",
                description: "409 to all reservations"
            }
        ]

        // dummy response for roomList

        if (url === "/api/v0/rooms/") {
            setResult(roomList)
            setStatus(200)
        }

        // dummy responses for roomInfo

        if (url.startsWith("/api/v0/rooms/") &&
            url.length > "/api/v0/rooms/".length) {
            if (url === "/api/v0/rooms/1/") {
                setResult(roomList[0])
                setStatus(200)
            } else if (url === "/api/v0/rooms/2/") {
                setResult(roomList[1])
                setStatus(200)
            } else if (url === "/api/v0/rooms/3/") {
                setResult(roomList[2])
                setStatus(200)
            } else {
                setStatus(404)
            }
        }

        // dummy response for reservations

        if (url === "/api/v0/reserve/") {
            if (data.room_id === "1") {
                setStatus(201)
                setResult(null)
            } else if (data.room_id === "2") {
                setStatus(400)
                setResult("Что за черт?")
            } else if (data.room_id === "3") {
                setResult(null)
                setStatus(409)
            } else {
                setStatus(404)
            }
        }

        // dummy response for sign-in

        if (url === "/api/v0/login/") {
            console.log("1" + data.username + "1", "saturas")
            if (data.username === "saturas") {
                setResult(null)
                setStatus(200)
            } else if (data.username === "corristo") {
                setResult(null)
                setStatus(409)
            } else {
                setResult(null)
                setStatus(400)
            }
        }

        setLoading(false)
        setFinished(true)
    },[fetchFlag])

    function triggerFetch() {
        setFetchFlag(fetchFlag + 1)

        setFinished(false)
    }

    return {triggerFetch, result, loading, statusCode, headers, finished};
}

export default useSomeAPI
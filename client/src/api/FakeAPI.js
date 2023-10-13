import useAPI from './API';
import {useEffect, useState} from "react";

export function useSomeAPI(url, data=null, method='GET') {
    // return useAPI(url, data, method);
    return useFakeAPI(url, data, method);
}

function useFakeAPI(url, data=null, method='GET') {

    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [statusCode, setStatus] = useState(0);
    const [fetchFlag, setFetchFlag] = useState(0)
    const [headers, setHeaders] = useState({})


    // dummy room list
    // useEffect(() => {
    useEffect(() => {
        const roomList = [
            {
                id: "101",
                name: "OK room",
                description: "OK to all reservations"
            }
            ,
            {
                id: "203",
                name: "error room",
                description: "400 to all reservations"
            }
            ,
            {
                id: "310",
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

        if (url === "/api/v0/rooms/101") {
            setResult(roomList[0])
            setStatus(200)
        }
        if (url === "/api/v0/rooms/203") {
            setResult(roomList[1])
            setStatus(200)
        }
        if (url === "/api/v0/rooms/310") {
            setResult(roomList[2])
            setStatus(200)
        }

        // dummy response for reservations

        if (url === "/api/v0/reserve") {
            if (data.room_id === 101) {
                setStatus(201)
                setResult(null)
            }
            if (data.room_id === 203) {
                setStatus(400)
                setResult("Что за черт?")
            }
            if (data.room_id === 101) {
                setResult(null)
                setStatus(409)
            }
        }

        // dummy response for sign-in

        if (url === "/api/v0/login") {
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
    },[url, data, method, fetchFlag])

    function triggerFetch() {
        setFetchFlag(fetchFlag + 1)
    }

    return {triggerFetch, result, loading, statusCode, headers};
}

export default useSomeAPI
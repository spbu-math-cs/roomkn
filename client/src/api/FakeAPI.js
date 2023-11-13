import useAPI from './API';
import {useEffect, useState} from "react";

export function useSomeAPI(url, data=null, method='GET') {
    useFakeAPI(url, data, method);
    return useAPI(url, data, method);
}


function useFakeAPI(url, data=null, method='GET') {
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const [statusCode, setStatus] = useState(0);
    const [fetchFlag, setFetchFlag] = useState(0)
    const [headers] = useState({})

    const roomListDefault = [
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

    const [roomList, setRoomList] = useState(roomListDefault)


    // dummy room list
    // useEffect(() => {
    useEffect(() => {
        if (fetchFlag === 0) return

        console.log(method, url, data)

        // dummy response for roomList

        if (url === "/api/v0/rooms") {
            setResult(roomList)
            setStatus(200)
        }

        // dummy responses for roomInfo

        if (url.startsWith("/api/v0/rooms/") &&
            url.length > "/api/v0/rooms/".length) {
            if (url === "/api/v0/rooms/create") {
                data.id = roomList.length
                setRoomList(roomList.concat(data))
                console.log(roomList.concat(data), roomList)
            } else {
                if (url === "/api/v0/rooms/1") {
                    setResult(roomList[0])
                    setStatus(200)
                } else if (url === "/api/v0/rooms/2") {
                    setResult(roomList[1])
                    setStatus(200)
                } else if (url === "/api/v0/rooms/3") {
                    setResult(roomList[2])
                    setStatus(200)
                } else {
                    setStatus(404)
                }
            }
        }

        // dummy response for reservations

        if (url === "/api/v0/reserve") {
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


        // dummy response for user info

        if (url === "/api/v0/users/1") {
            setStatus(200)
            setResult({
                id: 1,
                username: "Tinky Winky",
                email: null
            })
        }
        if (url === "/api/v0/users/2") {
            setStatus(200)
            setResult({
                id: 2,
                username: "Dipsy",
                email: null
            })
        }
        if (url === "/api/v0/users/3") {
            setStatus(200)
            setResult({
                id: 3,
                username: "Laa Laa",
                email: null
            })
        }

        // dummy response for reservation info

        if (url === "/api/v0/rooms/1/reservations") {
            console.log("fakeAPI: setting result")
            setStatus(200)
            setResult([
                {
                    id: 1,
                    user_id: 1,
                    from: "2021-11-25T14:20:00Z",
                    until: "2021-11-25T16:10:00Z",
                    room_id: 1
                },
                {
                    id: 2,
                    user_id: 3,
                    from: "2021-11-24T09:20:00Z",
                    until: "2021-11-24T10:50:00Z",
                    room_id: 1
                },
                {
                    id: 3,
                    user_id: 2,
                    from: "2021-11-25T10:20:00Z",
                    until: "2021-11-25T11:50:00Z",
                    room_id: 1
                }
            ])
        }

        setLoading(false)
        setFinished(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    },[fetchFlag])

    function triggerFetch() {
        setFetchFlag(fetchFlag + 1)

        setFinished(false)
    }

    return {triggerFetch, result, loading, statusCode, headers, finished};
}

export default useSomeAPI
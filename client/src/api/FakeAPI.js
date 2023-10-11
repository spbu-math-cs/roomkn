import useAPI from './API';

export default function callSomeAPI(url, data=null, method='GET') {
    // return useAPI(url, data, method);
    return callFakeAPI(url, data, method);
}

function callFakeAPI(url, data=null, method='GET') {
    

    // dummy room list

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

    if (url === "/api/v0/rooms/") return [roomList, 200, false]

    // dummy responses for roomInfo

    if (url === "/api/v0/rooms/101") return [roomList[0], false, 200]
    if (url === "/api/v0/rooms/203") return [roomList[1], false, 200]
    if (url === "/api/v0/rooms/310") return [roomList[2], false, 200]
    
    // dummy response for reservations

    if (url === "/api/v0/reserve") {
        if (data.room_id === 101) return [null, false, 201]
        if (data.room_id === 203) return ["Что за черт?", false, 400]
        if (data.room_id === 101) return [null, false, 409]
    }
}
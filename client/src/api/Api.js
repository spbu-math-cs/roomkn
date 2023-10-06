
class Api {
    constructor() {
        this.api_host = "http://127.0.0.1:8080"
    }

    getToken() {
        const tokenString = sessionStorage.getItem('token');
        const userToken = JSON.parse(tokenString);
        return userToken?.token
    };

    saveToken(userToken) {
        sessionStorage.setItem('token', JSON.stringify(userToken));
    };
    
    reservations = []

    async sendRequest(url, method='GET', data=null) {
        const options = {
            method: method,
            credentials: 'include',
            // headers: {
            //     "Access-Control-Allow-Origin": "*",
            //     "Access-Control-Allow-Methods": "*",
            //     "Access-Control-Allow-Headers": "*"
            // }

        }

        if (data) {
            options.body = JSON.stringify(data)
        }
        console.log(options)
        let response = await fetch(this.api_host + url, options)
        console.log('API-response', response)
        if (response.ok && response.headers['content-type'] == 'application/json')
            return response

        alert(response.status + response.statusText)

        // throw new Error("Bad request")
    }

    getRoomInfo(id) {
        console.log(id)
        const roomInfoPromise = this.sendRequest('/api/v0/rooms/' + id)
        const roomReservationsPromise = this.sendRequest('/api/v0/rooms/' + id + '/reservations')
        console.log(roomInfoPromise, roomReservationsPromise)

        var description = 'Нет доступа к серверу'
        var reservations = null

        roomInfoPromise.then((result) => {
            description = result.description
        }).catch((e) => {})

        roomReservationsPromise.then((result) => {
            reservations = result
        }).catch((e) => {})

        return {
            id: id,
            description: description,
            reservations: reservations
        }
    }

    getRoomList() {
        console.log(23432)
        const roomListPromise = this.sendRequest('/api/v0/rooms/')
        
        var roomList = [{id: 404, description: 'Нет доступа к серверу'}]

        roomListPromise.then((result) => {
            console.log(result)
            roomList = result
        }).catch((e) => {})

        return roomList
    }

    toApiTime(date, time) {

    }

    bookRoom(name, date, from, to) {

        let from_time = this.toApiTime(date, from)

        let to_time = this.toApiTime(date, to)

        let reservation = {
            from: from_time,
            to:   to_time
        }

        return this.sendRequest('/api/v0/reserve', 'POST', reservation)
    }
}

export default Api
import { useEffect, useState } from 'react';

const API_HOST = process.env.REACT_APP_REST_SERVER_ADDRESS

export function useAPI(url, data=null, method='GET', callback = () => {}, is_json_response=true) {
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const [failed, setFailed] = useState(false);
    const [statusCode, setStatus] = useState(0);
    const [fetchFlag, setFetchFlag] = useState(0)
    const [headers, setHeaders] = useState({})

    let myResult = null
    let myStatusCode = 0

    function secureCallback(result, statusCode) {
        try {
            return callback(result, statusCode)
        } catch (e) {

            console.log(e, statusCode, result)
        }
    }

    useEffect(() => {
        if (fetchFlag === 0) return

        setLoading(true);

        const options = {
            method: method,
            credentials: 'include',
            headers: {}
        }
        if (data) {
            options['body'] = JSON.stringify(data)
            options.headers["Content-Type"] = 'application/json;charset=utf-8'
        }

        fetch(API_HOST + url, options)
            .then(r => {
                setStatus(r.status)
                // eslint-disable-next-line react-hooks/exhaustive-deps
                myStatusCode = r.status
                // console.log(r.cookie ("userId"))
                return r
            })
            .then(r => {
                setHeaders(r.headers)
                return r
            })
            .then(r => {
                let res_f = is_json_response ? r.json() : r.text();
                res_f.then(rjson => {
                    setResult(rjson)

                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    myResult = rjson

                    setLoading(false)
                    setFinished(true)
                    console.log('starting callback for ' + url)
                    console.log('method = ' + method)
                    secureCallback(myResult, myStatusCode)
                }).catch(error => {
                    setResult(error)

                    myResult = error

                    setLoading(false)
                    setFinished(true)
                    secureCallback(myResult, myStatusCode)
                    setFailed(true)
                })
            })
            .catch(error => {
                setResult(error)

                myResult = error

                setStatus(0)
                myStatusCode = 0
                setFinished(true)
                secureCallback(myResult, myStatusCode)
                setFailed(true)
            });
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFlag]);

    function triggerFetch() {
        setLoading(false);
        setFinished(false);
        setFailed(false);
        setFetchFlag(fetchFlag + 1)
    }

    return {triggerFetch, result, loading, statusCode, headers, finished, setFinished, fetchFlag, failed};
}

export function toAPITime(date, time) {
    //return "2021-11-25T14:20:00Z"
    return (date + "T" + time + ":00Z")
}

export function fromAPITime(ins) {
    // return {
    //         date: "2022-10-12",
    //         time: "8:30"
    // }

    // console.log("fromAPITime: " + ins)

    const tokens = ins.split('T')
    const time = tokens[1].slice(0, -4)

    // console.log("date: " + tokens[0])
    // console.log("time: " + time)
    return {
        date: tokens[0],
        time: time
    }
}

export function dateFormat(date, format = "yyyy-mm-dd") {
    var mlz = ""
    if (date.getMonth() + 1 < 10) mlz = "0"
    var dlz = ""
    if (date.getDate() < 10) dlz = "0"
    const map = {
        mm: mlz + (date.getMonth() + 1),
        dd: dlz + date.getDate(),
        yyyy: date.getFullYear(),
        // yy: date.getFullYear().toString().slice(-2)
    }

    return format.replace(/mm|dd|yyyy/gi, matched => map[matched])
}

export function getTodayDate(format = "yyyy-mm-dd") {
    const date = new Date()

    return dateFormat(date, format)
}


export default useAPI
import { useEffect, useState } from 'react';

const API_HOST = process.env.REACT_APP_REST_SERVER_ADDRESS

export function useAPI(url, data=null, method='GET') {
    console.log(API_HOST)
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [finished, setFinished] = useState(false);
    const [statusCode, setStatus] = useState(0);
    const [fetchFlag, setFetchFlag] = useState(0)
    const [headers, setHeaders] = useState({})

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
            if (r.ok) {
                return r
            } else
                throw r.status
        })
        .then(r => {
            setHeaders(r.headers)
            return r
        })
        .then(r => r.json())
        .then(r => {
            setResult(r);
            setLoading(false);
            setFinished(true)
        })
        .catch(error => {
            setResult(error)
            setStatus(0)
            setFinished(true)
        });
      }, [fetchFlag]);

    function triggerFetch() {
        setFetchFlag(fetchFlag + 1)
    }
    
    return {triggerFetch, result, loading, statusCode, headers, finished};
}

export function toAPITime(date, time) {
    //return "2021-11-25T14:20:00Z"
    return (date + "T" + time + ":00Z")
}

export function fromAPITime(ins) {
    // return {
    //     date: "2022-10-12",
    //     time: "8:30"
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

    
export default useAPI
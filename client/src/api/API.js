import { useEffect, useState } from 'react';

const API_HOST = "http://127.0.0.1:8080"

export function useAPI(url, data=null, method='GET') {
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
        }
        if (data) {
            options.body = JSON.stringify(data)
        }

        fetch(API_HOST + url)
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

    
export default useAPI
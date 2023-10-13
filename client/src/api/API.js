import { useEffect, useState } from 'react';

const API_HOST = "http://127.0.0.1:8080"

export function useAPI(url, data=null, method='GET') {
    const [result, setResult] = useState();
    const [loading, setLoading] = useState(true);
    const [statusCode, setStatus] = useState();
    const [fetchFlag, setFetchFlag] = useState(0)

    useEffect(() => {
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
        .then(r => r.json())
        .then(r => {
            setResult(r);
            setLoading(false);
        })
        .catch(error => {
            setResult(error)
            setStatus(0)
        });
      }, [url, data, method, fetchFlag]);

    function triggerFetch() {
        setFetchFlag(fetchFlag + 1)
    }
    
    return {triggerFetch, result, loading, statusCode};
}

function getToken() {
    const tokenString = sessionStorage.getItem('token');
    const userToken = JSON.parse(tokenString);
    return userToken?.token
}

function saveToken(userToken) {
    sessionStorage.setItem('token', JSON.stringify(userToken));
}
    
export default useAPI
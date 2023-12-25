import useAPI from './API';

export function useSomeAPI(url, data = null, method = 'GET', callback = () => {}, is_json_response=true) {
    // console.log(url + " method:" + method)
    return useAPI(url, data, method, callback, is_json_response);
}

export default useSomeAPI
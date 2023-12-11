import useAPI from './API';
import {useEffect, useState} from "react";

export function useSomeAPI(url, data = null, method = 'GET', callback = () => {}) {
    console.log(url + " method:" + method)
    return useAPI(url, data, method, callback);
}

export default useSomeAPI
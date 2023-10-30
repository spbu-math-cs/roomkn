import {createContext, useContext, useEffect, useState} from "react";
import useSomeAPI from "../api/FakeAPI";

const IS_ADMIN_DEFAULT = true;
export const IS_ADMIN_GUEST = true;

export function AuthorizeWrapper({children}) {
    const {isAuthorized} = useContext(IsAuthorizedContext)
    const {triggerValidate} = useAuthorizeByCookie()

    useEffect(() => {
        if (isAuthorized == null) {
            triggerValidate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return children
}


export function AuthorizationProvider({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)

    return (
        <IsAuthorizedContext.Provider value={{isAuthorized, setIsAuthorized}}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
                <AuthorizeWrapper>
                    {children}
                </AuthorizeWrapper>
            </CurrentUserContext.Provider>
        </IsAuthorizedContext.Provider>
    )
}

export function useAuthorizeByCookie() {
    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {setCurrentUser} = useContext(CurrentUserContext)

    // document.cookie = "roomkn=234325"
    const {result, statusCode, headers, triggerFetch, finished, fetchFlag} = useSomeAPI("/api/v0/auth/validate-token", null, "GET")

    useEffect(() => {
        if (finished) {
            console.log('validate: ', result, statusCode, finished)
            if (statusCode === 200) {
                const userData = {
                    user_id: result?.id,
                    csrf_token: headers['X-CSRF-Token'],
                    is_admin: IS_ADMIN_DEFAULT
                }
                console.log(userData)
                setCurrentUser(userData)
                saveUserData(userData)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
                setCurrentUser(null)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished, result, fetchFlag])

    return {triggerValidate: triggerFetch}

}

function createAuthorizeFunction(result, statusCode, headers, triggerFetch, user, setCurrentUser, setIsAuthorized) {
    return () => {
        triggerFetch()
    }
}

export function useAuthorize(username, password) {
    const user = {
        username: username,
        password: password
    }

    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {setCurrentUser} = useContext(CurrentUserContext)

    const {result, statusCode, headers, triggerFetch, finished} = useSomeAPI("/api/v0/login", user, "POST")

    const authorize = createAuthorizeFunction(result, statusCode, headers, triggerFetch, user, setCurrentUser, setIsAuthorized)

    useEffect(() => {
        if (finished && result != null) {
            if (statusCode === 200) {
                const userData = {
                    user_id: result?.id,
                    username: username,
                    csrf_token: headers['X-CSRF-Token'],
                    is_admin: IS_ADMIN_DEFAULT
                }

                setCurrentUser(userData)
                saveUserData(userData)
                setIsAuthorized(true)
            } else {
                setIsAuthorized(false)
                setCurrentUser(null)
            }

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished, result]);

    return {result, statusCode, headers, authorize, finished}
}

export function useRegister(username, password, email) {
    const user = {
        username: username,
        password: password,
        email:    email
    }

    const {result, statusCode, headers, triggerFetch, finished} = useSomeAPI("/api/v0/register", user, "POST")

    console.log(finished, statusCode, result)

    return {result, statusCode, headers, register: triggerFetch, finished}
}

export function useLogout() {
    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {setCurrentUser} = useContext(CurrentUserContext)
    const {result, statusCode, headers, triggerFetch, finished} = useSomeAPI("/api/v0/logout", null, "DELETE")

    useEffect(() => {
        setIsAuthorized(false)
        setCurrentUser({})
        saveUserData({})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished])


    return {result, statusCode, headers, triggerLogout: triggerFetch, finished}
}

export function getUserData() {
    const dataString = sessionStorage.getItem('roomkn');
    return JSON.parse(dataString)
}

export function getCSRFToken() {
    return getUserData?.crsf_token
}

export function saveUserData(userData) {
    console.log(userData, JSON.stringify(userData))
    sessionStorage.setItem('roomkn', JSON.stringify(userData));
}

export const IsAuthorizedContext = createContext(false)
export const CurrentUserContext = createContext({})
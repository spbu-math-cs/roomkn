import {createContext, useContext, useEffect, useState} from "react";
import useSomeAPI from "../api/FakeAPI";

const IS_ADMIN_DEFAULT = true;
export const IS_ADMIN_GUEST = true;

export function AuthorizeWrapper({children}) {
    const {triggerValidate} = useAuthorizeByCookie()

    useEffect(() => {
        triggerValidate()
    }, [])

    return children
}


export function AuthorizationProvider({children}) {
    const [isAuthorized, setIsAuthorized] = useState(false)
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
    const {result, statusCode, headers, triggerFetch, finished} = useSomeAPI("/api/v0/auth/validate-token", null, "GET")

    useEffect(() => {
        if (finished) {
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
    }, [finished])

    return {triggerValidate: triggerFetch}

}

function createAuthorizeFunction(result, statusCode, headers, triggerFetch, user, setCurrentUser, setIsAuthorized) {
    return () => {
        triggerFetch()
        console.log(statusCode)
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
        if (finished) {
            if (statusCode === 200) {
                const userData = {
                    user_id: user.username,
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
    }, [finished]);

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
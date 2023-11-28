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
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext)

    // document.cookie = "roomkn=234325"
    const {
        result: resultValidate,
        statusCode: statusCodeCalidate,
        headers: headersValidate,
        triggerFetch: triggerFetchValidate,
        finished: finishedValidate,
        fetchFlag: fetchFlagValidate
    } = useSomeAPI("/api/v0/auth/validate-token", null, "GET")

    useEffect(() => {
        if (finishedValidate) {
            console.log('validate: ', resultValidate, statusCodeCalidate, finishedValidate)
            if (statusCodeCalidate === 200) {
                const userData = {
                    user_id: resultValidate?.id,
                    csrf_token: headersValidate['X-CSRF-Token'],
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
    }, [finishedValidate, resultValidate, fetchFlagValidate])

    let {
        triggerFetch: triggerFetchUser,
        result: resultUser,
        finished: finishedUser
    } = useSomeAPI('/api/v0/users/' + currentUser?.user_id)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (fetchFlagValidate === 0) return
        if (finishedValidate && currentUser?.user_id != null) {
            triggerFetchUser()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFlagValidate, finishedValidate, resultValidate, currentUser?.user_id]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (currentUser?.user_id == null) return

        if (finishedUser && resultUser?.username != null) {
            const tmp_user_data = currentUser
            tmp_user_data.username = resultUser?.username
            setCurrentUser(tmp_user_data)
            console.log(tmp_user_data)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, finishedUser, resultUser])

    return {triggerValidate: triggerFetchValidate}

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

    const {result, statusCode, headers, triggerFetch, finished, fetchFlag} = useSomeAPI("/api/v0/login", user, "POST")

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
    }, [finished, result, fetchFlag]);

    return {result, statusCode, headers, authorize, finished, fetchFlag}
}

export function useRegister(username, password, email) {
    const user = {
        username: username,
        password: password,
        email: email
    }

    const {result, statusCode, headers, triggerFetch, finished, fetchFlag} = useSomeAPI("/api/v0/register", user, "POST")

    console.log(finished, statusCode, result)

    return {result, statusCode, headers, register: triggerFetch, finished, fetchFlag}
}

export function useLogout() {
    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {setCurrentUser} = useContext(CurrentUserContext)
    const {result, statusCode, headers, triggerFetch, finished, fetchFlag} = useSomeAPI("/api/v0/logout", null, "DELETE")

    useEffect(() => {
        setIsAuthorized(false)
        setCurrentUser({})
        saveUserData({})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished, fetchFlag])


    return {result, statusCode, headers, triggerLogout: triggerFetch, finished, fetchFlag}
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
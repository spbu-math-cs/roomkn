import {createContext, useContext, useEffect, useState} from "react";
import useSomeAPI from "../api/FakeAPI";

export const IS_ADMIN_DEFAULT = false;
export const IS_ADMIN_GUEST = false;

export function AuthorizeWrapper({children}) {
    const {isAuthorized} = useContext(IsAuthorizedContext)
    const {triggerValidate} = useAuthorizeByCookie()

    useEffect(() => {
        if (isAuthorized == null) {
            triggerValidate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const {triggerGetPermissions} = useGetCurrentUserPermissions()

    const {currentUser} = useContext(CurrentUserContext)
    useEffect(() => {
        if (isAuthorized != null) {
            triggerGetPermissions()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser])

    return children
}

const emptyUser = {
    user_id: null,
    csrf_token: null,
    is_admin: null,
    username: null
}

export function AuthorizationProvider({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null)
    const [currentUser, setCurrentUser] = useState(emptyUser)
    const [currentUserPermissions, setCurrentUserPermissions] = useState({})

    return (
        <IsAuthorizedContext.Provider value={{isAuthorized, setIsAuthorized}}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
                <CurrentUserPermissionsContext.Provider value={{currentUserPermissions, setCurrentUserPermissions}}>
                    <AuthorizeWrapper>
                        {children}
                    </AuthorizeWrapper>
                </CurrentUserPermissionsContext.Provider>
            </CurrentUserContext.Provider>
        </IsAuthorizedContext.Provider>
    )
}

function useGetCurrentUserPermissions() {
    const {currentUser} = useContext(CurrentUserContext)
    const {setCurrentUserPermissions} = useContext(CurrentUserPermissionsContext)

    const {triggerFetch} = useSomeAPI(`/api/v0/users/${currentUser.user_id}/permissions`, null, "GET", getUserPermissionsCallback)

    function getUserPermissionsCallback(result, statusCode) {
        if (statusCode === 200) {
            setCurrentUserPermissions(result)
            console.log(result)
        }
    }

    return {triggerGetPermissions: triggerFetch}
}

export function useAuthorizeByCookie() {
    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext)

    // document.cookie = "roomkn=234325"
    const { 
        headers: headersValidate,
        fetchFlag: fetchFlagValidate,
        triggerFetch: triggerFetchValidate,
        finished: finishedValidate
    } = useSomeAPI("/api/v0/auth/validate-token", null, "GET", validateCallback)

    function validateCallback(resultValidate, statusCodeValidate) {
        console.log('validate: ', resultValidate, statusCodeValidate)
            if (statusCodeValidate === 200) {
                const userData = {
                    user_id: resultValidate?.id,
                    csrf_token: headersValidate['X-CSRF-Token'],
                    is_admin: IS_ADMIN_DEFAULT,
                    username: null
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

    let {
        triggerFetch: triggerFetchUser
    } = useSomeAPI('/api/v0/users/' + currentUser?.user_id, null, 'GET', userCallback)

    function userCallback(resultUser, statusCodeUser) {
        if (currentUser?.user_id == null) return

        if (resultUser?.username != null && statusCodeUser === 200) {
            const tmp_user_data = {
                user_id: currentUser.user_id,
                csrf_token: currentUser.csrf_token,
                is_admin: currentUser.is_admin,
                username: resultUser.username
            }
            setCurrentUser(tmp_user_data)
        }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (fetchFlagValidate === 0) return
        if (finishedValidate && currentUser?.user_id != null) {
            triggerFetchUser()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchFlagValidate, finishedValidate, currentUser?.user_id]);

    return {triggerValidate: triggerFetchValidate}
}

export function createAuthorizeFunction(result, statusCode, headers, triggerFetch, user, setCurrentUser, setIsAuthorized) {
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

    const {result, statusCode, headers, triggerFetch, finished} = useSomeAPI("/api/v0/login", user, "POST", authCallback)

    const authorize = createAuthorizeFunction(result, statusCode, headers, triggerFetch, user, setCurrentUser, setIsAuthorized)

    function authCallback(result, statusCode) {
        if (result != null) {
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
    }

    return {result, statusCode, headers, authorize, finished}
}

// export function useRegister(username, password, email) {
//     const user = {
//         username: username,
//         password: password,
//         email: email
//     }

//     const {result, statusCode, headers, triggerFetch, finished} = useSomeAPI("/api/v0/register", user, "POST", registerCallback)

//     console.log(finished, statusCode, result)

//     return {result, statusCode, headers, register: triggerFetch, finished}
// }

export function useLogout() {
    const {setIsAuthorized} = useContext(IsAuthorizedContext)
    const {setCurrentUser} = useContext(CurrentUserContext)
    const {result, statusCode, headers, triggerFetch, finished} = useSomeAPI("/api/v0/logout", null, "DELETE", logoutCallback)


    function logoutCallback(result, statusCode) {
        setIsAuthorized(false)
        setCurrentUser({})
        saveUserData({})
    }

    // useEffect(() => {
    //     setIsAuthorized(false)
    //     setCurrentUser({})
    //     saveUserData({})
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [finished])


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
export const CurrentUserPermissionsContext = createContext({})
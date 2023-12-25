import {createContext, useContext, useEffect, useState} from "react";
import useSomeAPI from "../api/FakeAPI";

export const IS_ADMIN_DEFAULT = false;
export const IS_ADMIN_GUEST = false;

export function AuthorizeWrapper({children}) {
    const {currentUser, setCurrentUser} = useContext(CurrentUserContext)
    const {currentUserPermissions, setCurrentUserPermissions} = useContext(CurrentUserPermissionsContext)
    const {isAuthorized, setIsAuthorized} = useContext(IsAuthorizedContext)
    const {triggerValidate} = useAuthorizeByCookie()

    useEffect(() => {
        setCurrentUser(getUserDataFromStorage());
        setIsAuthorized(currentUser?.user_id != null)
        setCurrentUserPermissions(getUserPermissionsFromStorage());

        if (!isAuthorized) {
            triggerValidate()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const {triggerGetPermissions} = useGetCurrentUserPermissions()

    useEffect(() => {
        if (isAuthorized) {
            triggerGetPermissions()
        }
        SaveUserDataIntoStorage(currentUser)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser])

    useEffect(() => {
        SaveUserPermissionsIntoStorage(currentUserPermissions)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserPermissions])

    return children
}

const emptyUser = {
    user_id: null,
    csrf_token: null,
    is_admin: null,
    username: null
}

const emptyUserPermissions = []

export function AuthorizationProvider({children}) {
    const [currentUser, setCurrentUser] = useState(getUserDataFromStorage())
    const [isAuthorized, setIsAuthorized] = useState(currentUser?.user_id != null)
    const [currentUserPermissions, setCurrentUserPermissions] = useState(getUserPermissionsFromStorage())

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

export function IsAdmin() {
    const {currentUserPermissions} = useContext(CurrentUserPermissionsContext)

    return (currentUserPermissions.indexOf("ReservationsAdmin") > -1)
        || (currentUserPermissions.indexOf("UsersAdmin") > -1)
        || (currentUserPermissions.indexOf("RoomsAdmin") > -1)
        || (currentUserPermissions.indexOf("GroupsAdmin") > -1)
        || IS_ADMIN_GUEST
        || IS_ADMIN_DEFAULT;
}

function useGetCurrentUserPermissions() {
    const {currentUser} = useContext(CurrentUserContext)
    const {setCurrentUserPermissions} = useContext(CurrentUserPermissionsContext)

    const {triggerFetch} = useSomeAPI(`/api/v0/users/${currentUser?.user_id}/permissions`, null, "GET", getUserPermissionsCallback)

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
    }

    // useEffect(() => {
    //     setIsAuthorized(false)
    //     setCurrentUser({})
    //     saveUserData({})
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, [finished])


    return {result, statusCode, headers, triggerLogout: triggerFetch, finished}
}

export function getUserDataFromStorage() {
    const dataString = localStorage.getItem('roomkn-user-data');
    try {
        return JSON.parse(dataString)
    } catch (e) {
        return emptyUser
    }
}

export function SaveUserDataIntoStorage(currentUser) {
    console.log(currentUser, JSON.stringify(currentUser))
    localStorage.setItem('roomkn-user-data', JSON.stringify(currentUser));
}

export function getUserPermissionsFromStorage() {
    const dataString = localStorage.getItem('roomkn-user-permissions');
    try {
        return JSON.parse(dataString)
    } catch (e) {
        return emptyUserPermissions
    }
}

export function SaveUserPermissionsIntoStorage(currentUser) {
    console.log(currentUser, JSON.stringify(currentUser))
    localStorage.setItem('roomkn-user-permissions', JSON.stringify(currentUser));
}

export const IsAuthorizedContext = createContext(false)
export const CurrentUserContext = createContext({})
export const CurrentUserPermissionsContext = createContext({})
import {createContext, useState} from "react";


export function AuthorizationProvider({children}) {
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [currentUser, setCurrentUser] = useState(null)

    return (
        <IsAuthorizedContext.Provider value={{isAuthorized, setIsAuthorized}}>
            <CurrentUserContext.Provider value={{currentUser, setCurrentUser}}>
                {children}
            </CurrentUserContext.Provider>
        </IsAuthorizedContext.Provider>
    )
}

export const IsAuthorizedContext = createContext(false)
export const CurrentUserContext = createContext({})
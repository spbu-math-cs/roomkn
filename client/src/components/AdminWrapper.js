import {useContext, useEffect} from "react";
import {CurrentUserContext, IsAdmin} from "./Auth";
import {useNavigate} from "react-router-dom";

export function AdminWrapper({children}) {
    const navigate = useNavigate()

    const {currentUser} = useContext(CurrentUserContext)

    const is_admin = IsAdmin()

    // console.log(is_admin,  currentUserPermissions)


    useEffect(() => {
        if (!is_admin) {
            navigate('/pagenotfound', {replace: true})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    return children
}

export default AdminWrapper
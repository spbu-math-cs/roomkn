import {useContext, useEffect} from "react";
import {CurrentUserContext, CurrentUserPermissionsContext, IS_ADMIN_GUEST, IS_ADMIN_DEFAULT} from "./Auth";
import {useNavigate} from "react-router-dom";

export function AdminWrapper({children}) {
    const navigate = useNavigate()

    const {currentUser} = useContext(CurrentUserContext)

    const {currentUserPermissions} = useContext(CurrentUserPermissionsContext)

    const is_admin = (currentUserPermissions.indexOf("ReservationsAdmin") > -1)
        || (currentUserPermissions.indexOf("UsersAdmin") > -1)
        || (currentUserPermissions.indexOf("RoomsAdmin") > -1)
        || (currentUserPermissions.indexOf("GroupsAdmin") > -1)
        || IS_ADMIN_GUEST
        || IS_ADMIN_DEFAULT

    // console.log(is_admin,  currentUserPermissions)


    useEffect(() => {
        if (!is_admin && !IS_ADMIN_GUEST) {
            navigate('/pagenotfound', {replace: true})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    return children
}

export default AdminWrapper
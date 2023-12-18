import {useContext} from "react";
import {CurrentUserContext, CurrentUserPermissionsContext, IS_ADMIN_GUEST} from "./Auth";
import {useNavigate} from "react-router-dom";

export function AdminWrapper({children}) {
    const navigate = useNavigate()

    const {currentUserPermissions} = useContext(CurrentUserPermissionsContext)

    const is_admin = ("ReservationsAdmin" in currentUserPermissions)
        || ("UsersAdmin" in currentUserPermissions)
        || ("RoomsAdmin" in currentUserPermissions)
        || ("GroupsAdmin" in currentUserPermissions)

    if (!is_admin && !IS_ADMIN_GUEST) {
        navigate('/pagenotfound', {replace: true})
    }

    return children
}

export default AdminWrapper
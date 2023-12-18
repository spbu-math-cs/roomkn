import {useContext, useEffect} from "react";
import {CurrentUserPermissionsContext, IS_ADMIN_GUEST, IS_ADMIN_DEFAULT} from "./Auth";
import {useNavigate} from "react-router-dom";

export function AdminWrapper({children}) {
    const navigate = useNavigate()

    const {currentUserPermissions} = useContext(CurrentUserPermissionsContext)

    const is_admin = ("ReservationsAdmin" in currentUserPermissions)
        || ("UsersAdmin" in currentUserPermissions)
        || ("RoomsAdmin" in currentUserPermissions)
        || ("GroupsAdmin" in currentUserPermissions)
        || IS_ADMIN_GUEST
        || IS_ADMIN_DEFAULT


    useEffect(() => {
        if (!is_admin && !IS_ADMIN_GUEST) {
            navigate('/pagenotfound', {replace: true})
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return children
}

export default AdminWrapper
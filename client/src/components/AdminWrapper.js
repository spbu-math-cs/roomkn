import {useContext} from "react";
import {CurrentUserContext, IS_ADMIN_GUEST} from "./Auth";
import {useNavigate} from "react-router-dom";

export function AdminWrapper({children}) {
    const navigate = useNavigate()

    const {currentUser} = useContext(CurrentUserContext)

    if (!currentUser?.is_admin && !IS_ADMIN_GUEST) {
        navigate('/pagenotfound', {replace: true})
    }

    return children
}

export default AdminWrapper
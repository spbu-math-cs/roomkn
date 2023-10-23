import ContentWrapper from "../../components/Content";
import {NavLink} from "react-router-dom";

export function AdminPanel() {
    return (
        <ContentWrapper page_name="Admin panel">

            <NavLink to="/admin/rooms" className="navlink">
                Room list
            </NavLink>

            <NavLink to="/admin/users" className="navlink">
                User list
            </NavLink>

            <NavLink to="/admin/reservations" className="navlink">
                Reservation list
            </NavLink>

        </ContentWrapper>
    )
}

export default AdminPanel
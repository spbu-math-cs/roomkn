import ContentWrapper from "../../components/Content";
import {NavLink} from "react-router-dom";
import AdminWrapper from "../../components/AdminWrapper";

export function AdminPanel() {
    return (
        <AdminWrapper>
            <ContentWrapper page_name="Admin panel">

                <NavLink to="/admin/rooms">
                    Room list
                </NavLink>

                <br/>

                <NavLink to="/admin/users">
                    User list
                </NavLink>

                <br/>

                <NavLink to="/admin/reservations">
                    Reservation list
                </NavLink>

            </ContentWrapper>
        </AdminWrapper>
    )
}

export default AdminPanel
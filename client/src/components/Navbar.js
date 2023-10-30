import './Navbar.css';
import React, {useContext, useEffect} from "react";


import { NavLink } from "react-router-dom";
import {CurrentUserContext, IsAuthorizedContext, useLogout} from "./Auth";

const NavSignIn = () => {
    const {isAuthorized, setIsAuthorized} = useContext(IsAuthorizedContext)
    const {currentUser} = useContext(CurrentUserContext)

    const {triggerLogout, finished, statusCode} = useLogout()

    const logOut = () => {
        triggerLogout()
        // browser.cookies.remove('_xsrf');
    }

    useEffect(() => {
        if (finished) {
            if (statusCode == 200) {
                alert("Вы успешно вышли из системы")
            } else if (statusCode == 401) {
                alert("Авторизационные куки отсутствуют, просрочены или некорректны. Отчистите куки страницы")
            } else {
                alert("Status code: " + statusCode)
            }
        }
    }, [finished]);

    if (isAuthorized) {
        return (
            <>
                <NavLink to="/profile" className="navlink">
                    {/*{currentUser.toString()}*/}
                    Мой профиль
                </NavLink>
                <div to="/sign-in" onClick={logOut} className="navlink">
                    Выйти
                </div>
            </>
        )
    } else {
        return (
            <>
                <NavLink to="/sign-in" className="navlink">
                    Войти
                </NavLink>
                <NavLink to="/sign-up" className="navlink">
                    Зарегестрироваться
                </NavLink>
            </>
        )
    }
}
 
const Navbar = () => {
    return (
        <>
            <nav className='nav'>
                <div className='nav-logo-wrapper'>
                    <img src="/logo.svg" alt="MKN logo dark" className="nav-logo" />
                </div>

                <div className='nav-link-wrapper'>
                    <div className="navdiv">
                        <NavLink to="/" className="navlink">
                            Список аудиторий
                        </NavLink>
                        <NavLink to="/about" className="navlink">
                            О нас
                        </NavLink>
                        <NavSignIn />
                    </div>
                </div>
                
            </nav>
        </>
    );
};
 
export default Navbar;
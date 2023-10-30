import './Navbar.css';
import React, {useContext, useEffect} from "react";


import { NavLink } from "react-router-dom";
import {IsAuthorizedContext, useLogout} from "./Auth";

const NavSignIn = () => {
    const {isAuthorized} = useContext(IsAuthorizedContext)

    const {triggerLogout, finished, statusCode} = useLogout()

    const logOut = () => {
        triggerLogout()
        // browser.cookies.remove('_xsrf');
    }

    useEffect(() => {
        if (finished) {
            if (statusCode === 200) {
                alert("Вы успешно вышли из системы")
            } else if (statusCode === 401) {
                alert("Авторизационные куки отсутствуют, просрочены или некорректны. Отчистите куки страницы")
            } else {
                alert("Status code: " + statusCode)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

    const user_nickname = "Азат"

    if (isAuthorized) {
        return (
            <>
                <NavLink to="/profile" className="navlink">
                    {user_nickname}
                    <img className="navbar-profile-avatar" src="/azat.png" alt="avatar"/>
                </NavLink>
                <div onClick={logOut} className="navlink">
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
                        <div className="navbar-left">
                            <NavLink to="/" className="navlink">
                                Список аудиторий
                            </NavLink>
                            <NavLink to="/about" className="navlink">
                                О нас
                            </NavLink>
                        </div>
                        <div className="navbar-right">
                            <NavSignIn />
                        </div>
                    </div>
                </div>
                
            </nav>
        </>
    );
};
 
export default Navbar;
import './Navbar.css';
import React, {useContext} from "react";


import { NavLink } from "react-router-dom";
import {CurrentUserContext, IsAuthorizedContext} from "./Auth";

const NavSignIn = () => {
    const {isAuthorized, setIsAuthorized} = useContext(IsAuthorizedContext)
    const {currentUser} = useContext(CurrentUserContext)

    const logOut = () => {
        setIsAuthorized(false)
    }

    if (isAuthorized) {
        return (
            <>
                <NavLink to="/profile" onClick={logOut} className="navlink">
                    {/*{currentUser.toString()}*/}
                    Мой профиль
                </NavLink>
                <NavLink to="/sign-in" onClick={logOut} className="navlink">
                    Выйти
                </NavLink>
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
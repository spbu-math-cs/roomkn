import './Navbar.css';
import React from "react";


import { NavLink } from "react-router-dom";
 
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
                        <NavLink to="/sign-in" className="navlink">
                            Войти
                        </NavLink>
                    </div>
                </div>
                
            </nav>
        </>
    );
};
 
export default Navbar;
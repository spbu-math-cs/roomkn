import './Navbar.css';
import React from "react";


import { NavLink } from "react-router-dom";
 
const Navbar = () => {
    return (
        <>
            <nav className='nav'>
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
            </nav>
        </>
    );
};
 
export default Navbar;
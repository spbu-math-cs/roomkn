import { NavLink } from "react-router-dom";
import React from "react";
import './Footer.css'

export function Footer() {
    return (
        <div className="footer">
            <NavLink to="/admin-panel" className="footer-link">
                Админка
            </NavLink>
        </div>
    )
}
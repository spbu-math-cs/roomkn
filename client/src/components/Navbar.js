import './Navbar.css';
import React, {useContext, useEffect, useState} from "react";


import {NavLink} from "react-router-dom";
import {CurrentUserContext, IsAuthorizedContext, useLogout} from "./Auth";
import {AppBar, Avatar, Box, Button, IconButton, Menu, Toolbar, Tooltip, Typography} from "@mui/material";
import {SnackbarContext} from "./SnackbarAlert";
import {Container} from "@pixi/react";
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';


const NavBarUserMenu = () => {
    const {isAuthorized} = useContext(IsAuthorizedContext)
    const {currentUser} = useContext(CurrentUserContext)

    const [userNickname, setUserNickname] = useState(currentUser?.username)
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const {triggerLogout, finished, statusCode} = useLogout()

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };
    const logOut = () => {
        handleCloseUserMenu()
        triggerLogout()
        // browser.cookies.remove('_xsrf');
    }

    useEffect(() => {
        if (userNickname == null) {
            setUserNickname("Azat")
        }
        setUserNickname(currentUser?.username)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthorized, currentUser?.username])

    const {setNewMessageSnackbar} = useContext(SnackbarContext)

    useEffect(() => {
        if (finished) {
            if (statusCode === 200) {
                setNewMessageSnackbar("You successfully logged out")
            } else if (statusCode === 401) {
                setNewMessageSnackbar("Authorization cookies are not present, expired or incorrect!")
            } else {
                setNewMessageSnackbar("Status code: " + statusCode)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finished]);

    // let userNickname = currentUser?.username
    // if (userNickname == null) {
    //     userNickname = "Azat"
    // }

    if (isAuthorized) {
        console.log("authorized, nickname = " + userNickname)
        return (
            <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open user menu">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <UserAvatar/>
                    </IconButton>
                </Tooltip>
                <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top{page[0]}',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                >
                    <MenuItem>
                        <NavLink to="/profile" className="navlink">
                            Profile
                        </NavLink>
                    </MenuItem>
                    <MenuItem>
                        <NavLink to="/admin/panel" className="navlink">
                            Admin panel
                        </NavLink>
                    </MenuItem>
                    <MenuItem>
                        <NavLink to="/my-reservations" className="navlink">
                            Reservations
                        </NavLink>
                    </MenuItem>
                    <MenuItem>
                        <div onClick={logOut} className="navlink">
                            Logout
                        </div>
                    </MenuItem>
                </Menu>
            </Box>
        )
    } else {
        return (
            <>
                <NavLink to="/sign-in">
                    <Button variant="outlined" color="primary">
                        LOGIN
                    </Button>
                </NavLink>
                {/*<MenuItem></MenuItem>*/}
                {/*<NavLink to="/sign-up" className="navlink">*/}
                {/*    Sign Up*/}
                {/*</NavLink>*/}
            </>
        )
    }
}

const UserAvatar = () => {
    return (
        <Avatar alt="Azat" src="/azat.png" sx={{ width: 56, height: 56 }}  style={{
            border: '0.1px solid lightgray'
        }}/>
        // <img className="navbar-profile-avatar" src="/azat.png" alt="avatar"/>
    )
}

const Logo = () => {
    return (
        <img src="/logo512.png" alt="MKN logo dark" className="nav-logo"/>
    )
}

const NavBarPages = () => {
    return (
        <>
            <MenuItem>
                <NavLink to="/" className="navlink">
                    Classrooms
                </NavLink>
            </MenuItem>
            <MenuItem>
                <NavLink to="/map" className="navlink">
                    Map
                </NavLink>
            </MenuItem>
            <MenuItem>
                <NavLink to="/about" className="navlink">
                    About
                </NavLink>
            </MenuItem>
        </>
    )
}

const Navbar = () => {
    const [anchorElNav, setAnchorElNav] = React.useState(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <AppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters className={"nav"}>
                    <Logo/>
                    {/*<div className='nav-logo-wrapper'>*/}
                    {/*    <img src="/logo512.png" alt="MKN logo dark" className="nav-logo"/>*/}
                    {/*</div>*/}

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>

                        <IconButton
                            size="Large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'left',
                            }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{
                                display: { xs: 'block', md: 'none' },
                            }}
                        >
                            <NavBarPages/>
                        </Menu>
                    </Box>

                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        // href="#app-bar-with-responsive-menu"
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        <NavLink to="/" className="navlink">
                        RooMKN
                        </NavLink>
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <NavBarPages/>
                    </Box>

                    <NavBarUserMenu/>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
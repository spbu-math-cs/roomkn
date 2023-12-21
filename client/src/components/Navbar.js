import './Navbar.css';
import React, {useContext, useEffect, useState} from "react";


import {NavLink} from "react-router-dom";
import {CurrentUserContext, IsAdmin, IsAuthorizedContext, useLogout} from "./Auth";
import {AppBar, Avatar, Box, Button, IconButton, ListItemIcon, Menu, Toolbar, Tooltip, Typography} from "@mui/material";
import {SnackbarContext} from "./SnackbarAlert";
import {Container} from "@pixi/react";
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import {Logout} from "@mui/icons-material";


const NavBarUserMenu = () => {
    const {isAuthorized} = useContext(IsAuthorizedContext)
    const {currentUser} = useContext(CurrentUserContext)

    const is_admin = IsAdmin();

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
                    sx={{ mt: '50px' }}
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
                    <MenuItem disabled>
                    <Typography>
                        {userNickname}
                    </Typography>
                    </MenuItem>
                    <MenuItem>
                        <NavLink to="/profile" className="navlink">
                            Profile
                        </NavLink>
                    </MenuItem>
                    <MenuItem sx={{display: (is_admin ? '' : 'none')}}>
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
                        <NavLink to="/" onClick={logOut} className="navlink">
                            <ListItemIcon>
                                <Logout fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </NavLink>
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
            </>
        )
    }
}

const UserAvatar = () => {
    return (
        <Avatar alt="Azat" src="/azat.png" sx={{ width: 45, height: 45 }}  style={{
            border: '0.1px solid lightgray'
        }}/>
    )
}

const Logo = () => {
    return (
        <NavLink to="/" className="navlink">
            <Avatar alt="LogoDark" src="/logo512.png"  variant="square" sx={{width: 60, height: 60 }}/>
        </NavLink>
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
                <Toolbar className={"nav"}>
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
                            <Logo/>
                            ROOMKN
                        </NavLink>
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        <Logo open={anchorElNav}/>
                        <NavBarPages/>
                    </Box>

                    <NavBarUserMenu/>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
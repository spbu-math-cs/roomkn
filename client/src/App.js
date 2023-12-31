import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Navbar from './components/Navbar';

import ContentWrapper from "./components/Content";

import RoomList from './pages/List';
import Map from './pages/Map';
import Room from './pages/Room';
import About from './pages/About';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import UserReservations from "./pages/UserReservation";

import Profile from './pages/Profile';

import {AuthorizationProvider} from './components/Auth'
import {SnackbarContextProvider} from './components/SnackbarAlert'

import AdminPanel from "./pages/admin/AdminPanel";
import AdminRoomList from "./pages/admin/AdminRoomList";
import AdminUserList from "./pages/admin/AdminUserList";
import AdminMap from "./pages/admin/AdminMap";
import AdminTokenList from './pages/admin/AdminTokens';

import {Box, createTheme, ThemeProvider} from "@mui/material";
import AdminReservations from "./pages/admin/AdminReservations";
import RoomScreenPage from "./pages/RoomScreenPage";
import {Footer} from "./components/Footer";


function PageNotFound() {
    return (
        <ContentWrapper page_name={"404 Page not found"}>
            {/*<h2>404 Page not found</h2>*/}
        </ContentWrapper>
    );
}

function AccessDenied() {
    return (
        <ContentWrapper page_name={"403 Access denied"}>
            {/*<h2></h2>*/}
        </ContentWrapper>
    );
}
const theme = createTheme({
    spacing: 8,
    palette: {
        mode: 'light',
        primary: {
            main: '#0a64a4',
        },
        secondary: {
            main: '#c700ff',
        },
    },
    typography: {
        fontFamily: "gg sans SemiBold"
    }
});


function App() {
    return (
        <SnackbarContextProvider>
            <ThemeProvider theme={theme}>
                <AuthorizationProvider>
                    <Router>
                        <Navbar/>
                        <Box sx={{pb: 7}}>
                        <Routes>
                            <Route exact path='/' element={<RoomList/>}/>
                            <Route path='/map' element={<Map/>}/>
                            <Route path='/about' element={<About/>}/>
                            <Route path='/room/*' element={<Room/>}/>
                            <Route path='/scrn/*' element={<RoomScreenPage/>}/>
                            <Route path='/sign-up' element={<SignUp/>}/>
                            <Route path='/invite/*' element={<SignUp/>}/>
                            <Route path='/sign-in' element={<SignIn/>}/>
                            <Route path='/my-reservations' element={<UserReservations/>} />
                            {/* <Route path='/contact' element={<Contact />} />
                                <Route path='/blogs' element={<Blogs />} />
                                <Route path='/sign-up' element={<SignUp />} /> */}
                            <Route path='profile' element={<Profile/>}/>
                            <Route path="*" element={<PageNotFound/>} status={404}/>
                            <Route path="*" element={<AccessDenied/>} status={403}/>
                            {
                                // Admin routes
                            }
                            <Route path="admin/panel" element={<AdminPanel/>}/>
                            <Route path="admin/rooms" element={<AdminRoomList/>}/>
                            <Route path="admin/users" element={<AdminUserList/>}/>
                            <Route path="admin/reservations" element={<AdminReservations/>}/>
                            <Route path='admin/map' element={<AdminMap/>}/>
                            <Route path='admin/invites' element={<AdminTokenList/>}/>
                        </Routes>
                        </Box>
                        <Footer />
                    </Router>
                </AuthorizationProvider>
            </ThemeProvider>
        </SnackbarContextProvider>
    );
}

export default App;
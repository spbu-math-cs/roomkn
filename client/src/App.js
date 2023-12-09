import React from 'react';
import './App.css';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';

import Navbar from './components/Navbar';

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
import {createTheme, ThemeProvider} from "@mui/material";


function PageNotFound() {
    return (
        <div>
            <h2>404 Page not found</h2>
        </div>
    );
}

function AccessDenied() {
    return (
        <div>
            <h2>403 Access denied</h2>
        </div>
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
});


function App() {
    return (
        <SnackbarContextProvider>
            <ThemeProvider theme={theme}>
                <AuthorizationProvider>
                    <Router>
                        <Navbar/>
                        <Routes>
                            <Route exact path='/' element={<RoomList/>}/>
                            <Route path='/map' element={<Map/>}/>
                            <Route path='/about' element={<About/>}/>
                            <Route path='/room/*' element={<Room/>}/>
                            <Route path='/sign-up' element={<SignUp/>}/>
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
                        </Routes>
                        {/*<Footer />*/}
                    </Router>
                </AuthorizationProvider>
            </ThemeProvider>
        </SnackbarContextProvider>
    );
}

export default App;
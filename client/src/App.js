import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route }
    from 'react-router-dom';

import Navbar from './components/Navbar';
import {Footer} from "./components/Footer";

import List from './pages/List';
import Room from './pages/Room';
import About from './pages/About';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';

import {AuthorizationProvider} from './components/Auth'

import AdminPanel from "./pages/admin/AdminPanel";
import AdminRoomList from "./pages/admin/AdminRoomList";


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

function App() {
    return (
        <AuthorizationProvider>
            <Router>
                <Navbar />
                <Routes>
                    <Route exact path='/' element={<List />} />
                    <Route path='/about' element={<About />} />
                    <Route path='/room/*' element={<Room />} />
                    <Route path='/sign-up' element={<SignUp />} />
                    <Route path='/sign-in' element={<SignIn />} />
                    {/* <Route path='/contact' element={<Contact />} />
                <Route path='/blogs' element={<Blogs />} />
                <Route path='/sign-up' element={<SignUp />} /> */}
                    <Route path="*" element={<PageNotFound />} status={404}/>
                    <Route path="*" element={<AccessDenied />} status={403}/>
                    {
                        // Admin routes
                    }
                    <Route path="admin/panel" element={<AdminPanel />} />
                    <Route path="admin/rooms" element={<AdminRoomList />} />
                </Routes>
                <Footer />
            </Router>
        </AuthorizationProvider>
    );
}
 
export default App;
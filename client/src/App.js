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


function PageNotFound() {
    return (
      <div>
        <h2>404 Page not found</h2>
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
                    <Route path="*" element={<PageNotFound />} status={404}></Route>
                    // Admin routes

                </Routes>
                <Footer />
            </Router>
        </AuthorizationProvider>
    );
}
 
export default App;
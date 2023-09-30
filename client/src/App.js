import React from 'react';
import './App.css';
import Navbar from './Navbar';
import { BrowserRouter as Router, Routes, Route }
    from 'react-router-dom';
import List from './pages/List';
import Room from './pages/Room';
import About from './pages/about';
// import Blogs from './pages/blogs';
// import SignUp from './pages/signup';
// import Contact from './pages/contact';
 
function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route exact path='/' exact element={<List />} />
                <Route path='/about' element={<About />} />
                <Route path='/room/*' element={<Room />} />
                {/* <Route path='/contact' element={<Contact />} />
                <Route path='/blogs' element={<Blogs />} />
                <Route path='/sign-up' element={<SignUp />} /> */}
            </Routes>
        </Router>
    );
}
 
export default App;
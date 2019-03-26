import React from 'react'
import './header.css'
import Navbar from './navbar'

export default props => (
    <header className='main-header'>
        <a href='/#/' className='logo'>
            <span className='logo-mini'><b>My</b>O</span>
            <span className='logo-lg'>
                <i className='fa fa-building-o'></i>
                &nbsp;&nbsp;<b>My</b> Office
            </span>        
        </a>
        <nav className='navbar navbar-static-top'>
            <a href="javascript:;" className='sidebar-toggle' data-toggle="push-menu"></a>
            <Navbar /> 
        </nav>
    </header>
)
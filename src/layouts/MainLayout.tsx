import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../styles/MainLayout.css';

const MainLayout: React.FC = () => {
    return (
        <div className="layout">
            <header className="header">
                <div className="container header-container">
                    <div className="logo">
                        <Link to="/">Todo App</Link>
                    </div>
                </div>
            </header>

            <main className="main">
                <div className="container">
                    <Outlet />
                </div>
            </main>

            <footer className="footer">
                <div className="container">
                    <p>{new Date().getFullYear()} Todo App</p>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;
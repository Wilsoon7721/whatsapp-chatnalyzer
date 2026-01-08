import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>Made By Wilsoon ♥ Source code can be found on <a href="https://github.com/Wilsoon7721/whatsapp-chatnalyzer">GitHub</a> · <a href="https://wilsoon.dev">Profile</a> · <Link to='/'>Home</Link> · <Link to='/about'>About</Link> · <Link to='/about#privacy'>Privacy Notice & FAQs</Link></p>
            </div>
        </footer>
    );
};

export default Footer;
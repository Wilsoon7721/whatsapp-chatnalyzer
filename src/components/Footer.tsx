import React from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
    const basePath = process.env.NODE_ENV === 'production' ? '/whatsapp-chatnalyzer/#' : '';
    return (
        <footer className="footer">
            <div className="footer-content">
                <p>Made By Wilsoon ♥ Source code can be found on <a href="https://github.com/Wilsoon7721/whatsapp-chatnalyzer">GitHub</a> · <a href="https://github.com/Wilsoon7721">Profile</a> · <a href={`${basePath}/`}>Home</a> · <a href={`${basePath}/about`}>About</a> · <a href={`${basePath}/about#privacy`}>Privacy Notice & FAQs</a></p>
            </div>
        </footer>
    );
};

export default Footer;
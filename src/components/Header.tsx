import React from 'react';

const Header: React.FC = () => {
    return (
        <div style={{ marginTop: '2rem' }}>
            <h4 style={{ textAlign: 'center' }}>WhatsApp Chat Log Analysis</h4>
            <p style={{ fontSize: 14, color: 'gray', textAlign: 'center' }}>All files are processed locally. No data is uploaded to any remote servers.</p>
        </div>
    )
}

export default Header;
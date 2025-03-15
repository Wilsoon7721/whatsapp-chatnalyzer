import React, { useState, useEffect } from 'react';
import '../styles/About.css';
import { ThreeDotsVertical } from 'react-bootstrap-icons';
import FAQuestion from '../components/FAQuestion';

const About: React.FC = () => {
    const [privacyNoticeView, setPrivacyNoticeView] = useState(window.location.hash === '#privacy');

    useEffect(() => {
        const handleHashChange = () => {
            setPrivacyNoticeView(window.location.hash === '#privacy');
        }

        if (privacyNoticeView) {
            let privacyEl = document.getElementById('privacy');
            if (privacyEl)
                privacyEl.scrollIntoView({ behavior: 'smooth' });
        }

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    return (
        <div className="d-flex flex-column" style={{ height: "100vh", padding: "3rem 15rem", fontSize: '16px' }}>
            <p>This program aims to help users extract various statistics based on their WhatsApp chats and present them in an easy to read and navigate format. I made it personally for me to view fun insights about my WhatsApp chats, but decided that it could be quite useful to release this to the public too.</p>
            <p>If you have any additional features or statistics you wish to be added, do feel free to reach me by opening an issue on <a href="https://github.com/Wilsoon7721/whatsapp-chatnalyzer/issues">the project's Github page</a>.</p>
            <div className='d-flex flex-column align-items-center' style={{ padding: '2rem 0' }}>
                <h5 style={{ textAlign: 'center' }} className='mb-4' id='quickstart'>How do I start using your program?</h5>
                <p>
                    Export your WhatsApp chats by going to the chat you want to analyze and pressing the <ThreeDotsVertical size="18px" /> button on the top right. Afterwards, select <b>Export chat</b> and then <b>Without media</b>. Provide the text file to the program by clicking <b>Upload file</b> .
                    <br /><br />
                    You may also choose to provide the ZIP file if you selected <b>With media</b>, but the program will only process the chat file and ignore everything else.
                </p>
            </div>
            <div className='d-flex flex-column align-items-center' style={{ padding: '2rem 0' }} id='faq-container'>
                <h5 style={{ textAlign: 'center' }} id='quickstart'>Frequently Asked Questions</h5>
                <FAQuestion question='What can I upload for the program to analyze?' answer={<>You can upload a <b>text file</b> of your WhatsApp chat or a <b>ZIP file</b> containing one or more chats. <br />Do take note that the program is <b>unable</b> to process multiple files at once. However, you will be prompted to choose a file to analyze if your ZIP file contains more than 1 text file.</>} />
                <FAQuestion question='What are the limits of the program?' answer={<>The maximum file size is <b>200MB</b> for both text and ZIP files. If you are uploading a ZIP file, the ZIP file <b>cannot contain more than 20 text files</b> throughout the entire archive.</>} />
                <FAQuestion customId='privacy' initializeOpen={privacyNoticeView} question={'What happens to my data when it is uploaded?'} answer={<>All the chat processing takes place <b>in your browser</b> and is not sent to any server.</>} />
                <FAQuestion question='What are the currently supported statistics that are shown?' answer={
                    <>
                        For each chat, the program will allow you to cycle through the participants and view individual or combined statistics.
                        <br /><br />
                        Individual statistics include:
                        <ul>
                            <li>Total characters, messages, words, and emojis sent</li>
                            <li>Total percentage of messages contributed</li>
                            <li>Most used emojis</li>
                            <li>Word usage frequency for that individual</li>
                        </ul>

                        Combined statistics include:
                        <ul>
                            <li>Total characters, messages, words, and emojis exchanged</li>
                            <li>First and last message exchanged</li>
                            <li>Number of days participants chatted</li>
                            <li>Line graph showing total messages exchanged by day, month, and year</li>
                            <li>Word usage frequency between all participants</li>
                        </ul>
                    </>
                } />
                <FAQuestion question='How long does the analysis take?' answer={<>The analysis is done <b>instantly</b> in your browser after you upload the file. The time taken to process the chat is dependent on the size of the chat file and the number of participants in the chat.</>} />
                <FAQuestion question='I found a bug with your code. Where can I report it?' answer={<>You can report any bugs or issues by opening an issue on <a href="https://github.com/Wilsoon7721/whatsapp-chatnalyzer/issues">Github</a>. If you can, do provide a way I could reproduce the issue from my end.</>} />
            </div>
        </div>
    );
}

export default About;

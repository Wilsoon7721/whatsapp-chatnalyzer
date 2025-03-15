import React from 'react';
import { useState, useEffect } from 'react';
import { CaretDownFill, CaretUpFill } from 'react-bootstrap-icons';

interface QuestionProps {
    question: React.ReactNode;
    answer: React.ReactNode;
    initializeOpen?: boolean;
    customId?: string;
}

const FAQuestion: React.FC<QuestionProps> = ({ question, answer, initializeOpen = false, customId }) => {
    const [open, setOpen] = useState(initializeOpen);

    useEffect(() => {
        setOpen(initializeOpen);
    }, [initializeOpen]);

    return (
        <div className={`faq-question ${open ? 'open' : ''}`} id={customId || undefined}>
            <div className="d-flex flex-row justify-content-between align-items-center" onClick={() => setOpen(!open)}>
                <p className="faq-question-text mx-2 my-3">{question}</p>
                {open ? <CaretUpFill color='#36454f' size='16px' className='me-3' /> : <CaretDownFill color='#36454f' size='16px' className='me-3' />}
            </div>
            <div className={`faq-answer ${open ? 'show' : ''}`}>
                <div className='mx-2 mb-2'>{answer}</div>
            </div>
        </div>
    );
};

export default FAQuestion;
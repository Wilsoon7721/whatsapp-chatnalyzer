import { useEffect, useRef, useState } from 'react';
import Statistics from './Statistics';
import { Upload, ExclamationTriangleFill, InfoCircleFill } from 'react-bootstrap-icons';
import '../styles/Home.css';
import emojiRegex from 'emoji-regex';
import StatisticsData from '../types/StatisticsData';
import JSZip from 'jszip';

const Home = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [processingMessage, setProcessingMessage] = useState("Please wait while your file is being processed.");
    const [processComplete, setProcessComplete] = useState(false);
    const [zipFileContents, setZipFileContents] = useState<string[]>([]);
    const [statistics, setStatistics] = useState<StatisticsData>({
        participants: [],
        totalMessages: 0,
        totalCharacters: 0,
        totalWords: 0,
        totalEmojis: 0,
        totalChatDays: 0,
        totalDaysBetweenFirstAndLast: 0,
        charactersByParticipant: {},
        messagesByParticipant: {},
        emojiByParticipantBreakdown: {},
        wordByParticipantBreakdown: {},
        firstMessageAnalysed: { participant: '', date: '' },
        lastMessageAnalysed: { participant: '', date: '' },
        messageCountByDay: {},
        messageCountByMonth: {},
        messageCountByYear: {}
    });

    let groupLikely = useRef<boolean>(false);
    const systemMessages = ["Only messages that mention @Meta AI are sent to Meta. Meta can't read any other messages in this chat. Some responses may be inaccurate or inappropriate. *Tap to learn more*.", "blocked this contact", "unblocked this contact", "pinned a message", "unpinned a message", " changed to ", " added ", " removed ", " changed their phone number to a new number. Tap to message or add the new number."];
    const groupSystemMessages = ["created group", "changed this group's icon", "changed this group's settings", "changed this group's icon", "changed the subject from", "changed the group description", "added you", "removed you", "You joined using this group's invite link", "joined using this group's invite link", "is now an admin", "is no longer an admin", "You removed", "You added", "left the group"];
    const businessSystemMessages = ["You have opted out of receiving messages from", "You have opted in to receive messages from", "This business uses a secure service from Meta to manage this chat.", "This business works with other companies to manage this chat."];

    const emptyStatistics = {
        participants: [],
        totalMessages: 0,
        totalCharacters: 0,
        totalWords: 0,
        totalEmojis: 0,
        totalChatDays: 0,
        totalDaysBetweenFirstAndLast: 0,
        charactersByParticipant: {},
        messagesByParticipant: {},
        emojiByParticipantBreakdown: {},
        wordByParticipantBreakdown: {},
        firstMessageAnalysed: { participant: '', date: '' },
        lastMessageAnalysed: { participant: '', date: '' },
        messageCountByDay: {},
        messageCountByMonth: {},
        messageCountByYear: {}
    };

    const parseDateString = (dateStr: string) => {
        const parts = dateStr.split(/[\/\-\.]/);
        if (parts.length !== 3) {
            return null;
        }

        function isValidDate(dateObj: Date, day: number, month: number, year: number) {
            return (
                dateObj instanceof Date &&
                !isNaN(dateObj.getTime()) &&
                dateObj.getFullYear() === year &&
                dateObj.getMonth() === month - 1 &&
                dateObj.getDate() === day
            );
        }

        let day = parseInt(parts[0]);
        let month = parseInt(parts[1]);
        let year = parseInt(parts[2]);

        let dateObj = new Date(year, month - 1, day);
        if (isValidDate(dateObj, day, month, year)) {
            return dateObj;
        }

        month = parseInt(parts[0]);
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);

        dateObj = new Date(year, month - 1, day);
        if (isValidDate(dateObj, day, month, year)) {
            return dateObj;
        }

        return null;
    }

    useEffect(() => {
        if (!selectedFile)
            return;

        setStatistics(emptyStatistics);
        setTimeout(() => processFile(selectedFile), 5);
    }, [selectedFile]);

    useEffect(() => {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (!fileInput)
            return;

        return () => {
            fileInput.onchange = () => { };
        };
    }, []);

    const handleFileChange = () => {
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        const file = fileInput.files![0];
        if (!file) {
            setErrorMessage('Please select a file to process.');
            return;
        }
        let fileExtension = file.name.split('.').pop()?.toLowerCase();
        if (file.type !== 'text/plain' && fileExtension !== 'zip') {
            setErrorMessage('Invalid file type. Please upload a ZIP or text file.');
            return;
        }
        setSelectedFile(file);
        setErrorMessage(null);
    };

    function splitByFirstDelimiter(text: string, delimiter: string) {
        return [text.slice(0, text.indexOf(delimiter)), text.slice(text.indexOf(delimiter) + 1)];
    }

    let dateTimeRegex = /^\d{2}\/\d{2}\/\d{4}, \s*\d{1,2}:\d{2}\s*[ap]m/;
    let lastZipFile = useRef<JSZip | null>(null);

    const fileSelectionFromZip = async (zipFile: JSZip, fileIndex: number) => {
        let file = zipFile.files[zipFileContents[fileIndex]];
        setZipFileContents([]);
        setProcessingMessage("Please wait while your file is being processed.");
        const fileContent = await file.async("blob");
        const textFile = new File([fileContent], file.name, { type: "text/plain" });
        processFile(textFile);
        setSelectedFile(textFile);
    };

    const processFile = async (file: File) => {
        let fileExtension = file.name.split('.').pop()?.toLowerCase();

        // Maximum 200MB file size
        if (file.size / (1024 * 1024) > 200) {
            setErrorMessage('The file size is too large. Please upload a file less than 200MB.');
            return;
        }

        if (fileExtension === 'zip') {
            setProcessingMessage("Unpacking ZIP...");
            let zip = new JSZip();
            let zipFile = await zip.loadAsync(file);
            let fileNames = Object.keys(zipFile.files);
            let textFiles = fileNames.filter(fileName => fileName.endsWith('.txt'));
            if (textFiles.length === 0) {
                setErrorMessage('You uploaded a ZIP file, but it does not contain any text files.');
                return;
            }
            if (textFiles.length === 1) {
                let fileContent = await zipFile.files[textFiles[0]].async("blob");
                let textFile = new File([fileContent], textFiles[0], { type: "text/plain" });
                processFile(textFile);
                setProcessingMessage(`Processing ${textFiles[0]}...`);
                setSelectedFile(textFile);
                return;
            }
            if (textFiles.length > 20) {
                setErrorMessage('Please upload a ZIP file with less than 20 text files.');
                return;
            }
            setZipFileContents(textFiles);
            lastZipFile.current = zipFile;
            setProcessingMessage("Waiting for you to select a file...");
            return;
        }

        let emojiMap: Record<string, Record<string, number>> = {};
        let wordMap: Record<string, Record<string, number>> = {};
        let characterCount: Record<string, number> = {};
        let messageCount: Record<string, number> = {};
        let totalCharacters: number = 0, totalWords: number = 0, totalMessages: number = 0, totalEmojis: number = 0;
        const accumulateEmojis = (participant: string, message: string) => {
            let emojis = message.match(emojiRegex());
            if (!emojis)
                return;
            emojis.forEach(emoji => {
                totalEmojis++;
                if (!emojiMap[participant])
                    emojiMap[participant] = {};

                if (emoji in emojiMap)
                    emojiMap[participant][emoji] += 1;
                else
                    emojiMap[participant][emoji] = 1;
            });
        }

        const accumulateWords = (participant: string, message: string) => {
            let wordRegex = /\b[\w'-]+\b/g;

            let words = message.match(wordRegex) || [];
            let emojis = message.match(emojiRegex()) || [];

            messageCount[participant] = (messageCount[participant] || 0) + 1;
            characterCount[participant] = (characterCount[participant] || 0) + message.length;

            totalCharacters += message.length;
            totalMessages += 1;

            words.forEach(word => {
                let cleanedWord = word.trim().toLowerCase();
                if (cleanedWord === '') return;

                if (groupLikely.current && cleanedWord.startsWith('@')) return;
                if (cleanedWord.startsWith('http') || cleanedWord.startsWith('www') || cleanedWord.startsWith('https')) return;

                totalWords++;
                if (!wordMap[participant]) wordMap[participant] = {};

                if (Object.prototype.hasOwnProperty.call(wordMap[participant], cleanedWord)) wordMap[participant][cleanedWord] += 1;
                else wordMap[participant][cleanedWord] = 1;
            });

            emojis.forEach(emoji => {
                totalEmojis++;
                if (!emojiMap[participant]) emojiMap[participant] = {};

                if (emoji in emojiMap[participant]) emojiMap[participant][emoji] += 1;
                else emojiMap[participant][emoji] = 1;
            });
        };

        const validateMap = (map: Record<string, Record<string, number>>) => {
            for (let participant in map) {
                for (let key in map[participant]) {
                    if (typeof map[participant][key] !== 'number') {
                        console.warn(`Removing entry for participant ${participant} and key ${key}. Actual value found: ${map[participant][key]}`);
                        delete map[participant][key];
                    }
                }
            }
        };


        try {


            const fullText = await file.text();
            const lines = fullText.split('\n');


            if (lines[0].includes('Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Tap to learn more.'))
                lines.shift();

            if (lines[0].endsWith("is a contact"))
                lines.shift();

            let processedLines = [];
            let currentLine = '';

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                if (dateTimeRegex.test(line)) {
                    if (currentLine)
                        processedLines.push(currentLine.trim());

                    let splitText = line.split(':');
                    if (splitText.length < 3) {
                        if (systemMessages.some(msg => line.includes(msg)) || businessSystemMessages.some(msg => line.includes(msg)))
                            continue;

                        if (groupSystemMessages.some(msg => line.includes(msg))) {
                            groupLikely.current = true;
                            continue;
                        }

                        console.warn("Could not split at delimiter ':', assuming an unknown WhatsApp system message. \nYou can report this to the developer (@Wilsoon7721 on GitHub) with the following message: ", line);
                        continue;
                    }
                    let messageContent = splitText[2].trim();
                    if (messageContent === '<Media omitted>' || messageContent === 'This message was deleted')
                        continue;

                    if (messageContent.trim().endsWith('<This message was edited>'))
                        messageContent = messageContent.replace('<This message was edited>', '').trim();

                    let participant = splitByFirstDelimiter(splitByFirstDelimiter(line, '-')[1], ':')[0].trim();
                    if (participant === 'Meta AI')
                        continue;

                    currentLine = line;
                } else
                    currentLine += ` ${line}`;
            }

            if (currentLine)
                processedLines.push(currentLine.trim());

            // Get the participants
            let participants = new Set<string>();

            let messageCountByDate: Record<string, number> = {};
            let messageCountByMonth: Record<string, number> = {};
            let messageCountByYear: Record<string, number> = {};
            let uniqueMessageDates = new Set<number>();
            // Remember to continue with `processedLines` and not `lines`. `processedLines` contains the combined lines.
            for (let i = 0; i < processedLines.length; i++) {
                const line = processedLines[i];
                let participant = splitByFirstDelimiter(splitByFirstDelimiter(line, '-')[1], ':')[0].trim();
                participants.add(participant);
                let messageDate = splitByFirstDelimiter(splitByFirstDelimiter(line, ' - ')[0].trim(), ",")[0].trim();
                let dateObj = parseDateString(messageDate);
                messageCountByDate[messageDate] = (messageCountByDate[messageDate] || 0) + 1;
                if (dateObj)
                    uniqueMessageDates.add(dateObj.getTime());
                if (dateObj) {
                    const monthYear = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                    const year = dateObj.getFullYear().toString();
                    messageCountByMonth[monthYear] = (messageCountByMonth[monthYear] || 0) + 1;
                    messageCountByYear[year] = (messageCountByYear[year] || 0) + 1;
                }
                let message = line.split(':')[2].trim();
                accumulateEmojis(participant, message);
                accumulateWords(participant, message);
            }

            let firstMessageAnalysis = {
                participant: splitByFirstDelimiter(splitByFirstDelimiter(processedLines[0], '-')[1], ':')[0].trim(),
                date: splitByFirstDelimiter(processedLines[0], ' - ')[0].trim()
            }

            let lastMessageAnalysis = {
                participant: splitByFirstDelimiter(splitByFirstDelimiter(processedLines[processedLines.length - 1], '-')[1], ':')[0].trim(),
                date: splitByFirstDelimiter(processedLines[processedLines.length - 1], ' - ')[0].trim()
            }

            let firstMessageDate = parseDateString(firstMessageAnalysis.date);
            let lastMessageDate = parseDateString(lastMessageAnalysis.date);
            let totalDaysBetweenFirstAndLast = firstMessageDate && lastMessageDate ? Math.round(Math.abs((lastMessageDate.getTime() - firstMessageDate.getTime()) / (24 * 60 * 60 * 1000))) : 0;

            let finalParticipants = Array.from(participants);
            finalParticipants.push('All Participants');

            validateMap(wordMap);
            validateMap(emojiMap);

            let stats = {
                participants: finalParticipants,
                totalMessages,
                totalCharacters,
                totalWords,
                totalEmojis,
                totalDaysBetweenFirstAndLast,
                totalChatDays: uniqueMessageDates.size,
                charactersByParticipant: characterCount,
                messagesByParticipant: messageCount,
                emojiByParticipantBreakdown: emojiMap,
                wordByParticipantBreakdown: wordMap,
                firstMessageAnalysed: firstMessageAnalysis,
                lastMessageAnalysed: lastMessageAnalysis,
                messageCountByDay: messageCountByDate,
                messageCountByMonth: messageCountByMonth,
                messageCountByYear: messageCountByYear
            };
            setStatistics(stats);
            setProcessComplete(true);

        } catch (err) {
            setErrorMessage(`Are you sure this is a WhatsApp chat log?`);
            console.error(err);
            setProcessComplete(false);
            setSelectedFile(null);
            setStatistics(emptyStatistics);
            let fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput)
                fileInput.value = '';
            return;
        }
    }

    return (
        <div className="container container-fluid d-flex justify-content-center align-items-center flex-column mt-2">
            {(!selectedFile || (selectedFile && errorMessage)) && (
                <div className='d-flex align-items-center flex-column'>
                    <label htmlFor="file-upload" className="upload-btn mt-4"><Upload style={{ marginRight: '10px' }} />Upload File</label>
                    <input type="file" id="file-upload" accept='text/plain, application/zip' onChange={handleFileChange} />
                    {errorMessage && (
                        <>
                            <div style={{ height: '40px' }}></div>
                            <div className='alert alert-danger mt-3' style={{ width: '100%', height: 'auto' }} >
                                <div className='d-flex flex-row align-items-center mb-2'>
                                    <ExclamationTriangleFill style={{ marginRight: '10px' }} />
                                    <strong>Error</strong>
                                </div>
                                <p style={{ marginBottom: 0 }}>{errorMessage}</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {(!selectedFile && !errorMessage) && (
                <>
                    <div style={{ height: '40px' }}></div>
                    <div className='alert alert-primary mt-3' style={{ width: '40%', height: 'auto' }} >
                        <div className='d-flex flex-row align-items-center mb-2'>
                            <InfoCircleFill size='18px' style={{ marginRight: '10px' }} />
                            <strong>Not sure where to start?</strong>
                        </div>
                        <p style={{ marginBottom: 0 }}>Take a look at the <a href='/about#quickstart'>quickstart</a>.</p>
                    </div>
                </>
            )}

            {selectedFile && !errorMessage && zipFileContents.length > 0 && (
                <>
                    <div className="list-group mt-4 mb-2" style={{ width: '40%' }}>
                        <h6 className='mb-2 ms-1'>Select a file from the ZIP...</h6>
                        {zipFileContents.map((fileName, index) => (
                            <button key={index} onClick={() => fileSelectionFromZip(lastZipFile.current!, index)} className="list-group-item list-group-item-action list-group-item">
                                {fileName}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {selectedFile && !errorMessage && !processComplete && (
                <div className='d-flex align-items-center flex-column mt-5'>
                    <div className='spinner-border text-secondary' style={{ width: '2.5rem', height: '2.5rem' }} role="status"></div>
                    <p style={{ fontSize: 14, color: 'gray', marginTop: '15px' }}>{processingMessage}</p>
                </div>
            )}

            {selectedFile && !errorMessage && processComplete && statistics && (
                <>
                    <div className="d-flex align-items-center justify-content-center flex-column mt-3">
                        <h5>File: {selectedFile?.name}</h5>
                        <p style={{ fontSize: 16, textAlign: 'center' }}>Want to analyse another file? Click <a href="/">here</a> to return to the homepage!</p>
                    </div>
                    <Statistics stats={statistics} groupLikely={groupLikely.current} />
                </>
            )}
        </div>
    )
}

export default Home;
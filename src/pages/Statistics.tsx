import { Tooltip } from 'bootstrap';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { Search } from 'react-bootstrap-icons';
import { Line } from 'react-chartjs-2';
import Select from 'react-select';
import NumberIncrementer from '../components/NumberIncrementer';
import '../styles/Statistics.css';
import StatisticsData from '../types/StatisticsData';


import { CategoryScale, Chart as ChartJS, Tooltip as ChartTooltip, Legend, LinearScale, LineElement, PointElement, Title } from 'chart.js';
import chartZoom from 'chartjs-plugin-zoom';

ChartJS.register(LinearScale, CategoryScale, PointElement, LineElement, Title, ChartTooltip, Legend, chartZoom);

const Statistics: React.FC<{ stats: StatisticsData, groupLikely: boolean }> = ({ stats, groupLikely }) => {
    const [statistics] = useState(stats);
    const [participantFilter, setParticipantFilter] = useState(statistics.participants[statistics.participants.length - 1]);
    const [displayedStatistics, setDisplayedStats] = useState<any>(null);
    const [grammar, setGrammar] = useState('Exchanged');
    const [renderedWords, setRenderedWords] = useState<Record<string, number> | null>(null);
    const [spinnerHidden, setSpinnerHidden] = useState(true);
    const [searchFiltered, setSearchFiltered] = useState(false);
    const [wordFrequencyPageNumber, setWordFrequencyPageNumber] = useState(1);
    const [wordFrequencyPagesDisplay, setWordFrequencyPagesDisplay] = useState([1, 10]);
    const [dynamicCols, setDynamicCols] = useState(5);
    const [wordFrequencyMaxWordsPerPage, setWordFrequencyMaxWordsPerPage] = useState(30);
    const [highestSpeaker, setHighestSpeaker] = useState({ name: '', count: 0 });
    const [messagesByDateLineData, setMessagesByDateLineData] = useState<any>({
        labels: [],
        datasets: [
            {
                label: 'Messages',
                data: [],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
            }
        ]

    });

    let messagesByDateLineChartRef = useRef<any>(null);


    let useWords = useRef<Record<string, number>>({});

    let wordFrequencyTotalPages = useRef<number>(0);
    let fullRenderedWords = useRef<Record<string, number>>({});

    let defaultChartOptions = useRef<any>({
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true
            },
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy'
                },
                limits: {
                    y: {
                        min: -300,
                        max: 100000
                    }
                },
                zoom: {
                    wheel: {
                        enabled: true,
                        mode: 'xy',
                        speed: 0.1,
                        threshold: 2
                    },
                    pinch: {
                        enabled: true,
                        mode: 'xy',
                        speed: 0.1,
                        threshold: 2
                    },
                    drag: {
                        enabled: false,
                        mode: 'xy',
                        speed: 0.1,
                        threshold: 2
                    },
                    limits: {
                        y: {
                            min: -300,
                            max: 100000
                        }
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true
            },
        },
    });

    useEffect(() => {
        const updateLayout = () => {
            let dynamicColLayout = document.getElementById('dynamic-col-layout');
            if (!dynamicColLayout) {
                setTimeout(updateLayout, 100);
                return;
            }
            let colChildrenCount = dynamicColLayout.getElementsByClassName('col').length;
            dynamicColLayout.classList.add(`row-cols-md-${colChildrenCount < 5 ? colChildrenCount : 5}`);
        }

        updateLayout();
    }, [displayedStatistics]);

    useEffect(() => {
        setGrammar((participantFilter === 'All Participants' ? 'Exchanged' : `Sent`));
        if (participantFilter === 'All Participants') {
            let highest = Object.entries(statistics.messagesByParticipant).reduce((a, b) => b[1] > a[1] ? b : a)[0]
            setHighestSpeaker({ name: highest, count: statistics.messagesByParticipant[highest] });
            let displayedStats = {
                totalCharacters: statistics.totalCharacters,
                totalWords: statistics.totalWords,
                totalEmojis: statistics.totalEmojis,
                totalMessages: statistics.totalMessages,
                firstMessageAnalysed: statistics.firstMessageAnalysed,
                lastMessageAnalysed: statistics.lastMessageAnalysed,
                totalWordMap: sumBreakdown(statistics.wordByParticipantBreakdown),
                totalEmojiMap: sumBreakdown(statistics.emojiByParticipantBreakdown),
                messageCountByDay: statistics.messageCountByDay,
                messageCountByMonth: statistics.messageCountByMonth,
                messageCountByYear: statistics.messageCountByYear
            }
            setDisplayedStats(displayedStats);
            let rendered = { ...displayedStats.totalWordMap, ...displayedStats.totalEmojiMap };
            setRenderedWords(Object.fromEntries(Object.entries(rendered).sort(([, a], [, b]) => b - a)));
            fullRenderedWords.current = rendered;
            useWords.current = fullRenderedWords.current;
            setMessagesByDateLineData({
                labels: Object.keys(displayedStats.messageCountByDay),
                datasets: [
                    {
                        label: 'Messages',
                        data: Object.values(displayedStats.messageCountByDay),
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                    }
                ]
            });
            return;
        }
        // Use participantFilter to filter keys
        let displayedStats = {
            totalCharacters: statistics.charactersByParticipant[participantFilter] || 0,
            totalWords: sumTotalByUser(statistics.wordByParticipantBreakdown, participantFilter) || 0,
            totalEmojis: sumTotalByUser(statistics.emojiByParticipantBreakdown, participantFilter) || 0,
            totalMessages: statistics.messagesByParticipant[participantFilter] || 0,
            wordByParticipantBreakdown: statistics.wordByParticipantBreakdown[participantFilter] || 0,
            emojiByParticipantBreakdown: statistics.emojiByParticipantBreakdown[participantFilter] || 0
        }
        setDisplayedStats(displayedStats);
        let rendered = { ...displayedStats.wordByParticipantBreakdown, ...displayedStats.emojiByParticipantBreakdown };
        setRenderedWords(Object.fromEntries(Object.entries(rendered).sort(([, a], [, b]) => b - a)));
        fullRenderedWords.current = rendered;
        useWords.current = fullRenderedWords.current;
    }, [participantFilter, statistics]);

    useEffect(() => {
        let tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        [...tooltipTriggerList].forEach(el => new Tooltip(el));
    }, [renderedWords]);

    const sumBreakdown = (breakdown: any) => {
        let final: Record<string, number> = {};

        for (let user in breakdown) {
            let data = breakdown[user];
            for (let key in data) {
                if (final[key])
                    final[key] += data[key];
                else
                    final[key] = data[key];
            }
        }

        return final;
    }

    const sumTotalByUser = (breakdown: any, participant: string) => {
        let total = 0;
        for (let key in breakdown[participant]) {
            total += breakdown[participant][key];
        }
        return total
    }

    const getDateSince = (dateString: string) => {
        const date = moment(dateString, "DD/MM/YYYY, h:mm a");

        if (!date.isValid()) return '';

        const now = moment();
        const diff = now.diff(date, 'minutes');

        if (now.isSame(date, 'day')) {
            return 'Today';
        } else if (now.subtract(1, 'day').isSame(date, 'day')) {
            return 'Yesterday';
        }

        const years = Math.floor(diff / (60 * 24 * 365));
        const months = Math.floor((diff % (60 * 24 * 365)) / (60 * 24 * 30));
        const days = Math.floor((diff % (60 * 24 * 30)) / (60 * 24));

        let result = '';
        if (years > 0) result += `${years} year${years > 1 ? 's' : ''}, `;
        if (months > 0) result += `${months} month${months > 1 ? 's' : ''}, `;
        if (days > 0) result += `${days} day${days > 1 ? 's' : ''} `;
        if (result.endsWith(', '))
            result = result.slice(0, -2);
        result += " ago";
        return result.trim();
    };

    const getIncrementSpeed = (num: number) => {
        let incrementSpeed = num / (100 / 16.67);
        return incrementSpeed;
    };

    const participantStyles = {
        control: (provided: any) => ({
            ...provided,
            width: '300px',
            minHeight: '36px',
            padding: '0 2px'
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#E0E0E0' : null,
            color: '#000',
            padding: '10px 15px',
        }),
    };

    const maxWordsPerPageStyles = {
        control: (provided: any) => ({
            ...provided,
            width: '200px',
            minHeight: '36px',
            padding: '0 2px'
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#E0E0E0' : null,
            color: '#000',
            padding: '10px 15px',
        }),
    };

    const messagesByDateStyles = {
        control: (provided: any) => ({
            ...provided,
            width: '150px',
            minHeight: '36px',
            padding: '0 2px'
        }),
        menu: (provided: any) => ({
            ...provided,
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }),
        option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isFocused ? '#E0E0E0' : null,
            color: '#000',
            padding: '10px 15px',
        }),
    };

    let throttleRef = useRef<NodeJS.Timeout | null>(null);
    const handleWordSearch = (e: any) => {
        if (throttleRef.current)
            clearTimeout(throttleRef.current);
        setSpinnerHidden(false);
        throttleRef.current = setTimeout(() => {
            let value = e.target.value.toLowerCase();
            if (value === '') {
                useWords.current = fullRenderedWords.current;
                setRenderedWords(Object.fromEntries(Object.entries(fullRenderedWords.current).sort(([, a], [, b]) => b - a)));
                setWordFrequencyPageNumber(1);
                setSearchFiltered(false);
            } else {
                useWords.current = Object.fromEntries(
                    Object.entries(fullRenderedWords.current).filter(([key]) => key.toLowerCase().includes(value)).sort(([, a], [, b]) => b - a)
                );
                setRenderedWords(() => {
                    return Object.fromEntries(
                        Object.entries(fullRenderedWords.current)
                            .filter(([key]) => key.toLowerCase().includes(value))
                            .sort(([, a], [, b]) => b - a)
                    );
                });
                setWordFrequencyPageNumber(1);
                setSearchFiltered(true);
            }
            setSpinnerHidden(true);
        }, 750);
    };

    const getWordFrequencyPageLimits = (pageNumber: number) => {
        if (!fullRenderedWords.current)
            return [0, 0];
        if (wordFrequencyMaxWordsPerPage === -1)
            return [0, 1000000];
        if (useWords.current === null) return [0, 0];
        let total = Object.keys(useWords.current).length;
        wordFrequencyTotalPages.current = Math.ceil(total / wordFrequencyMaxWordsPerPage);
        let start = (pageNumber - 1) * wordFrequencyMaxWordsPerPage;
        let end = Math.min(start + wordFrequencyMaxWordsPerPage, total);
        return [start, end];
    };

    const handleWordFrequencyPageChange = (newPageNo: number) => {
        setWordFrequencyPageNumber(newPageNo);
        let [start, end] = getWordFrequencyPageLimits(newPageNo);
        let diff = end - start;
        setDynamicCols(diff < 5 ? diff : 5);

        setRenderedWords(Object.fromEntries(Object.entries(useWords.current).sort(([, a], [, b]) => b - a).slice(start, end)));
        let pageStart = Math.floor(((newPageNo - (newPageNo % 10)) / 10) * 10 + 1);
        let pageEnd = Math.min(pageStart + 9, wordFrequencyTotalPages.current);
        if (newPageNo % 10 == 0) {
            pageStart -= 1;
            pageEnd -= 1;
        }
        if (pageStart > wordFrequencyTotalPages.current) pageStart = wordFrequencyTotalPages.current - 9;
        setWordFrequencyPagesDisplay([pageStart, pageEnd]);
    };

    let jumpPageCountdownNumberRef = useRef<number | null>(null);
    let existingJumpPageRef = useRef<NodeJS.Timeout | null>(null);
    const wordFrequencyJumpPageHandleInput = (e: any) => {
        let newValue = e.target.value;
        let countdownEl = document.getElementById('word-frequency-jump-page-countdown')!;

        let jumpTo = document.getElementById('word-frequency-jump-to')! as HTMLInputElement;

        if (jumpTo.classList.contains('errored'))
            jumpTo.classList.remove('errored');

        if (newValue === '') {
            countdownEl.setAttribute('hidden', 'true');
            return;
        }

        if (existingJumpPageRef.current) {
            clearInterval(existingJumpPageRef.current);
            existingJumpPageRef.current = null;
        }

        if (jumpPageCountdownNumberRef.current)
            jumpPageCountdownNumberRef.current = null;

        let newPageNo = parseInt(newValue);
        let errorEl = document.getElementById('word-frequency-jump-page-error')!;
        errorEl.setAttribute('hidden', 'true');
        if (isNaN(newPageNo) || newPageNo < 1 || newPageNo > wordFrequencyTotalPages.current) {
            errorEl.textContent = (newPageNo > wordFrequencyTotalPages.current ? `Only ${wordFrequencyTotalPages.current} pages available` : 'Invalid page number');
            errorEl.removeAttribute('hidden');
            jumpTo.classList.add('errored');
            countdownEl.setAttribute('hidden', 'true');
            return;
        }

        jumpPageCountdownNumberRef.current = 2;
        countdownEl.textContent = jumpPageCountdownNumberRef.current.toString();
        countdownEl.removeAttribute('hidden');

        let countdownInterval = setInterval(() => {
            let countdown = countdownEl.textContent;
            if (!countdown) {
                clearInterval(countdownInterval);
                return;
            }
            let countdownValue = parseInt(countdown);
            if (countdownValue <= 1) {
                clearInterval(countdownInterval);
                handleWordFrequencyPageChange(newPageNo);
                e.target.value = '';
                jumpPageCountdownNumberRef.current = null;
                countdownEl.setAttribute('hidden', 'true');
                return;
            }
            let newCountdownValue = countdownValue - 1;
            jumpPageCountdownNumberRef.current = newCountdownValue;
            countdownEl.textContent = newCountdownValue.toString();
        }, 1000);
        existingJumpPageRef.current = countdownInterval;
    }

    return (
        <>
            <div className='search-border' style={{ backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
                <p className='search-border-title'>Filter statistics by participant...</p>
                <Select
                    options={statistics.participants.map((participant: any) => ({
                        value: participant,
                        label: participant
                    }))}
                    isLoading={false}
                    isMulti={false}
                    isSearchable={true}
                    styles={participantStyles}
                    onChange={(selectedOption: any) => {
                        (document.getElementById('word-frequency-search') as HTMLInputElement).value = '';
                        setParticipantFilter(selectedOption.value);
                    }}
                    placeholder='Select a participant...'
                    defaultValue={{ value: statistics.participants[statistics.participants.length - 1], label: statistics.participants[statistics.participants.length - 1] }}
                />
            </div>
            {displayedStatistics && (
                <>
                    <div className="row row-cols-1 row-cols-md-4 g-3">
                        <div className="col">
                            <div className="card" style={{ minWidth: '15vw', minHeight: '12.5vh' }}>
                                <div className="card-body">
                                    <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Total Characters {grammar}</h5>
                                    <p className="card-text text-center">
                                        <span style={{ display: 'inline-block', transform: 'scale(1.3)', margin: '0 10px' }}><NumberIncrementer target={displayedStatistics.totalCharacters} incrementSpeed={getIncrementSpeed(displayedStatistics.totalCharacters)} /></span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card" style={{ minWidth: '15vw', minHeight: '12.5vh' }}>
                                <div className="card-body">
                                    <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Total Words {grammar}</h5>
                                    <p className="card-text text-center">
                                        <span style={{ display: 'inline-block', transform: 'scale(1.3)', margin: '0 10px' }}><NumberIncrementer target={displayedStatistics.totalWords} incrementSpeed={getIncrementSpeed(displayedStatistics.totalWords)} /></span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card" style={{ minWidth: '15vw', minHeight: '12.5vh' }}>
                                <div className="card-body">
                                    <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Total Messages {grammar}</h5>
                                    <p className="card-text text-center">
                                        <span style={{ display: 'inline-block', transform: 'scale(1.3)', margin: '0 10px' }}><NumberIncrementer target={displayedStatistics.totalMessages} incrementSpeed={getIncrementSpeed(displayedStatistics.totalMessages)} /></span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            <div className="card" style={{ minWidth: '15vw', minHeight: '12.5vh' }}>
                                <div className="card-body">
                                    <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Total Emojis {grammar}</h5>
                                    <p className="card-text text-center">
                                        <span style={{ display: 'inline-block', transform: 'scale(1.3)', margin: '0 10px' }}><NumberIncrementer target={displayedStatistics.totalEmojis} incrementSpeed={getIncrementSpeed(displayedStatistics.totalEmojis)} /></span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="dynamic-col-layout" className="row row-cols-1 g-3 mt-1">
                        {participantFilter === 'All Participants' && displayedStatistics.firstMessageAnalysed && (
                            <>
                                <div className="col">
                                    <div className="card" style={{ minWidth: '20vw' }}>
                                        <div className="card-body">
                                            <h5 className="card-title text-center" style={{ fontSize: '20px' }}>First Message {grammar}</h5>
                                            <div className="card-text text-center">
                                                <p style={{ transform: 'scale(1.3)', margin: '0 10px', marginBottom: '10px' }}>{displayedStatistics.firstMessageAnalysed.participant}</p>
                                                <p style={{ transform: 'scale(1.2)', margin: '0 10px', marginBottom: '5px' }}>{displayedStatistics.firstMessageAnalysed.date}</p>
                                                <p style={{ display: 'inline-block', transform: 'scale(1.1)', margin: '0 10px' }}>{getDateSince(displayedStatistics.firstMessageAnalysed.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col">
                                    <div className="card" style={{ minWidth: '20vw' }}>
                                        <div className="card-body">
                                            <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Last Message {grammar}</h5>
                                            <div className="card-text text-center">
                                                <p style={{ transform: 'scale(1.3)', margin: '0 10px', marginBottom: '10px' }}>{displayedStatistics.lastMessageAnalysed.participant}</p>
                                                <p style={{ transform: 'scale(1.2)', margin: '0 10px', marginBottom: '5px' }}>{displayedStatistics.lastMessageAnalysed.date}</p>
                                                <p style={{ display: 'inline-block', transform: 'scale(1.1)', margin: '0 10px' }}>{getDateSince(displayedStatistics.lastMessageAnalysed.date)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {(participantFilter !== 'All Participants' && !groupLikely) && (
                            <div className="col">
                                <div className="card" style={{ minWidth: '20vw' }}>
                                    <div className="card-body">
                                        <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Total % of Messages Contributed</h5>
                                        <div className="card-text text-center">
                                            <p style={{ transform: 'scale(1.3)', margin: '0 10px', marginBottom: '10px' }}>{((displayedStatistics.totalMessages / statistics.totalMessages) * 100).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {(participantFilter === 'All Participants' && groupLikely) && (
                            <div className="col">
                                <div className="card" style={{ minWidth: '20vw' }}>
                                    <div className="card-body">
                                        <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Dominant Speaker</h5>
                                        <div className="card-text text-center">
                                            <p style={{ transform: 'scale(1.3)', margin: '0 10px', marginBottom: '10px' }}>{highestSpeaker.name}</p>
                                            <p style={{ transform: 'scale(1.2)', margin: '0 10px', marginBottom: '5px' }}><NumberIncrementer target={highestSpeaker.count} incrementSpeed={getIncrementSpeed(highestSpeaker.count)} /> messages</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {participantFilter !== 'All Participants' && displayedStatistics.emojiByParticipantBreakdown && (
                            <div className='col'>
                                <div className="card" style={{ minWidth: '20vw' }}>
                                    <div className="card-body">
                                        <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Most Used Emojis</h5>
                                        <div className="card-text text-center">
                                            <p style={{ transform: 'scale(1.3)', margin: '0 10px', marginBottom: '10px' }}>{Object.entries(displayedStatistics.emojiByParticipantBreakdown)
                                                .sort(([, a], [, b]) => (b as number) - (a as number))
                                                .slice(0, 3)
                                                .map(([emoji]) => emoji)
                                                .join('')}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )
            }
            {participantFilter === 'All Participants' && (<h5 className="text-align-center mt-5 mb-3">Basic Statistics</h5>)}
            <div className="row row-cols-1 row-cols-md-3 g-3 mb-1">
                {participantFilter === 'All Participants' && (
                    <div className="col">
                        <div className="card" style={{ minWidth: '20vw' }} data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title={`Participants chatted on ${statistics.totalChatDays} days out of a total of ${statistics.totalDaysBetweenFirstAndLast} days.`}>
                            <div className="card-body">
                                <h5 className="card-title text-center" style={{ fontSize: '20px' }}>Messages Exchanged Over</h5>
                                <p className="card-text text-center">
                                    <span style={{ display: 'block', transform: 'scale(1.3)', margin: '0 10px', marginBottom: '10px' }}><NumberIncrementer target={statistics.totalChatDays} incrementSpeed={getIncrementSpeed(statistics.totalChatDays)} /> / <NumberIncrementer target={statistics.totalDaysBetweenFirstAndLast} incrementSpeed={getIncrementSpeed(statistics.totalDaysBetweenFirstAndLast)} /> days</span>
                                    <span style={{ display: 'block', transform: 'scale(1.2)', margin: '0 10px', marginBottom: '5px' }}>{statistics.firstMessageAnalysed.date.split(',')[0]} ‒ {statistics.lastMessageAnalysed.date.split(',')[0]}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {participantFilter === 'All Participants' && (
                <>
                    <div className="position-relative mt-5" style={{ width: '100%' }}>
                        <h5 id="messages-by-graph-title" className="text-center mb-1 mt-2">Messages By Day</h5>
                        <div className="position-absolute" style={{ right: 0, top: '50%', transform: 'translateY(-50%)' }}>
                            <Select
                                options={[{ value: 'Day', label: 'Day' }, { value: 'Month', label: 'Month' }, { value: 'Year', label: 'Year' }]}
                                isLoading={false}
                                isMulti={false}
                                isSearchable={false}
                                styles={messagesByDateStyles}
                                onChange={(selectedOption: any) => {
                                    let val = selectedOption.value.toLowerCase();
                                    if (val === 'day')
                                        val = 'Day';
                                    if (val === 'month')
                                        if (val === 'month')
                                            val = 'Month';
                                    if (val === 'year')
                                        val = 'Year';
                                    setMessagesByDateLineData({
                                        labels: Object.keys(displayedStatistics[`messageCountBy${val}`]),
                                        datasets: [
                                            {
                                                label: 'Messages',
                                                data: Object.values(displayedStatistics[`messageCountBy${val}`]),
                                                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                                                borderColor: 'rgba(54, 162, 235, 1)',
                                            }
                                        ]
                                    });
                                    messagesByDateLineChartRef.current.resetZoom();
                                    document.getElementById('messages-by-graph-title')!.textContent = `Messages By ${val}`;
                                }}
                                defaultValue={{ value: 'Day', label: 'Day' }}
                            />
                        </div>
                    </div>
                    <Line ref={messagesByDateLineChartRef} data={messagesByDateLineData} options={defaultChartOptions.current} />
                </>
            )}
            <h5 className="text-align-center mt-5 mb-3">Word Usage Frequency</h5>
            <div className="d-flex mt-3" style={{ width: '100%', justifyContent: 'space-between' }}>
                <div className="d-flex flex-row align-items-center mb-4" style={{ width: '55%', minWidth: '35%' }}>
                    <Search id="search-icon" style={{ marginRight: '0.75rem' }} size={17.5} />
                    <input className="form-control" type="search" id="word-frequency-search" placeholder="Search Word..." autoCorrect='false' autoComplete='false' onInput={handleWordSearch}></input>
                    <div style={{ marginLeft: '0.75rem' }}>
                        {!spinnerHidden && (<div className="spinner-border spinner-border-sm" id="search-loading-spinner" style={{ color: 'rgb(33, 37, 41)' }} role="status"></div>)}
                    </div>
                </div>
                <div className="d-flex">
                    <Select
                        options={[{ value: 10, label: '10 per page' }, { value: 30, label: '30 per page' }, { value: 50, label: '50 per page' }, { value: 100, label: '100 per page' }, { value: -1, label: 'All' }]}
                        isLoading={false}
                        isMulti={false}
                        isSearchable={false}
                        styles={maxWordsPerPageStyles}
                        onChange={(selectedOption: any) => {
                            if (selectedOption.value === -1) {
                                // TODO Bootstrap Modal to warn user if useWords exceeds 200.
                            }
                            setWordFrequencyMaxWordsPerPage(selectedOption.value);
                        }}
                        defaultValue={{ value: 30, label: '30 per page' }}
                    />
                </div>
            </div>
            <div className={`row row-cols-1 row-cols-md-${dynamicCols} g-3`}>
                {
                    renderedWords && (
                        Object.entries(renderedWords).sort(([, a], [, b]) => b - a).slice(...getWordFrequencyPageLimits(1)).map(([word, count], index) => (
                            <div className="col" key={index}>
                                <div className="card" style={{ minWidth: '10vw' }}>
                                    <div className="card-body">
                                        <h5 className="card-title text-center" style={{ fontSize: '20px' }}
                                            {...(word.length > 20 && { 'data-bs-toggle': 'tooltip', 'data-bs-placement': 'top', 'data-bs-title': word })}>
                                            {word.length > 20 ? word.slice(0, 15) + '...' : word}
                                        </h5>
                                        <p className="card-text text-center">
                                            <span style={{ display: 'inline-block', fontWeight: 'bold', transform: `scale(${count >= 1000 ? 1.4 : count >= 100 ? 1.3 : count >= 10 ? 1.2 : 1.1})`, margin: `0 ${count >= 1000 ? 12.5 : count >= 100 ? 10 : count >= 10 ? 5 : 2.5}px` }}>{count}</span> {count > 1 ? "matches" : "match"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                }
            </div>
            <div className="d-flex justify-content-center flex-row align-items-center mt-3">
                {(wordFrequencyTotalPages.current > 1 && wordFrequencyMaxWordsPerPage !== -1) && (
                    <ul className="pagination">
                        <li className={`page-item ${wordFrequencyPageNumber <= 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handleWordFrequencyPageChange(1)}>⋘</button>
                        </li>
                        <li className={`page-item ${wordFrequencyPageNumber <= 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handleWordFrequencyPageChange(wordFrequencyPageNumber - 1)}>«</button>
                        </li>
                        {

                            Array.from({ length: wordFrequencyTotalPages.current }, (_, i) => i + 1).slice(wordFrequencyPagesDisplay[0] - 1, wordFrequencyPagesDisplay[1]).map((pageNumber) => (
                                <li className={`page-item ${pageNumber === wordFrequencyPageNumber ? 'active' : ''}`} key={pageNumber}>
                                    <button className="page-link" onClick={() => handleWordFrequencyPageChange(pageNumber)}>{pageNumber}</button>
                                </li>
                            ))
                        }
                        <li className={`page-item ${wordFrequencyPageNumber >= wordFrequencyTotalPages.current ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handleWordFrequencyPageChange(wordFrequencyPageNumber + 1)}>»</button>
                        </li>
                        <li className={`page-item ${wordFrequencyPageNumber >= wordFrequencyTotalPages.current ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => handleWordFrequencyPageChange(wordFrequencyTotalPages.current)}>⋙</button>
                        </li>
                        <div className="d-flex flex-column" style={{ marginLeft: '2.5rem', }}>
                            <div className="d-flex justify-content-center flex-row">
                                <input type="number" className='custom-text-input' onInput={wordFrequencyJumpPageHandleInput} name="word-frequency-jump-to" id="word-frequency-jump-to" placeholder='Jump to page...' />
                                <p className='input-mini-text' id="word-frequency-jump-page-countdown" hidden>2</p>
                            </div>
                            <p className="input-mini-error" id="word-frequency-jump-page-error"></p>
                        </div>
                    </ul>
                )}
            </div>
        </>
    )
}

export default Statistics;

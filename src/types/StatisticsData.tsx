export default interface StatisticsData {
    participants: Array<string>;
    totalMessages: number;
    totalCharacters: number;
    totalWords: number;
    totalEmojis: number;
    totalChatDays: number,
    totalDaysBetweenFirstAndLast: number,
    charactersByParticipant: Record<string, number>;
    messagesByParticipant: Record<string, number>;
    emojiByParticipantBreakdown: Record<string, Record<string, number>>;
    wordByParticipantBreakdown: Record<string, Record<string, number>>;
    firstMessageAnalysed: Record<string, string>;
    lastMessageAnalysed: Record<string, string>;
    messageCountByDay: Record<string, number>;
    messageCountByMonth: Record<string, number>;
    messageCountByYear: Record<string, number>;
}
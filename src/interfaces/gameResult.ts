interface GameResult {
    result: ResultType;
    error?: string;
    name?: string;
    score?: string;
}

export default GameResult;

export enum ResultType {
    TIMEOUT = 'timeout',
    WINNER = 'winner',
    LOSER = 'loser',
    TIE = 'tie',
    ERROR = 'error',
    DELETED = 'deleted',
}
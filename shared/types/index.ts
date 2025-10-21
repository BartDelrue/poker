export type ScoreMap = Map<string, Score>;
export type ScoreArray = [string, Score][];
export type Member = { userId: string, active: boolean}

export type Score = string | number | null | undefined

export interface Criterium {
    options: Score[],
    scores: ScoreMap | ScoreArray,
    revealed: boolean,
    id: string,
    name?: string
}

export interface Rubric {
    criteria: Criterium[],
    members?: Member[]
}

interface PokerMessageBase {
    type: string,
    roomId: string,
    data?: unknown
}

interface Initmessage extends PokerMessageBase {
    type: 'init',
    data: string
}

interface JoinMessage extends PokerMessageBase {
    type: 'join',
    data: string
}

interface JoinedMessage extends PokerMessageBase {
    type: 'joined',
    data: string
}

interface LeaveMessage extends PokerMessageBase {
    type: 'leave',
}

interface ScoredMessage extends PokerMessageBase {
    type: 'scored'
    data: Rubric
}

interface ScoreMessage extends PokerMessageBase {
    type: 'score'
    data: {
        criteriumId: string,
        value: string
    }
}

interface ResetMessage extends PokerMessageBase {
    type: 'reset'
    data: {
        criteriumIds: string[],
    }
}

interface ConfigMessage extends PokerMessageBase {
    type: 'config',
    data: {
        id?: string,
        name?: string,
        options: Score[]
    }
}

interface RevealMessage extends PokerMessageBase {
    type: 'reveal',
    data: string
}

export type PokerMessage =
    Initmessage
    | JoinedMessage
    | JoinMessage
    | LeaveMessage
    | ScoreMessage
    | ScoredMessage
    | ResetMessage
    | RevealMessage
    | ConfigMessage

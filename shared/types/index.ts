export type ScoreMap = Map<string, string | null>;
export type ScoreArray = ReturnType<typeof Array.from<ScoreMap>>;

type PeerId = string
export type Score = string | number | null | undefined

export interface Criterium {
    options: Score[],
    scores: Map<PeerId, Score> | [PeerId, Score][],
    revealed: boolean,
    id: string,
    name?: string
}

export interface Rubric {
    criteria: Criterium[]
}

interface PokerMessageBase {
    type: string,
    roomId: string,
    data?: unknown,
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

interface ConfigMessage extends PokerMessageBase {
    type: 'config',
    data: {
        id?: string,
        name: string,
        options: Score[]
    }
}

interface RevealMessage extends PokerMessageBase {
    type: 'reveal',
    data: string
}

export interface Member {
    id: string
}

export type PokerMessage =
    JoinedMessage
    | JoinMessage
    | LeaveMessage
    | ScoreMessage
    | ScoredMessage
    | RevealMessage
    | ConfigMessage

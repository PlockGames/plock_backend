import { IGame } from "./game";

export interface IComment {
    id: number;
    userId: string;
    comment: string;
    date: Date;
    gameId: number;
    game: IGame;
}
import { IComment } from "./comments";

export interface IGame {
  id: number;
  title: string;
  tags: string[];
  creatorId: number;
  creationDate: Date;
  gameUrl: string;
  playTime: string;
  gameType: string;
  thumbnailUrl: string;
  likes: number;
  comments: IComment[];
}

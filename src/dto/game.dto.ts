import { CommentDto } from './comment.dto';

export class GameWithoutIdDto {
  title: string;
  tags: string[];
  creatorId: number;
  creationDate: Date;
  gameUrl: string;
  playTime: string;
  gameType: string;
  thumbnailUrl: string;
  likes: number;
  comments: CommentDto[];

  constructor(
    title: string,
    tags: string[],
    creatorId: number,
    creationDate: Date,
    gameUrl: string,
    playTime: string,
    gameType: string,
    thumbnailUrl: string,
    likes: number,
    comments: CommentDto[],
  ) {
    this.title = title;
    this.tags = tags;
    this.creatorId = creatorId;
    this.creationDate = creationDate;
    this.gameUrl = gameUrl;
    this.playTime = playTime;
    this.gameType = gameType;
    this.thumbnailUrl = thumbnailUrl;
    this.likes = likes;
    this.comments = comments;
  }
}

export class GameDto extends GameWithoutIdDto {
  id: number;

  constructor(
    id: number,
    title: string,
    tags: string[],
    creatorId: number,
    creationDate: Date,
    gameUrl: string,
    playTime: string,
    gameType: string,
    thumbnailUrl: string,
    likes: number,
    comments: CommentDto[],
  ) {
    super(
      title,
      tags,
      creatorId,
      creationDate,
      gameUrl,
      playTime,
      gameType,
      thumbnailUrl,
      likes,
      comments,
    );
    this.id = id;
  }
}

export class GameWithDataDto extends GameDto {
  data: string;

  constructor(
    id: number,
    title: string,
    tags: string[],
    creatorId: number,
    creationDate: Date,
    gameUrl: string,
    playTime: string,
    gameType: string,
    thumbnailUrl: string,
    likes: number,
    comments: CommentDto[],
    data: string,
  ) {
    super(
      id,
      title,
      tags,
      creatorId,
      creationDate,
      gameUrl,
      playTime,
      gameType,
      thumbnailUrl,
      likes,
      comments,
    );
    this.data = data;
  }
}

export class CreateGameDto {
  title: string;
  tags: string[];
  creatorId: number;
  playTime: string;
  gameType: string;
  thumbnailUrl: string;
  data: string;

  constructor(
    title: string,
    tags: string[],
    creatorId: number,
    playTime: string,
    gameType: string,
    thumbnailUrl: string,
    data: string,
  ) {
    this.title = title;
    this.tags = tags;
    this.creatorId = creatorId;
    this.playTime = playTime;
    this.gameType = gameType;
    this.thumbnailUrl = thumbnailUrl;
    this.data = data;
  }
}

export class UpdateGameDto {
  title: string;
  tags: string[];
  creatorId: number;
  playTime: string;
  gameType: string;
  thumbnailUrl: string;
  likes: number;
  data: string;

  constructor(
    title: string,
    tags: string[],
    creatorId: number,
    playTime: string,
    gameType: string,
    thumbnailUrl: string,
    likes: number,
    data: string,
  ) {
    this.title = title;
    this.tags = tags;
    this.creatorId = creatorId;
    this.playTime = playTime;
    this.gameType = gameType;
    this.thumbnailUrl = thumbnailUrl;
    this.likes = likes;
    this.data = data;
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../shared/modules/prisma/prisma.service';
import { User, Game } from '@prisma/client';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(private readonly prisma: PrismaService) {}

  private LIKE_WEIGHT = 3;
  private COMMENT_WEIGHT = 2;
  private PLAYTIME_WEIGHT = 1; // Base weight, to be multiplied by the normalized time

  async getRecommendations(user: User, limit: number = 10): Promise<Game[]> {
    this.logger.log(`Generating recommendations for user ID: ${user.id}`);

    // 1. Obtain user interactions
    const [likedGames, commentedGames, playHistories] = await Promise.all([
      this.prisma.like.findMany({
        where: { userId: user.id },
        include: {
          game: { include: { Taggable: { include: { tag: true } } } },
        },
      }),
      this.prisma.comment.findMany({
        where: { userId: user.id },
        include: {
          game: { include: { Taggable: { include: { tag: true } } } },
        },
      }),
      this.prisma.playHistory.findMany({
        where: { userId: user.id },
        include: {
          game: { include: { Taggable: { include: { tag: true } } } },
        },
      }),
    ]);

    this.logger.log(
      `User ID: ${user.id} - Liked games: ${likedGames.length}, Commented games: ${commentedGames.length}, Play histories: ${playHistories.length}`,
    );
    // Calculate affinity by tag
    const tagAffinity: { [tagId: string]: number } = {};

    // Process likes
    likedGames.forEach((like) => {
      like.game.Taggable.forEach((taggable) => {
        tagAffinity[taggable.tagId] =
          (tagAffinity[taggable.tagId] || 0) + this.LIKE_WEIGHT;
      });
    });

    // Process comments
    commentedGames.forEach((comment) => {
      comment.game.Taggable.forEach((taggable) => {
        tagAffinity[taggable.tagId] =
          (tagAffinity[taggable.tagId] || 0) + this.COMMENT_WEIGHT;
      });
    });

    // Process playtime
    let maxPlayTime = 0;
    playHistories.forEach((playHistory) => {
      if (playHistory.playTime > maxPlayTime) {
        maxPlayTime = playHistory.playTime;
      }
    });

    playHistories.forEach((playHistory) => {
      const normalizedPlayTime = playHistory.playTime / maxPlayTime;
      const weight = this.PLAYTIME_WEIGHT * normalizedPlayTime;
      playHistory.game.Taggable.forEach((taggable) => {
        tagAffinity[taggable.tagId] =
          (tagAffinity[taggable.tagId] || 0) + weight;
      });
    });

    this.logger.log(
      `Tag affinities calculated: ${JSON.stringify(tagAffinity)}`,
    );
    // 3. Normalize affinity
    const totalAffinity = Object.values(tagAffinity).reduce(
      (sum, value) => sum + value,
      0,
    );

    for (const tagId in tagAffinity) {
      tagAffinity[tagId] /= totalAffinity;
    }

    this.logger.log(
      `Normalized tag affinities: ${JSON.stringify(tagAffinity)}`,
    );

    // 4. Get non-interacted games
    const interactedGameIds = new Set<string>([
      ...likedGames.map((like) => like.gameId),
      ...commentedGames.map((comment) => comment.gameId),
      ...playHistories.map((playHistory) => playHistory.gameId),
    ]);

    const candidateGames = await this.prisma.game.findMany({
      where: {
        id: { notIn: Array.from(interactedGameIds) },
      },
      include: { Taggable: { include: { tag: true } } },
    });

    this.logger.log(
      `Found ${candidateGames.length} candidate games for recommendations.`,
    );
    // 5. Calculate score for each game
    const gameScores: { game: Game; score: number }[] = [];

    candidateGames.forEach((game) => {
      let score = 0;
      game.Taggable.forEach((taggable) => {
        const affinity = tagAffinity[taggable.tagId] || 0;
        score += affinity;
      });
      if (score > 0) {
        gameScores.push({ game, score });
      }
    });

    this.logger.log(`Calculated scores for ${gameScores.length} games.`);

    // 6. Sort and return recommendations
    gameScores.sort((a, b) => b.score - a.score);
    const recommendations = gameScores.slice(0, limit).map((item) => item.game);

    this.logger.log(
      `Returning ${recommendations.length} recommendations for user ID: ${user.id}`,
    );
    return recommendations;
  }
}

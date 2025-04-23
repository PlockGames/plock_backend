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
  private MIN_RECOMMENDATIONS = 5; // Minimum number of recommendations to return

  /**
   * Get game recommendations for a user
   * Handles edge cases:
   * - New users with no interactions
   * - Games without tags
   * - Limited number of games in the system
   */
  async getRecommendations(user: User, limit: number = 10): Promise<Game[]> {
    this.logger.log(`Generating recommendations for user ID: ${user.id}`);
    limit = Math.max(1, limit); // Ensure limit is at least 1

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

    // Check if user has any interactions
    const hasInteractions =
      likedGames.length > 0 ||
      commentedGames.length > 0 ||
      playHistories.length > 0;

    this.logger.log(
      `User ID: ${user.id} - Liked games: ${likedGames.length}, Commented games: ${commentedGames.length}, Play histories: ${playHistories.length}`,
    );

    // If user has no interactions, return popular games instead
    if (!hasInteractions) {
      this.logger.log(
        `No interactions found for user ${user.id}. Using popular games fallback.`,
      );
      return this.getPopularGames(limit);
    }

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
      // Avoid division by zero if all playtimes are 0
      const normalizedPlayTime =
        maxPlayTime > 0 ? playHistory.playTime / maxPlayTime : 1;
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

    // Only normalize if we have affinity data
    if (totalAffinity > 0) {
      for (const tagId in tagAffinity) {
        tagAffinity[tagId] /= totalAffinity;
      }
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

    // If we don't have any candidate games, return popular games
    if (candidateGames.length === 0) {
      this.logger.log(
        `No candidate games found. Using popular games fallback.`,
      );
      return this.getPopularGames(limit);
    }

    // 5. Calculate score for each game
    const gameScores: { game: Game; score: number }[] = [];

    candidateGames.forEach((game) => {
      let score = 0;

      // Handle games without tags by giving them a small base score
      if (game.Taggable.length === 0) {
        score = 0.1; // Small base score for games without tags
      } else {
        game.Taggable.forEach((taggable) => {
          const affinity = tagAffinity[taggable.tagId] || 0;
          score += affinity;
        });
      }

      // Include all games in scoring, even with zero score
      gameScores.push({ game, score });
    });

    this.logger.log(`Calculated scores for ${gameScores.length} games.`);

    // 6. Sort and return recommendations
    gameScores.sort((a, b) => b.score - a.score);
    let recommendations = gameScores.slice(0, limit).map((item) => item.game);

    // If we don't have enough recommendations, supplement with popular games
    if (recommendations.length < Math.min(this.MIN_RECOMMENDATIONS, limit)) {
      const additionalCount =
        Math.min(this.MIN_RECOMMENDATIONS, limit) - recommendations.length;
      if (additionalCount > 0) {
        this.logger.log(
          `Not enough personalized recommendations. Adding ${additionalCount} popular games.`,
        );
        const existingIds = new Set(recommendations.map((game) => game.id));
        const popularGames = await this.getPopularGames(additionalCount + 5); // Get extra to account for possible duplicates

        // Filter out games already in recommendations
        const newPopularGames = popularGames.filter(
          (game) => !existingIds.has(game.id),
        );

        // Add the popular games to recommendations
        recommendations = [
          ...recommendations,
          ...newPopularGames.slice(0, additionalCount),
        ];
      }
    }

    this.logger.log(
      `Returning ${recommendations.length} recommendations for user ID: ${user.id}`,
    );
    return recommendations;
  }

  /**
   * Get popular games based on likes, comments, and play histories
   * Used as a fallback when personalized recommendations aren't available
   */
  private async getPopularGames(limit: number): Promise<Game[]> {
    this.logger.log(`Getting popular games, limit: ${limit}`);

    try {
      // Get games with the most likes
      const popularGamesByLikes = await this.prisma.game.findMany({
        take: limit * 2, // Get more than needed to ensure variety
        orderBy: {
          likes: {
            sort: 'desc',
          },
        },
        include: {
          Taggable: { include: { tag: true } },
        },
      });

      // If we have no games with likes, get random games
      if (popularGamesByLikes.length === 0) {
        return this.getRandomGames(limit);
      }

      // Get games with the most play time
      const popularGamesByPlayTime = await this.prisma.game.findMany({
        take: limit * 2,
        orderBy: {
          PlayHistory: {
            _count: 'desc',
          },
        },
        include: {
          Taggable: { include: { tag: true } },
        },
      });

      // Combine and deduplicate games
      const gameMap = new Map<string, Game & { score: number }>();

      // Process games by likes (higher weight)
      popularGamesByLikes.forEach((game, index) => {
        const score = (popularGamesByLikes.length - index) * 2; // Higher weight for likes
        gameMap.set(game.id, { ...game, score });
      });

      // Process games by play time
      popularGamesByPlayTime.forEach((game, index) => {
        const existingGame = gameMap.get(game.id);
        const playTimeScore = popularGamesByPlayTime.length - index;

        if (existingGame) {
          existingGame.score += playTimeScore;
        } else {
          gameMap.set(game.id, { ...game, score: playTimeScore });
        }
      });

      // Convert to array, sort by score, and take the top 'limit' games
      const combinedGames = Array.from(gameMap.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);

      // If we don't have enough games, supplement with random games
      if (combinedGames.length < limit) {
        const randomGames = await this.getRandomGames(
          limit - combinedGames.length,
        );
        const existingIds = new Set(combinedGames.map((game) => game.id));
        const newRandomGames = randomGames.filter(
          (game) => !existingIds.has(game.id),
        );

        return [
          ...combinedGames.map(({ score, ...game }) => game as Game),
          ...newRandomGames,
        ];
      }

      // Remove the score property before returning
      return combinedGames.map(({ score, ...game }) => game as Game);
    } catch (error) {
      this.logger.error(`Error getting popular games: ${error.message}`);
      // Fallback to random games if there's an error
      return this.getRandomGames(limit);
    }
  }

  /**
   * Get random games
   * Used as a last resort when no other recommendation strategy works
   */
  private async getRandomGames(limit: number): Promise<Game[]> {
    this.logger.log(`Getting random games, limit: ${limit}`);

    try {
      // Count total games
      const totalGames = await this.prisma.game.count();

      // If no games exist, return empty array
      if (totalGames === 0) {
        this.logger.log('No games found in the database');
        return [];
      }

      // Get random games
      const randomGames = await this.prisma.game.findMany({
        take: limit,
        include: {
          Taggable: { include: { tag: true } },
        },
        // Using createdAt as a random-ish sorting mechanism
        orderBy: {
          createdAt: totalGames > limit * 2 ? 'desc' : 'asc',
        },
      });

      return randomGames;
    } catch (error) {
      this.logger.error(`Error getting random games: ${error.message}`);
      return [];
    }
  }
}

import type { LeaderboardEntry } from './leaderboardTypes.ts';
import { STORAGE_LEADERBOARD_KEY } from '../game/constants.ts';

export class LeaderboardStorage {
  /**
   * Retrieves the top 10 leaderboard entries sorted by score desc.
   * Returns a Promise to simulate an async backend API.
   */
  public async getScores(): Promise<LeaderboardEntry[]> {
    try {
      const data = localStorage.getItem(STORAGE_LEADERBOARD_KEY);
      if (!data) return [];
      const scores: LeaderboardEntry[] = JSON.parse(data);
      return scores.sort((a, b) => b.score - a.score).slice(0, 10);
    } catch (e) {
      console.error('Failed to retrieve leaderboard from localStorage:', e);
      return [];
    }
  }

  /**
   * Saves a score to the leaderboard, keeping only the top 10 entries.
   */
  public async saveScore(entry: LeaderboardEntry): Promise<void> {
    try {
      const scores = await this.getScores();
      scores.push(entry);
      const updatedScores = scores
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      
      localStorage.setItem(STORAGE_LEADERBOARD_KEY, JSON.stringify(updatedScores));
    } catch (e) {
      console.error('Failed to save score to localStorage:', e);
    }
  }

  /**
   * Checks if the given score is high enough to enter the top 10 list.
   */
  public async qualifiesForLeaderboard(score: number): Promise<boolean> {
    if (score <= 0) return false;
    const scores = await this.getScores();
    if (scores.length < 10) return true;
    
    const lowestScore = scores[scores.length - 1].score;
    return score > lowestScore;
  }

  /**
   * Clears the leaderboard stored in localStorage.
   */
  public async clearScores(): Promise<void> {
    try {
      localStorage.removeItem(STORAGE_LEADERBOARD_KEY);
    } catch (e) {
      console.error('Failed to clear leaderboard in localStorage:', e);
    }
  }
}

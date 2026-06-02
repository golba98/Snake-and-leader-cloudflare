import { LeaderboardStorage } from './leaderboardStorage.ts';
import type { LeaderboardEntry } from './leaderboardTypes.ts';

export class Leaderboard {
  private storage: LeaderboardStorage;
  private tableBodyElement: HTMLElement | null = null;

  constructor() {
    this.storage = new LeaderboardStorage();
  }

  public init(tableBodyElement: HTMLElement | null): void {
    this.tableBodyElement = tableBodyElement;
    this.refresh();
  }

  public getStorage(): LeaderboardStorage {
    return this.storage;
  }

  public async refresh(): Promise<void> {
    if (!this.tableBodyElement) return;

    const scores = await this.storage.getScores();
    this.renderScores(scores);
  }

  private renderScores(scores: LeaderboardEntry[]): void {
    if (!this.tableBodyElement) return;

    if (scores.length === 0) {
      this.tableBodyElement.innerHTML = `
        <tr>
          <td colspan="4" class="empty-leaderboard">No scores yet. Be the first!</td>
        </tr>
      `;
      return;
    }

    this.tableBodyElement.innerHTML = scores
      .map((entry, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'rank-gold';
        else if (index === 1) rankClass = 'rank-silver';
        else if (index === 2) rankClass = 'rank-bronze';

        const dateStr = this.formatDate(entry.date);

        return `
          <tr class="${rankClass}">
            <td class="rank-col">#${index + 1}</td>
            <td class="name-col">${this.escapeHtml(entry.name)}</td>
            <td class="score-col">${entry.score}</td>
            <td class="date-col">${dateStr}</td>
          </tr>
        `;
      })
      .join('');
  }

  public async submitScore(name: string, score: number): Promise<void> {
    const formattedDate = new Date().toISOString();
    const cleanName = name.trim() || 'Anonymous';
    
    await this.storage.saveScore({
      name: cleanName,
      score: score,
      date: formattedDate
    });

    await this.refresh();
  }

  public async clear(): Promise<void> {
    await this.storage.clearScores();
    await this.refresh();
  }

  private formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    } catch {
      return dateStr;
    }
  }

  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

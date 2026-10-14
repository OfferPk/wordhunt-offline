/* Game-specific achievements (cosmetic coin rewards). Shared ones live in achievements.js. */
window.ACH_DEFS = [
  { "id": "wh_first", "name": "First Find", "desc": "Finish your first puzzle", "metric": "wins", "goal": 1, "reward": 15 },
  { "id": "wh_wins25", "name": "Word Seeker", "desc": "Finish 25 puzzles", "metric": "wins", "goal": 25, "reward": 80 },
  { "id": "wh_wins100", "name": "Grid Master", "desc": "Finish 100 puzzles", "metric": "wins", "goal": 100, "reward": 200 },
  { "id": "wh_clean10", "name": "Sharp Eyes", "desc": "Finish 10 puzzles without a hint", "metric": "clean_wins", "goal": 10, "reward": 70 },
  { "id": "wh_daily7", "name": "Daily Reader", "desc": "Finish 7 Daily puzzles", "metric": "dailies", "goal": 7, "reward": 90 },
  { "id": "wh_quick10", "name": "Speed Reader", "desc": "Finish 10 puzzles in under 2 minutes", "metric": "quick", "goal": 10, "reward": 80 },
  { "id": "wh_words500", "name": "Word Hoard", "desc": "Find 500 words", "metric": "words_total", "goal": 500, "reward": 150 },
  { "id": "wh_all10", "name": "Mixed Bag", "desc": "Finish 10 puzzles on the All theme", "metric": "all_wins", "goal": 10, "reward": 60 }
];

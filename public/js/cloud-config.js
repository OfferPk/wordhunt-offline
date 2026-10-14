/* Play Games cloud save: OFF (scaffold only; the native bridge is not wired in this game yet). Never put a guessed ID here. */
window.CLOUD_CONFIG = {
  ENABLED: false,
  PLAY_GAMES_APP_ID: 'REPLACE_WITH_PLAY_GAMES_APP_ID', // numeric "App ID" from Play Console > Play Games Services > Configuration
  PLUGIN_NAME: 'PlayGamesSaves',                        // native bridge name (see SETUP_PLAY_GAMES.md)
  SNAPSHOT_NAME: 'wordhunt-progress',
  KEYS: ['wordhunt:v1:settings', 'wordhunt:v1:gamesPlayed', 'wordhunt:v1:wordsFoundTotal', 'wordhunt.meta.v1', 'wordhunt.meta.v1.daily', 'wordhunt.meta.v1.ach'] // progress, coins, purchases (save), daily state, achievements
};
if (typeof module !== 'undefined') module.exports = window.CLOUD_CONFIG;

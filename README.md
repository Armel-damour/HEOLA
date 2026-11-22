# HEOLA: Which One Is Stronger?

A small, fun browser game where you pick the stronger animal in head-to-head matchups and crown a champion at the end of each tournament.

## How to play

1. Eight random animals enter a tournament.
2. Click the animal you think is stronger (or press the left or right arrow key).
3. Winners move on through the quarterfinals, semifinals and final.
4. The last animal standing is crowned champion. Start a new tournament and try again.

## Features

- 8-animal tournament bracket with a champion screen
- Animated cards, confetti and sound effects (with a mute button)
- Daily streak and a daily goal of 10 votes
- Personal stats: total votes and your top pick
- Leaderboard ranking animals by share of matchups won
- Works on phones and desktops, and respects the reduced-motion setting

## Run it locally

No install or build step is needed.

1. Download or clone this repository.
2. Open `index.html` in your browser.

## Files

| File | What it does |
| --- | --- |
| `index.html` | Page structure |
| `style.css` | Colors, layout and animations |
| `script.js` | Game logic, sound, confetti, stats and tournament |

## Customize

- **Change the animals:** edit the `ANIMALS` list at the top of `script.js`. Each entry is an emoji and a name.
- **Change the daily goal:** edit `DAILY_GOAL` in `script.js`.
- **Change the tournament size:** edit `.slice(0, 8)` in `startTournament()` in `script.js`. The round names are set up for 8 animals.

## Your data

Votes, streaks and stats are saved with your browser's `localStorage`. They stay on your own device, are not sent anywhere, and are not shared with other players. Clearing your browser data or using private browsing will erase them.

## Deploy with GitHub Pages

1. Put `index.html`, `style.css` and `script.js` in the root of the repository.
2. Go to **Settings > Pages**.
3. Under "Build and deployment", choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Your site will be live after a minute or two.

## Built with

Plain HTML, CSS and JavaScript. No frameworks or dependencies.

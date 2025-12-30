# FOAQ - Jeopardy Tracker

[**Live Demo**](https://foaq.kurai.org/)

## Overview
FOAQ (Form Of A Question) is a vanilla JS Progressive Web App for tracking Jeopardy! scores. It allows you to play along with the show, tracking scores for multiple people in the room.

## Features

### 1. Game Setup
- **Add Players**: Default 3 slots. Can add more using "+ Player" in the top bar.
- **Remove Players**: "X" button removes a slot.
- **Start Game**: Validates names (filters empty ones) and initializes the game board.

### 2. Gameplay & Scoring
- **Select Value**: Tap a dollar amount (e.g., $200). It highlights **Gold** to show it's active.
- **Select Player**: Tapping a player card is optional but can highlight them.
- **Record Answer**:
    - **Correct (✓)**: Click the checkmark inside the player's card. Adds the points.
    - **Incorrect (✗)**: Click the X inside the player's card. Subtracts the points.
- **Play-Along Mode**: Even after one player gets it right, the clue stays open so others can answer (if playing against the TV). The clue only closes when you manually pick a new dollar value.
- **Undo (↩️)**: Made a mistake? Click the Undo button in the top bar to reverse the last action (score change, round change, etc.).

### 3. Advanced Features (New)
#### Daily Double
- **Trigger**: **Long Press** (hold for ~0.6s) on any dollar amount button. (Hint displayed in the scrolling banner).
- **Wager UI**: An input box and a **"Max" button** appear in player cards.
- **Max Button**: Click "Max" to instantly set the wager to the highest allowed amount (your score or the round minimum, whichever is higher).
- **Action**: Enter wager manually or click Max, then score Correct (✓) or Incorrect (✗).

#### Final Jeopardy
- **Trigger**: Click "Next Round" until you reach Final Jeopardy.
- **Wager**: Every player card shows a wager input and "Max" button.
- **Action**: Enter wagers for everyone. Then, after the answer is revealed, mark them Correct or Incorrect to apply the final score changes.
- **Winner Reveal**: Once all final scores are recorded, the **Winning Player(s)** are automatically highlighted with a **Green Glow and Crown (👑)**.
- **New Game**: A "Start New Game" button appears automatically after the winner is declared.

#### Settings
- **Icon**: Click the Gear icon (⚙️) in the top nav.
- **Mercy Rule**: 
    - **ON (Default)**: Players with negative scores *can* participate in Final Jeopardy.
    - **OFF**: Players with negative scores are grayed out.
- **Reset Game**: "Reset Game" button (Danger Zone) clears all progress and returns to the initial player setup screen.

### 4. Mid-Game Roster Management
- **Add Player**: Click "+ Player" in the utility bar. Enter a name.
- **Remove Player**: Click "- Player". The board enters "Delete Mode" (red/alert). Tap any player card to remove them.

### 5. Rounds
- **Prev / Next**: Use `Prev Round` and `Next Round` buttons in the top bar to switch between round.

### 6. Auto-Save
- The game automatically saves your progress to your browser (LocalStorage).
- **Refresh Protection**: If you reload the page, you'll be right back where you left off.
- **Reset**: To start a fresh game, go to **Settings > Reset Game**.

## Known Issues
- **Desktop Layout**: On some desktop browsers, the "Winner Crown" icon may be obscured due to vertical spacing issues in the player card. It displays correctly on mobile devices.

## Installation (PWA)
1. Hosted/Local: Open in Chrome/Safari.
2. Icon: "Install FOAQ" icon appears in address bar (Desktop) or "Add to Home Screen" (Mobile).
3. Offline: Works offline once installed/cached.

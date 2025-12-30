
// utils/validators.js

const LETTERS = ["B", "I", "N", "G", "O"];
const SIZE = 5;

/**
 * 1️⃣ Check if ALL marked numbers were actually called
 */
function isMarkedReallyCalled(markedNumbers, calledNumbers) {
  // Build a fast lookup set: "B-12", "G-49", etc.
  const calledSet = new Set(
    calledNumbers.map((c) => `${c.letter}-${c.number}`)
  );

  for (const letter of LETTERS) {
    for (const cell of markedNumbers[letter]) {
      // FREE center is always valid
      if (cell.value === "FREE") continue;

      const key = `${letter}-${cell.value}`;
      if (!calledSet.has(key)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * 2️⃣ Check Bingo patterns (rows, columns, diagonals, corners)
 */
function checkBingo(markedNumbers) {
  // Build a strict 5x5 boolean grid
  const grid = Array.from({ length: SIZE }, () =>
    Array(SIZE).fill(false)
  );

  // Fill grid based on marked numbers
  LETTERS.forEach((letter, colIndex) => {
    markedNumbers[letter].forEach(({ row }) => {
      grid[row][colIndex] = true;
    });
  });

  // FREE center
  grid[2][2] = true;

  // ---- ROWS ----
  for (let r = 0; r < SIZE; r++) {
    if (grid[r].every(Boolean)) return true;
  }

  // ---- COLUMNS ----
  for (let c = 0; c < SIZE; c++) {
    if (grid.every((row) => row[c])) return true;
  }

  // ---- DIAGONALS ----
  if (grid.every((row, i) => row[i])) return true;
  if (grid.every((row, i) => row[SIZE - 1 - i])) return true;

  // ---- FOUR CORNERS ----
  if (grid[0][0] && grid[0][4] && grid[4][0] && grid[4][4]) {
    return true;
  }

  return false;
}

export { isMarkedReallyCalled, checkBingo };

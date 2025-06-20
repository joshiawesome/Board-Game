function constructGridConfig(gridDimension) {
  const gridConfig = [];

  for (let r = 0; r < gridDimension; r++) {
    const row = [];

    for (let c = 0; c < gridDimension; c++) {
      row.push(Math.floor(Math.random() * 10));
    }

    gridConfig.push(row);
  }
  return gridConfig;
}

function getDomElementById(elementId) {
  return document.getElementById(elementId);
}

function createDPTable(N, grid) {
  let dp = Array.from({ length: N }, () =>
    Array.from({ length: N }, () => Array(N).fill(-Infinity))
  );

  for (let col1 = 0; col1 < N; col1++) {
    for (let col2 = 0; col2 < N; col2++) {
      if (col1 === col2) {
        dp[N - 1][col1][col2] = grid[N - 1][col1];
      } else {
        dp[N - 1][col1][col2] = grid[N - 1][col1] + grid[N - 1][col2];
      }
    }
  }

  for (let row = N - 2; row >= 0; row--) {
    for (let col1 = 0; col1 < N; col1++) {
      for (let col2 = 0; col2 < N; col2++) {
        let maxChocolates = -Infinity;

        for (let move1 of [-1, 0, 1]) {
          for (let move2 of [-1, 0, 1]) {
            let newCol1 = col1 + move1;
            let newCol2 = col2 + move2;
            if (newCol1 >= 0 && newCol1 < N && newCol2 >= 0 && newCol2 < N) {
              let currentChocolates =
                col1 === col2
                  ? grid[row][col1]
                  : grid[row][col1] + grid[row][col2];
              maxChocolates = Math.max(
                maxChocolates,
                currentChocolates + dp[row + 1][newCol1][newCol2]
              );
            }
          }
        }
        dp[row][col1][col2] = maxChocolates;
      }
    }
  }

  return dp;
}

document.addEventListener("DOMContentLoaded", function () {
  let n = parseInt(prompt("Enter Grid Size:", 5));

  const gridConfig = constructGridConfig(n);

  const playersConfig = {
    p1: { rowIndex: 0, colIndex: 0 },
    p2: { rowIndex: 0, colIndex: n - 1 },
  };

  const scoreConfig = {
    totalCollectedChocolatesCount:
      gridConfig[playersConfig.p1.rowIndex][playersConfig.p1.colIndex] +
      gridConfig[playersConfig.p2.rowIndex][playersConfig.p2.colIndex],
    playerOneCollectedChocolatesCount:
      gridConfig[playersConfig.p1.rowIndex][playersConfig.p1.colIndex],
    playerTwoCollectedChocolatesCount:
      gridConfig[playersConfig.p2.rowIndex][playersConfig.p2.colIndex],
  };

  const visitedCells = [];

  let currentPlayer = "p1";

  const autoPlayButton = document.getElementById("auto-play-button");

  autoPlayButton.onclick = handleAutoPlay;

  function initGame() {
    renderGrid();
    renderScoreCard();
    attachGridEventListeners();
  }

  function refreshGrid() {
    renderGrid();
    renderScoreCard();
  }

  initGame();

  // to get optimal path using dynamic programming approach
  function handleAutoPlay() {
    let dp = createDPTable(n, gridConfig);
  }

  function attachGridEventListeners() {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowDown": {
          navigatePlayerCoin("DOWN");
          break;
        }
        case "ArrowRight": {
          navigatePlayerCoin("DIAGONALLY_RIGHT");
          break;
        }
        case "ArrowLeft": {
          navigatePlayerCoin("DIAGONALLY_LEFT");
          break;
        }
        case "Tab": {
          e.preventDefault();
          switchPlayer();
          break;
        }
        default:
          break;
      }
    });
  }

  function switchPlayer() {
    currentPlayer = currentPlayer === "p1" ? "p2" : "p1";

    refreshGrid();
  }

  function collectChocolates() {
    const currentPlayerConfig = playersConfig[currentPlayer];
    const otherPlayerConfig =
      playersConfig[currentPlayer === "p1" ? "p2" : "p1"];

    const { rowIndex: currentPlayerRowIndex, colIndex: currentPlayerColIndex } =
      currentPlayerConfig;

    const { rowIndex: otherPlayerRowIndex, colIndex: otherPlayerColIndex } =
      otherPlayerConfig;

    const {
      totalCollectedChocolatesCount,
      playerOneCollectedChocolatesCount,
      playerTwoCollectedChocolatesCount,
    } = scoreConfig;

    let newTotalCollectedChocolatesCount = totalCollectedChocolatesCount;
    let newPlayerOneCollectedChocolatesCount =
      playerOneCollectedChocolatesCount;
    let newPlayerTwoCollectedChocolatesCount =
      playerTwoCollectedChocolatesCount;

    const tileChocolateCount =
      gridConfig[currentPlayerRowIndex][currentPlayerColIndex];

    if (
      currentPlayerRowIndex === otherPlayerRowIndex &&
      currentPlayerColIndex === otherPlayerColIndex
    ) {
      newTotalCollectedChocolatesCount += tileChocolateCount;
      newPlayerOneCollectedChocolatesCount += tileChocolateCount;
      newPlayerTwoCollectedChocolatesCount += tileChocolateCount;
    } else {
      newTotalCollectedChocolatesCount += tileChocolateCount;

      if (currentPlayer === "p1") {
        newPlayerOneCollectedChocolatesCount += tileChocolateCount;
      } else {
        newPlayerTwoCollectedChocolatesCount += tileChocolateCount;
      }
    }

    // update the score config
    scoreConfig.totalCollectedChocolatesCount =
      newTotalCollectedChocolatesCount;
    scoreConfig.playerOneCollectedChocolatesCount =
      newPlayerOneCollectedChocolatesCount;
    scoreConfig.playerTwoCollectedChocolatesCount =
      newPlayerTwoCollectedChocolatesCount;
  }

  function navigatePlayerCoin(direction) {
    const currentPlayerConfig = playersConfig[currentPlayer];

    const { rowIndex, colIndex } = currentPlayerConfig;

    const prevColIndex = colIndex - 1;
    const nextColIndex = colIndex + 1;

    const nextRowIndex = rowIndex + 1;

    let newRowIndex = rowIndex;
    let newColIndex = colIndex;

    // check grid bounds and move the coin in the desired direction
    switch (direction) {
      case "DOWN": {
        if (rowIndex + 1 < n) {
          newRowIndex = nextRowIndex;
        }
        break;
      }
      case "DIAGONALLY_RIGHT": {
        if (nextRowIndex < n && nextColIndex < n) {
          newRowIndex = nextRowIndex;
          newColIndex = nextColIndex;
        }
        break;
      }
      case "DIAGONALLY_LEFT": {
        if (nextRowIndex < n && prevColIndex >= 0) {
          newRowIndex = nextRowIndex;
          newColIndex = prevColIndex;
        }
        break;
      }
    }

    currentPlayerConfig.rowIndex = newRowIndex;
    currentPlayerConfig.colIndex = newColIndex;

    visitedCells.push(`${newRowIndex}_${newColIndex}_${currentPlayer}`);

    collectChocolates();

    refreshGrid();
  }

  function renderScoreCard() {
    const playerOneScoreContainerDiv = getDomElementById(
      "p1-score-container-div"
    );
    const playerTwoScoreContainerDiv = getDomElementById(
      "p2-score-container-div"
    );
    const totalScoreDiv = getDomElementById("total-score-div");

    const {
      playerOneCollectedChocolatesCount,
      playerTwoCollectedChocolatesCount,
      totalCollectedChocolatesCount,
    } = scoreConfig;

    playerOneScoreContainerDiv.innerText = `Player One : ${playerOneCollectedChocolatesCount}`;
    playerTwoScoreContainerDiv.innerText = `Player Two: ${playerTwoCollectedChocolatesCount}`;
    totalScoreDiv.innerText = `Total Score: ${totalCollectedChocolatesCount}`;
  }

  function renderGrid() {
    const gridContainerElement = getDomElementById(
      "board-game-grid-container-div"
    );
    gridContainerElement.innerHTML = "";

    for (let r = 0; r < gridConfig.length; r++) {
      const gridRow = gridConfig[r];

      const gridRowElement = document.createElement("div");
      gridRowElement.classList.add("grid-row");

      for (let c = 0; c < gridRow.length; c++) {
        const choclateCount = gridRow[c];

        const gridTileElement = document.createElement("div");
        gridTileElement.classList.add("tile-container");

        gridTileElement.innerText = choclateCount;

        const { rowIndex: playerOneRowIndex, colIndex: playerOneColIndex } =
          playersConfig.p1;
        const { rowIndex: playerTwoRowIndex, colIndex: playerTwoColIndex } =
          playersConfig.p2;

        // append player-coin to tile
        function addPlayerMarkerToTile(playerClassNamePrefix, player = null) {
          let activePlayerCoinClass = null;
          let visitedTileClass = null;

          // switch (currentPlayer) {
          //   case "p1": {
          //     if (
          //       visitedCells.includes(
          //         `${playerOneRowIndex}_${playerOneColIndex}_${currentPlayer}`
          //       )
          //     ) {
          //       visitedTileClass = "player-one-visited-tile";
          //     }
          //     break;
          //   }
          //   case "p2": {
          //     if (
          //       visitedCells.includes(
          //         `${playerTwoRowIndex}_${playerTwoColIndex}_${currentPlayer}`
          //       )
          //     ) {
          //       visitedTileClass = "player-two-visited-tile";
          //     }
          //     break;
          //   }
          // }

          if (player === currentPlayer) {
            activePlayerCoinClass = "active";
          }

          gridTileElement.classList.add(
            `${playerClassNamePrefix}-coin-container`
          );

          // highlight cell containing the active player
          if (activePlayerCoinClass) {
            gridTileElement.classList.add(activePlayerCoinClass);
          }

          // to highlight visited cells
          if (visitedTileClass) {
            gridTileElement.classList.add(visitedTileClass);
          }
        }

        if (playerOneRowIndex === r && playerOneColIndex === c) {
          addPlayerMarkerToTile("player-one", "p1");
        }
        if (playerTwoRowIndex === r && playerTwoColIndex === c) {
          addPlayerMarkerToTile("player-two", "p2");
        }

        if (
          playerOneRowIndex === playerTwoRowIndex &&
          playerOneColIndex === playerTwoColIndex
        ) {
          addPlayerMarkerToTile("players-intersect", "null");
        }

        // append tiles to row
        gridRowElement.appendChild(gridTileElement);
      }

      // append row to grid
      gridContainerElement.appendChild(gridRowElement);
    }
  }
});

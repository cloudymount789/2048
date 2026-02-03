document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const cells = Array.from(document.querySelectorAll('.cell'));
    const scoreElement = document.getElementById('score');
    const timeElement = document.getElementById('time');
    const bestTimeElement = document.getElementById('best-time');
    const bestScoreElement = document.getElementById('best-score');
    const newGameButton = document.getElementById('new-game');

    let gridArray = Array(4).fill().map(() => Array(4).fill(0));
    let score = 0;
    let startTime;
    let timerInterval;
    let bestSpeed = localStorage.getItem('bestSpeed') || 0;

    bestTimeElement.textContent = bestSpeed ? `${bestSpeed.toFixed(2)}分/秒` : '无记录';

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    }

    function canMove() {
        // Check if there are empty cells
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (gridArray[r][c] === 0) return true;
            }
        }
        // Check if adjacent cells can merge
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 3; c++) {
                if (gridArray[r][c] === gridArray[r][c+1]) return true;
            }
        }
        for (let c = 0; c < 4; c++) {
            for (let r = 0; r < 3; r++) {
                if (gridArray[r][c] === gridArray[r+1][c]) return true;
            }
        }
        return false;
    }

    function checkGameOver() {
        if (!canMove()) {
            clearInterval(timerInterval);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const speed = elapsed > 0 ? score / elapsed : 0;
            if (speed > bestSpeed) {
                bestSpeed = speed;
                localStorage.setItem('bestSpeed', bestSpeed);
                bestTimeElement.textContent = `${bestSpeed.toFixed(2)}分/秒`;
            }
            alert(`游戏结束！分数：${score}，速度：${speed.toFixed(2)}分/秒`);
        }
    }

    function updateDisplay() {
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = gridArray[row][col];
            cell.textContent = value || '';
            cell.className = 'cell';
            if (value) {
                cell.classList.add(`tile-${value}`);
            }
        });
        scoreElement.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
            bestScoreElement.textContent = bestScore;
        }
    }

    function addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (gridArray[r][c] === 0) {
                    emptyCells.push({r, c});
                }
            }
        }
        if (emptyCells.length > 0) {
            const {r, c} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            gridArray[r][c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    function move(direction) {
        let moved = false;
        let newGrid = Array(4).fill().map(() => Array(4).fill(0));
        let newScore = score;

        function slide(row) {
            let newRow = [0, 0, 0, 0];
            let j = 0;
            for (let i = 0; i < 4; i++) {
                if (row[i] !== 0) {
                    if (newRow[j] === 0) {
                        newRow[j] = row[i];
                    } else if (newRow[j] === row[i]) {
                        newRow[j] *= 2;
                        newScore += newRow[j];
                        j++;
                    } else {
                        j++;
                        newRow[j] = row[i];
                    }
                }
            }
            return newRow;
        }

        if (direction === 'left') {
            for (let r = 0; r < 4; r++) {
                const newRow = slide(gridArray[r]);
                if (JSON.stringify(newRow) !== JSON.stringify(gridArray[r])) moved = true;
                newGrid[r] = newRow;
            }
        } else if (direction === 'right') {
            for (let r = 0; r < 4; r++) {
                const reversed = gridArray[r].slice().reverse();
                const slid = slide(reversed);
                const newRow = slid.reverse();
                if (JSON.stringify(newRow) !== JSON.stringify(gridArray[r])) moved = true;
                newGrid[r] = newRow;
            }
        } else if (direction === 'up') {
            for (let c = 0; c < 4; c++) {
                const col = [gridArray[0][c], gridArray[1][c], gridArray[2][c], gridArray[3][c]];
                const slid = slide(col);
                for (let r = 0; r < 4; r++) {
                    newGrid[r][c] = slid[r];
                }
                if (JSON.stringify(slid) !== JSON.stringify(col)) moved = true;
            }
        } else if (direction === 'down') {
            for (let c = 0; c < 4; c++) {
                const col = [gridArray[0][c], gridArray[1][c], gridArray[2][c], gridArray[3][c]];
                const reversedCol = col.slice().reverse();
                const slid = slide(reversedCol);
                const newCol = slid.reverse();
                for (let r = 0; r < 4; r++) {
                    newGrid[r][c] = newCol[r];
                }
                if (JSON.stringify(newCol) !== JSON.stringify(col)) moved = true;
            }
        }

        if (moved) {
            gridArray = newGrid;
            score = newScore;
            addRandomTile();
            updateDisplay();
            checkWin();
            checkGameOver();
        }
    }

    function checkWin() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (gridArray[r][c] === 2048) {
                    const elapsed = Math.floor((Date.now() - startTime) / 1000);
                    const speed = elapsed > 0 ? score / elapsed : 0;
                    if (speed > bestSpeed) {
                        bestSpeed = speed;
                        localStorage.setItem('bestSpeed', bestSpeed);
                        bestTimeElement.textContent = `${bestSpeed.toFixed(2)}分/秒`;
                    }
                    alert('恭喜！你达到了2048！');
                    return;
                }
            }
        }
    }

    function startNewGame() {
        // Calculate speed for previous game if applicable
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const speed = elapsed > 0 ? score / elapsed : 0;
            if (speed > bestSpeed) {
                bestSpeed = speed;
                localStorage.setItem('bestSpeed', bestSpeed);
                bestTimeElement.textContent = `${bestSpeed.toFixed(2)}分/秒`;
            }
        }
        gridArray = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        startTime = Date.now();
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            timeElement.textContent = formatTime(elapsed);
        }, 1000);
        addRandomTile();
        addRandomTile();
        updateDisplay();
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') move('left');
        else if (e.key === 'ArrowRight') move('right');
        else if (e.key === 'ArrowUp') move('up');
        else if (e.key === 'ArrowDown') move('down');
    });

    newGameButton.addEventListener('click', startNewGame);

    // 初始化
    startNewGame();
});
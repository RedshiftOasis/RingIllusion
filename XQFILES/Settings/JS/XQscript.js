document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('board');
    
    const gameState = {
        currentPlayer: 'red',
        selectedCell: null,
        boardData: {}
    };
    
    // 棋子初始位置
    const piecePositions = [
        // 黑方棋子
        { row: 0, col: 0, piece: '車', color: 'black' },
        { row: 0, col: 1, piece: '馬', color: 'black' },
        { row: 0, col: 2, piece: '象', color: 'black' },
        { row: 0, col: 3, piece: '士', color: 'black' },
        { row: 0, col: 4, piece: '將', color: 'black' },
        { row: 0, col: 5, piece: '士', color: 'black' },
        { row: 0, col: 6, piece: '象', color: 'black' },
        { row: 0, col: 7, piece: '馬', color: 'black' },
        { row: 0, col: 8, piece: '車', color: 'black' },
        { row: 2, col: 1, piece: '砲', color: 'black' },
        { row: 2, col: 7, piece: '砲', color: 'black' },
        { row: 3, col: 0, piece: '卒', color: 'black' },
        { row: 3, col: 2, piece: '卒', color: 'black' },
        { row: 3, col: 4, piece: '卒', color: 'black' },
        { row: 3, col: 6, piece: '卒', color: 'black' },
        { row: 3, col: 8, piece: '卒', color: 'black' },
        
        // 红方棋子
        { row: 9, col: 0, piece: '車', color: 'red' },
        { row: 9, col: 1, piece: '馬', color: 'red' },
        { row: 9, col: 2, piece: '相', color: 'red' },
        { row: 9, col: 3, piece: '仕', color: 'red' },
        { row: 9, col: 4, piece: '帥', color: 'red' },
        { row: 9, col: 5, piece: '仕', color: 'red' },
        { row: 9, col: 6, piece: '相', color: 'red' },
        { row: 9, col: 7, piece: '馬', color: 'red' },
        { row: 9, col: 8, piece: '車', color: 'red' },
        { row: 7, col: 1, piece: '炮', color: 'red' },
        { row: 7, col: 7, piece: '炮', color: 'red' },
        { row: 6, col: 0, piece: '兵', color: 'red' },
        { row: 6, col: 2, piece: '兵', color: 'red' },
        { row: 6, col: 4, piece: '兵', color: 'red' },
        { row: 6, col: 6, piece: '兵', color: 'red' },
        { row: 6, col: 8, piece: '兵', color: 'red' }
    ];

    // 棋子类型映射
    const pieceTypes = {
        '車': 'rook', '车': 'rook',
        '馬': 'horse', '马': 'horse',
        '象': 'elephant', '相': 'elephant',
        '士': 'advisor', '仕': 'advisor',
        '將': 'king', '帥': 'king',
        '砲': 'cannon', '炮': 'cannon',
        '卒': 'pawn', '兵': 'pawn'
    };

    // 初始化游戏
    function initGame() {
        board.innerHTML = '';
        createBoardBackground();
        drawBoardGrid();
        initBoardData();
        placePieces();
        updatePlayerTurn();
    }

    // 创建棋盘背景
    function createBoardBackground() {
        const gradientBg = document.createElement('div');
        gradientBg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            background: linear-gradient(45deg,
                rgba(32, 32, 64, 0.1) 0%,
                rgba(64, 128, 255, 0.15) 25%,
                rgba(128, 192, 255, 0.2) 50%,
                rgba(64, 128, 255, 0.15) 75%,
                rgba(32, 32, 64, 0.1) 100%),
                radial-gradient(circle at 30% 30%, rgba(100, 180, 255, 0.1) 0%, transparent 50%);
            animation: futuristicGlow 8s ease-in-out infinite alternate;
        `;
        board.appendChild(gradientBg);
        
        // 添加边框发光效果
        const boardGlow = document.createElement('div');
        boardGlow.style.cssText = `
            position: absolute;
            top: -10px;
            left: -10px;
            width: calc(100% + 20px);
            height: calc(100% + 20px);
            border-radius: 5px;
            z-index: -1;
            background: linear-gradient(45deg, #4060ff, #60a0ff, #80c0ff, #60a0ff, #4060ff);
            background-size: 400% 400%;
            animation: borderGlow 3s ease-in-out infinite alternate;
            filter: blur(8px);
            opacity: 0.7;
        `;
        board.insertBefore(boardGlow, board.firstChild);
    }

    // 绘制棋盘网格
    function drawBoardGrid() {
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("style", "position: absolute; top: 0; left: 0; z-index: 1; pointer-events: none;");
        
        // 计算棋盘格子的尺寸和位置
        const cols = 9;
        const rows = 10;
        const boardWidth = 450;  // 参考宽度
        const boardHeight = 500; // 参考高度
        const cellSize = 50;
        const startX = (boardWidth - (cols - 1) * cellSize) / 2;
        const startY = (boardHeight - (rows - 1) * cellSize) / 2;
        
        // 设置viewBox以保持比例
        svg.setAttribute("viewBox", `0 0 ${boardWidth} ${boardHeight}`);
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        
        // 绘制垂直线条
        for (let i = 0; i < cols; i++) {
            const verticalLine = document.createElementNS(svgNS, "line");
            verticalLine.setAttribute("x1", startX + i * cellSize);
            verticalLine.setAttribute("y1", startY);
            verticalLine.setAttribute("x2", startX + i * cellSize);
            verticalLine.setAttribute("y2", startY + (rows - 1) * cellSize);
            verticalLine.setAttribute("stroke", "rgba(100, 180, 255, 0.8)");
            verticalLine.setAttribute("stroke-width", "2");
            verticalLine.setAttribute("style", "animation: lineGlow 2s ease-in-out infinite;");
            svg.appendChild(verticalLine);
        }
        
        // 绘制水平线条
        for (let i = 0; i < rows; i++) {
            const horizontalLine = document.createElementNS(svgNS, "line");
            horizontalLine.setAttribute("x1", startX);
            horizontalLine.setAttribute("y1", startY + i * cellSize);
            horizontalLine.setAttribute("x2", startX + (cols - 1) * cellSize);
            horizontalLine.setAttribute("y2", startY + i * cellSize);
            horizontalLine.setAttribute("stroke", "rgba(100, 180, 255, 0.8)");
            horizontalLine.setAttribute("stroke-width", "2");
            horizontalLine.setAttribute("style", "animation: lineGlow 2s ease-in-out infinite;");
            svg.appendChild(horizontalLine);
        }
        
        // 绘制九宫格斜线
        const palaceLines = [
            { x1: startX + 3 * cellSize, y1: startY, x2: startX + 5 * cellSize, y2: startY + 2 * cellSize },
            { x1: startX + 5 * cellSize, y1: startY, x2: startX + 3 * cellSize, y2: startY + 2 * cellSize },
            { x1: startX + 3 * cellSize, y1: startY + 7 * cellSize, x2: startX + 5 * cellSize, y2: startY + 9 * cellSize },
            { x1: startX + 5 * cellSize, y1: startY + 7 * cellSize, x2: startX + 3 * cellSize, y2: startY + 9 * cellSize }
        ];
        
        palaceLines.forEach(line => {
            const palaceLine = document.createElementNS(svgNS, "line");
            palaceLine.setAttribute("x1", line.x1);
            palaceLine.setAttribute("y1", line.y1);
            palaceLine.setAttribute("x2", line.x2);
            palaceLine.setAttribute("y2", line.y2);
            palaceLine.setAttribute("stroke", "rgba(150, 220, 255, 0.9)");
            palaceLine.setAttribute("stroke-width", "1.5");
            palaceLine.setAttribute("style", "animation: lineGlow 1.5s ease-in-out infinite;");
            svg.appendChild(palaceLine);
        });
        
        // 绘制楚河汉界
        const riverLine1 = document.createElementNS(svgNS, "line");
        riverLine1.setAttribute("x1", startX);
        riverLine1.setAttribute("y1", startY + 3.5 * cellSize);
        riverLine1.setAttribute("x2", startX + (cols - 1) * cellSize);
        riverLine1.setAttribute("y2", startY + 3.5 * cellSize);
        riverLine1.setAttribute("stroke", "rgba(200, 230, 255, 0.6)");
        riverLine1.setAttribute("stroke-width", "1");
        riverLine1.setAttribute("stroke-dasharray", "10,5");
        svg.appendChild(riverLine1);
        
        const riverLine2 = document.createElementNS(svgNS, "line");
        riverLine2.setAttribute("x1", startX);
        riverLine2.setAttribute("y1", startY + 5.5 * cellSize);
        riverLine2.setAttribute("x2", startX + (cols - 1) * cellSize);
        riverLine2.setAttribute("y2", startY + 5.5 * cellSize);
        riverLine2.setAttribute("stroke", "rgba(200, 230, 255, 0.6)");
        riverLine2.setAttribute("stroke-width", "1");
        riverLine2.setAttribute("stroke-dasharray", "10,5");
        svg.appendChild(riverLine2);
        
        board.appendChild(svg);
        createClickableCells(startX, startY, cellSize, rows, cols);
    }

    // 创建可点击的单元格
    function createClickableCells(startX, startY, cellSize, rows, cols) {
        // 计算比例，将绝对坐标转换为百分比
        const boardWidth = 450;
        const boardHeight = 500;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.dataset.id = `cell-${row}-${col}`;
                
                // 计算百分比位置
                const leftPercent = ((startX + col * cellSize - cellSize/2) / boardWidth) * 100;
                const topPercent = ((startY + row * cellSize - cellSize/2) / boardHeight) * 100;
                
                cell.style.cssText = `
                    left: ${leftPercent}%;
                    top: ${topPercent}%;
                    width: ${(cellSize / boardWidth) * 100}%;
                    height: ${(cellSize / boardHeight) * 100}%;
                `;
                
                cell.addEventListener('mouseenter', function() {
                    if (!this.classList.contains('occupied')) {
                        this.style.backgroundColor = 'rgba(100, 180, 255, 0.1)';
                        this.style.boxShadow = '0 0 10px rgba(100, 180, 255, 0.5)';
                    }
                });
                
                cell.addEventListener('mouseleave', function() {
                    if (!this.classList.contains('occupied') && !this.classList.contains('selected')) {
                        this.style.backgroundColor = '';
                        this.style.boxShadow = '';
                    }
                });
                
                cell.addEventListener('click', handleCellClick);
                board.appendChild(cell);
            }
        }
    }

    // 初始化棋盘数据
    function initBoardData() {
        gameState.selectedCell = null;
        gameState.boardData = {};
        
        // 初始化空棋盘
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 9; col++) {
                gameState.boardData[`${row}-${col}`] = null;
            }
        }
        
        // 放置初始棋子
        piecePositions.forEach(coord => {
            const cellId = `${coord.row}-${coord.col}`;
            gameState.boardData[cellId] = {
                piece: coord.piece,
                type: pieceTypes[coord.piece],
                color: coord.color
            };
        });
    }

    // 放置棋子
    function placePieces() {
        piecePositions.forEach(coord => {
            const cell = document.querySelector(`[data-id="cell-${coord.row}-${coord.col}"]`);
            if (cell) {
                createPiece(cell, coord.piece, coord.color);
            }
        });
    }

    // 创建棋子元素
    function createPiece(cell, piece, color) {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'piece';
        pieceElement.textContent = piece;
        pieceElement.dataset.piece = piece;
        pieceElement.dataset.color = color;
        
        if (color === 'black') {
            pieceElement.classList.add('black-piece');
        }
        
        cell.appendChild(pieceElement);
        cell.classList.add('occupied');
    }

    // 处理单元格点击
    function handleCellClick(event) {
        const cell = event.currentTarget;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const cellId = `${row}-${col}`;
        const pieceData = gameState.boardData[cellId];
        
        if (pieceData && pieceData.color === gameState.currentPlayer) {
            selectPiece(row, col, pieceData);
        } else if (gameState.selectedCell && cell.classList.contains('possible-move')) {
            movePiece(row, col);
        } else {
            clearSelection();
        }
    }

    // 选择棋子
    function selectPiece(row, col, pieceData) {
        clearSelection();
        const cell = document.querySelector(`[data-id="cell-${row}-${col}"]`);
        if (!cell) return;
        
        gameState.selectedCell = `${row}-${col}`;
        cell.classList.add('selected');
        const moves = getPossibleMoves(row, col, pieceData);
        highlightPossibleMoves(moves);
    }

    // 获取可能的移动位置
    function getPossibleMoves(row, col, pieceData) {
        const moves = [];
        const pieceType = pieceTypes[pieceData.piece];
        const isBlack = pieceData.color === 'black';
        
        switch(pieceType) {
            case 'rook':
                getRookMoves(row, col, pieceData.color, moves);
                break;
            case 'horse':
                getHorseMoves(row, col, pieceData.color, moves);
                break;
            case 'elephant':
                getElephantMoves(row, col, pieceData.color, moves);
                break;
            case 'advisor':
                getAdvisorMoves(row, col, pieceData.color, moves);
                break;
            case 'king':
                getKingMoves(row, col, pieceData.color, moves);
                break;
            case 'cannon':
                getCannonMoves(row, col, pieceData.color, moves);
                break;
            case 'pawn':
                getPawnMoves(row, col, pieceData.color, moves);
                break;
        }
        
        return moves.filter(([newRow, newCol]) => {
            if (newRow < 0 || newRow >= 10 || newCol < 0 || newCol >= 9) return false;
            const targetPiece = gameState.boardData[`${newRow}-${newCol}`];
            if (targetPiece && targetPiece.color === pieceData.color) return false;
            return true;
        });
    }

    // 车（車）的移动规则
    function getRookMoves(row, col, color, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dx, dy]) => {
            let i = 1;
            while (true) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow < 0 || newRow >= 10 || newCol < 0 || newCol >= 9) break;
                
                const targetPiece = gameState.boardData[`${newRow}-${newCol}`];
                moves.push([newRow, newCol]);
                
                if (targetPiece) break;
                i++;
            }
        });
    }

    // 马（馬）的移动规则
    function getHorseMoves(row, col, color, moves) {
        const horseMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        horseMoves.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            
            // 检查马腿
            const legRow = row + Math.sign(dx) * (Math.abs(dx) > 1 ? 1 : 0);
            const legCol = col + Math.sign(dy) * (Math.abs(dy) > 1 ? 1 : 0);
            
            if (!gameState.boardData[`${legRow}-${legCol}`]) {
                moves.push([newRow, newCol]);
            }
        });
    }

    // 象（相）的移动规则
    function getElephantMoves(row, col, color, moves) {
        const elephantMoves = [
            [-2, -2], [-2, 2], [2, -2], [2, 2]
        ];
        
        const isRed = color === 'red';
        
        elephantMoves.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            
            // 检查象眼
            const eyeRow = row + dx / 2;
            const eyeCol = col + dy / 2;
            
            // 不能过河
            if ((isRed && newRow > 4) || (!isRed && newRow < 5)) {
                if (!gameState.boardData[`${eyeRow}-${eyeCol}`]) {
                    moves.push([newRow, newCol]);
                }
            }
        });
    }

    // 士（仕）的移动规则
    function getAdvisorMoves(row, col, color, moves) {
        const advisorMoves = [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
        ];
        
        const isRed = color === 'red';
        const palaceRows = isRed ? [7, 8, 9] : [0, 1, 2];
        const palaceCols = [3, 4, 5];
        
        advisorMoves.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (palaceRows.includes(newRow) && palaceCols.includes(newCol)) {
                moves.push([newRow, newCol]);
            }
        });
    }

    // 将（帥）的移动规则
    function getKingMoves(row, col, color, moves) {
        const kingMoves = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];
        
        const isRed = color === 'red';
        const palaceRows = isRed ? [7, 8, 9] : [0, 1, 2];
        const palaceCols = [3, 4, 5];
        
        kingMoves.forEach(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            
            if (palaceRows.includes(newRow) && palaceCols.includes(newCol)) {
                moves.push([newRow, newCol]);
            }
        });
    }

    // 炮（砲）的移动规则
    function getCannonMoves(row, col, color, moves) {
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        directions.forEach(([dx, dy]) => {
            let i = 1;
            let hasJumped = false;
            
            while (true) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                
                if (newRow < 0 || newRow >= 10 || newCol < 0 || newCol >= 9) break;
                
                const targetPiece = gameState.boardData[`${newRow}-${newCol}`];
                
                if (!targetPiece && !hasJumped) {
                    moves.push([newRow, newCol]);
                } else if (targetPiece && !hasJumped) {
                    hasJumped = true;
                } else if (targetPiece && hasJumped && targetPiece.color !== color) {
                    moves.push([newRow, newCol]);
                    break;
                } else if (targetPiece && hasJumped) {
                    break;
                }
                
                i++;
            }
        });
    }

    // 兵（卒）的移动规则
    function getPawnMoves(row, col, color, moves) {
        const isRed = color === 'red';
        const forward = isRed ? -1 : 1;
        const isCrossedRiver = isRed ? row <= 4 : row >= 5;
        
        // 前进
        moves.push([row + forward, col]);
        
        // 过河后可以左右移动
        if (isCrossedRiver) {
            moves.push([row, col - 1]);
            moves.push([row, col + 1]);
        }
    }

    // 高亮可能的移动位置
    function highlightPossibleMoves(moves) {
        moves.forEach(([row, col]) => {
            const cell = document.querySelector(`[data-id="cell-${row}-${col}"]`);
            if (cell) {
                cell.classList.add('possible-move');
            }
        });
    }

    // 移动棋子
    function movePiece(targetRow, targetCol) {
        if (!gameState.selectedCell) return;
        
        const [srcRow, srcCol] = gameState.selectedCell.split('-').map(Number);
        const srcCellId = gameState.selectedCell;
        const targetCellId = `${targetRow}-${targetCol}`;
        
        const srcCell = document.querySelector(`[data-id="cell-${srcRow}-${srcCol}"]`);
        const targetCell = document.querySelector(`[data-id="cell-${targetRow}-${targetCol}"]`);
        
        if (!srcCell || !targetCell) return;
        
        const pieceData = gameState.boardData[srcCellId];
        const capturedPiece = gameState.boardData[targetCellId];
        
        // 检查是否将军
        if (capturedPiece && capturedPiece.type === 'king') {
            setTimeout(() => {
                alert(`${pieceData.color === 'red' ? '红方' : '黑方'}获胜！`);
                initGame();
            }, 100);
            return;
        }
        
        // 移动棋子
        const pieceElement = srcCell.querySelector('.piece');
        
        if (capturedPiece) {
            targetCell.innerHTML = '';
            targetCell.classList.remove('occupied');
        }
        
        targetCell.appendChild(pieceElement);
        targetCell.classList.add('occupied');
        srcCell.classList.remove('occupied');
        srcCell.innerHTML = '';
        
        // 更新游戏状态
        gameState.boardData[targetCellId] = {...pieceData};
        gameState.boardData[srcCellId] = null;
        
        clearSelection();
        gameState.currentPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
        updatePlayerTurn();
    }

    // 更新玩家回合显示
    function updatePlayerTurn() {
        // 这里可以添加显示当前回合的代码
        console.log(`当前回合: ${gameState.currentPlayer === 'red' ? '红方' : '黑方'}`);
    }

    // 清除选择
    function clearSelection() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.remove('possible-move');
            cell.style.backgroundColor = '';
            cell.style.boxShadow = '';
        });
        gameState.selectedCell = null;
    }

    // 初始化游戏
    initGame();
});
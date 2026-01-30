document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const gridSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let gameInterval;
    let speed = 150; /* 初始速度为毫秒 */
    let score = 0;
    let gameRunning = false;

    // 创建游戏界面
    createBoard();
    createGameInfo();
    createGameOverScreen();

    // 生成食物
    generateFood();

    // 开始游戏
    startGame();

    // 键盘控制
    document.addEventListener('keydown', handleKeyPress);
	
	
    
    // 创建游戏板
    function createBoard() {
        board.innerHTML = '';
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                board.appendChild(cell);
            }
        }
    }
	
	
	
    function createGameInfo() {
        const gameInfo = document.createElement('div');
        gameInfo.className = 'game-info';
        gameInfo.innerHTML = `
            <div class="info-item">
                <div class="info-label">分数</div>
                <div class="info-value" id="score">0</div>
            </div>
            <div class="info-item">
                <div class="info-label">长度</div>
                <div class="info-value" id="length">1</div>
            </div>
            <div class="info-item">
                <div class="info-label">速度</div>
                <div class="info-value" id="speed">${speed}ms</div>
            </div>
        `;
        board.parentNode.insertBefore(gameInfo, board.nextSibling);
		
        const controls = document.createElement('div');
        controls.className = 'controls';
        gameInfo.parentNode.insertBefore(controls, gameInfo.nextSibling);
        
		// 移动端控制按钮
        createMobileControls();
    }
	
	
    // 移动端控制按钮
    function createMobileControls() {
        const mobileControls = document.createElement('div');
        mobileControls.className = 'mobile-controls';
        mobileControls.innerHTML = `
            <div class="control-row">
                <div class="control-button" data-action="up">⇧</div>
            </div>
            <div class="control-row">
                <div class="control-button" data-action="left">⇦</div>
                <div class="control-button" data-action="down">⇩</div>
                <div class="control-button" data-action="right">⇨</div>
            </div>
        `;
        
        // 将移动控制按钮插入到游戏板后面
        board.parentNode.insertBefore(mobileControls, board.nextSibling.nextSibling);
        
        // 为移动控制按钮添加事件监听
        mobileControls.querySelectorAll('.control-button').forEach(button => {
            button.addEventListener('touchstart', handleTouchControl);
            button.addEventListener('mousedown', handleTouchControl);
        });
    }
	
    // 触摸/鼠标控制
    function handleTouchControl(e) {
        if (!gameRunning) return;
        
        e.preventDefault();
        const action = e.currentTarget.dataset.action;
        
        switch (action) {
            case 'up':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'down':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'left':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'right':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
        
        // 为触摸设备添加触觉反馈
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
    }
	
    // 重新绑定移动控制事件
    function bindMobileControls() {
        const mobileControls = document.querySelector('.mobile-controls');
        if (mobileControls) {
            mobileControls.querySelectorAll('.control-button').forEach(button => {
                button.addEventListener('touchstart', handleTouchControl);
                button.addEventListener('mousedown', handleTouchControl);
            });
        }
    }
	
    
    // 创建游戏结束屏幕
    function createGameOverScreen() {
        const gameOverScreen = document.createElement('div');
        gameOverScreen.className = 'game-over';
        gameOverScreen.id = 'gameOverScreen';
        gameOverScreen.innerHTML = `
            <p>最终分数为<span id="finalScore">0</span>分</p>
            <p>蛇的格数为<span id="finalLength">1</span>格</p>
            <button onclick="restartGame()">↻</button>
        `;
        document.querySelector('.game-container').appendChild(gameOverScreen);
    }

    // 生成食物
    function generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * gridSize),
                y: Math.floor(Math.random() * gridSize)
            };
        } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        food = newFood;
    }

    // 绘制游戏
    function draw() {
        // 清除所有单元格的样式
        document.querySelectorAll('.cell').forEach(cell => {
            cell.className = 'cell';
        });

        // 绘制蛇
        snake.forEach((segment, index) => {
            const cell = document.querySelector(`.cell[data-row="${segment.y}"][data-col="${segment.x}"]`);
            if (cell) {
                if (index === 0) {
                    cell.classList.add('snake-head');
                } else {
                    cell.classList.add('snake-body');
                    // 为身体添加渐变色效果
                    const alpha = 1 - (index / snake.length) * 0.7;
                    cell.style.opacity = alpha;
                }
            }
        });

        // 绘制食物
        const foodCell = document.querySelector(`.cell[data-row="${food.y}"][data-col="${food.x}"]`);
        if (foodCell) {
            foodCell.classList.add('food');
        }

        // 更新游戏信息
        document.getElementById('score').textContent = score;
        document.getElementById('length').textContent = snake.length;
        document.getElementById('speed').textContent = `${speed}ms`;
    }

    // 移动蛇
    function moveSnake() {
        direction = nextDirection;

        // 创建新的蛇头
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up':
                head.y = (head.y - 1 + gridSize) % gridSize;
                break;
            case 'down':
                head.y = (head.y + 1) % gridSize;
                break;
            case 'left':
                head.x = (head.x - 1 + gridSize) % gridSize;
                break;
            case 'right':
                head.x = (head.x + 1) % gridSize;
                break;
        }

        // 检查是否撞到自己
        if (snake.some((segment, index) => 
            index > 0 && segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        // 添加新的头部
        snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            // 增加分数
            score += 10;
            
            // 根据长度调整速度（吃的越多速度越快）
            speed = Math.max(50, 150 - Math.floor(snake.length / 5) * 10);
            
            // 生成新食物
            generateFood();
            
            // 重新设置游戏循环间隔
            if (gameRunning) {
                clearInterval(gameInterval);
                gameInterval = setInterval(moveSnake, speed);
            }
        } else {
            // 如果没有吃到食物，移除尾部
            snake.pop();
        }

        // 重新绘制
        draw();
    }

    // 处理按键
    function handleKeyPress(event) {
        if (!gameRunning) return;

        switch (event.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                break;
        }
    }
	
    // 开始游戏
    function startGame() {
        if (gameRunning) return;
        
        gameRunning = true;
        snake = [{ x: 10, y: 10 }];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        speed = 150;
        
        generateFood();
        draw();
        
        clearInterval(gameInterval);
        gameInterval = setInterval(moveSnake, speed);
        
        // 隐藏游戏结束屏幕
        document.getElementById('gameOverScreen').style.display = 'none';
        
        // 重新绑定移动控制事件
        bindMobileControls();
    }
	
    // 游戏结束
    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);
        
        // 显示游戏结束屏幕
        const gameOverScreen = document.getElementById('gameOverScreen');
        document.getElementById('finalScore').textContent = score;
        document.getElementById('finalLength').textContent = snake.length;
        gameOverScreen.style.display = 'block';
    }

    // 重新开始游戏（全局函数，供按钮调用）
    window.restartGame = startGame;
});
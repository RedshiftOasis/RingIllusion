        const config = {
            playerSpeed: 6,
            bulletSpeed: 10,
            enemySpeed: 2,
            enemySpawnRate: 100, // 帧数，数字越小生成越快
            heartSpawnRate: 300, // 爱心生成率
            maxEnemies: 30,
            maxHearts: 5,
            stunDuration: 180, // 雷电箭暂停时间帧数
            initialHealth: 10
        };

        // 游戏状态
        const gameState = {
            score: 0,
            health: config.initialHealth,
            gameRunning: false,
            currentWeapon: 'heart', // heart, thunder, normal
            playerX: 0,
            playerY: 0,
            playerWidth: 70,
            playerHeight: 70,
            lastEnemySpawn: 0,
            lastHeartSpawn: 0,
            enemies: [],
            hearts: [],
            bullets: [],
            stunnedEnemies: new Map(), // 记录被雷电箭击中的敌人和剩余暂停时间
            keys: {}
        };

        // 词汇库
        const negativeWords = [
            "自私", "傲慢", "贪婪", "懦弱", "无耻", "懒惰", 
            "嫉妒", "虚伪", "狡猾", "冷漠", "刻薄", "暴躁",
            "悲观", "消极", "胆小", "多疑", "吝啬", "粗鲁"
        ];
        
        const positiveWords = [
            "无私", "谦卑", "知足", "坚强", "高尚", "勤奋",
            "欣赏", "真诚", "正直", "热情", "宽容", "温和",
            "乐观", "积极", "勇敢", "信任", "慷慨", "礼貌"
        ];

        // 获取DOM元素
        const canvas = document.getElementById('game-canvas');
        const ctx = canvas.getContext('2d');
        const player = document.getElementById('player');
        const healthBar = document.getElementById('health-bar');
        const scoreElement = document.getElementById('score');
        const finalScoreElement = document.getElementById('final-score');
        const gameStartScreen = document.getElementById('game-start');
        const gameOverScreen = document.getElementById('game-over');
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        const weaponElements = document.querySelectorAll('.weapon');
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        const shootBtn = document.getElementById('shoot-btn');

        // 初始化血条
        function initHealthBar() {
            healthBar.innerHTML = '';
            for (let i = 0; i < config.initialHealth; i++) {
                const segment = document.createElement('div');
                segment.classList.add('health-segment', 'filled');
                healthBar.appendChild(segment);
            }
        }

        // 更新血条
        function updateHealthBar() {
            const segments = document.querySelectorAll('.health-segment');
            segments.forEach((segment, index) => {
                if (index < gameState.health) {
                    segment.classList.add('filled');
                } else {
                    segment.classList.remove('filled');
                }
            });
        }

        // 切换武器
        function switchWeapon(weaponType) {
            gameState.currentWeapon = weaponType;
            weaponElements.forEach(weapon => {
                if (weapon.dataset.weapon === weaponType) {
                    weapon.classList.add('active');
                } else {
                    weapon.classList.remove('active');
                }
            });
        }

        // 初始化游戏
        function initGame() {
            // 设置画布尺寸
            resizeCanvas();
            
            // 初始化游戏状态
            gameState.score = 0;
            gameState.health = config.initialHealth;
            gameState.playerX = canvas.width / 2 - gameState.playerWidth / 2;
            gameState.playerY = canvas.height - 200;
            gameState.enemies = [];
            gameState.hearts = [];
            gameState.bullets = [];
            gameState.stunnedEnemies.clear();
            gameState.lastEnemySpawn = 0;
            gameState.lastHeartSpawn = 0;
            
            // 更新UI
            scoreElement.textContent = gameState.score;
            finalScoreElement.textContent = gameState.score;
            updateHealthBar();
            
            // 设置玩家初始位置
            player.style.left = `${gameState.playerX}px`;
            player.style.top = `${gameState.playerY}px`;
            
            // 隐藏游戏结束界面，显示游戏界面
            gameOverScreen.style.display = 'none';
            gameStartScreen.style.display = 'none';
            
            // 开始游戏循环
            gameState.gameRunning = true;
            requestAnimationFrame(gameLoop);
        }

        // 调整画布尺寸
        function resizeCanvas() {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        // 生成敌人
        function spawnEnemy() {
            if (gameState.enemies.length >= config.maxEnemies) return;
            
            const negativeIndex = Math.floor(Math.random() * negativeWords.length);
            const word = negativeWords[negativeIndex];
            const positiveWord = positiveWords[negativeIndex];
            
            const enemy = {
                x: Math.random() * (canvas.width - 100) + 50,
                y: -50,
                width: 80,
                height: 40,
                word: word,
                positiveWord: positiveWord,
                speed: Math.random() * 1 + config.enemySpeed,
                isHeart: false,
                isBrokenHeart: Math.random() < 0.1, // 10%的几率是破碎的心
                color: `hsl(${Math.random() * 60}, 70%, 60%)` // 红色到黄色
            };
            
            gameState.enemies.push(enemy);
        }

        // 生成爱心
        function spawnHeart() {
            if (gameState.hearts.length >= config.maxHearts) return;
            
            // 破碎的爱心
            if (Math.random() < 0.3) {
                const brokenHeart = {
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: -30,
                    width: 40,
                    height: 40,
                    symbol: '💔',
                    isBroken: true,
                    speed: Math.random() * 1 + 1.5
                };
                gameState.hearts.push(brokenHeart);
            } 
            // 完整的爱心
            else {
                const heart = {
                    x: Math.random() * (canvas.width - 40) + 20,
                    y: -30,
                    width: 40,
                    height: 40,
                    symbol: '❤️',
                    isBroken: false,
                    speed: Math.random() * 1 + 1.5
                };
                gameState.hearts.push(heart);
            }
        }

        // 射击
        function shoot() {
            const bullet = {
                x: gameState.playerX + gameState.playerWidth / 2 - 5,
                y: gameState.playerY,
                width: 10,
                height: 20,
                type: gameState.currentWeapon,
                speed: config.bulletSpeed
            };
            
            // 根据武器类型设置子弹颜色
            switch (gameState.currentWeapon) {
                case 'heart':
                    bullet.color = '#ff5252';
                    break;
                case 'thunder':
                    bullet.color = '#ffeb3b';
                    break;
                case 'normal':
                    bullet.color = '#4a9eff';
                    break;
            }
            
            gameState.bullets.push(bullet);
        }

        // 更新游戏对象
        function updateGameObjects() {
            // 更新敌人位置
            gameState.enemies.forEach((enemy, index) => {
                // 检查敌人是否被暂停
                if (gameState.stunnedEnemies.has(index)) {
                    const remainingTime = gameState.stunnedEnemies.get(index);
                    if (remainingTime <= 0) {
                        gameState.stunnedEnemies.delete(index);
                    } else {
                        gameState.stunnedEnemies.set(index, remainingTime - 1);
                        return; // 暂停的敌人不移动
                    }
                }
                
                enemy.y += enemy.speed;
                
                // 敌人到达底部
                if (enemy.y > canvas.height) {
                    gameState.enemies.splice(index, 1);
                    
                    // 如果是破碎的心，不扣血
                    if (!enemy.isBrokenHeart) {
                        gameState.health--;
                        updateHealthBar();
                        
                        if (gameState.health <= 0) {
                            gameOver();
                        }
                    }
                }
            });
            
            // 更新爱心位置
            gameState.hearts.forEach((heart, index) => {
                heart.y += heart.speed;
                
                // 爱心到达底部
                if (heart.y > canvas.height) {
                    gameState.hearts.splice(index, 1);
                }
            });
            
            // 更新子弹位置
            gameState.bullets.forEach((bullet, index) => {
                bullet.y -= bullet.speed;
                
                // 子弹超出屏幕
                if (bullet.y < -20) {
                    gameState.bullets.splice(index, 1);
                }
            });
            
            // 生成新敌人
            gameState.lastEnemySpawn++;
            if (gameState.lastEnemySpawn > config.enemySpawnRate) {
                spawnEnemy();
                gameState.lastEnemySpawn = 0;
                
                // 随着游戏进行，敌人生成速度加快
                if (config.enemySpawnRate > 20) {
                    config.enemySpawnRate -= 0.1;
                }
            }
            
            // 生成新爱心
            gameState.lastHeartSpawn++;
            if (gameState.lastHeartSpawn > config.heartSpawnRate) {
                spawnHeart();
                gameState.lastHeartSpawn = 0;
            }
        }

        // 检测碰撞
        function detectCollisions() {
            // 子弹与敌人碰撞
            gameState.bullets.forEach((bullet, bulletIndex) => {
                gameState.enemies.forEach((enemy, enemyIndex) => {
                    if (bullet.x < enemy.x + enemy.width &&
                        bullet.x + bullet.width > enemy.x &&
                        bullet.y < enemy.y + enemy.height &&
                        bullet.y + bullet.height > enemy.y) {
                        
                        // 根据子弹类型处理碰撞
                        switch (bullet.type) {
                            case 'normal':
                                // 普通箭：将贬义词转化为褒义词
                                enemy.word = enemy.positiveWord;
                                enemy.color = `hsl(${120 + Math.random() * 60}, 70%, 60%)`; // 绿色
                                gameState.score += 10;
                                scoreElement.textContent = gameState.score;
                                
                                // 短暂延迟后移除敌人
                                setTimeout(() => {
                                    const idx = gameState.enemies.indexOf(enemy);
                                    if (idx !== -1) {
                                        gameState.enemies.splice(idx, 1);
                                    }
                                }, 300);
                                break;
                                
                            case 'heart':
                                // 爱心箭：将破碎的心转化为完整的心
                                if (enemy.isBrokenHeart) {
                                    enemy.symbol = '❤️';
                                    enemy.isBrokenHeart = false;
                                    enemy.isHeart = true;
                                    gameState.score += 5;
                                    scoreElement.textContent = gameState.score;
                                }
                                break;
                                
                            case 'thunder':
                                // 雷电箭：暂停敌人
                                gameState.stunnedEnemies.set(enemyIndex, config.stunDuration);
                                enemy.color = '#ffeb3b';
                                gameState.score += 5;
                                scoreElement.textContent = gameState.score;
                                break;
                        }
                        
                        // 移除子弹
                        gameState.bullets.splice(bulletIndex, 1);
                    }
                });
                
                // 子弹与爱心碰撞
                gameState.hearts.forEach((heart, heartIndex) => {
                    if (bullet.x < heart.x + heart.width &&
                        bullet.x + bullet.width > heart.x &&
                        bullet.y < heart.y + heart.height &&
                        bullet.y + bullet.height > heart.y) {
                        
                        // 爱心箭可以将破碎的心转化为完整的心
                        if (bullet.type === 'heart' && heart.isBroken) {
                            heart.symbol = '❤️';
                            heart.isBroken = false;
                            gameState.score += 5;
                            scoreElement.textContent = gameState.score;
                        }
                        
                        // 移除子弹
                        gameState.bullets.splice(bulletIndex, 1);
                    }
                });
            });
            
            // 玩家与敌人碰撞
            gameState.enemies.forEach((enemy, index) => {
                if (gameState.playerX < enemy.x + enemy.width &&
                    gameState.playerX + gameState.playerWidth > enemy.x &&
                    gameState.playerY < enemy.y + enemy.height &&
                    gameState.playerY + gameState.playerHeight > enemy.y) {
                    
                    // 如果是破碎的心，不扣血
                    if (!enemy.isBrokenHeart) {
                        gameState.health--;
                        updateHealthBar();
                        
                        if (gameState.health <= 0) {
                            gameOver();
                        }
                    }
                    
                    gameState.enemies.splice(index, 1);
                }
            });
            
            // 玩家与爱心碰撞
            gameState.hearts.forEach((heart, index) => {
                if (gameState.playerX < heart.x + heart.width &&
                    gameState.playerX + gameState.playerWidth > heart.x &&
                    gameState.playerY < heart.y + heart.height &&
                    gameState.playerY + gameState.playerHeight > heart.y) {
                    
                    // 如果是完整的心，回血
                    if (!heart.isBroken) {
                        if (gameState.health < config.initialHealth) {
                            gameState.health++;
                            updateHealthBar();
                        }
                        gameState.score += 15;
                        scoreElement.textContent = gameState.score;
                    }
                    
                    gameState.hearts.splice(index, 1);
                }
            });
        }

        // 绘制游戏对象
        function drawGameObjects() {
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制背景效果
            drawBackground();
            
            // 绘制敌人
            gameState.enemies.forEach(enemy => {
                // 绘制敌人背景
                ctx.fillStyle = enemy.color + '40'; // 半透明
                ctx.fillRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
                ctx.strokeStyle = enemy.color;
                ctx.lineWidth = 2;
                ctx.strokeRect(enemy.x - 5, enemy.y - 5, enemy.width + 10, enemy.height + 10);
                
                // 绘制敌人文字
                ctx.fillStyle = enemy.color;
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // 如果是破碎的心，绘制emoji
                if (enemy.isBrokenHeart) {
                    ctx.font = '24px Arial';
                    ctx.fillText('💔', enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                } else if (enemy.isHeart) {
                    ctx.font = '24px Arial';
                    ctx.fillText('❤️', enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                } else {
                    ctx.fillText(enemy.word, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                }
                
                // 如果敌人被暂停，绘制雷电效果
                if (Array.from(gameState.stunnedEnemies.keys()).some(idx => 
                    gameState.enemies[idx] === enemy)) {
                    ctx.fillStyle = '#ffeb3b80';
                    ctx.beginPath();
                    ctx.arc(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 
                            Math.max(enemy.width, enemy.height) / 2 + 5, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            
            // 绘制爱心
            gameState.hearts.forEach(heart => {
                ctx.font = '30px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(heart.symbol, heart.x + heart.width / 2, heart.y + heart.height / 2);
            });
            
            // 绘制子弹
            gameState.bullets.forEach(bullet => {
                ctx.fillStyle = bullet.color;
                
                // 根据子弹类型绘制不同形状
                switch (bullet.type) {
                    case 'heart':
                        // 绘制爱心形状子弹
                        ctx.beginPath();
                        ctx.moveTo(bullet.x + bullet.width / 2, bullet.y);
                        ctx.bezierCurveTo(
                            bullet.x + bullet.width, bullet.y + bullet.height / 4,
                            bullet.x + bullet.width, bullet.y + bullet.height * 3/4,
                            bullet.x + bullet.width / 2, bullet.y + bullet.height
                        );
                        ctx.bezierCurveTo(
                            bullet.x, bullet.y + bullet.height * 3/4,
                            bullet.x, bullet.y + bullet.height / 4,
                            bullet.x + bullet.width / 2, bullet.y
                        );
                        ctx.fill();
                        break;
                        
                    case 'thunder':
                        // 绘制雷电形状子弹
                        ctx.beginPath();
                        ctx.moveTo(bullet.x + bullet.width / 2, bullet.y);
                        ctx.lineTo(bullet.x + bullet.width * 3/4, bullet.y + bullet.height / 3);
                        ctx.lineTo(bullet.x + bullet.width / 4, bullet.y + bullet.height * 2/3);
                        ctx.lineTo(bullet.x + bullet.width / 2, bullet.y + bullet.height);
                        ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height / 3);
                        ctx.lineTo(bullet.x, bullet.y + bullet.height / 3);
                        ctx.closePath();
                        ctx.fill();
                        break;
                        
                    case 'normal':
                        // 绘制普通箭头形状子弹
                        ctx.beginPath();
                        ctx.moveTo(bullet.x + bullet.width / 2, bullet.y);
                        ctx.lineTo(bullet.x + bullet.width, bullet.y + bullet.height);
                        ctx.lineTo(bullet.x, bullet.y + bullet.height);
                        ctx.closePath();
                        ctx.fill();
                        break;
                }
            });
            
            // 绘制当前武器提示
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.font = '16px Arial';
            ctx.textAlign = 'left';
            let weaponName = '';
            switch (gameState.currentWeapon) {
                case 'heart': weaponName = '爱心箭'; break;
                case 'thunder': weaponName = '雷电箭'; break;
                case 'normal': weaponName = '普通箭'; break;
            }
            // ctx.fillText(`当前持有武器: ${weaponName}`, 20, canvas.height - 160);
        }

        // 绘制背景效果
        function drawBackground() {
            // 绘制渐变背景
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(15, 32, 39, 0.9)');
            gradient.addColorStop(1, 'rgba(44, 83, 100, 0.9)');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 绘制网格线
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            
            // 垂直线
            for (let x = 0; x < canvas.width; x += 50) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            // 水平线
            for (let y = 0; y < canvas.height; y += 50) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }
        }

        // 游戏结束
        function gameOver() {
            gameState.gameRunning = false;
            finalScoreElement.textContent = gameState.score;
            gameOverScreen.style.display = 'flex';
        }

        // 游戏主循环
        function gameLoop() {
            if (!gameState.gameRunning) return;
            
            updateGameObjects();
            detectCollisions();
            drawGameObjects();
            
            requestAnimationFrame(gameLoop);
        }

        // 事件监听器
        window.addEventListener('resize', resizeCanvas);
        
        // 鼠标/触摸移动控制玩家
        canvas.addEventListener('mousemove', (e) => {
            if (!gameState.gameRunning) return;
            
            const rect = canvas.getBoundingClientRect();
            gameState.playerX = e.clientX - rect.left - gameState.playerWidth / 2;
            
            // 限制玩家在画布内移动
            gameState.playerX = Math.max(0, Math.min(canvas.width - gameState.playerWidth, gameState.playerX));
            
            player.style.left = `${gameState.playerX}px`;
        });
        
        // 触摸移动控制（移动设备）
        canvas.addEventListener('touchmove', (e) => {
            if (!gameState.gameRunning) return;
            
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            gameState.playerX = e.touches[0].clientX - rect.left - gameState.playerWidth / 2;
            
            // 限制玩家在画布内移动
            gameState.playerX = Math.max(0, Math.min(canvas.width - gameState.playerWidth, gameState.playerX));
            
            player.style.left = `${gameState.playerX}px`;
        });
        
        // 点击/触摸射击
        canvas.addEventListener('click', () => {
            if (gameState.gameRunning) {
                shoot();
            }
        });
        
        canvas.addEventListener('touchstart', (e) => {
            if (gameState.gameRunning) {
                e.preventDefault();
                shoot();
            }
        });
        
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            gameState.keys[e.key] = true;
            
            // 切换武器
            if (e.key === '1') switchWeapon('heart');
            if (e.key === '2') switchWeapon('thunder');
            if (e.key === '3') switchWeapon('normal');
            
            // 空格键射击
            if (e.key === ' ' && gameState.gameRunning) {
                shoot();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            gameState.keys[e.key] = false;
        });
        
        // 武器切换按钮
        weaponElements.forEach(weapon => {
            weapon.addEventListener('click', () => {
                switchWeapon(weapon.dataset.weapon);
            });
        });
  //       开始和重新开始按钮
		startBtn.addEventListener('click', initGame);
        restartBtn.addEventListener('click', initGame);
		
        // 初始化游戏界面
        initHealthBar();
        resizeCanvas();
        
        // 显示开始界面
        gameStartScreen.style.display = 'flex';
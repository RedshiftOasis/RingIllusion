        const starCanvas = document.getElementById('starCanvas');
        const ringCanvas = document.getElementById('ringCanvas');
        const ball = document.getElementById('ball');
        const instructions = document.getElementById('instructions');
        const completionMessage = document.getElementById('completionMessage');
        const resetButton = document.getElementById('resetButton');
        
        const starCtx = starCanvas.getContext('2d');
        const ringCtx = ringCanvas.getContext('2d');
        
        // 设置画布尺寸
        function resizeCanvas() {
            starCanvas.width = window.innerWidth;
            starCanvas.height = window.innerHeight;
            ringCanvas.width = window.innerWidth;
            ringCanvas.height = window.innerHeight;
            
            // 调整游戏元素
            adjustGameElements();
        }
        
        // 调整游戏元素
        function adjustGameElements() {
            // 屏幕最小尺寸
            const screenMin = Math.min(window.innerWidth, window.innerHeight);
            
            // 圆环半径适应屏幕
            const baseRadius = screenMin * 0.1;
            
            // 圆环配置
            rings.forEach((ring, index) => {
                ring.radius = baseRadius * (index + 1) * 0.9;
            });
            
            // 小圆珠大小
            ballProperties.radius = Math.max(8, Math.min(12, screenMin * 0.02));
            
            // 小圆珠显示
            ball.style.width = `${ballProperties.radius * 2}px`;
            ball.style.height = `${ballProperties.radius * 2}px`;
            
            // 重置小圆珠位置
            if (!gameStarted || gameCompleted) {
                initBall();
            }
        }
        
        // 星星数组
        let stars = [];
        const starCount = 100;
        
        // 圆环配置
        const rings = [
            { radius: 80, width: 5, speed: 0.0005, angle: 0, gapSize: 0.22, completed: false },
            { radius: 120, width: 5, speed: -0.0003, angle: 0.3, gapSize: 0.27, completed: false },
            { radius: 160, width: 5, speed: 0.0004, angle: 0.7, gapSize: 0.32, completed: false },
            { radius: 200, width: 5, speed: -0.0002, angle: 1.2, gapSize: 0.37, completed: false },
            { radius: 240, width: 5, speed: 0.00035, angle: 1.8, gapSize: 0.42, completed: false }
        ];
        
        // 小圆珠属性
        const ballProperties = {
            x: 0,
            y: 0,
            radius: 10,
            vx: 0,
            vy: 0,
            friction: 0.97,
            gravity: 0.08
        };
        
        // 游戏状态
        let gameStarted = false;
        let gameCompleted = false;
        let ringsCompleted = 0;
        let lastTimestamp = 0;
        
        // 设备方向数据
        let beta = 0; // 前后倾斜（-180 到 180）
        let gamma = 0; // 左右倾斜（-90 到 90）
        
        // 初始化星星
        function initStars() {
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * starCanvas.width,
                    y: Math.random() * starCanvas.height,
                    size: Math.random() * 1.5 + 0.5,
                    brightness: Math.random() * 0.5 + 0.5,
                    twinkleSpeed: Math.random() * 0.05 + 0.02,
                    twinklePhase: Math.random() * Math.PI * 2
                });
            }
        }
        
        // 绘制星星
        function drawStars() {
            starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
            
            const currentTime = Date.now() / 1000;
            
            stars.forEach(star => {
                // 计算闪烁效果
                const brightness = star.brightness + Math.sin(currentTime * star.twinkleSpeed + star.twinklePhase) * 0.3;
                
                starCtx.beginPath();
                starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                starCtx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                starCtx.fill();
            });
        }
        
        // 绘制圆环
        function drawRings() {
            ringCtx.clearRect(0, 0, ringCanvas.width, ringCanvas.height);
            
            const centerX = ringCanvas.width / 2;
            const centerY = ringCanvas.height / 2;
            
            rings.forEach(ring => {
                // 更新圆环角度
                ring.angle += ring.speed;
                
                // 计算缺口位置
                const gapStart = ring.angle;
                const gapEnd = ring.angle + ring.gapSize;
                
                ringCtx.beginPath();
                // 绘制圆环（缺）
                ringCtx.arc(centerX, centerY, ring.radius, gapEnd, gapStart + Math.PI * 2);
                ringCtx.lineWidth = ring.width;
                ringCtx.strokeStyle = ring.completed ? '#000000' : 'rgba(255, 255, 255, 0.9)';
                ringCtx.stroke();
                
                // 圆环完成发生消失效果
                if (ring.completed) {
                    ringCtx.beginPath();
                    ringCtx.arc(centerX, centerY, ring.radius, 0, Math.PI * 2);
                    ringCtx.lineWidth = ring.width + 2;
                    ringCtx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
                    ringCtx.stroke();
                }
            });
        }
        
        // 初始化小圆珠位置
        function initBall() {
            ballProperties.x = ringCanvas.width / 2;
            ballProperties.y = ringCanvas.height / 2;
            ballProperties.vx = 0;
            ballProperties.vy = 0;
            
            // 更新DOM元素位置和大小
            ball.style.width = `${ballProperties.radius * 2}px`;
            ball.style.height = `${ballProperties.radius * 2}px`;
            ball.style.left = `${ballProperties.x - ballProperties.radius}px`;
            ball.style.top = `${ballProperties.y - ballProperties.radius}px`;
        }
        
        // 更新小圆珠位置
        function updateBall() {
            if (!gameStarted || gameCompleted) return;
            
            // 应用重力（根据设备倾斜）
            ballProperties.vx += gamma * 0.008;
            ballProperties.vy += beta * 0.008;
            
            // 添加一点向下的重力
            ballProperties.vy += ballProperties.gravity;
            
            // 应用摩擦力
            ballProperties.vx *= ballProperties.friction;
            ballProperties.vy *= ballProperties.friction;
            
            // 更新位置
            ballProperties.x += ballProperties.vx;
            ballProperties.y += ballProperties.vy;
            
            // 边界碰撞检测
            if (ballProperties.x < ballProperties.radius) {
                ballProperties.x = ballProperties.radius;
                ballProperties.vx *= -0.8; // 反弹
            } else if (ballProperties.x > ringCanvas.width - ballProperties.radius) {
                ballProperties.x = ringCanvas.width - ballProperties.radius;
                ballProperties.vx *= -0.8;
            }
            
            if (ballProperties.y < ballProperties.radius) {
                ballProperties.y = ballProperties.radius;
                ballProperties.vy *= -0.8;
            } else if (ballProperties.y > ringCanvas.height - ballProperties.radius) {
                ballProperties.y = ringCanvas.height - ballProperties.radius;
                ballProperties.vy *= -0.8;
            }
            
            // 更新DOM元素位置
            ball.style.left = `${ballProperties.x - ballProperties.radius}px`;
            ball.style.top = `${ballProperties.y - ballProperties.radius}px`;
            
            // 检测是否通过圆环缺口
            checkRingCollision();
        }
        
        // 检测小圆珠与圆环的碰撞
        function checkRingCollision() {
            const centerX = ringCanvas.width / 2;
            const centerY = ringCanvas.height / 2;
            
            rings.forEach((ring, index) => {
                if (ring.completed) return;
                
                // 计算小圆珠到中心点的距离
                const dx = ballProperties.x - centerX;
                const dy = ballProperties.y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // 检查是否在圆环半径范围内
                const ringInnerRadius = ring.radius - ring.width / 2 - ballProperties.radius;
                const ringOuterRadius = ring.radius + ring.width / 2 + ballProperties.radius;
                
                if (distance >= ringInnerRadius && distance <= ringOuterRadius) {
                    // 计算小圆珠相对于圆心的角度
                    let angle = Math.atan2(dy, dx);
                    if (angle < 0) angle += Math.PI * 2;
                    
                    // 计算缺口位置（标准化到0-2π范围）
                    const gapStart = ((ring.angle % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
                    const gapEnd = ((ring.angle + ring.gapSize) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2);
                    
                    // 检查是否在缺口内
                    let isInGap = false;
                    if (gapEnd > gapStart) {
                        // 缺口没有跨越0度
                        isInGap = angle >= gapStart && angle <= gapEnd;
                    } else {
                        // 缺口跨越0度
                        isInGap = angle >= gapStart || angle <= gapEnd;
                    }
                    
                    // 如果不在缺口内，小圆珠被弹回
                    if (!isInGap) {
                        // 计算反弹方向
                        const normalX = dx / distance;
                        const normalY = dy / distance;
                        
                        // 计算反弹力度（基于与圆环的距离）
                        const penetrationDepth = 
                            distance < ring.radius 
                            ? ringInnerRadius - distance 
                            : distance - ringOuterRadius;
                        
                        // 将小圆珠推出圆环
                        ballProperties.x += normalX * penetrationDepth * 0.1;
                        ballProperties.y += normalY * penetrationDepth * 0.1;
                        
                        // 反弹
                        const dotProduct = ballProperties.vx * normalX + ballProperties.vy * normalY;
                        ballProperties.vx = ballProperties.vx - 1.8 * dotProduct * normalX;
                        ballProperties.vy = ballProperties.vy - 1.8 * dotProduct * normalY;
                        
                        // 添加弹性损失
                        ballProperties.vx *= 0.85;
                        ballProperties.vy *= 0.85;
                    } else {
                        // 通过了缺口，标记圆环为已完成
                        ring.completed = true;
                        ringsCompleted++;
                        
                        // 小圆珠通过时改变颜色
                        ball.style.backgroundColor = '#00ff7f';
                        setTimeout(() => {
                            if (!gameCompleted) {
                                ball.style.backgroundColor = '#ff4757';
                            }
                        }, 300);
                        
                        // 检查是否所有圆环都已完成
                        if (ringsCompleted === rings.length) {
                            completeGame();
                        }
                    }
                }
            });
        }
        
        // 游戏完成
        function completeGame() {
            gameCompleted = true;
            completionMessage.textContent = "May the force be with you!";
            completionMessage.style.opacity = 1;
            
            // 通过小圆珠颜色
            ball.style.backgroundColor = '#55ffff';
            ball.style.boxShadow = '0 0 20px rgba(170, 255, 255, 0.9)';
            
            // 显示重置按钮
            resetButton.style.opacity = 1;
            resetButton.style.pointerEvents = 'auto';
        }
        
        // 重置游戏
        function resetGame() {
            rings.forEach(ring => {
                ring.completed = false;
            });
            
            ringsCompleted = 0;
            gameCompleted = false;
            gameStarted = false;
            completionMessage.style.opacity = 0;
            
            // 重置小圆珠颜色
            ball.style.backgroundColor = '#ff4757';
            ball.style.boxShadow = '0 0 15px rgba(255, 71, 87, 0.7)';
            
            // 隐藏重置按钮
            resetButton.style.opacity = 0;
            resetButton.style.pointerEvents = 'none';
            
            // 重新显示提示
            instructions.style.opacity = 0.8;
            setTimeout(() => {
                if (!gameStarted) {
                    instructions.style.opacity = 0;
                }
            }, 3000);
            
            // 重置小圆珠位置
            initBall();
        }
        
        // 设备方向事件处理
        function handleDeviceOrientation(event) {
            if (!gameStarted) {
                gameStarted = true;
                instructions.style.opacity = 0;
            }
            
            // 获取设备倾斜数据
            beta = event.beta || 0;  // 前后倾斜
            gamma = event.gamma || 0; // 左右倾斜
            
            // 限制数值范围
            beta = Math.max(-25, Math.min(25, beta));
            gamma = Math.max(-25, Math.min(25, gamma));
        }
        
        // 处理触摸事件（为不支持陀螺仪的设备提供替代控制）
        function handleTouchMove(event) {
            event.preventDefault();
            
            if (!gameStarted) {
                gameStarted = true;
                instructions.style.opacity = 0;
            }
            
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                // 根据触摸位置计算倾斜角度
                gamma = (touch.clientX - centerX) / centerX * 15;
                beta = (touch.clientY - centerY) / centerY * 15;
                
                // 限制数值范围
                beta = Math.max(-25, Math.min(25, beta));
                gamma = Math.max(-25, Math.min(25, gamma));
            }
        }
        
        // 动画循环
        function animate(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaTime = timestamp - lastTimestamp;
            lastTimestamp = timestamp;
            
            drawStars();
            drawRings();
            updateBall();
            
            requestAnimationFrame(animate);
        }
        
        // 初始化
        function init() {
            resizeCanvas();
            initStars();
            initBall();
            
            // 监听设备方向事件
            if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
                
                // 添加点击事件来请求权限
                const requestPermission = () => {
                    DeviceOrientationEvent.requestPermission()
                        .then(permissionState => {
                            if (permissionState === 'granted') {
                                window.addEventListener('deviceorientation', handleDeviceOrientation);
                                instructions.textContent = "";
                            } else {
                                instructions.textContent = "未检测陀螺仪，请触摸移动小球移动";
                            }
                        })
                        .catch(console.error);
                    
                    // 移除点击事件
                    document.removeEventListener('click', requestPermission);
                    document.removeEventListener('touchstart', requestPermission);
                };
                
                document.addEventListener('click', requestPermission);
                document.addEventListener('touchstart', requestPermission);
            } else if (window.DeviceOrientationEvent) {
                // 支持陀螺仪但不需要权限
                window.addEventListener('deviceorientation', handleDeviceOrientation);
                instructions.textContent = "";
            } else {
                // 不支持陀螺仪，使用触摸控制
                instructions.textContent = "请触摸拖动小球移动";
            }
            
            // 添加触摸控制作备用
            document.addEventListener('touchmove', handleTouchMove, { passive: false });
            
            // 添加重置按钮事件
            resetButton.addEventListener('click', resetGame);
            
            // 监听窗口大小变化
            window.addEventListener('resize', resizeCanvas);
            
            // 初始提示淡出
            setTimeout(() => {
                if (!gameStarted) {
                    instructions.style.opacity = 0;
                }
            }, 5000);
            
            // 启动动画循环
            requestAnimationFrame(animate);
        }
        
        // 页面加载完成后初始化
        window.addEventListener('load', init);
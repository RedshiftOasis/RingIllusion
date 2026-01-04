        // 显示感谢信息
        setTimeout(() => {
            document.getElementById('appreciation').classList.add('show');
        }, 2000);
        
        document.getElementById('closeAppreciation').addEventListener('click', () => {
            document.getElementById('appreciation').classList.remove('show');
        });
        
        // 创建粒子背景
        function createParticles() {
            const container = document.getElementById('particles');
            const particleCount = 40;
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle');
                
                // 随机大小和位置
                const size = Math.random() * 15 + 5;
                const posX = Math.random() * 100;
                const posY = Math.random() * 100 + 100;
                const delay = Math.random() * 15;
                const duration = 15 + Math.random() * 10;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${posX}%`;
                particle.style.top = `${posY}%`;
                particle.style.animationDelay = `${delay}s`;
                particle.style.animationDuration = `${duration}s`;
                
                container.appendChild(particle);
            }
        }
        
        // 初始化Canvas
        const canvas = document.getElementById('gradientCircle');
        const ctx = canvas.getContext('2d');
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let radius = Math.min(canvas.width, canvas.height) * 0.35;
        let lineWidth = 26;
        
        let baseSpeed = 0.015;
        let currentSpeed = baseSpeed;
        
        // 鼠标位置和轨迹点
        let mouseX = null;
        let mouseY = null;
        let isMouseOnCanvas = false;
        let capturePoints = [];
        let captureMode = 'single'; // 'single' or 'multi'
        const maxPoints = 100;
        
        // 设置鼠标事件监听器
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            isMouseOnCanvas = true;
            
            if (captureMode === 'single') {
                capturePoints = [{x: mouseX, y: mouseY}];
            } else {
                // 添加新点，但限制总点数
                capturePoints.push({x: mouseX, y: mouseY});
                if (capturePoints.length > maxPoints) {
                    capturePoints.shift();
                }
            }
        });
        
        canvas.addEventListener('mouseleave', () => {
            isMouseOnCanvas = false;
            mouseX = null;
            mouseY = null;
            
            if (captureMode === 'single') {
                capturePoints = [];
            }
        });
        
        // 点击切换捕捉模式
        const modeToggle = document.getElementById('modeToggle');
        modeToggle.addEventListener('click', () => {
            captureMode = captureMode === 'single' ? 'multi' : 'single';
            capturePoints = [];
            modeToggle.querySelector('span').textContent = 
                captureMode === 'single' ? '单点捕捉模式' : '多点轨迹模式';
        });
        
        // 获取环上某点的颜色
        function getColorAtPoint(x, y) {
            // 计算点到圆心的角度
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > radius + lineWidth/2 || dist < radius - lineWidth/2) {
                return null; // 点不在环上
            }
            
            // 计算角度（0到2π）
            let angle = Math.atan2(dy, dx);
            if (angle < 0) angle += Math.PI * 2;
            
            // 根据角度创建渐变
            const gradient = ctx.createLinearGradient(
                centerX + radius * Math.cos(angle),
                centerY + radius * Math.sin(angle),
                centerX + radius * Math.cos(angle + Math.PI),
                centerY + radius * Math.sin(angle + Math.PI)
            );
            
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#f0aff0');
            gradient.addColorStop(1, '#ff00ff');
            
            return gradient;
        }
        
        function drawGradientCircle(angle) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 绘制背景光晕
            const gradientBg = ctx.createRadialGradient(
                centerX, centerY, radius * 0.3,
                centerX, centerY, radius * 1.8
            );
            gradientBg.addColorStop(0, 'rgba(0, 200, 255, 0.15)');
            gradientBg.addColorStop(1, 'rgba(0, 50, 100, 0)');
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = gradientBg;
            ctx.fill();
            
            // 根据角度动态创建环的渐变
            const gradient = ctx.createLinearGradient(
                centerX + radius * Math.cos(angle),
                centerY + radius * Math.sin(angle),
                centerX + radius * Math.cos(angle + Math.PI),
                centerY + radius * Math.sin(angle + Math.PI)
            );
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#f0aff0');
            
            // 绘制外环光晕
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius + 10, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(240, 175, 240, 0.2)';
            ctx.lineWidth = lineWidth + 10;
            ctx.stroke();

            // 绘制主环
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.lineCap = 'round';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#f0aff0';
            ctx.stroke();
            
            // 绘制中心点
            ctx.beginPath();
            ctx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00ffff';
            ctx.fill();
            
            // 绘制内环
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.3, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
            ctx.stroke();
            
            // 绘制捕捉线条
            if (isMouseOnCanvas && capturePoints.length > 0) {
                if (captureMode === 'single') {
                    // 单点模式 - 绘制从中心到鼠标的线
                    const point = capturePoints[0];
                    const color = getColorAtPoint(point.x, point.y);
                    
                    if (color) {
                        ctx.beginPath();
                        ctx.moveTo(centerX, centerY);
                        ctx.lineTo(point.x, point.y);
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 3;
                        ctx.shadowBlur = 15;
                        ctx.shadowColor = '#f0aff0';
                        ctx.stroke();
                        
                        // 在末端绘制圆点
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
                        ctx.fillStyle = color;
                        ctx.shadowBlur = 20;
                        ctx.fill();
                    }
                } else {
                    // 多点模式 - 绘制轨迹
                    for (let i = 1; i < capturePoints.length; i++) {
                        const prev = capturePoints[i-1];
                        const current = capturePoints[i];
                        const color = getColorAtPoint(current.x, current.y);
                        
                        if (color) {
                            // 绘制连接线
                            ctx.beginPath();
                            ctx.moveTo(prev.x, prev.y);
                            ctx.lineTo(current.x, current.y);
                            ctx.strokeStyle = color;
                            ctx.lineWidth = 3;
                            ctx.shadowBlur = 10;
                            ctx.shadowColor = '#f0aff0';
                            ctx.stroke();
                            
                            // 在末端绘制圆点
                            ctx.beginPath();
                            ctx.arc(current.x, current.y, 6, 0, Math.PI * 2);
                            ctx.fillStyle = color;
                            ctx.shadowBlur = 15;
                            ctx.fill();
                        }
                    }
                }
            }
        }

        let angle = 0;
        function animate() {
            angle += currentSpeed;
            drawGradientCircle(angle);
            requestAnimationFrame(animate);
        }
        
        // 添加鼠标悬停效果
        canvas.addEventListener('mouseenter', () => {
            currentSpeed = baseSpeed * 1.8;
            canvas.style.transform = 'scale(1.03)';
            canvas.style.boxShadow = '0 0 80px rgba(0, 255, 255, 0.5), 0 0 150px rgba(240, 175, 240, 0.3)';
        });
        
        canvas.addEventListener('mouseleave', () => {
            currentSpeed = baseSpeed;
            canvas.style.transform = 'scale(1)';
            canvas.style.boxShadow = '0 0 60px rgba(0, 255, 255, 0.3), 0 0 100px rgba(240, 175, 240, 0.2)';
        });
        
        // 速度控制
        const speedControl = document.getElementById('speedControl');
        speedControl.addEventListener('input', (e) => {
            baseSpeed = parseFloat(e.target.value);
            currentSpeed = baseSpeed;
        });
        
        // 响应窗口大小变化
        function resizeCanvas() {
            const container = document.querySelector('.canvas-container');
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            radius = Math.min(canvas.width, canvas.height) * 0.35;
            drawGradientCircle(angle);
        }
        
        // 初始化
        window.addEventListener('load', () => {
            createParticles();
            resizeCanvas();
            animate();
        });
        
        window.addEventListener('resize', resizeCanvas);
const canvas = document.getElementById('gradientCircle');
        const ctx = canvas.getContext('2d');

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 150;
        const lineWidth = 20;

        function drawGradientCircle(angle) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
			
            // 根据角度动态创建渐变
            const gradient = ctx.createLinearGradient(
                centerX + radius * Math.cos(angle),
                centerY + radius * Math.sin(angle),
                centerX + radius * Math.cos(angle + Math.PI),
                centerY + radius * Math.sin(angle + Math.PI)
            );
            gradient.addColorStop(0, '#00ffff');
            gradient.addColorStop(0.5, '#f0aff0');
            gradient.addColorStop(1, '#f0aff0');

            // 绘制空心圆
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, angle, angle + Math.PI * 2);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
        }

        let angle = 0;
        function animate() {
            angle += 0.01; // 控制旋转速度
            drawGradientCircle(angle);
            requestAnimationFrame(animate);
        }

        animate();
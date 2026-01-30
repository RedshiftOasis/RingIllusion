const gradientBg = document.getElementById('gradientBg');
const ringContainer = document.getElementById('ringContainer');
const whiteCenter = document.getElementById('whiteCenter');
const canvas = document.getElementById('gradientCanvas');
const ctx = canvas.getContext('2d');

// 设置画布尺寸
canvas.width = 320;
canvas.height = 320;

// 状态控制
let isRingMode = false;
let animationId = null;
let angle = 0;

// 使用你提供的渐变环参数
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 150;
const lineWidth = 20;

// 绘制动态渐变环 - 完全使用你的代码
function drawGradientCircle() {
    if (!isRingMode) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 根据角度动态创建渐变 - 使用你提供的颜色
    const gradient = ctx.createLinearGradient(
        centerX + radius * Math.cos(angle),
        centerY + radius * Math.sin(angle),
        centerX + radius * Math.cos(angle + Math.PI),
        centerY + radius * Math.sin(angle + Math.PI)
    );
    gradient.addColorStop(0, '#00ffff');
    gradient.addColorStop(0.5, '#f0aff0');
    gradient.addColorStop(1, '#f0aff0');

    // 绘制空心圆 - 使用你提供的绘制方式
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, angle, angle + Math.PI * 2);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    
    // 控制旋转速度 - 使用你提供的速度
    angle += 0.01;
    
    // 继续动画
    animationId = requestAnimationFrame(drawGradientCircle);
}

// 切换到圆环模式
function switchToRingMode() {
    isRingMode = true;
    
    // 背景缩放到圆环中并淡出
    gradientBg.classList.remove('expand');
    gradientBg.classList.add('shrink');
    
    // 显示圆环并开始动画
    setTimeout(() => {
        ringContainer.classList.add('show');
        whiteCenter.classList.add('show');
        drawGradientCircle();
    }, 800);
}

// 切换回渐变模式
function switchToGradientMode() {
    isRingMode = false;
    
    // 停止圆环动画
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    
    // 隐藏圆环和白色中心
    ringContainer.classList.remove('show');
    whiteCenter.classList.remove('show');
    
    // 圆环渐变淡出，同时背景从圆环位置展开
    gradientBg.classList.remove('shrink');
    gradientBg.classList.add('expand');
    
    // 展开动画完成后重置背景类
    setTimeout(() => {
        gradientBg.classList.remove('expand');
    }, 1500);
    
    // 清除画布
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 800);
}

// 点击事件处理 - 修改后的版本
function handleClick(e) {
    // 检查点击是否发生在白色中心区域或按钮上
    const whiteCenter = document.getElementById('whiteCenter');
    const centerButtons = document.querySelector('.center-buttons');
    
    // 如果点击的是白色中心区域或其内部的按钮，不执行切换
    if (whiteCenter.contains(e.target) || 
        (centerButtons && centerButtons.contains(e.target))) {
        return; // 直接返回，不执行切换逻辑
    }
    
    // 否则，执行正常的切换逻辑
    if (isRingMode) {
        // 如果在圆环模式，点击返回渐变模式
        switchToGradientMode();
    } else {
        // 如果在渐变模式，点击进入圆环模式
        switchToRingMode();
    }
}

// 点击事件监听
document.body.addEventListener('click', handleClick);

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isRingMode) {
        switchToGradientMode();
    }
});

// 导航函数
function navigateTo(url) {
    window.location.href = url;
}
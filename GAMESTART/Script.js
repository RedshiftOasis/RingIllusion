// 角色数据
const characters = [
    {
        id: 'Q',
        name: '棋',
        title: '关于',
        description: `不准绑单马尾！一个不成文的规矩，作为这里的主要成员，她上任后第一件事就是将头发束成了利落的高马尾。她说，单马尾是智慧的象征——头发被整齐收束，才不会被杂念干扰，思维才能如箭般直抵要害。从此，那束随她行动微微晃动的马尾，就成了她本人的旗帜。
        她确实也配得上这"智慧"之名，棋风如人，善于在十步之外布下绝杀的陷阱，公开对弈从未失手。
        人们常看见她与人交谈时，那时她的眼神总是格外清亮，仿佛看穿了对方所有未说出口的台词与算计。当面对质疑，她可能会淡淡回应："你的思路，像三步就被将死的棋局一样清晰。
        而面对真正的挑战，她则会落子无悔，用行动宣告：在这里，马尾是旗帜，棋局是法则，而我，是那个创造规则的人。`,
        image: 'Show/Qiming/棋敏.png',
        icon: 'Show/Qiming/xq.ico',
        page: 'XQFILES/XiangQi.html'
    },
    {
        id: 'J',
        name: '箭',
        title: '关于',
        description: '描述内容...',
        image: 'Show/Xiaojing/箭.png',
        icon: 'Show/Xiaojing/j.ico',
        page: 'JFILES/Jian.html'
    },
    {
        id: 'S',
        name: '绳',
        title: '关于',
        description: '描述内容...',
        image: 'Show/Qiming/棋敏.png',
        icon: 'Show/Small Middle·TT/s.ico',
        page: 'SFILES/Sheng.html'
    },
    {
        id: 'Z',
        name: '珠',
        title: '关于',
        description: '描述内容...',
        image: 'Show/Qiming/棋敏.png',
        icon: 'Show/Hwoad/blz.ico',
        page: 'BLZFILES/BoLiZhu.html'
    }
];

// DOM元素
const mainButtons = document.querySelectorAll('.main-btn');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const characterDescription = document.getElementById('characterDescription');

// 当前选中的角色索引
let currentIndex = 0;
const clickStates = new Array(characters.length).fill(false);

// 初始化
function init() {
    // 为每个按钮添加事件监听
    mainButtons.forEach((btn, index) => {
        btn.addEventListener('click', () => handleButtonClick(index));
        btn.addEventListener('mouseenter', () => handleButtonHover(btn, true));
        btn.addEventListener('mouseleave', () => handleButtonHover(btn, false));
    });
    
    // 左右切换按钮事件
    prevBtn.addEventListener('click', showPrevCharacter);
    nextBtn.addEventListener('click', showNextCharacter);
    
    // 键盘左右键切换
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') showPrevCharacter();
        if (e.key === 'ArrowRight') showNextCharacter();
    });
    
    // 默认显示第一个角色
    updateActiveCharacter(0);
}

// 处理按钮点击
function handleButtonClick(index) {
    if (!clickStates[index]) {
        // 第一次点击：显示内容
        clickStates[index] = true;
        const character = characters[index];
        const button = mainButtons[index];
        
        // 更新按钮为图标
        button.innerHTML = `<img src="${character.icon}" class="custom-icon">`;
        button.classList.add('ico-mode');
        
        // 切换到该角色
        switchToCharacter(index);
        
        // 显示内容区域
        setTimeout(() => {
            contentContainer.classList.add('show');
        }, 300);
    } else {
        // 第二次点击：跳转到对应页面
        window.location.href = characters[index].page;
    }
}

// 切换到指定角色
function switchToCharacter(index) {
    // 更新当前索引
    currentIndex = index;
    
    // 更新UI
    updateActiveCharacter(index);
    
    // 更新内容
    const character = characters[index];
    characterImage.src = character.image;
    characterImage.alt = character.name;
}

// 更新活动按钮状态
function updateActiveCharacter(index) {
    mainButtons.forEach((btn, i) => {
        if (i === index) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// 显示上一个角色
function showPrevCharacter() {
    currentIndex = (currentIndex - 1 + characters.length) % characters.length;
    switchToCharacter(currentIndex);
}

// 显示下一个角色
function showNextCharacter() {
    currentIndex = (currentIndex + 1) % characters.length;
    switchToCharacter(currentIndex);
}

// 按钮悬停效果
function handleButtonHover(button, isEntering) {
    if (isEntering && !button.classList.contains('ico-mode')) {
        button.style.textShadow = '0 0 10px #e98dff, 0 0 20px #214eff, 0 0 40px #ffffff';
    } else {
        button.style.textShadow = '';
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
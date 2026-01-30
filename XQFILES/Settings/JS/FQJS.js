function toggleContent() {
    const content = document.getElementById('content');
    const isHidden = content.style.display === 'none' || content.style.display === '';
    
    if (isHidden) {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
}
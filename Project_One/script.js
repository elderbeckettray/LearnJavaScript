function spinText() {
    const element = document.getElementById('spinner');
    let angle = 0;
    setInterval(() => {
        angle = (angle + 1) % 360;
        element.style.transform = `rotate(${angle}deg)`;
    }, 50);
}



function changeFontSize() {
    const element = document.getElementById('hello');
    let size = 16;
    setInterval(() => {
        size = size >= 40 ? 0 : size + 1;
        element.style.fontSize = `${size}px`;
    }, 1000);
}

window.onclick = function() {
    spinText();
    changeFontSize();
};
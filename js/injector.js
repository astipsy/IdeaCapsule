var laylink = document.createElement('link');
laylink.setAttribute('rel', 'stylesheet');
laylink.setAttribute('href', chrome.runtime.getURL('js/layui/css/layui.css'));
document.head.appendChild(laylink);

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function() {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
            const div = document.createElement('div');
            div.innerHTML = xhr.responseText;
            document.body.appendChild(div);
        } else {
            console.error("Failed to load custom content.");
        }
    }
};
xhr.open("GET", chrome.runtime.getURL("html/index.html"), true);
xhr.send();


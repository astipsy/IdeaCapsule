layui.use(['jquery', 'form'], function(){
    $ = layui.$;
    var form = layui.form;
    chrome.storage.local.get(['capsule_switch'], function(result) {
        if (result.capsule_switch === undefined) {
            result.capsule_switch = true
        } 
        
        $(document).find("#capsule-switch").prop('checked', result.capsule_switch)
        form.render('checkbox');
    })

    form.on('switch(capsule_switch)',function (data) {
        chrome.storage.local.set({capsule_switch: data.elem.checked})
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.reload(tabs[0].id);
        });
    })
})
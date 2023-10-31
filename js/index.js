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

layui.use(['layer', 'jquery', 'form'], function(){
    var layer = layui.layer
    $ = layui.$;
    var form = layui.form;

    chrome.storage.local.get(['capsule_switch'], function(result) {
        if (result.capsule_switch === undefined || result.capsule_switch) {
            $(document).find(".wait-box").show()
        } else {
            $(document).find(".wait-box").hide()
        }
    })

    $(document).on("click", ".wait-box", function() {
        document.getElementsByClassName('wait-box')[0].style.display = 'none'
        document.getElementsByClassName('pill-list')[0].style.display = 'block'
        document.getElementsByClassName('capsule-mask')[0].style.display = 'block'
        loadPill()
    })

    $(document).on("click", ".capsule-mask", function() {
        document.getElementsByClassName('wait-box')[0].style.display = 'block'
        document.getElementsByClassName('pill-list')[0].style.display = 'none'
        document.getElementsByClassName('capsule-mask')[0].style.display = 'none'
    })

    $(document).on("click", "#save-increase", function() {
        var index = $(document).find("#index-increase").val()
        var old_type = $(document).find("#old-type-increase").val()
        var original_type = $(document).find("#original-type-increase").val()
        var content = $(document).find("#content-increase").val()
        var type = $(document).find("#type-increase").is(":checked")
        if (content === '') {
            layer.msg("请输入idea")
            return
        }
        
        type = (type === true ? "emergent" : "ordinary")
        type = (old_type === "complete" ? old_type : type)

        chrome.storage.local.get(['capsule_list'], function(result) {
            var capsule_list = result.capsule_list
            if (index === 0 || index === "0") {
                if (!capsule_list) {
                    capsule_list = {
                        complete: {},
                        ordinary: {},
                        emergent: {},
                    }
                }
                var key = 'data' + (Object.keys(capsule_list['emergent']).length + Object.keys(capsule_list['ordinary']).length + Object.keys(capsule_list['complete']).length + 1)
                capsule_list[type][key] = {
                    content: content,
                    status: 0,
                    type: type,
                }
            } else {
                if (type !== original_type && type !== "complete") {
                    var need_remove_list_tmp = capsule_list[old_type]
                    delete need_remove_list_tmp[index]
                    capsule_list[old_type] = need_remove_list_tmp
                }
                capsule_list[type][index] = {
                    content: content,
                    status: 0,
                    type: type,
                }
            }
            
            chrome.storage.local.set({capsule_list: capsule_list})

            cleanIncrease()

            loadPill()
        }); 
    })

    $(document).on("click", "#cancel-increase", function() {
        cleanIncrease()
    })

    $(document).on("click", "#btn-increase", function() {
        layer.open({
            title: "增加idea",
            type: 1,
            content: $('#increase')
        });
    })

    $(document).on("click", ".idea-remove", function() {
        var that = this
        layer.confirm('确认删除？', {icon: 3, title:'提醒'}, function(layer_index){
            var elem = $(that).parent().parent()
            var index = elem.data("index")
            var type = elem.data("type")
            chrome.storage.local.get(['capsule_list'], function(result) {
                var capsule_list = result.capsule_list
                capsule_list[type][index]['status'] = 1
                chrome.storage.local.set({capsule_list: capsule_list})
                loadPill()
            });
            layer.close(layer_index);
        });
    })

    $(document).on("dblclick", ".pill-box-content", function() {
        var elem = $(this).parent()
        var content = $(this).html()
        var index = elem.data("index")
        var type = elem.data("type")
        var original_type = elem.data("original_type")

        $(document).find("#index-increase").val(index)
        $(document).find("#old-type-increase").val(type)
        $(document).find("#content-increase").val(content)
        $(document).find("#original-type-increase").val(original_type)
        $(document).find("#type-increase").prop('checked', type === "emergent" ? true : false)
        form.render('checkbox');

        layer.open({
            title: "修改idea",
            type: 1,
            content: $('#increase')
        });
    })

    form.on('checkbox(idea_done)', function(chkbox){
        var elem = $(this).parent().parent()
        var index = elem.data("index")
        var type = elem.data("type")

        chrome.storage.local.get(['capsule_list'], function(result) {
            var capsule_list = result.capsule_list
            
            var content = capsule_list[type][index]
            var need_delete_type_list = capsule_list[type]
            delete need_delete_type_list[index]
            capsule_list[type] = need_delete_type_list
    
            if (type == 'complete') {
                capsule_list[content.type][index] = content
            } else {
                capsule_list['complete'][index] = content
            }

            chrome.storage.local.set({capsule_list: capsule_list})
            loadPill()
        });
    })

    function loadPill() {
        chrome.storage.local.get(['capsule_list'], function(result) {
            var capsule_list = result.capsule_list
            renderPill(capsule_list)
        });
    }

    function cleanIncrease() {
        $(document).find("#index-increase").val(0)
        $(document).find("#old-type-increase").val("")
        $(document).find("#content-increase").val("")
        $(document).find("#original-type-increase").val("")
        $(document).find("#type-increase").prop('checked', false);
        form.render('checkbox');
        layer.closeAll();
    }

    function renderPill(capsule_list) {
        if (!capsule_list) {
            capsule_list = {
                complete: {},
                ordinary: {},
                emergent: {},
            }
        }

        capsule_list = {
            complete: capsule_list['complete'],
            ordinary: capsule_list['ordinary'],
            emergent: capsule_list['emergent'],
        }

        var html = ''
        for (const [type, items] of Object.entries(capsule_list)) {
            for (const [index, item] of Object.entries(items)) {
                if(item.status === 0) {
                    let is_checked = type === 'complete' ? 'checked' : '';
                    html = `<div class="pill-box ${ type }"  data-index="${ index }" data-original_type="${ item.type }" data-type="${ type }">
                        <div class="pill-box-checkbox">
                            <input type="checkbox" lay-skin="primary" lay-filter="idea_done" ${ is_checked } >
                        </div>
                        <div class="pill-box-content">${ item.content }</div>
                        <div class="pill-box-close">
                            <i class="layui-icon idea-remove">&#xe640;</i> 
                        </div>
                    </div>` + html
                }
            }
        }
        html += '<button type="button" id="btn-increase" class="layui-btn layui-btn-radius">idea</button>'
        $('#pill-list').html(html)
        form.render();
    }
});
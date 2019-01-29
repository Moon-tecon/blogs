$(function () {
    var default_error_message = '服务器响应错误，请稍后重试。';

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader('X-CSRFToken', csrf_token);
            }
        }
    });

    $(document).ajaxError(function (event, request, settings) {
        var message = null;
        if (request.responseJSON && request.responseJSON.hasOwnProperty('message')) {
            message = request.responseJSON.message;
        } else if (request.responseText) {
            var IS_JSON = true;
            try {
                var data = JSON.parse(request.responseText);
            }
            catch (err) {
                IS_JSON = false;
            }
            if (IS_JSON && data !== undefined && data.hasOwnProperty('message')) {
                message = JSON.parse(request.responseText).message;
            } else {
                message = default_error_message;
            }
        } else {
            message = default_error_message;
        }
        toast(message, 'error');
    });

    var flash = null;

    function toast(body, category) {
        clearTimeout(flash);
        var $toast = $('#toast');
        if (category === 'error') {
            $toast.css('background-color', 'red')
        } else {
            $toast.css('background-color', '#333')
        }
        $toast.text(body).fadeIn();
        flash = setTimeout(function () {
            $toast.fadeOut();
        }, 3000);
    }

    $('#post-tr').click(function () {
        $(this).hide();
        $('#new_post').show();
        $('.fm_header').hide();
        $('#post_input').focus().val('');
    });

    $('.adjunct').click(function () {
        $('#upload_input').click()
    });

    $("#post-new").click(function () {
        $("#post-tr").click()
    });

    /*function show_filename(filename) {
        $.ajax({
            type:'GET',
            url:'/'+filename,
            dataType:'html',
            success:function (filename) {
                console.log('get filename success');
                $('#upload_input').parent().next().append(filename);
            }
        });
    }*/

    $('#upload_input').change(function () {
        var fileSize = document.getElementById("upload_input").files[0].size;
        var size = fileSize/(1024*1024);
        var filemaxsize = 16;    /*验证上传的文件大小*/
        if (size>filemaxsize){
            toast('附件不能大于'+filemaxsize+'M!', 'error');
            return;
        }

        var formData = new FormData($('#upload-fm')[0]);
        $.ajax({
            type: 'post',
            url: '/ajax/upload/',
            data: formData,
            timeout : 300000,
            async: false,
            processData: false,
            contentType: false,
            success: function (filename) {
                console.log('upload-success');
                $.ajax({
                    type:'GET',
                    url:'/ajax/'+filename,
                    dataType:'html',
                    success:function (filename) {
                        console.log('get filename success');
                        $('#upload_input').parent().next().append(filename);
                    }
                });
            }
        });
    });

    $(document).on('click', '#del-btn', function () {
        var $input = $('#upload_input');
        var $item = $(this).parent();

        $input.focus();
        $.ajax({
            type:'DELETE',
            url:$(this).data('href'),
            success:function () {
                console.log('deleted-success');
                $item.remove();
            }
        })
    });

    function update_notifications_count() {
        var $el = $('#notification-badge');
        $.ajax({
            type: 'GET',
            url: $el.data('href'),
            success: function (data) {
                if (data.count === 0) {
                    $('#notification-badge').hide();
                } else {
                    $el.show();
                    $el.text(data.count)
                }
            }
        });
    }

    var hover_timer = null;

    function show_profile_popover(e) {
        var $el = $(e.target);

        hover_timer = setTimeout(function () {
            hover_timer = null;
            $.ajax({
                type: 'GET',
                url: $el.data('href'),
                success: function (data) {
                    $el.popover({
                        html: true,
                        content: data,
                        trigger: 'manual',
                        animation: false
                    });
                    $el.popover('show');
                    $('.popover').on('mouseleave', function () {
                        setTimeout(function () {
                            $el.popover('hide');
                        }, 200);
                    });
                }
            });
        }, 500);
    }

    function hide_profile_popover(e) {
        var $el = $(e.target);

        if (hover_timer) {
            clearTimeout(hover_timer);
            hover_timer = null;
        } else {
            setTimeout(function () {
                if (!$('.popover:hover').length) {
                    $el.popover('hide');
                }
            }, 200);
        }
    }

    $('.profile-popover').hover(show_profile_popover.bind(this), hide_profile_popover.bind(this));

    // delete confirm modal
    $('#confirm-delete').on('show.bs.modal', function (e) {
        $('.delete-form').attr('action', $(e.relatedTarget).data('href'));
    });

    //migrate form modal
    $('#migrate_form').on('show.bs.modal', function (e) {
        $('.migrate_form').attr('action', $(e.relatedTarget).data('href'))
    });

    if (is_authenticated) {
        setInterval(update_notifications_count, 300000);
    }

    $("[data-toggle='tooltip']").tooltip({title: moment($(this).data('timestamp')).format('lll')});

    $('#comment-btn').click(function () {
        $.ajax({
            url:$(this).data('href'),
            type:'get',
            dataType: 'html',
            success:function (data) {
                console.log('success');
                $(this).parent().next().append(data)
            }
        })
    })
});

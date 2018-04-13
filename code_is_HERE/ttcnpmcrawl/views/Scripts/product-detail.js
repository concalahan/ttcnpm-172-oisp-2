var productR = {
    urlObj: {
        getDistrict: '/Payment/GetDistrict',
        getShip: '/Payment/GetShip',
        sendComment: '/Product/InsertComment',
        replyComment: '/Product/ReplyComment'
    },
    commentPostData: {
        COMMENT_NAME: '',
        COMMENT_CONTENT: '',
        COMMENT_EMAIL: '',
        COMMENT_PARENT_ID: 0,
        PRODUCT_ID: 0
    },
    init: function () {
        productR.load.event()
    },
    load: {
        event: function () {
            $('#CITY_ID').change(function () {
                var cityId = $(this).val()
                productR.load.getDistrict(cityId)
            })
            $('#DISTRICT_ID').change(function () {
                var districtId = $(this).val()
                productR.load.getShip(districtId)
            })
            $('.btn-sendcomment').click(function () {
                productR.action.setCommentPostData()
                var msg = productR.action.validateComment()
                if (msg) {
                    showDialog(msg, 'Cảnh báo')
                }
                else {
                    productR.action.sendComment()
                }
            })
            $('.btn-reply').click(function () {
                productR.action.setReplyPostData(false,$(this))
                var msg = productR.action.validateComment()
                if (msg) {
                    showDialog(msg, 'Cảnh báo')
                }
                else {
                    productR.action.sendReply()
                }
            })
            $('.btn-reply-item').click(function () {
                productR.action.setReplyPostData(true, $(this))
                var msg = productR.action.validateComment()
                if (msg) {
                    showDialog(msg, 'Cảnh báo')
                }
                else {
                    productR.action.sendReply()
                }
            })
        },
        getDistrict: function (cityId) {
            $.ajax({
                url: productR.urlObj.getDistrict,
                data: { 'cityId': cityId },
                type: 'POST',
                success: function (data) {
                    var html = []
                    html.push('<option value="">Quận/huyện</option>')
                    for (var i = 0; i < data.length; i++) {
                        var item = data[i]
                        html.push('<option value="' + item.KEY + '">' + item.VALUE + '</option>')
                    }
                    $('#DISTRICT_ID').html(html.join(''))
                }
            })
        },
        getShip: function (districtId) {
            $.ajax({
                url: productR.urlObj.getShip,
                data: { 'districtId': districtId },
                type: 'POST',
                success: function (data) {
                    $('.ship-content').html(data.Msg)
                }
            })
        }
    },
    action: {
        sendComment: function () {
            $.ajax({
                url: productR.urlObj.sendComment,
                data: productR.commentPostData,
                type: 'POST',
                success: function (data) {
                    showDialog('Gửi thành công', 'Thông báo')
                    productR.action.resetCommentForm()
                }
            })
        },
        sendReply: function () {
            $.ajax({
                url: productR.urlObj.replyComment,
                data: productR.commentPostData,
                type: 'POST',
                success: function (data) {
                    showDialog('Gửi thành công', 'Thông báo')
                    productR.action.resetReplyForm()
                }
            })
        },
        setCommentPostData: function () {
            productR.commentPostData.COMMENT_CONTENT = $('textarea[data-name="content-comment"]').val()
            productR.commentPostData.COMMENT_NAME = $('input[data-name="name-comment"]').val()
            productR.commentPostData.COMMENT_EMAIL = $('input[data-name="email-comment"]').val()
        },
        setReplyPostData: function (isReplyItem,elem) {
            if (isReplyItem) {
                productR.commentPostData.COMMENT_CONTENT = elem.parents('.reply_item').find('textarea[data-name="content-reply"]').val()
                productR.commentPostData.COMMENT_NAME = elem.parents('.reply_item').find('input[data-name="name-reply"]').val()
                productR.commentPostData.COMMENT_PARENT_ID = elem.parents('.reply_item').find('.hidden-commentid').val()
            }
            else {
                productR.commentPostData.COMMENT_CONTENT = elem.parents('.wrap-comment').find('textarea[data-name="content-reply"]').val()
                productR.commentPostData.COMMENT_NAME = elem.parents('.wrap-comment').find('input[data-name="name-reply"]').val()
                productR.commentPostData.COMMENT_PARENT_ID = elem.parents('.wrap-comment').find('.hidden-commentid').val()
            }
        },
        validateComment: function () {
            var msg = ''
            if (!productR.commentPostData.COMMENT_CONTENT)
                msg = 'Vui lòng nhập nội dung'
            else if (!productR.commentPostData.COMMENT_NAME)
                msg = 'Vui lòng nhập tên'
            return msg
        },
        resetCommentForm: function () {
            $('textarea[data-name="content-comment"]').val('')
            $('input[data-name="name-comment"]').val('')
            $('input[data-name="email-comment"]').val('')
        },
        resetReplyForm: function () {
            $('textarea[data-name="content-reply"]').val('')
            $('input[data-name="name-reply"]').val('')
        }
    },
    template: {

    }
}
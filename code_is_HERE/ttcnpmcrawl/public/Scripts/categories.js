var cateR = {
    postData: {
        urlCurrent: '',
        price: '',
        trader: '',
        sortOrder: '',
        cateId: ''
    },
    urlObj: {
        getTrader: '/Categories/GetTrader'
    },
    init: function () {
        cateR.load.event()
        cateR.load.loadTrader()
    },
    load: {
        event: function () {
            $('#sort-by').change(function () {
                var sortOrder = $(this).val()
                var urlCurrent = cateR.postData.urlCurrent
                var price = cateR.postData.price
                var trader = cateR.postData.trader
                cateR.action.redirectToAction(sortOrder, price, trader)
            })
            $('.trader-content').on('click', '.trader-item', function () {
                var traderId = $(this).val();
                var trader = cateR.postData.trader
                var price = cateR.postData.price
                var sortOrder = cateR.postData.sortOrder
                var arrTrader = []
                if (trader) {
                    arrTrader = trader.split(',')
                }
                if ($(this).is(':checked')) {
                    arrTrader.push(traderId)
                }
                else {
                    var index = arrTrader.indexOf(traderId)
                    arrTrader.splice(index, 1)
                }
                cateR.action.redirectToAction(sortOrder, price, arrTrader.join(','))
            })
            $('.price-search').click(function () {
                var price = $(this).attr('data-id')
                var urlCurrent = cateR.postData.urlCurrent
                document.location = urlCurrent + '?price=' + price
            })
            $('.trader-keyword').keyup(function () {
                cateR.load.loadTrader()
            })
        },
        loadTrader: function () {
            var keyword = $('.trader-keyword').val()
            $.ajax({
                url: cateR.urlObj.getTrader,
                type: 'POST',
                data: { 'cateId': cateR.postData.cateId, 'keyword': keyword },
                success: function (data) {
                    var html = cateR.template.createTemplateTrader(data)
                    $('.trader-content').html(html)
                }
            })
        }
    },
    action: {
        redirectToAction: function (sortOrder, price, trader) {
            var urlCurrent = cateR.postData.urlCurrent
            if (sortOrder) {
                urlCurrent += cateR.action.getCharUrl(urlCurrent) + 'sortOrder=' + sortOrder
            }
            if (price) {
                urlCurrent += cateR.action.getCharUrl(urlCurrent) + 'price=' + price
            }
            if (trader) {
                urlCurrent += cateR.action.getCharUrl(urlCurrent) + 'trader=' + trader
            }
            document.location = urlCurrent
        },
        getCharUrl: function (urlCurrent) {
            if (urlCurrent.match(/\?./)) {
                return '&'
            }
            return '?'
        }
    },
    template: {
        createTemplateTrader: function (data) {
            var html = []
            var trader = cateR.postData.trader
            var arrTrader = []
            if (trader) {
                arrTrader = trader.split(',')
            }
            for (var i = 0; i < data.length; i++) {
                var item = data[i]
                var isSelected = arrTrader.indexOf(String(item.CATE_ID)) != -1
                html.push('<li class="multiselect__item">')
                if (isSelected)
                    html.push('<input type="checkbox" id="' + item.CATE_ID + '" class="trader-item" value="' + item.CATE_ID + '" checked="checked">')
                else
                    html.push('<input type="checkbox" id="' + item.CATE_ID + '" class="trader-item" value="' + item.CATE_ID + '">')
                html.push('<label for="' + item.CATE_ID + '"><span></span>' + item.CATE_NAME + '</label>')
                html.push('</li>')
            }
            return html.join('')
        }
    }
}
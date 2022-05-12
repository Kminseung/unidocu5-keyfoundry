/**
 * @module unidocu-ui/view/EMBED_URL
 */
define(function(){
    return function(){
        var base_prg = $u.page.getBASE_PRG();
        if(!base_prg) throw 'BASE_PRG missing';
        var $searchForm = $('#searchForm');
        var $iframe = $('<iframe style="height: 100%;width: 100%;border:none;"></iframe>').attr('src', base_prg);
        $searchForm.empty().append($iframe);
        $(window).resize(function () {
            setTimeout(function () {
                var documentHeight = $(document).height();
                var iframeOffset = $iframe.offset().top;
                $iframe.height(documentHeight - iframeOffset - 30);
            }, 500);
        }).resize();
    }
});
/**
 * @module unidocu-ui/view/UniDocu001/postNoticeSetting
 */
define(function () {
    return function () {
        var programSetting = $u.webData.programSetting.getData('UD_0703_000');
        $u.buttons.addHandler({
            save: function () {
                var params = $.extend({}, programSetting, $u.getValues('search-condition'));
                params['postingWidth'] = String(params['postingWidth']);
                params['postingId'] = String(Date.now());
                $u.webData.createOrModifySingle('programSetting', 'UD_0703_000', {OS_DATA: params});
            }
        });

        return function () {
            $('#unidocu-th-postingContents').css('min-width', '110px');
            $u.setValues('search-condition', programSetting);
            $u.get('search-condition', 'postingContents').$el.find('.uni-ckeditor').html(programSetting['postingContents']);

            var $buttons = $('#uni-buttons');
            $('#search-condition').after($buttons);
            $('#unidocu-grid').hide();

            $buttons.after('' +
                '<div style="background: #fff; padding: 10px;">' +
                '<p>* 공지 게시 내용: 팝업 공지 내용</p>' +
                '<p>* 공지 게시 기한: 설정된 날짜 까지 팝업 공지 게시</p>' +
                '<p>* 공지 게시 넓이: 팝업 공지 게시 넓이. 높이는 자동 적용</p>' +
                '<p>* 저장시 하루 동안 보지 않음 초기화.</p>' +
                '</div>');
        }
    }
});
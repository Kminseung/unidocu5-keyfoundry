/**
 * @module view/ShowEvidence
 */
define(function() {
    return function(){
        $('body').addClass('show-as-popup');
        $(window).focus();
        $u.setPageTitle($mls.getByCode('DLT_ShowEvidence'));

        var evi_seq = Base64.decode($u.page.getPageParams()['EVI_SEQ']);
        var fileUrl = $u.fineUploader.getDownloadUrl({EVI_SEQ: evi_seq, FILE_SEQ: '1'});

        $u.util.displayThumbnail($('#displayAttachFile'), fileUrl, 'can not display image', function(){
            window.resizeTo(700, $('body').height() + 120);
        });

        $('.file-link').attr('href',  $u.getUrlFromRoot(fileUrl));
        $nst.is_data_ot_data('ZUNIEFI_3101', {EVI_SEQ: evi_seq}, function(ot_data){
            var fileInfo = ot_data[0];
            if(ot_data.length === 0) throw '[ZUNIEFI_3101] no OT_DATA result.';
            fileInfo['WRBTR'] = $u.unidocuCurrency.getFormattedValue(fileInfo['WAERS'], fileInfo['WRBTR']);
            fileInfo['FWSTE'] = $u.unidocuCurrency.getFormattedValue(fileInfo['WAERS'], fileInfo['FWSTE']);
            if(fileInfo) {
                if(fileInfo['WAERS'] !== '' && fileInfo['WAERS'] !== 'KRW') $('#field-waers').show();
                $.each(fileInfo, function(key, value){ $('#' + key).text(value); });
                window.resizeTo(700, $('body').height() + 90);
            }
        });
    }
});
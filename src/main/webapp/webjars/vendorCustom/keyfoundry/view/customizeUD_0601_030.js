/**
 * @module vendorCustomkeyfoundry/view/customizeUD_0601_030
 */
define(function () {
    return function (initFn) {
        initFn();

        // 권한별 처리담당자 제어
        if($u.page.getPROGRAM_ID() === 'UD_0601_030') {
            if(staticProperties.user['ROLE'].indexOf('FI_2120') === -1 && $u.get('FLAG')) {
                $('#unidocu-td-FLAG label:nth-child(2)').hide();
            }
        }
    }
});
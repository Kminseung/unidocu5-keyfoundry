/**
 * @module vendorCustom/keyfoundry/view/customizeUD_0201_010
 */
define(function () {
    return function (initFn) {
        initFn();

        // 권한별 처리담당자 및 내역 삭제 버튼 제어
        if($u.page.getPROGRAM_ID() === 'UD_0201_010') {
            if(staticProperties.user['ROLE'].indexOf('FI_2120') === -1 && $u.get('FLAG')) {
                $('#unidocu-td-FLAG label:nth-child(2)').hide();
                $('#deleteStatementMulti').hide();
            }
        }
    }
});
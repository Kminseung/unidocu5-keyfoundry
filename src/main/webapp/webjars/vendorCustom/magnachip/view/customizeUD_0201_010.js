/**
 * @module vendorCustom/magnachip/view/customizeUD_0201_001
 */

define([], function () {
    return function (initFn) {
        initFn();
        if(staticProperties.user['ROLE'].indexOf('EA_0000')===-1){
            $("#unidocu-td-FLAG label:nth-child(2),#unidocu-td-FLAG label:nth-child(3)").hide()
        }
    }
});
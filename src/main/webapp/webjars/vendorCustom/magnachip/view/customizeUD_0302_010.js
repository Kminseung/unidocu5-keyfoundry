/**
 * @module vendorCustom/magnachip/view/customizeUD_0301_010
 */

define([
],function() {
    return function(initFn) {
        initFn();
        $('#unidocu-td-PERNR').change(function(){
            $magnachip.magnaPernrComboOption('IPERNR');
        })
    }

});
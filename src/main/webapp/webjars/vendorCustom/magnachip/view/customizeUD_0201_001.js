/**
 * @module vendorCustom/magnachip/view/customizeUD_0201_001
 */

define([], function () {
    return function (initFn) {
        $u.buttons.addHandler({
            createStatement: function () {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                $efi.createStatement.callCreateStatementFn(params);
            },
            getDbData: function () {
                $magnachip.getGwDbDialog()
            }
        });
        initFn();

    }
});
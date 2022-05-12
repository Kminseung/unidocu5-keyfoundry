/**
 * @module vendorCustom/magnachip/view/customizeUD_0202_001
 */

define([], function () {
    return function (initFn) {

        $u.buttons.addHandler({
            createStatement: function () {
                $magnachip.validateEntertainment()
            },
            getDbData: function () {
                $magnachip.getGwDbDialog()
            }
        });
        initFn();
        var gridObj = $u.gridWrapper.getGrid()
        $magnachip.setPrecision(gridObj);

        $('#unidocu-td-SGTXT').change(function (){
            var sgtxtTable = $u.getValues().SGTXT;
            gridObj.loopRowIndex(function (rowIndex) {
                gridObj.$V('SGTXT',rowIndex,sgtxtTable)
            })
        })

        if ($u.page.getPageParams()['showAsPopup']) {
            $('#approvalDbData').hide()
            var sgtxtInput = $('#unidocu-td-SGTXT input')
            sgtxtInput.val($u.page.getPageParams().SGTXT)
            $u.get('header-invoicer-content','SGTXT' ).setReadOnly(true);
            var exp_gb = $u.page.getPageParams().EXP_GB
            if (exp_gb) {
                var exp_gb_txt;
                if (exp_gb === 'A') exp_gb_txt = '숙박비'
                else if (exp_gb === 'B') exp_gb_txt = '식비'
                else if (exp_gb === 'C') exp_gb_txt = '잡비'
                else if (exp_gb === 'D') exp_gb_txt = '교통비'
                else if (exp_gb === 'E') exp_gb_txt = '항공요금'
                else if (exp_gb === 'F') exp_gb_txt = '통신비'
                else if (exp_gb === 'G') exp_gb_txt = '접대비'
                gridObj.$V('ZUONR', 0, exp_gb_txt)
                gridObj.makeCellReadOnly('ZUONR', 0)
                gridObj.onChangeRow(function () {
                    gridObj.$V('ZUONR', gridObj.getActiveRowIndex(), exp_gb_txt)
                    gridObj.makeCellReadOnly('ZUONR', gridObj.getActiveRowIndex())
                })
            }

        }
        $magnachip.SGTXTChange(gridObj)
    }

});
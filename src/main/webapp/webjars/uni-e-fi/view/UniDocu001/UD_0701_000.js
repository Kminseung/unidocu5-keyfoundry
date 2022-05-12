/**
 * UD_0701_000    공급업체 마스터 조회
 * UD_0701_030    공급업체 마스터 변경
 * @module uni-e-fi/view/UniDocu001/UD_0701_000
 */
define(function() {
    return function(){
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            "createStatement": function() {
                var gridObjSelectCount = gridObj.$F('1', 'SELECTED').length;

                if(gridObjSelectCount > 1) throw $mls.getByCode('M_UD_0701_000_crerateStatementSelectedMoreThan1');

                var selectedJSONData = {};
                if(gridObjSelectCount === 1) {
                    if(gridObj.getSELECTEDJSONData()[0]['STATS'] === '2') throw $mls.getByCode('M_UD_0701_000_crerateStatementSTATS_2');
                    selectedJSONData = gridObj.getSELECTEDJSONData()[0];
                }

                var MODE = "U";
                if(gridObjSelectCount === 0) MODE = "C";
                var jsonData = $.extend({}, selectedJSONData, {MODE: MODE});
                $u.navigateByProgramId('UD_0701_001', jsonData);
            },
            "changeStatement": function() {
                gridObj.asserts.rowSelected();
                gridObj.asserts.selectedExactOneRow();
                var statsValue = gridObj.getSELECTEDJSONData()[0]['STATS'];
                if(!(statsValue === '7' || statsValue === '1' || statsValue === '3')) throw $mls.getByCode('M_UD_0701_000_changeStatement_STATS_7_1_3');
                if(statsValue === '2') throw $mls.getByCode('M_UD_0701_000_changeStatement_STATS_2');

                var jsonData = $.extend({}, gridObj.getSELECTEDJSONData()[0]);
                $u.navigateByProgramId('UD_0701_031', jsonData);
            },
            "callApproval": function() {
                gridObj.asserts.rowSelected();
                for(var i = 0, len = gridObj.getSELECTEDJSONData().length; i < len; i++) {
                    if(gridObj.getSELECTEDJSONData()[i]['STATS'] === '2') throw $mls.getByCode('M_UD_0701_000_callApproval_STATS_2')
                }

                // TODO : 유니포스트에서 사용하는 공급업체 결제 페이지가 존재하지 않음 . 개발필요함.
            }
        });

        return function(){

        }
    }
});
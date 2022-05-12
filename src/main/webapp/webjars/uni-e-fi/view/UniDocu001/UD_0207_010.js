/**
 * UD_0207_010    선급 비용 관리
 * @module uni-e-fi/view/UniDocu001/UD_0207_010
 */
define(function() {
    return function(){
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            "createPrepaidExpenses": function() {
                $u.navigateByProgramId('UD_0207_020');
            },
            "cancelPrepaidExpenses": function() {
                gridObj.asserts.selectedExactOneRow();
                $u.navigateByProgramId('UD_0207_030', gridObj.getSELECTEDJSONData()[0]);
            }
        });

        return function(){

        }
    }
});

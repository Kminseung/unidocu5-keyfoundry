/**
 * UD_0201_050    지로/인출 마스터 생성&변경
 * @module uni-e-fi/view/UniDocu001/UD_0201_050
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            "doCreate": function () {
                $efi.popup.openUD_0201_053();
            },
            "doChange": function () {
                gridObj.asserts.selectedExactOneRow();
                $efi.popup.openUD_0201_054(gridObj.getSELECTEDJSONData()[0])
            }
        });
        return function () {

        }
    }
});

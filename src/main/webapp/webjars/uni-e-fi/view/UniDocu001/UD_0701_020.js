/**
 * UD_0701_010    법인카드
 * @module uni-e-fi/view/UniDocu001/UD_0701_020
 */
define(function () {
    return function () {
        $u.buttons.addHandler({
            "newIssue": function () {
                $u.navigateByProgramId('UD_0701_021');
            },
            "limCha": function () {
                $u.navigateByProgramId('UD_0701_022');
            },
            "reCall": function () {
                $u.navigateByProgramId('UD_0701_023');
            },
            "reNew": function () {
                unidocuConfirm($mls.getByCode('M_UD_0701_020_reNewConfirm'), $u.locationReload);
            }
        });
        return function () {
        }
    }
});
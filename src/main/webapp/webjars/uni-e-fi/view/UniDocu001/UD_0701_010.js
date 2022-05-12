/**
 * UD_0701_010    구매업체
 * @module uni-e-fi/view/UniDocu001/UD_0701_010
 */
define(function() {
    return function(){
        $u.buttons.addHandler({
            createStatement: function() {
                $u.navigateByProgramId('UD_0701_011');
            }
        });

        return function(){

        }
    }
});
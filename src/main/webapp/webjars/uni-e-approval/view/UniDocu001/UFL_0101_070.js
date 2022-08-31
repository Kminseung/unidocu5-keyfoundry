/**
 * @module uni-e-approval/view/UniDocu001/UFL_0101_070
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('selectedJSONDataReturnMessageFuncName',{
            defaultValue: 'ZUNIEWF_0091',
            description: 'selectedJSONDataReturnMessage의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('selectedJSONDataReturnMessage2FuncName',{
            defaultValue: 'ZUNIEWF_0094',
            description: 'selectedJSONDataReturnMessage2의 FuncName #20465'
        });

        return function () {
            $u.buttons.triggerFormTableButtonClick();
        }
    }
});

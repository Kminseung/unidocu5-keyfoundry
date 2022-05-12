/**
 * @module unidocu-ui/view/debugSubView
 */
define(function() {
    return function(){
        $u.unidocuUI();
        $u.programSetting.appendTemplate('debugSubView', {
            description: 'debugSubView id',
            defaultValue: ''
        });

        return function(){
            var debugSubView = $u.programSetting.getValue('debugSubView');
            $debug.renderDebugSubView(debugSubView);
        }
    }
});
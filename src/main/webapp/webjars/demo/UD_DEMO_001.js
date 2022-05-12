/**
 * @module demo/UD_DEMO_001
 * 차량 정보
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.buttons.addHandler({
            "doQuery": function () {}
        });

        return function () {
            $nst.is_data_os_data('ZUNIEWF_5114', {}, function(os_data){
                $u.setValues('uni-form-table2', os_data);
                var $uniButtons = $('#uni-buttons, #cloned-buttons');
                $('#cloned-buttons').append($uniButtons.find('button').clone());
            });
        }
    };
});
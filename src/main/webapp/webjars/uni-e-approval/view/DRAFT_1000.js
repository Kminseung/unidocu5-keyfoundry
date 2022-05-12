/**
 * @module uni-e-approval/view/DRAFT_1000
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.buttons.addHandler({
            "tempSave": function () {
                $u.validateRequired();
                var params = $u.getValues('uni-form-table2');
                $u.fileUI.setFileAttachKeyParam(params);
                $nst.is_data_returnMessage('ZUNIEWF_5110', params, function (message) {
                    unidocuAlert(message, $u.locationReload)
                });
            },
            "list": function () {
                $u.navigateByProgramId('UFL_0301_000');
            },
            "queryClosed": function () {
                $efi.showExGateClosedVendorStatus($u.get('uni-form-table2', 'STCD2').getValue().replace(/-/g, ''));
            }
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
/**
 * UD_0101_100    개인환경설정
 * @module unidocu-ui/view/UD_0101_100
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $u.programSetting.appendTemplate('암호설정 사용 여부', {
            defaultValue: 'true',
            description: '암호설정 사용 여부 #20465'
        });
        $u.programSetting.appendTemplate('부재중 설정 사용 여부', {
            defaultValue: 'true',
            description: '부재중 설정 사용 여부 #20465'
        });
        $u.programSetting.appendTemplate('save1FuncName', {
            defaultValue: 'ZUNIEWF_1101',
            description: 'save1의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('save2FuncName', {
            defaultValue: 'ZUNIEWF_1111',
            description: 'save2의 FuncName #20465'
        });

        $u.buttons.addHandler({
            "save1": function () {
                $u.validateRequired('form-table1');
                var values = $u.getValues('form-table1');

                if (values['FLAG_PW'] && values['WF_PW'] !== values['WF_PW_CONFIRM']) throw $mls.getByCode('M_incorrectPassword');

                values['ID'] = staticProperties.user['ID'];
                values['WF_PW2'] = $u.thirdParty.sha256(values['WF_PW']);
                if(values['CURRENT_WF_PW']) values['CURRENT_WF_PW2'] = $u.thirdParty.sha256(values['CURRENT_WF_PW']);

                delete values['WF_PW'];
                delete values['CURRENT_WF_PW'];

                $nst.is_data_nsReturn($u.programSetting.getValue('save1FuncName'), values, function () { // ZUNIEWF_1101
                    $u.navigateByProgramId($u.page.getPROGRAM_ID());
                });
            },
            "save2": function () {
                $u.validateRequired('form-table2');
                var values = $u.getValues('form-table2');
                values['ID'] = staticProperties.user['ID'];
                $nst.is_data_nsReturn($u.programSetting.getValue('save2FuncName'), values, function () {
                    $u.navigateByProgramId($u.page.getPROGRAM_ID());
                });
            }
        });

        return function () {
            if ($u.programSetting.getValue('암호설정 사용 여부') !== 'true') $('#wf-password').hide();
            if ($u.programSetting.getValue('부재중 설정 사용 여부') !== 'true') $('#wf-abs').hide();

            $('#form-table1').find('input[type=text], input[type=password]').width(200);

            $u.get('FLAG_PW').$el.change(function () {
                var readOnly = false;
                if ($u.get('FLAG_PW').getValue() === '') readOnly = true;
                $u.get('CURRENT_WF_PW').setReadOnly(readOnly).setEmptyValue();
                $u.get('WF_PW').setReadOnly(readOnly).setEmptyValue().setRequired(!readOnly);
                $u.get('WF_PW_CONFIRM').setReadOnly(readOnly).setEmptyValue().setRequired(!readOnly);
            });
            $u.get('FLAG_AB').$el.change(function () {
                var readOnly = false;
                if ($u.get('FLAG_AB').getValue() === '') {
                    readOnly = true;
                    $u.get('AB_ID').setEmptyValue();
                    $u.get('AB_DATE').setEmptyValue();
                }

                $u.get('AB_ID').setReadOnly(readOnly).setRequired(!readOnly);
                $u.get('AB_DATE').setReadOnly(readOnly).setRequired(!readOnly);
            });

            var userIdParams = {ID: staticProperties.user['ID']};
            $nst.is_data_os_data('ZUNIEWF_1103', userIdParams, function (os_data) { // 암호 설정.
                $u.setValues('form-table1', {FLAG_PW: os_data['FLAG_PW']});
                $u.get('FLAG_PW').$el.change();
            });
            $nst.is_data_os_data('ZUNIEWF_1113', userIdParams, function (os_data) { // 부재중 설정.
                $u.setValues('form-table2', os_data);
                $u.get('FLAG_AB').$el.change();
            });

        }
    }
});
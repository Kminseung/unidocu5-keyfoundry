/**
 * UD_7010_021    부서관리
 * @module uni-e-approval/view/UD_7010_021
 */
define(function () {

    var formHandler = {};
    formHandler.$userInfo = null;
    formHandler.$deptInfo = null;
    formHandler.$uniButtonsDept = null;
    formHandler.$uniButtonsUser = null;
    formHandler.$uniButtonsDeptAdd = null;
    formHandler.$uniButtons = null;
    formHandler.$uniButtonsUserAdd = null;
    formHandler.$rightWrapper = null;
    formHandler.$leftWrapper = null;
    formHandler.clearForm = function ($el) {
        $el.find('input[type=text]').val('');
        $el.find('select').val('');
    };
    formHandler.hideAllForm = function () {
        formHandler.$userInfo.detach();
        formHandler.$deptInfo.detach();
        formHandler.$uniButtonsDept.detach();
        formHandler.$uniButtonsUser.detach();
        formHandler.$uniButtonsDeptAdd.detach();
        formHandler.$uniButtonsUserAdd.detach();
        formHandler.$uniButtons.detach();
        formHandler.clearForm(formHandler.$userInfo);
        formHandler.clearForm(formHandler.$deptInfo);
    };
    formHandler.setDeptForm = function (jsonData) {
        formHandler.$deptInfo.appendTo(formHandler.$rightWrapper);
        formHandler.$uniButtonsDept.appendTo(formHandler.$rightWrapper);
        formHandler.$uniButtons.appendTo(formHandler.$leftWrapper);
        jsonData['NODE_KEY_'] = jsonData['NODE_KEY'];
        $u.setValues('dept-info', jsonData);
        $u.get('HEAD_KEY').setReadOnly(false);
    };
    formHandler.setUserInfoForm = function (jsonData) {
        formHandler.$userInfo.appendTo(formHandler.$rightWrapper);
        formHandler.$uniButtonsUser.appendTo(formHandler.$rightWrapper);
        $u.get('ID').setReadOnly(true);
        $u.get('PERNR').setReadOnly(true);
        $nst.is_data_os_data('ZUNIEWF_1042', jsonData, function (os_data) {
            $u.setValues('user-info', os_data);
        });
        $('#editPernr').show();
        $('#savePernr').hide();
    };

    formHandler.initialize = function () {
        formHandler.$userInfo = $('#user-info').detach();
        formHandler.$deptInfo = $('#dept-info').detach();
        formHandler.$uniButtonsDept = $('#uni-buttons-dept').detach();
        formHandler.$uniButtonsUser = $('#uni-buttons-user').detach();
        formHandler.$uniButtonsDeptAdd = $('#uni-buttons-dept-insert').detach();
        formHandler.$uniButtonsUserAdd = $('#uni-buttons-user-insert').detach();
        formHandler.$uniButtons = $('#uni-buttons').detach();
        formHandler.$rightWrapper = $('#rightWrapper');
        formHandler.$leftWrapper = $('#leftWrapper');
    };

    var state;


    return function () {
        $u.unidocuUI();
        var orgTree = new $efi.OrgTree($('#org-tree'), {
            load_node: function () {
                orgTree.select_node(staticProperties.user['ID']);
            },
            select_node: function (nodeData) {
                formHandler.hideAllForm();
                if (orgTree.isDeptNode()) formHandler.setDeptForm(nodeData);
                else formHandler.setUserInfoForm(nodeData);
            }
        });

        function updatePernr(state){
            $u.validateRequired('user-info');
            var importParams = $.extend({},$u.getValues('user-info'))
            importParams.GB=state;
            $nst.is_data_returnMessage("ZUNIEWF_U100",importParams,function (message){
                unidocuAlert(message)
                formHandler.hideAllForm();
            })
        }
        $u.buttons.addHandler({
            "addPernr": function () {
                var obj = $.extend({},staticProperties.user, $u.getValues('dept-info'));
                formHandler.hideAllForm();
                formHandler.$userInfo.appendTo(formHandler.$rightWrapper);
                formHandler.$uniButtonsUser.appendTo(formHandler.$rightWrapper);
                $u.get('ID').setReadOnly(false);
                $u.get('PERNR').setReadOnly(false);
                $u.get('KOSTL').setReadOnly(false);
                delete obj['PERNR'];
                delete obj['ID'];
                delete obj['BUPLA'];
                delete obj['GSBER'];
                delete obj['SNAME'];
                delete obj['SMTP_ADDR'];
                delete obj['MOB_NO'];
                delete obj['KOSTL'];
                delete obj['KOSTL_TXT'];
                obj['INIT']='X';
                obj['NODE_KEY']=obj['NODE_KEY_']
                obj['STAT2']='0';
                $u.setValues('user-info',obj);
                $('#editPernr').hide();
                $('#savePernr').show();
            },
            "savePernr": function (){
                state= "I";
                updatePernr(state)
            },
            "editPernr": function (){
                state="U"
                updatePernr(state)
            },
        });
        return function () {
            formHandler.initialize();
            orgTree.initOrgData();
        }
    }
});
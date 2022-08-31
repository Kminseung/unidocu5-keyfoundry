/**
 * @module uni-e-approval/$ewf/$ewfDialog
 */
define(['uni-e-approval/$ewf/modifyApprovalDialog'], function (modifyApprovalDialog) {
    return function () {
        $ewf.dialog = {};
        modifyApprovalDialog();
        $ewf.dialog.approvalCommentsDialog = {};
        $ewf.dialog.approvalCommentsDialog.open = function (params) {
            var title = params['title'];
            var usePassword = params['usePassword'];
            var approvalPassword = params['approvalPassword'];
            var confirmCallback = params['confirmCallback'];

            var $dialog = $('<div><div class="unidocu-form-table-wrapper" id="approvalCommentsDialog"></div></div>');
            $u.renderUIComponents($dialog, 'wfDialog');
            if (!usePassword) $u.get('approvalCommentsDialog', 'APPROVAL_PASSWORD').$el.closest('tr').remove();
            else $u.get('approvalCommentsDialog', 'APPROVAL_PASSWORD').setRequired(true);
            $u.get('approvalCommentsDialog', 'APPROVAL_COMMENTS').setThText(title);

            $u.baseDialog.openModalDialog($dialog, {
                title: title,
                width: 600,
                buttons: [
                    $u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                        $u.validateRequired('approvalCommentsDialog');
                        var values = $u.getValues('approvalCommentsDialog');
                        if (usePassword && $u.thirdParty.sha256(values['APPROVAL_PASSWORD']) !== approvalPassword) throw $mls.getByCode('M_incorrectPassword');

                        confirmCallback(values['APPROVAL_COMMENTS']);
                        $dialog.dialog('close');
                    })
                ]
            });
        };
        $ewf.dialog.changeWF_ORGDialog = {};
        $ewf.dialog.changeWF_ORGDialog.open = function (addCallback) {
            var templateString = '';
            templateString += '<div>';
            templateString += '<button style="position: absolute; left: -200px;top: -200px;"></button>';
            templateString += '<div id="reference-search-form" data-sub-group="WF_ORGDialog" class="unidocu-form-table-wrapper"></div>';
            templateString += '<div id="reference-search-grid" data-sub-group="WF_ORGDialog" class="unidocu-grid" data-sub-id="GRIDHEADER" style="height: 300px; margin: 10px 0;"></div>';
            templateString += '</div>';

            var $dialog = $(templateString);

            $u.renderUIComponents($dialog, 'DRAFT_0010');

            var referenceSearchGrid = $u.gridWrapper.getGrid('reference-search-grid');

            $u.buttons.addHandler({
                "referenceSearchButton": function () {
                    var params = $u.getValues('reference-search-form');
                    params['WF_TITLE'] = params['WF_TITLE2'];
                    $nst.is_data_ot_data('ZUNIEWF_4410', params, function (ot_data) {
                        referenceSearchGrid.setJSONData(ot_data);
                    });
                }
            });
            $u.buttons.triggerFormTableButtonClick('reference-search-form');

            $u.baseDialog.openModalDialog($dialog, {
                width: 800,
                draggable: true,
                title: $mls.getByCode('DLT_changeWF_ORGDialog'),
                buttons: [
                    $u.baseDialog.getButton($mls.getByCode('DLB_add'), function () {
                        var gridObj = $u.gridWrapper.getGrid('reference-search-grid');
                        gridObj.asserts.rowSelected();
                        addCallback(gridObj.getSELECTEDJSONData());
                        $dialog.dialog('close');
                    })
                ],
                close: function () {
                    $dialog.remove();
                }
            });
        };
        $ewf.dialog.sendApprovalAlarmDialog = {};
        $ewf.dialog.sendApprovalAlarmDialog.open = function (params) {
            var templateString = '';
            templateString += '<div id="send-approval-alarm-dialog">';
            templateString += '    <div id="alarm-dialog-table" class="unidocu-form-table-wrapper" data-sub-group="send-approval-alarm-dialog"></div>';
            templateString += '    <div id="send-approval-alarm-dialog-buttons1" class="btn_area uni-form-table-button-area" data-sub-group="send-approval-alarm-dialog"></div>';
            templateString += '    <div id="send-approval-alarm-dialog-grid" class="unidocu-grid" data-sub-group="send-approval-alarm-dialog" data-sub-id="GRIDHEADER" style="height: 300px;margin-bottom: 5px;"></div>';
            templateString += '</div>';
            var $dialog = $(templateString);

            $dialog.find('#send-approval-alarm-dialog-buttons1').append($u.getFromButtonsElBySubGroupButtonAreaId('send-approval-alarm-dialog', 'send-approval-alarm-dialog-buttons1'));
            $u.renderUIComponents($dialog);
            $u.setValues('alarm-dialog-table', params);

            var gridObj = $u.gridWrapper.getGrid('send-approval-alarm-dialog-grid');
            $u.buttons.addHandler({
                "addPERNR": function () {
                    $u.dialog.f4CodeDialog.open({
                        popupKey: 'PERNR',
                        useSelectWithoutCallback: true,
                        codePopupCallBack: function (_pernr) {
                            $.each(gridObj.getJSONData(), function (index, item) {
                                if (item['PERNR'] === _pernr) throw $mls.getByCode('M_alreadyAdded');
                            });
                            $nst.is_data_os_data('ZUNIEWF_1042', {PERNR: _pernr}, function (os_data) {
                                gridObj.addRowByJSONData(os_data);
                            });
                        }
                    });
                },
                "delPERNR": function () {
                    gridObj.deleteSelectedRows();
                }
            });
            var dialogButtons = [$u.baseDialog.getButton($mls.getByCode('DLB_send'), function () {
                $u.validateRequired('alarm-dialog-table');
                var jsonData = gridObj.getJSONData();
                if (jsonData.length === 0) throw $mls.getByCode('M_addReceiver');
                var item = $.extend({}, params, $u.getValues('alarm-dialog-table'));

                var SMTP_ADDRs = [];
                $.each(jsonData, function (index, item) {
                    SMTP_ADDRs.push(item['SMTP_ADDR']);
                });
                item['SMTP_ADDR'] = SMTP_ADDRs.join(',');
                var redirectUrlTemplate = '/unidocu/view.do?programId=DRAFT_0011&ID={APPR_ID}&PERNR={PERNR}&BUKRS={BUKRS}&WF_KEY={WF_KEY}&showAsPopup=true';
                item['redirectUrl'] = $u.util.formatString(redirectUrlTemplate, item);


                $nst.it_data_nsReturn('SendApprovalAlarm', [item], function(){
                    unidocuAlert($mls.getByCode('M_sended'), function () {
                        $dialog.dialog('close');
                    });
                });
            })];
            $u.baseDialog.openModalDialog($dialog, {
                width: 1000,
                title: $mls.getByCode('DLT_sendApprovalAlarmDialog'),
                buttons: dialogButtons,
                close: function () {
                    $dialog.remove();
                }
            });
        };
        $ewf.dialog.draftPreviewDialog = {};
        $ewf.dialog.draftPreviewDialog.open = function ($el) {
            var $dialog = $('<div></div>');
            $dialog.append($el);
            $u.baseDialog.openModalDialog($dialog, {
                title: $mls.getByCode('DLT_draftPreviewDialog'),
                width: 1000
            });
        };
    }
});

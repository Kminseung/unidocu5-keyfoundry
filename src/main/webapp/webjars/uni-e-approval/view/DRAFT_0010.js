/**
 * DRAFT_0010    회계전표 결재 요청.
 * @module uni-e-approval/view/DRAFT_0010
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var $uniButtons = $('#uni-buttons');
        var $clonedButtons = $('#cloned-buttons');
        if (opener.$u.page.getPROGRAM_ID() === 'UD_0302_010') $uniButtons.find('button').hide();
        $clonedButtons.append($uniButtons.find('button').clone());

        return function () {
            $ewf.draftUtil.initializeDraftPage();
            var wf_gb = $u.page.getPageParams()['WF_GB'];
            $('#draft-title').replaceWith($ewf.mustache.draftTitleTemplate({
                description: $mls.getByCode('M_requestApproval'),
                WF_GB_TXT: $ewf.draftUtil.getWF_GB_TXT(wf_gb)
            }));
            $ewf.handleChangeLine();
            $ewf.renderDocumentReferenceWF_ORG();
            $u.setValues('uni-form-table5', $u.page.getPageParams());
            $ewf.renderEmbedStatementArea(wf_gb, $u.page.getPageParams()['GRONO']);
            $u.buttons.addHandler({
                "requestApproval": function () {
                    $u.validateRequired('uni-form-table5');
                    var importParams = $.extend({}, $u.page.getPageParams(), $u.getValues('uni-form-table5'));
                    $u.fileUI.setFileAttachKeyParam(importParams);
                    $ewf.changeLine.validateApprovalLineSelected();
                    importParams['WF_SECUR'] = $ewf.changeLine.getWF_SECUR();
                    var tableReturns = $ewf.changeLine.getTableReturns();

                    if (!importParams['WF_GB']) $.extend(importParams, {WF_GB: $ewf.draftUtil.getWF_GB()});
                    var tableParams = {
                        IT_DATA1: tableReturns['OT_DATA1'],
                        IT_DATA2: tableReturns['OT_DATA2'],
                        IT_DATA3: tableReturns['OT_DATA3'],
                        IT_DATA4: tableReturns['OT_DATA4'],
                        IT_WF_ORG: $ewf.getDocumentReferenceListWF_ORG()
                    };

                    if (importParams['ADDAMT']) importParams['WF_AMOUNT'] = importParams['ADDAMT'];
                    if (!importParams['WF_TITLE'] && importParams['TITLE']) importParams['WF_TITLE'] = importParams['TITLE'];

                    $.extend(importParams, {
                        targetNamedServiceId: 'ZUNIEWF_4201',
                        tableParamsString: JSON.stringify(tableParams)
                    });

                    unidocuConfirm($mls.getByCode('M_proceedRequest'), function () {
                        $nst.is_data_tableParams_nsReturn('ApprovalStep', importParams, tableParams, function (nsReturn) {
                            var message = nsReturn.getStringReturn('message');
                            unidocuAlert(message, function () {
                                if ($u.isPopupView()) window.close();
                                else $u.pageReload();
                            });
                        });
                    });
                }
            });
        }
    };
});
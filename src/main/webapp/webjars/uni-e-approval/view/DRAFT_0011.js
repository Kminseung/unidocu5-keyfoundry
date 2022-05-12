/**
 * @module uni-e-approval/view/DRAFT_0011
 */
define(function () {
    $u.page.setCustomParam('messageCodeMap', {
        B: 'DLT_approvalCommentsDialog_approvalComment',
        C: 'DLT_approvalCommentsDialog_cancelComment',
        D: 'DLT_approvalCommentsDialog_rejectComment',
        E: 'DLT_approvalCommentsDialog_retrieveComment',
        G: 'DLT_approvalCommentsDialog_arbitraryComment',
        F: 'DLT_approvalCommentsDialog_comment'
    });

    var messageCodeMap = $u.page.getCustomParam('messageCodeMap');

    var namedServiceIdMap = {
        B: 'ZUNIEWF_4320',
        C: 'ZUNIEWF_4320',
        D: 'ZUNIEWF_4320',
        E: 'ZUNIEWF_4320',
        G: 'ZUNIEWF_4320',
        F: 'ZUNIEWF_4321'
    };

    return function () {
        $u.unidocuUI();
        $u.buttons.addHandler({
            "accept": function(){$u.buttons.runCustomHandler('approvalStepHandler', 'B')},
            "cancelAccept": function(){$u.buttons.runCustomHandler('approvalStepHandler', 'C')},
            "reject": function(){$u.buttons.runCustomHandler('approvalStepHandler', 'D')},
            "withdraw": function(){$u.buttons.runCustomHandler('approvalStepHandler', 'E')},
            "closed": function(){$u.buttons.runCustomHandler('approvalStepHandler', 'G')},
            "comments": function(){$u.buttons.runCustomHandler('approvalStepHandler', 'F')}
        });

        $u.buttons.addCustomHandler({
            approvalStepHandler: function (appr_stat) {
                var title = $mls.getByCode(messageCodeMap[appr_stat]);
                var useComments = false;
                var usePassword = false;
                var approvalPassword;

                var zuniewf_1103_os_data = $nst.is_data_os_data('ZUNIEWF_1103', {ID: staticProperties.user['ID']});

                if (appr_stat !== 'E') useComments = true;

                if (zuniewf_1103_os_data['FLAG_PW'] === 'X') usePassword = true;
                approvalPassword = zuniewf_1103_os_data['WF_PW2'];

                var $deferred = $.Deferred();
                if (useComments) {
                    $ewf.dialog.approvalCommentsDialog.open({
                        title: title,
                        usePassword: usePassword,
                        approvalPassword: approvalPassword,
                        confirmCallback: function (comments) {
                            $deferred.resolve(comments);
                        }
                    });
                } else {
                    unidocuConfirm($mls.getByCode('M_cancelRequest'), function () {
                        $deferred.resolve('');
                    });
                }
                $.when($deferred).done(function (comments) {
                    $u.buttons.runCustomHandler('requestApproval', appr_stat, comments);
                });
            },
            requestApproval: function (appr_stat, comments) {
                var importParam = $.extend({}, $u.page.getPageParams(), {
                    APPR_STAT: appr_stat,
                    APPR_TEXT: comments,
                    comments: comments
                }, {targetNamedServiceId: namedServiceIdMap[appr_stat]});

                $nst.is_data_stringReturns('ApprovalStep', importParam, function(stringReturns){
                    unidocuAlert(stringReturns['message'], function () {
                        if ($u.isPopupView()) {
                            try {opener.$u.buttons.triggerFormTableButtonClick();} // 타 사이트에서 호출 되는 경우 DOMException: Blocked a frame with origin
                            catch (e) {getLogger().log(e);}
                            window.close();
                            location.href = $u.getUrlFromRoot('/unidocu/view.do?programId=UFL_0401_010');
                        } else history.back();
                    });
                });
            }
        });

        return function () {
            var $uniButtons = $('#uni-buttons');
            var $clonedButtons = $('#cloned-buttons');
            $uniButtons.find('button').hide();

            $nst.is_data_nsReturn('ZUNIEWF_4203', $u.page.getPageParams(), function (nsReturn) {
                var os_data = nsReturn.getExportMap('OS_DATA');
                var os_header = nsReturn.getExportMap('OS_HEADER');
                var tableReturns = nsReturn.getTableReturns();
                var ot_button = tableReturns['OT_BUTTON'];

                $('#draft-title').replaceWith($ewf.mustache.draftTitleTemplate($.extend({}, os_header, {
                    description: $mls.getByCode('M_viewDraft'),
                    WF_GB_TXT: $ewf.draftUtil.getWF_GB_TXT(os_header['WF_GB'])
                })));

                var documentReferenceWF_ORG = $ewf.renderDocumentReferenceWF_ORG();
                documentReferenceWF_ORG.setReadOnly(true);
                documentReferenceWF_ORG.appendDocumentReference(tableReturns['OT_WF_ORG']);

                $u.fileUI.load(os_header['WF_ATTACH_KEY'], true);
                $.each(ot_button, function (index, item) {
                    $uniButtons.find('#' + item['BUTTON']).show();
                });

                if($u.openByUniDocu()) {
                    if(opener.$u.page.getPROGRAM_ID() === 'UD_0302_010') $uniButtons.find('button').hide();
                }

                $clonedButtons.append($uniButtons.find('button').clone());

                $('#approval-line-wrapper').empty().append($ewf.getApprovalLineEl(os_header, os_data, tableReturns, $nst.is_data_ot_data('ZUNIEWF_4323', {WF_KEY: os_header['WF_KEY']})));
                $u.setValues('uni-form-table5', os_header);

                $ewf.renderEmbedStatementArea(os_header['WF_GB'], os_header['GRONO']);

                if($u.isPopupView()) $u.util.resizeWindowBy$el($('#searchForm'), 40);

                $magnachip.statementPop();
            });
        }
    };
});
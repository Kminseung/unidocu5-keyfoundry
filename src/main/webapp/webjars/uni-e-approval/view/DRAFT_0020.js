/**
 * DRAFT_0020   일반품의
 * DRAFT_0021   매장시재금품의
 * @module uni-e-approval/view/DRAFT_0020
 */
define(function () {
    return function () {
        $u.unidocuUI();
        $ewf.draftUtil.initializeDraftPage();
        $u.buttons.addHandler({
            "tempSave": function () {
                $u.validateRequired();
                var is_data = $u.getValues('uni-form-table1,uni-form-table2'); // 다중 체크박스 처리
                is_data['REQNO'] = $u.page.getPageParams()['REQNO'];
                if ($u.page.getPageParams()['OREQNO']) is_data['OREQNO'] = $u.page.getPageParams()['OREQNO'];
                is_data['REQTXT'] = $u.page.getPageParams()['REQTXT'];
                $u.fileUI.setFileAttachKeyParam(is_data);
                $ewf.changeLine.validateApprovalLineSelected();
                $.extend(is_data, $ewf.changeLine.getSelectedOT_DATA());
                var tableReturns = $ewf.changeLine.getTableReturns();
                var tableParams = {
                    IT_DATA1: tableReturns['OT_DATA1'],
                    IT_DATA2: tableReturns['OT_DATA2'],
                    IT_DATA3: tableReturns['OT_DATA3'],
                    IT_DATA4: tableReturns['OT_DATA4'],
                    IT_WF_ORG: $ewf.getDocumentReferenceListWF_ORG()
                };
                var funcname = 'ZUNIEWF_6401';
                if ($u.page.getPROGRAM_ID() === 'DRAFT_0021') funcname = 'ZUNIEWF_6411';

                $nst.is_data_tableParams_nsReturn(funcname, is_data, tableParams, function (message) {
                    unidocuAlert(message, function () {
                        $u.navigateByProgramId('UFL_0301_000');
                    });
                });
            }
        });

        return function () {
            var $whenAfterChangeLineHandle;
            var pageParams = $u.page.getPageParams();
            $whenAfterChangeLineHandle = $.when($ewf.handleChangeLine());
            $ewf.renderDocumentReferenceWF_ORG();

            if ($ewf.draftUtil.hasSavedData()) {
                var funcname = 'ZUNIEWF_6403';
                if ($u.page.getPROGRAM_ID() === 'DRAFT_0021') funcname = 'ZUNIEWF_6413';

                $nst.is_data_nsReturn(funcname, $u.page.getPageParams(), function (nsReturn) {
                    var os_data = nsReturn.getExportMap('OS_DATA');
                    var os_text = nsReturn.getExportMap('OS_TEXT');
                    var os_line = nsReturn.getExportMap('OS_LINE');
                    var tableReturns = nsReturn.getTableReturns();

                    if (pageParams['OREQNO']) {
                        pageParams['REQNO'] = '';
                        os_text['TITLE'] = pageParams['TITLE'];
                    }

                    os_line['changeLine'] = os_line['SEQ'];
                    var values = $.extend(os_data, os_text, os_line);
                    $u.setValues('uni-form-table1', values);
                    $u.setValues('uni-form-table2', values);

                    $whenAfterChangeLineHandle.done(function () {
                        $ewf.changeLine.setTableReturns(tableReturns);
                        $('#approval-line-wrapper').empty().append($ewf.getApprovalLineEl({}, staticProperties.user, tableReturns));
                    });

                    var documentReferenceWF_ORG = $ewf.renderDocumentReferenceWF_ORG();
                    documentReferenceWF_ORG.appendDocumentReference(tableReturns['OT_WF_ORG']);
                    $u.showSubContent();
                });
            } else {
                $u.showSubContent();
            }

            if ($u.page.getPROGRAM_ID() === 'DRAFT_0021') {
                function setDMBTR() {
                    $nst.is_data_nsReturn('ZUNIEWF_6410', $u.getValues('uni-form-table2'), function (nsReturn) {
                        $u.get('DMBTR').setValue(nsReturn.getStringReturn('O_DMBTR'));
                    });
                }

                if ($u.get('PRCTR')) $u.get('PRCTR').$el.change(function () {
                    setDMBTR();
                }).change();
                else setDMBTR();
            }

            var $uniButtons = $('#uni-buttons, #cloned-buttons');
            if (!$ewf.draftUtil.isReadOnly()) $uniButtons.find('#requestApproval_DRAFT_0020').show();
            $('#cloned-buttons').append($uniButtons.find('button').clone());
        }
    };
});
/**
 * 결재선 modify 다이얼로그
 * @module uni-e-approval/$ewf/modifyApprovalDialog
 */
define(function () {
    return function () {
        $ewf.dialog.modifyApprovalDialog = {};
        $ewf.dialog.modifyApprovalDialog.orgTree = {};
        $ewf.dialog.modifyApprovalDialog.open = function (params) {
            var saveCallback = params['saveCallback'];
            var selectedRow = params['selectedJSONData'];
            var ZUNIEWF_2001Params = params['ZUNIEWF_2001Params'];
            var givenTableReturns = params['tableReturns'];
            if (!givenTableReturns) givenTableReturns = {};
            var directChangeConfirmCallback = params['directChangeConfirmCallback'];

            var $dialog = $($ewf.mustache.modifyApprovalDialogTemplate());

            $u.renderUIComponents($dialog);
            if (params['mode'] === 'directChange') $u.remove('approval-dialog-form-table', $dialog);
            else $u.remove('approval-dialog-form-table2', $dialog);

            if (params['mode'] === 'directChange') $dialog.find('#addDynamicApprover, #addDynamicReferer, #addDynamicReader, #addDynamicSupporter').hide();

            $ewf.dialog.modifyApprovalDialog.orgTree = new $efi.OrgTree($dialog.find('#org-tree'), {
                load_node: function () {
                    $ewf.dialog.modifyApprovalDialog.orgTree.select_node(staticProperties.user['ID']);
                },
                select_node: function () {
                }
            });
            $ewf.dialog.modifyApprovalDialog.orgTree.initOrgData();
            var os_data = $nst.is_data_os_data('ZUNIEWF_1200', {});

            if (os_data['WF_LINE2_FLAG'] !== 'X') $dialog.find('#wf-line-2').hide();
            if (os_data['WF_LINE3_FLAG'] !== 'X') $dialog.find('#wf-line-3').hide();
            if (os_data['WF_LINE4_FLAG'] !== 'X') $dialog.find('#wf-line-4').hide();

            var hideCount = 0;
            if (os_data['WF_LINE2_FLAG'] !== 'X') hideCount++;
            if (os_data['WF_LINE3_FLAG'] !== 'X') hideCount++;
            if (os_data['WF_LINE4_FLAG'] !== 'X') hideCount++;

            var treeHeight = 700 - (180 * hideCount);
            if (treeHeight < 400) treeHeight = 400;
            $ewf.dialog.modifyApprovalDialog.orgTree.setHeight(treeHeight);

            var approvalLineGrid1 = $u.gridWrapper.getGrid('approval-line-grid1');
            var approvalLineGrid2 = $u.gridWrapper.getGrid('approval-line-grid2');
            var approvalLineGrid3 = $u.gridWrapper.getGrid('approval-line-grid3');
            var approvalLineGrid4 = $u.gridWrapper.getGrid('approval-line-grid4');
            var approvalLineGridList = [approvalLineGrid1, approvalLineGrid2, approvalLineGrid3, approvalLineGrid4];

            approvalLineGrid1.setPanelText($mls.getByCode('M_GRID_customPanelTitle_approver'));
            approvalLineGrid2.setPanelText($mls.getByCode('M_GRID_customPanelTitle_referer'));
            approvalLineGrid3.setPanelText($mls.getByCode('M_GRID_customPanelTitle_reader'));
            approvalLineGrid4.setPanelText($mls.getByCode('M_GRID_customPanelTitle_supporter'));

            if ($u.page.getPROGRAM_ID() === 'UFL_0101_020') { // 문서구분에 대한 결재선 지정
                $dialog.find('#approval-dialog-form-table').hide();
                $dialog.find('.wf-line').hide();
                $dialog.find('#wf-line-' + ZUNIEWF_2001Params['WF_ITEM_GB']).show();
            }

            $.each(approvalLineGridList, function (index, gridObj) {
                gridObj.setCheckBarAsRadio('SELECTED');
                gridObj.setSortEnable(false);
            });
            // 합의/회계 구분
            if (os_data['WF_FINAN_FLAG'] === 'X') approvalLineGrid1.setColumnHide('WF_AGRET', true);
            else approvalLineGrid1.setColumnHide('WF_FINAN', true);

            $.each([approvalLineGrid2, approvalLineGrid3, approvalLineGrid4], function (index, gridObj) {
                gridObj.setColumnHide('WF_AGRET');
                gridObj.setColumnHide('WF_FINAN');
            });


            if (selectedRow) {
                $u.setValues('approval-dialog-form-table', selectedRow);
                $nst.is_data_tableReturns('ZUNIEWF_2203', selectedRow, function (tableReturns) {
                    $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT(tableReturns);
                    approvalLineGrid1.setJSONData(tableReturns['OT_DATA1']);
                    approvalLineGrid2.setJSONData(tableReturns['OT_DATA2']);
                    approvalLineGrid3.setJSONData(tableReturns['OT_DATA3']);
                    approvalLineGrid4.setJSONData(tableReturns['OT_DATA4']);
                });
            }
            if ($u.page.getPROGRAM_ID() === 'UFL_0101_020' && ZUNIEWF_2001Params['WF_LINE']) { // 문서구분에 대한 결재선 지정
                $nst.is_data_ot_data('ZUNIEWF_2003', ZUNIEWF_2001Params, function (ot_data) {
                    $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT_Single(ot_data);
                    approvalLineGridList[ZUNIEWF_2001Params['WF_ITEM_GB'] - 1].setJSONData(ot_data);
                });
            }
            if (params['mode'] === 'directChange') {
                $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT(givenTableReturns);
                approvalLineGrid1.setJSONData(givenTableReturns['OT_DATA1']);
                approvalLineGrid2.setJSONData(givenTableReturns['OT_DATA2']);
                approvalLineGrid3.setJSONData(givenTableReturns['OT_DATA3']);
                approvalLineGrid4.setJSONData(givenTableReturns['OT_DATA4']);
            }

            approvalLineGrid1.onChangeCell(function (columnKey) {
                if (columnKey === 'SELECTED') return;
                $ewf.dialog.modifyApprovalDialog.handleWF_SEQ(approvalLineGrid1, approvalLineGrid1.getJSONData());
            });

            $u.buttons.addHandler({ // @formatter:off
                "addApprover": function () {$ewf.dialog.modifyApprovalDialog.appendSelectedPerson(approvalLineGrid1);}, // 결재자
                "removeApprover": function () {$ewf.dialog.modifyApprovalDialog.removeSelectedPerson(approvalLineGrid1);},
                "upApprover": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid1, -1);},
                "downApprover": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid1, 1);},
                "addDynamicApprover": function () {$ewf.dialog.modifyApprovalDialog.addDynamicUser(approvalLineGrid1);},
                "addReferer": function () {$ewf.dialog.modifyApprovalDialog.appendSelectedPerson(approvalLineGrid2);}, // 참조자
                "removeReferer": function () {$ewf.dialog.modifyApprovalDialog.removeSelectedPerson(approvalLineGrid2);},
                "upReferer": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid2, -1);},
                "downReferer": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid2, 1);},
                "addDynamicReferer": function () {$ewf.dialog.modifyApprovalDialog.addDynamicUser(approvalLineGrid2);},
                "addReader": function () {$ewf.dialog.modifyApprovalDialog.appendSelectedPerson(approvalLineGrid3);}, // 열람자
                "removeReader": function () {$ewf.dialog.modifyApprovalDialog.removeSelectedPerson(approvalLineGrid3);},
                "upReader": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid3, -1);},
                "downReader": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid3, 1);},
                "addDynamicReader": function () {$ewf.dialog.modifyApprovalDialog.addDynamicUser(approvalLineGrid3);},
                "addSupporter": function () {$ewf.dialog.modifyApprovalDialog.appendSelectedPerson(approvalLineGrid4);}, // 협조자
                "removeSupporter": function () {$ewf.dialog.modifyApprovalDialog.removeSelectedPerson(approvalLineGrid4);},
                "upSupporter": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid4, -1);},
                "downSupporter": function () {$ewf.dialog.modifyApprovalDialog.swapSelectedPerson(approvalLineGrid4, 1);},
                "addDynamicSupporter": function () {$ewf.dialog.modifyApprovalDialog.addDynamicUser(approvalLineGrid4);}
            }); // @formatter:on

            var buttonText = $mls.getByCode('DLB_save');
            var buttonClickHandler = function () {
                var params;
                if ($u.page.getPROGRAM_ID() === 'UFL_0101_020') { // 문서구분에 대한 결재선 지정
                    params = $.extend({}, ZUNIEWF_2001Params, {
                        WF_USE: 'A' // 공용 결재선
                    });

                    var it_data = approvalLineGridList[ZUNIEWF_2001Params['WF_ITEM_GB'] - 1].getJSONData();
                    if (it_data.length === 0) throw $mls.getByCode('M_chooseApprovalLine');
                    if (ZUNIEWF_2001Params['WF_ITEM_GB'] === 1) {
                        if (it_data[it_data.length - 1]['WF_AGRET'] !== '') throw $mls.getByCode('M_lastApprovalCanNotSetAsAgreementUser');
                    }

                    $nst.is_data_it_data_nsReturn('ZUNIEWF_2001', params, it_data, function (nsReturn) {
                        var stringReturns = nsReturn.getStringReturns();
                        saveCallback(stringReturns['O_WF_LINE'], ZUNIEWF_2001Params['WF_ITEM_GB']);
                        $dialog.dialog('close');
                    });
                } else {
                    $u.validateRequired('approval-dialog-form-table');
                    var it_data1 = approvalLineGrid1.getJSONData();
                    if (it_data1.length === 0) throw $mls.getByCode('M_chooseApprovalLine');
                    if (it_data1[it_data1.length - 1]['WF_AGRET'] !== '') throw $mls.getByCode('M_lastApprovalCanNotSetAsAgreementUser');
                    var tableParams = {
                        IT_DATA1: it_data1,
                        IT_DATA2: approvalLineGrid2.getJSONData(),
                        IT_DATA3: approvalLineGrid3.getJSONData(),
                        IT_DATA4: approvalLineGrid4.getJSONData()
                    };
                    params = $u.getValues('approval-dialog-form-table');
                    params = $.extend({}, selectedRow, params);
                    $nst.is_data_tableParams_nsReturn('ZUNIEWF_2201', params, tableParams, function () {
                        saveCallback();
                        $dialog.dialog('close');
                    });
                }
            };
            if (params['mode'] === 'directChange') {
                buttonText = $mls.getByCode('DLB_confirm');
                buttonClickHandler = function () {
                    var it_data1 = approvalLineGrid1.getJSONData();
                    if (it_data1.length === 0) throw $mls.getByCode('M_chooseApprovalLine');
                    if (it_data1[it_data1.length - 1]['WF_AGRET'] !== '') throw $mls.getByCode('M_lastApprovalCanNotSetAsAgreementUser');

                    var wf_secur = '';
                    if ($u.get('approval-dialog-form-table2', 'WF_SECUR')) wf_secur = $u.get('approval-dialog-form-table2', 'WF_SECUR').getValue();
                    directChangeConfirmCallback(wf_secur, {
                        OT_DATA1: it_data1,
                        OT_DATA2: approvalLineGrid2.getJSONData(),
                        OT_DATA3: approvalLineGrid3.getJSONData(),
                        OT_DATA4: approvalLineGrid4.getJSONData()
                    });
                    $dialog.dialog('close');
                };
            }

            var title = $mls.getByCode('DLT_modifyApprovalDialog_create');
            if (selectedRow) title = $mls.getByCode('DLT_modifyApprovalDialog_editDefault');
            if (params['mode'] === 'directChange') title = $mls.getByCode('DLT_modifyApprovalDialog_edit');

            $u.baseDialog.openModalDialog($dialog, {
                width: 1020,
                title: title,
                draggable: true,
                "class": 'modify-approval-dialog',
                buttons: [
                    $u.baseDialog.getButton(buttonText, buttonClickHandler),
                    $u.baseDialog.getButton($mls.getByCode('DLB_cancel'), function () {
                        $dialog.dialog('close');
                    })
                ],
                open: function () {
                    $('.ui-dialog .ui-dialog-buttonpane .ui-dialog-buttonset').css({
                        "text-align": 'center',
                        "float": 'none'
                    })
                },
                close: function () {
                    $dialog.remove();
                }
            });
        };
        $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT = function(tableReturns) {
            $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT_Single(tableReturns['OT_DATA1']);
            $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT_Single(tableReturns['OT_DATA2']);
            $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT_Single(tableReturns['OT_DATA3']);
            $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT_Single(tableReturns['OT_DATA4']);
        };
        $ewf.dialog.modifyApprovalDialog.handleDISPLAY_TEXT_Single = function (list) {
            $.each(list, function (index, item) {
                item['DISPLAY_TEXT'] = $u.util.formatString('{JOB_KEY_TXT} {WF_ID_TXT}', item);
                if (!item['WF_ID_TXT']) item['DISPLAY_TEXT'] = item['WF_USER_TXT'];
            });
        };
        $ewf.dialog.modifyApprovalDialog.handleWF_SEQ = function(targetGrid, gridData) {
            var nextSeq = 1;
            $.each(gridData, function (index, item) {
                if (index !== 0 && (gridData[index - 1]['WF_AGRET'] === '' || item['WF_AGRET'] === '')) nextSeq++;
                item['WF_LINE_LEV'] = nextSeq;
                item['WF_SEQ'] = index + 1;
            });
            targetGrid.setJSONData(gridData);
        };

        $ewf.dialog.modifyApprovalDialog.appendSelectedPerson = function(targetGrid) {
            if (!$ewf.dialog.modifyApprovalDialog.orgTree.hasSelectedNode()) throw $mls.getByCode('M_selectTarget');
            if ($ewf.dialog.modifyApprovalDialog.orgTree.isDeptNode()) return;
            var jsonData = $ewf.dialog.modifyApprovalDialog.orgTree.getSelectedData();

            jsonData["WF_ID"] = jsonData["ID"];
            jsonData["WF_ID_TXT"] = jsonData["SNAME"];
            if (targetGrid.getRowCount() >= 10) throw $mls.getByCode('M_canNotAddMoreThanTenUser');
            if (targetGrid.$F(jsonData['WF_ID'], 'WF_ID').length > 0) throw $u.util.formatString($mls.getByCode('M_alreadAddedUser'), jsonData);

            jsonData['DISPLAY_TEXT'] = $u.util.formatString('{JOB_KEY_TXT} {WF_ID_TXT}', jsonData);
            jsonData['WF_AGRET'] = '';
            var gridData = targetGrid.getJSONData();
            var clonedJSONData = $.extend({}, jsonData);
            delete clonedJSONData.id;
            gridData.push(clonedJSONData);
            var sortedGridData = [];
            var wf_finanList = [];
            $.each(gridData, function (index, item) {
                if (item['WF_FINAN'] === '1') wf_finanList.push(item);
                else sortedGridData.push(item);
            });
            sortedGridData = sortedGridData.concat(wf_finanList);
            $ewf.dialog.modifyApprovalDialog.handleWF_SEQ(targetGrid, sortedGridData);
        };

        $ewf.dialog.modifyApprovalDialog.removeSelectedPerson = function(targetGrid) {
            targetGrid.deleteSelectedRows();
            $ewf.dialog.modifyApprovalDialog.handleWF_SEQ(targetGrid, targetGrid.getJSONData());
        };

        $ewf.dialog.modifyApprovalDialog.swapSelectedPerson = function (targetGrid, offset) {
            targetGrid.swapRow(offset);
            $ewf.dialog.modifyApprovalDialog.handleWF_SEQ(targetGrid, targetGrid.getJSONData());
        };

        $ewf.dialog.modifyApprovalDialog.addDynamicUser = function (targetGrid) {
            $u.dialog.codeComboDialog.open('WF_USER', {}, '', function (code, textValue) {
                var gridData = targetGrid.getJSONData();
                gridData.push({WF_USER: code, DISPLAY_TEXT: textValue});
                $ewf.dialog.modifyApprovalDialog.handleWF_SEQ(targetGrid, gridData);
            });
        };
    }
});
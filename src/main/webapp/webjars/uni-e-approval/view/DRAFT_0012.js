/**
 * DRAFT_0012    예산품의서
 * @module uni-e-approval/view/DRAFT_0012
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        var gridObj2 = $u.gridWrapper.getGrid('unidocu-grid2');

        gridObj.setSortEnable(false);
        gridObj2.setSortEnable(false);

        $u.buttons.addHandler({
            "tempSave": function () {
                $u.validateRequired();
                var is_data = $u.getValues('uni-form-table1,uni-form-table5,uni-form-table-draft0012-reason'); // 다중 체크박스 처리
                is_data['REQNO'] = $u.page.getPageParams()['REQNO'];
                if ($u.page.getPageParams()['OREQNO']) is_data['OREQNO'] = $u.page.getPageParams()['OREQNO'];
                is_data['REQTXT'] = $u.page.getPageParams()['REQTXT'];
                $u.fileUI.setFileAttachKeyParam(is_data);
                gridObj.validateGridRequired();
                gridObj2.validateGridRequired();
                var it_item1 = gridObj.getJSONData();
                var it_item2 = gridObj2.getJSONData();

                if (it_item1.length === 0) throw $mls.getByCode('M_draft_0012_item1Empty');
                if (it_item2.length === 0) throw $mls.getByCode('M_draft_0012_item2Empty');

                var tableParams = {
                    IT_ITEM1: it_item1,
                    IT_ITEM2: it_item2
                };
                $nst.is_data_tableParams_nsReturn('ZUNIEWF_6051', is_data, tableParams, function (nsReturn) {
                    var $dialog = $efi.dialog.afterCreateStatementDialog.open({
                        mode: 'create_statement_draft_0061',
                        REQTXT: nsReturn.getExportMap('OS_DATA')['REQNO'],
                        REQNO: nsReturn.getExportMap('OS_DATA')['REQNO']
                    });

                    $dialog.parent().find('.ui-dialog-title').text($mls.getByCode('DLT_unidocuAlert'));
                    $dialog.find('th').text('Req No.');
                });
            },
            "addRowGridObj": function () {
                $u.dialog.addRowByGridDialog.open({
                    confirmCallback: function (jsonData) {
                        var keys = {};

                        $.each(gridObj.getJSONData(), function (index, item) {
                            keys[getKey(item)] = true;
                        });
                        $.each(jsonData, function (index, item) {
                            if (keys[getKey(item)]) return true;
                            keys[getKey(item)] = true;
                            gridObj.addRowByJSONData(item);
                        });

                        function getKey(item) {
                            var key = '';
                            $.each(['HKONT', 'KOSTL', 'AUFNR'], function (index, columnKey) {
                                if (item[columnKey]) key += item[columnKey];
                            });
                            return key;
                        }
                    }
                });
            },
            "deleteRowGridObj": function () {
                function getKeyByRowData(rowData) {
                    var keyValueString = '';
                    $.each(['HKONT', 'KOSTL', 'AUFNR'], function (index, key) {
                        if (rowData[key]) keyValueString += rowData[key];
                    });
                    return keyValueString;
                }

                gridObj.asserts.rowSelected();
                var selectedKey = getKeyByRowData(gridObj.getSELECTEDJSONData()[0]);
                gridObj.deleteSelectedRows();

                var grid2DeletingRowIndexes = [];
                $.each(gridObj2.getJSONData(), function (index, rowData) {
                    if (selectedKey === getKeyByRowData(rowData)) grid2DeletingRowIndexes.push(index);
                });
                gridObj2.deleteRowByRowIndexes(grid2DeletingRowIndexes);
            },
            "addRowGridObj2": function () {
                gridObj.asserts.rowSelected($mls.getByCode('M_draft_0012_rowSelected'));
                gridObj.validateRequiredBySelected();

                var selectedRowData = gridObj.getSELECTEDJSONData()[0];
                if (gridObj.getGridHeader('CHECK') && selectedRowData['CHECK'] !== '1') throw $mls.getByCode('M_draft_0012_validateCHECK');
                if ($u.get('SPMON')) selectedRowData['MON'] = Number($u.get('SPMON').getValue().substr(4, 2));
                gridObj2.addRowByJSONData(selectedRowData);
            },
            "deleteRowGridObj2": function () {
                gridObj2.asserts.rowSelected();
                gridObj2.deleteSelectedRows();
            },
            "getBudget": function () { // DRAFT_0012	예산품의서
                gridObj.asserts.rowSelected();
                var selectedRowIndex = gridObj.getSelectedRowIndexes()[0];
                gridObj.validateRequiredByRowIndex(selectedRowIndex);

                var is_data = gridObj.getJSONDataByRowIndex(selectedRowIndex);
                if ($u.get('SPMON')) is_data['SPMON'] = $u.get('SPMON').getValue();
                is_data['BUKRS'] = staticProperties.user['IS_KEY_BUKRS'];

                $nst.is_data_os_data('ZUNIEWF_6054', is_data, function (os_data) {
                    gridObj.setRowDataByJSONObj(selectedRowIndex, os_data);
                });
            }
        });

        return function () {
            gridObj.setCheckBarAsRadio('SELECTED');
            if ($u.get('SPMON')) {
                $u.get('SPMON').$el.change(function () {
                    gridObj.clearGridData();
                    gridObj2.clearGridData();
                    $u.buttons.runHandler('addRowGridObj');
                });
            }
            if ($u.page.getPageParams()['REQNO']) {
                $nst.is_data_nsReturn('ZUNIEWF_6053', $u.page.getPageParams(), function (nsReturn) {
                    var os_data = nsReturn.getExportMap('OS_DATA');
                    var os_text = nsReturn.getExportMap('OS_TEXT');
                    var tableReturns = nsReturn.getTableReturns();

                    var values = $.extend(os_data, os_text);
                    $u.setValues('uni-form-table1', values);
                    $u.setValues('uni-form-table5', values);
                    $u.setValues('uni-form-table-draft0012-reason', values);

                    gridObj.setJSONData(tableReturns['OT_ITEM1']);
                    gridObj2.setJSONData(tableReturns['OT_ITEM2']);


                    var readOnly = false;
                    if($u.page.getPageParams()['GRONO']) {
                        gridObj.makeReadOnlyGrid();
                        gridObj2.makeReadOnlyGrid();
                        $('.uni-form-table-button-area button').hide();
                        $u.makeReadOnlyForm('uni-form-table5');
                        readOnly = true;
                    }
                    $u.fileUI.load(os_data['EVI_SEQ'], readOnly);
                });
            }
            $('#cloned-buttons').append($('#uni-buttons, #cloned-buttons').find('button').clone());
        }
    };
});
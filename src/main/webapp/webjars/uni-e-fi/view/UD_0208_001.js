/**
 * UD_0208_001    가지급금 정산
 * @module uni-e-fi/view/UD_0208_001
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();

        var ids = {
            table1: 'form-table-1',
            table2: 'form-table-2',
            statementInfo: 'statement-information-content',
            vendorInfo: 'vendor-info',
            grid2: 'unidocu-grid2'
        };
        var grid2Id = 'unidocu-grid2';
        var gridObj2 = $u.gridWrapper.getGrid(grid2Id);
        var $u_LIFNR = $u.get('form-table-1', 'LIFNR');
        var $u_calculateKind = $u.get(ids.table2, 'calculateKind');
        var $u_calculateType = $u.get(ids.table2, 'calculateType');
        var $u_depositType = $u.get(ids.table2, 'depositType');

        gridObj2.onTreeNodeClick(function (rowIndex) {
            $efi.popup.openStatementViewWithParamMap(gridObj2.getJSONDataByRowIndex(rowIndex));
        });

        if ($u_LIFNR) $u_LIFNR.$el.change(function () {
            $u.buttons.triggerFormTableButtonClick(ids.table1);
        });

        if ($u_calculateKind) $u_calculateKind.$el.change(onCalculateKindChange);
        if ($u_calculateType) $u_calculateType.$el.change(onCalculateKindChange);
        if ($u_depositType) $u_depositType.$el.change(handleStatementKindChange);


        $efi.createStatementCommon.bindFormButton();
        $u.buttons.addHandler({
            "form-table-1-doQuery": function () {
                $nst.is_data_ot_data('ZUNIEFI_5002', $u.getValues(ids.table1), function (ot_data) {
                    $.each(ot_data, function (index, item) {
                        if (item['GROUP_KEY'] === item['ZUONR']) item['GROUP_KEY'] = '*';
                    });
                    gridObj2.setTreeData('BELNR', ot_data, 'GROUP_KEY', 'ZUONR', '*');
                    gridObj2.expandAll();
                    gridObj2.enableTreeClickEvent(false);
                    if (gridObj2.getRowCount() > 0) gridObj2.$V('SELECTED', 0, '1');
                });
            },
            createStatement: function () {
                $u.validateRequired(ids.table1);
                var gridObj2 = $u.gridWrapper.getGrid(ids.grid2);
                var name = $u.get(ids.table1, 'LIFNR').params.thText;
                gridObj2.asserts.rowSelected($u.util.formatString($mls.getByCode('M_UD_0208_001_validateLIFNRSelect'), {name: name}));
                $efi.createStatement.validateCreateStatement();

                var params = $efi.createStatement.getCreateStatementCommonParams();
                params['funcname'] = 'ZUNIEFI_5004';
                params.paramMap['EVIKB'] = getStatementKind();
                params.paramMap['INV_SEQ'] = $u.page.getCustomParam('INV_SEQ');
                var tableParams = {
                    IT_DATA: params.gridData,
                    IT_VEND: [params.paramMap],
                    IT_STEP1: gridObj2.getSELECTEDJSONData()
                };
                tableParams['IT_ATTACH'] = $u.fileUI.getFineUploader().getCopiedFileInfos();
                $nst.is_data_tableParams_os_docno(params['funcname'], params.paramMap, tableParams, function (os_docno) {
                    $efi.dialog.afterCreateStatementDialog.open(os_docno, $u.pageReload);
                });
            }
        });

        function getStatementKind() {
            var $u_calculateKind = $u.get(ids.table2, 'calculateKind');
            var $u_calculateType = $u.get(ids.table2, 'calculateType');
            var $u_depositType = $u.get(ids.table2, 'depositType');

            if (!$u_calculateKind) return '';
            if ($u_calculateKind.getValue() === 'A') return $u_calculateType.getValue();
            else return $u_depositType.getValue();
        }

        function setFormTable(selectedData) {
            if (!selectedData) selectedData = {};
            var statementKind = getStatementKind();
            var subGroup = $u.page.getPROGRAM_ID() + '_' + statementKind;
            if (statementKind === '') {
                subGroup = $u.page.getPROGRAM_ID();
                $('#form-table-2').hide();
            }
            selectedData['programIdStatementKind'] = subGroup;

            $u.page.setCustomParam('INV_SEQ', selectedData['INV_SEQ']);
            var $statementKindDependentArea = $('#statement-kind-dependent-area');
            var gridObj = $u.gridWrapper.getGrid();
            $(gridObj).data('subGroup', subGroup);
            $u.renderUIComponents($statementKindDependentArea, subGroup, selectedData);
            $(gridObj).show();
            if (gridObj.getGridHeaders().length === 1) $('#amount-grid-wrapper').hide();
            else $('#amount-grid-wrapper').show();

            $efi.statementInitialData.setStatementInitialData(subGroup, function () {
                if (gridObj.getGridHeaders().length !== 1) {
                    if (getStatementKind() === 'A1') $efi.createStatementCommon.handleEditMode();
                    else $efi.createStatementCommon.addRow();
                    $efi.createStatement.bindGridEvent();
                    gridObj.fitToWindowSize();
                }
                $efi.createStatement.bindEvent.bindCommonFormEvent();
                if ($u.get('ZLSCH')) $u.get('ZLSCH').triggerChange();
            });
        }

        function handleStatementKindChange() {
            $u.remove(ids.statementInfo);
            $u.remove(ids.vendorInfo);
            var gridObj = $u.gridWrapper.getGrid();
            $(gridObj).hide();


            if (getStatementKind() === 'A1') {
                $efi.dialog.evidenceSelectDialog.open({
                    "evidencePROGRAM_ID": "UD_0201_010",
                    "selectCallback": function (selectedData) {
                        setFormTable(selectedData);
                        $u.get('ISSUE_ID').$el.append($efi.get$evidenceIcon(selectedData));
                    },
                    closeWithoutSelectCallback: function () {
                        $u.get(ids.table2, 'calculateKind').setValue('A');
                        $u.get(ids.table2, 'calculateType').setValue('A2');
                        $u.get(ids.table2, 'calculateKind').$el.change();
                    }
                });
            } else {
                setFormTable();
            }
            $u.showSubContent();
        }

        function onCalculateKindChange() {
            if ($u_calculateKind && $u_calculateKind.getValue() === 'A') { // 정산구분-정산
                $u_calculateType.setReadOnly(false);
                $u_depositType.setReadOnly(true);
                $u_calculateType.$el.show();
                $u_depositType.$el.hide();
                $u_calculateType.setThText($u_calculateType.params.thText);
            } else { // 정산구분-입금
                $u_calculateType.setReadOnly(true);
                $u_depositType.setReadOnly(false);
                $u_calculateType.$el.hide();
                $u_depositType.$el.show();
                $u_calculateType.setThText($u_depositType.params.thText);
            }
            handleStatementKindChange();
        }

        return function () {
            gridObj2.setCheckBarAsRadio('SELECTED');
            gridObj2.setSortEnable(false);
            if ($u_LIFNR) {
                $u_LIFNR.$el.change(function () {
                    gridObj2.clearGridData();
                    if ($u_LIFNR.getValue() !== '') $u.buttons.triggerFormTableButtonClick();
                }).change();
            }
            onCalculateKindChange();
        }
    }
});
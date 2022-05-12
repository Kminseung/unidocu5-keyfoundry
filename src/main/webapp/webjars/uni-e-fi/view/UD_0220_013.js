/**
 * UD_0220_013    출장비 전표결재
 *
 * @module uni-e-fi/view/UD_0220_013
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();

        $u.programSetting.appendTemplate('useOnLoadSelect', {
            defaultValue: 'false',
            description: '화면 로드시 자동 조회 사용 여부'
        });
        $u.programSetting.appendTemplate('setCheckBarAsRadio', {
            defaultValue: 'false',
            description: '그리드 선택 컬럼 radio mode 로 설정'
        });
        $u.programSetting.appendTemplate('hideCheckBar', {
            defaultValue: 'false',
            description: '그리드 선택 컬럼 표시하지 않음'
        });
        $u.programSetting.appendTemplate('useOnRadioChangeSelect', {
            defaultValue: 'false',
            description: 'radio type 검색 조건이 변경 되는 경우 자동조회'
        });
        $u.programSetting.appendTemplate('useHeaderCheckbox', {
            defaultValue: 'false',
            description: 'checkbar 전체 선택/해제 사용 여부'
        });
        $u.programSetting.appendTemplate('showSummary', {
            defaultValue: 'false',
            description: '금액 필드 합계 표시'
        });
        $u.programSetting.appendTemplate('nextProgramIDforCreatingReqno', {
            defaultValue: 'UD_0220_002',
            description: '출장비 신청 버튼 클릭시 이동할 화면'
        });
        $u.programSetting.appendTemplate('default BSTAT value', {defaultValue: 'V'});
        $u.programSetting.appendTemplate('use handle group check', {defaultValue: 'true'});
        $u.programSetting.appendTemplate('use GRONO_EB select validation', {defaultValue: 'true'});
        $u.programSetting.appendTemplate('set default ZFBDT empty', {defaultValue: 'false'});
        $u.programSetting.appendTemplate('regularStatementPostingFuncName',{
            defaultValue: 'ZUNIEFI_9010',
            description: 'regularStatementPosting의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('cancelGroupFuncName',{
            defaultValue: 'ZUNIEFI_4202',
            description: 'cancelGroup의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('makeGroupFuncName',{
            defaultValue: 'ZUNIEFI_4201',
            description: 'makeGroup의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('requestApprovalFuncName',{
            defaultValue: 'ZUNIEFI_4203',
            description: 'requestApproval의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('batchMakeGroupFuncName',{
            defaultValue: 'ZUNIEFI_4201',
            description: 'batchMakeGroup의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('expKeyMappingTable', {
            defaultValue: {'A': 'ROOM_EXP', 'B': 'TRAN_EXP', 'C': 'DAY_EXP'},
            type: 'json',
            description: '그리드의 비용구분 코드키와 합계 폼 키를 매핑'
        });

        $u.page.restoreSearchConditions();
        $u.buttons.addHandler($u.Unidocu001.layoutButtonHandler);

        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue) {
            if($u.page.getPROGRAM_ID() === 'UD_0302_000_D62') return;
            $u.util.tryCatchCall(function () {
                if (columnKey === 'SELECTED') {
                    if ($u.programSetting.getValue('use handle group check') === 'true') gridObj.handleGroupCheck('SELECTED', 'GRONO', rowIndex, newValue);
                    if ($u.programSetting.getValue('use GRONO_EB select validation') === 'true') $efi.UD_0302_000selectionValidator.validate();
                    $u.buttons.runCustomHandler('setSummaryFormValues', $u.buttons.runCustomHandler('getExpensesSummaries'));
                }
            }, function () {
                gridObj.$V('SELECTED', rowIndex, oldValue);
                $u.buttons.runCustomHandler('setSummaryFormValues', $u.buttons.runCustomHandler('getExpensesSummaries'));
            });
        });
        gridObj.onCellClick(function (columnKey, rowIndex) {
            $efi.UD_0302_000EventHandler.gridCellClick(columnKey, rowIndex);
            var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
            if (/^REQTXT|REQNO|TITLE|WF_KEY$/.test(columnKey) && rowData[columnKey]) {
                if(rowData['WF_KEY']) {
                    $u.navigateByProgramId('DRAFT_0011', rowData, true);
                } else {
                    rowData['mode'] = 'edit';
                    $u.navigateByProgramId(rowData['PROGRAM_ID'], rowData, true);
                }
            }
        });

        $efi.UD_0302EventHandler.handleDeleteStatement();

        $u.buttons.addHandler({
            "regularStatementPosting": $efi.UD_0302_000EventHandler.regularStatementPosting,
            "editStatement": $efi.UD_0302_000EventHandler.editStatement,
            "cancelGroup": $efi.UD_0302_000EventHandler.cancelGroup,
            "makeGroup": function () {
                gridObj.asserts.rowSelected();
                if (gridObj.getSELECTEDJSONData()[0]['GRONO'] !== '') throw $mls.getByCode('M_UD_0302_000_makeGroupGRONOExists');
                unidocuConfirm($mls.getByCode('M_UD_0302_000_makeGroupConfirm'), function () {
                    $nst.it_data_nsReturn($u.programSetting.getValue('makeGroupFuncName'), gridObj.getSELECTEDJSONData(), function () {
                        $u.buttons.triggerFormTableButtonClick();
                    })
                })
            },
            "requestApproval": function () {
                gridObj.asserts.rowSelected();
                $nst.it_data_nsReturn($u.programSetting.getValue('requestApprovalFuncName'), gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"))
                });
            },
            "CreateReqno": function() {
                gridObj.asserts.rowSelected();
                $u.navigateByProgramId($u.programSetting.getValue('nextProgramIDforCreatingReqno'), {
                    disableEditingStatement: true,
                    gridData: gridObj.getSELECTEDJSONData()
                }, true);
            },
            "doQuery": function () {
                $u.buttons.runCustomHandler('is_data_ot_data', $(this));
            },
            "batchMakeGroup": function () {
                var requestData = [];
                $.each(gridObj.getJSONData(), function (index, data) {
                    if (data['GRONO'] === '') requestData.push(data);
                });

                if (requestData.length === 0) throw  $mls.getByCode('M_UD_0302_000_batchMakeGroupEmptyData');

                if ($u.programSetting.getValue('use GRONO_EB select validation') === 'true') {
                    $efi.UD_0302_000selectionValidator.validate(requestData);
                }

                unidocuConfirm($mls.getByCode('M_UD_0302_000_makeGroupConfirm'), function () {
                    $nst.it_data_nsReturn($u.programSetting.getValue('batchMakeGroupFuncName'), requestData, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "checkAll": function () {
                $.each(gridObj.getSelectedRowIndexes(), function (index, rowIndex) {
                    if (gridObj.getJSONDataByRowIndex(rowIndex)['GRONO']) gridObj.$V('SELECTED', rowIndex, '0');
                });
                var rowIndexes = gridObj.$F('', 'GRONO');
                var requestData = [];
                $.each(rowIndexes, function (index, rowIndex) {
                    requestData.push(gridObj.getJSONDataByRowIndex(rowIndex));
                });

                if (requestData.length === 0) throw  $mls.getByCode('M_noDataForSelect');
                $.each(rowIndexes, function(index, value) {
                    gridObj.$V('SELECTED', value, '1');
                });

                if ($u.programSetting.getValue('use GRONO_EB select validation') === 'true') {
                    $u.util.tryCatchCall(function(){
                        $efi.UD_0302_000selectionValidator.validate();
                    }, function(){
                        gridObj.unCheckAll('SELECTED');
                    });
                }
            },
            "unCheckAll": function () {

                $.each(gridObj.getSelectedRowIndexes(), function (index, rowIndex) {
                    gridObj.$V('SELECTED', rowIndex, '0');
                });
            },
            "rejectEdit": function () {
                gridObj.asserts.selectedExactOneRow();
                gridObj.validateSELECTEDGridRequired();

                $nst.is_data_it_data_returnMessage('ZUNID_4002', {I_IND: 'U'}, gridObj.getSELECTEDJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "rejectDelete": function () {
                gridObj.asserts.selectedExactOneRow();
                gridObj.validateSELECTEDGridRequired();

                $nst.is_data_it_data_returnMessage('ZUNID_4002', {I_IND: 'D'}, gridObj.getSELECTEDJSONData(), function (message) {
                    unidocuAlert(message, function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                });
            },
            "blockSelect": function () {
                $.each(gridObj.getBlockedRowIndexes(), function (index, value) {
                    gridObj.$V('SELECTED', value, '1');
                });
            },
            "cancelBlockSelect": function () {
                $.each(gridObj.getBlockedRowIndexes(), function (index, value) {
                    gridObj.$V('SELECTED', value, '0');
                });
            },
            "is_data_ot_data": function () {
                $u.buttons.runCustomHandler('is_data_ot_data', $(this));
            }
        });

        $u.buttons.addCustomHandler({
            "defaultBudat": function() {
                var os_data = $nst.is_data_os_data('ZUNIECM_7010');
                var jsonObj = {fromDate: os_data['DATAB'], toDate: os_data['DATBI']};
                if ($u.get('BUDAT')) $u.get('BUDAT').setValue(jsonObj);
                if ($u.get('ERDAT')) $u.get('ERDAT').setValue(jsonObj);
            },
            "is_data_ot_data": function($target){
                var namedServiceId = $target.data('funcname');
                if(!namedServiceId) namedServiceId = 'ZUNIEFI_4200';
                var values = $u.getValues('search-condition');
                var $deferred = $.Deferred();

                if (/,/.test(values['BELNR'])) {
                    var it_belnr = [];
                    $.each(values['BELNR'].split(','), function () {
                        it_belnr.push({BELNR: this});
                    });
                    delete values['BELNR'];
                    $nst.is_data_tableParams_nsReturn(namedServiceId, values, {IT_BELNR: it_belnr}, function (nsReturn) {
                        $deferred.resolve(nsReturn.getTableReturn('OT_DATA'));
                    });
                } else {
                    $nst.is_data_ot_data(namedServiceId, values, function(ot_data){
                        $deferred.resolve(ot_data);
                    });
                }

                $.when($deferred).done(function(ot_data){
                    gridObj.setJSONData(ot_data);
                    $efi.handleEVIKBIconVisible();
                    if ($target.data('callback')) {
                        $target.data('callback')();
                        $target.data('callback', null);
                    }
                });
            },
            'getExpensesFieldNameMappingTable': (function() {
                var table = $u.programSetting.getValue('expKeyMappingTable');
                return function() {
                    return table;
                }
            })(),
            'setSummaryFormValues': function(summaries) {
                var total = 0;
                var table = $u.buttons.runCustomHandler('getExpensesFieldNameMappingTable');
                $.each(summaries, function(key, value) {
                    var formInput = $u.get(table[key]);
                    if (formInput) formInput.setValue(value === 0 ? '' : value.toLocaleString());
                    total += value;
                });
                $u.get('SUM_EXP').setValue(total.toLocaleString());
            },
            'getExpensesSummaries': function() {
                return gridObj.getSELECTEDJSONData().reduce(function(summary, rowData) {
                    var key = !rowData['TRIP_TYPE'] ? 'ETC' : rowData['TRIP_TYPE'];
                    var dmbtr = parseFloat(rowData['DMBTR']);
                    if (isNaN(dmbtr)) return summary;
                    summary[key] += dmbtr;
                    return summary;
                }, Object.keys($.extend({}, $u.programSetting.getValue('expKeyMappingTable'), {'SUM': 'SUM_EXP'})).reduce(function(summary, comboOption) {
                    summary[!comboOption ? 'ETC' : comboOption] = 0;
                    return summary;
                }, {}));
            },
            'alignSummaryTableVertical': function () {
                var $tbody = $('#expenses_summary').find('tbody');
                if ($tbody.length === 0) return;
                var $ths = $tbody.find('th');
                var $tds = $tbody.find('td');

                $tbody.parent().css('width', 'auto');
                $tds.css({
                    'width': '',
                    'text-align': 'right'
                });

                $ths.appendTo($tbody).wrapAll('<tr></tr>');
                $tds.appendTo($tbody).wrapAll('<tr></tr>');
                $tbody.find('tr').each(function(_, elem) {
                    if (elem.children.length === 0) elem.remove();
                });
            }
        });

        return function() {
            $u.buttons.runCustomHandler('alignSummaryTableVertical');
            $u.page.setCustomParam('useCancelGroupOnApprovalPopupClose', true);
            var pageParams = $u.page.getPageParams();
            if (!pageParams['BSTAT'] && $u.get('BSTAT')) {
                var defaultBSTAT = $u.programSetting.getValue('default BSTAT value');
                $u.get('BSTAT').setValue(defaultBSTAT);
                if (defaultBSTAT === 'empty') $u.get('BSTAT').setEmptyValue();
            }

            if($u.programSetting.getValue('set default ZFBDT empty') === 'true' && $u.get('ZFBDT')) $u.get('ZFBDT').setEmptyValue();

            if (!$.isEmptyObject(pageParams)) {
                if (pageParams['BELNR'] || pageParams['REQTXT']) {
                    if ($u.get('BSTAT')) $u.get('BSTAT').setValue('*');
                    if ($u.get('BUDAT')) $u.get('BUDAT').setValue({
                        fromDate: pageParams['BUDAT'],
                        toDate: pageParams['BUDAT']
                    });
                    if ($u.get('BLDAT')) $u.get('BLDAT').setValue({
                        fromDate: pageParams['BLDAT'],
                        toDate: pageParams['BLDAT']
                    });
                    $u.buttons.triggerFormTableButtonClick('search-condition', function () {
                        if ($u.page.isNavigateByBrowserButton) return;
                        if (gridObj.getRowCount() === 0) return;
                        gridObj.checkAll();
                        $u.buttons.runHandler('requestApproval');
                    });
                } else {
                    if ($u.get('BELNR')) $u.get('BELNR').setEmptyValue();
                    if ($u.get('REQTXT')) $u.get('REQTXT').setEmptyValue();
                    $u.buttons.runCustomHandler('defaultBudat');
                    $u.buttons.triggerFormTableButtonClick();
                }
            } else {
                if ($u.get('BELNR')) $u.get('BELNR').setEmptyValue();
                if ($u.get('REQTXT')) $u.get('REQTXT').setEmptyValue();
                $u.buttons.runCustomHandler('defaultBudat');
                $u.buttons.triggerFormTableButtonClick();
            }

            if ($u.programSetting.getValue('setCheckBarAsRadio') === 'true') gridObj.setCheckBarAsRadio('SELECTED');
            if ($u.programSetting.getValue('useOnLoadSelect') === 'true') $u.buttons.triggerFormTableButtonClick();
            if ($u.programSetting.getValue('hideCheckBar') === 'true') gridObj.setColumnHide('SELECTED', true);
            if ($u.programSetting.getValue('useHeaderCheckbox') === 'true') gridObj.setHeaderCheckBox('SELECTED', true);
            if ($u.programSetting.getValue('showSummary') === 'true') gridObj.setSummaryVisible(true);

            if ($u.programSetting.getValue('useOnRadioChangeSelect') === 'true') {
                $.each($u.getNames('search-condition'), function (index, item) {
                    var unidocuInput = $u.get('search-condition', item);
                    if (unidocuInput.getType() !== 'Uni_Radio') return true;
                    unidocuInput.$el.change(function () {
                        $u.buttons.triggerFormTableButtonClick();
                    });
                })
            }

        }
    };

});
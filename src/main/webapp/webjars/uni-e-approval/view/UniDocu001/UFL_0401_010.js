/**
 * 결재함
 * UFL_0401_010    결재대기함
 * UFL_0401_020    결재진행함
 * UFL_0401_030    반려/회수
 * UFL_0401_040    완료함
 *
 * UFL_0401_050 참조함
 * UFL_0401_060    열람함
 * UFL_0401_070    협조함
 * @module uni-e-approval/view/UniDocu001/UFL_0401_010
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('selectedJSONDataReturnMessageFuncName',{
            defaultValue: 'ZUNIEWF_0091',
            description: 'selectedJSONDataReturnMessage의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('selectedJSONDataReturnMessage2FuncName',{
            defaultValue: 'ZUNIEWF_0094',
            description: 'selectedJSONDataReturnMessage2의 FuncName #20465'
        });
        $u.programSetting.appendTemplate('it_data_returnMessageFuncName',{
            defaultValue: 'ZUNIECM_DEV002',
            description: 'it_data_returnMessageFuncName의 FuncName #20465'
        });

        var gridObj = $u.gridWrapper.getGrid();
        var $u_displayGB2 = $u.get('DISPLAY_GB2'); // 결재[A], 회수[R]
        var $u_displayGB3 = $u.get('DISPLAY_GB3'); // 건별[A], 일괄[B]

        gridObj.onCellClick(function (columnKey, rowIndex) {
            if (!/WF_KEY_TEXT|WF_TITLE/.test(columnKey)) return;
            $ewf.popup.openDRAFT_0011(gridObj.getJSONDataByRowIndex(rowIndex));
        });

        $u.buttons.addHandler({
            "detailApproval": function () {
                gridObj.asserts.selectedExactOneRow();
                $ewf.popup.openDRAFT_0011(gridObj.getSELECTEDJSONData()[0]);
            },
            "sendApprovalMail": function () {
                gridObj.asserts.selectedExactOneRow();
                $ewf.dialog.sendApprovalAlarmDialog.open(gridObj.getSELECTEDJSONData()[0]);
            }
        });

        function isBatchApproval() {
            return $u_displayGB2.getValue() === 'A' && $u_displayGB3.getValue() === 'B';
        }

        function handleRadioChange() {
            $.each(gridObj.getSelectedRowIndexes(), function (rowIndex) {
                gridObj.$V('SELECTED', rowIndex, '0');
            });
            if (isBatchApproval()) {
                gridObj.setCheckBarAsRadio('SELECTED', false);
                $('#it_data_returnMessage').show();
                $('#detailApproval').hide();
            } else {
                gridObj.setCheckBarAsRadio('SELECTED', true);
                $('#it_data_returnMessage').hide();
                $('#detailApproval').show();
            }
            $u.buttons.triggerFormTableButtonClick();
        }

        return function () {
            $u.buttons.triggerFormTableButtonClick();
            if ($u.page.getPROGRAM_ID() === 'UFL_0401_010') {
                if (!$u_displayGB2 || !$u_displayGB3) return;

                $u_displayGB2.$el.change(handleRadioChange);
                $u_displayGB3.$el.change(handleRadioChange).change();

                gridObj.onChangeCell(function (columnKey, rowIndex) {
                    if (columnKey !== 'SELECTED') return;
                    if (!isBatchApproval()) return;
                    if (gridObj.$V('SELECTED', rowIndex) === '0') return;

                    $nst.is_data_nsReturn('ZUNIEWF_4326', gridObj.getJSONDataByRowIndex(rowIndex), function () {
                    }, function () {
                        gridObj.$V('SELECTED', rowIndex, '0')
                    });
                });
            }
        }
    }
});
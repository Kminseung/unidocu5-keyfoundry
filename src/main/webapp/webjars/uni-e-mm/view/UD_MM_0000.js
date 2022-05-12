/**
 * @module uni-e-mm/view/UD_MM_0000
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            "tempSave": function () {
                $u.validateRequired();
                gridObj.validateGridRequired();
                var is_data = $u.getValues('uni-form-table2');
                is_data['REQNO'] = $ewf.draftUtil.getREQNO();
                $u.fileUI.setFileAttachKeyParam(is_data);
                $nst.is_data_it_data_nsReturn('ZUNIEWF_6420', is_data, gridObj.getJSONData(), function (nsReturn) {
                    var os_data = nsReturn.getExportMap('OS_DATA');
                    var message = nsReturn.getReturnMessage();
                    $ewf.draftUtil.setREQNO(os_data['REQNO']);
                    unidocuAlert(message, function () {
                        $u.navigateByProgramId('UD_MM_0010');
                    });
                });
            },
            addRow: function () {
                gridObj.addRow();
            },
            deleteRow: function () {
                gridObj.deleteSelectedRows()
            },
            templateDownload: function () {
                $u.excel.templateDownload(gridObj);
            }
        });

        $u.buttons.addCustomHandler({
            callZUNIEWF_6423_setSavedData: function () {
                $nst.is_data_nsReturn('ZUNIEWF_6423', {REQNO: $ewf.draftUtil.getREQNO()}, function (nsReturn) {
                    var os_data = nsReturn.getExportMap('OS_DATA');
                    var os_text = nsReturn.getExportMap('OS_TEXT');
                    var ot_data = nsReturn.getTableReturn('OT_DATA');
                    $u.setValues('uni-form-table2', $.extend(os_data, os_text));
                    gridObj.setJSONData(ot_data);
                });
            }
        });

        return function () {
            $u.excel.bindExcelUploadHandler(gridObj);
            $('#cloned-buttons').append($('#uni-buttons').find('button').clone());
            if ($u.page.getPageParams()['REQNO']) $u.buttons.runCustomHandler('callZUNIEWF_6423_setSavedData', $u.page.getPageParams());
        }
    }
});
/**
 * UD_0220_004    출장비 정산
 * @module uni-e-fi/view/UniDocu001/UD_0220_004
 */
define(function () {
    return function () {
        $u.programSetting.appendTemplate('NextTripProgramID', {
            defaultValue: 'UD_0220_002',
            description: '출장비 정산화면'
        });
        $u.programSetting.appendTemplate('searchFunction', {
            defaultValue: 'ZUNIEWF_6603',
            description: '품의 조회시 사용할 RFC'
        });
        $u.programSetting.appendTemplate('DeleteFunction', {
            defaultValue: 'ZUNIEWF_6630',
            description: '품의 삭제 사용할 RFC'
        });
        $u.programSetting.appendTemplate('requestApprovalFuncName',{
            defaultValue: 'ZUNIEFI_4203',
            description: 'requestApproval의 FuncName #20465'
        });

        var pageParams = $u.page.getPageParams();
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.onCellClick(function (columnKey, rowIndex) {
            var rowData = gridObj.getJSONDataByRowIndex(rowIndex);
            $efi.UD_0302_000EventHandler.gridCellClick(columnKey, rowIndex);
            if (/^REQTXT|REQNO|TITLE$/.test(columnKey) && rowData[columnKey]) {
                if($u.page.getPROGRAM_ID() === 'UD_0220_140') {
                    $u.buttons.runCustomHandler('searchConsultation2', rowData).done(function (params) {
                        $u.navigateByProgramId(rowData['PROGRAM_ID'], params);
                    });
                } else {
                    $u.buttons.runCustomHandler('searchConsultation', rowData).done(function (params) {
                        $u.navigateByProgramId(rowData['PROGRAM_ID'], params, true);
                    });
                }
            }
        });

        $u.get('DOC_TYPE').$el.on('search', function() {
            if (/(15|17)$/.test($u.get('DOC_TYPE').getValue())) {
                $('button#createStatement').show();
            } else {
                $('button#createStatement').hide();
            }
        });

        $('.panel-search-init-button').click(function() {
            $u.locationReload();
        })

        $u.buttons.addHandler({
            'NextTrip': function () {
                gridObj.asserts.selectedExactOneRow();
                var rowData = gridObj.getSELECTEDJSONData()[0];
                var button = this[0];

                $u.buttons.runCustomHandler('searchConsultation', $.extend({}, rowData, {'BUTTON': button.id})).done(function (params) {
                    $u.navigateByProgramId($u.programSetting.getValue('NextTripProgramID'), params, true);
                });
            },
            'DeleteTrip': function() {
                gridObj.asserts.selectedExactOneRow();
                $nst.is_data_returnMessage($u.programSetting.getValue('DeleteFunction'), gridObj.getSELECTEDJSONData()[0], function (msg) {
                    unidocuAlert(msg, $u.buttons.triggerFormTableButtonClick);
                });
            },
            "requestApproval": function () {
                gridObj.asserts.rowSelected();
                $nst.it_data_nsReturn($u.programSetting.getValue('requestApprovalFuncName'), gridObj.getSELECTEDJSONData(), function (nsReturn) {
                    $efi.UD_0302_000EventHandler.openApprovalPopup(nsReturn.getStringReturn("O_URL"))
                });
            },
            'cancelGroup': $efi.UD_0302_000EventHandler.cancelGroup,
            'createStatement': function() {
                gridObj.asserts.selectedExactOneRow();
                var rowData = gridObj.getSELECTEDJSONData()[0];
                var button = this[0];
                $u.buttons.runCustomHandler('searchConsultation', $.extend({}, rowData, {'BUTTON': button.id})).done(function (params) {
                    $u.navigateByProgramId(rowData['PROGRAM_ID2'], params, true);
                });
            },
            'is_data_ot_data': function() {
                var $self = $(this);
                $nst.is_data_ot_data($self.data('funcname'), $u.getValues('search-condition'), function(ot_data) {
                    $u.gridWrapper.getGrid().setJSONData(ot_data);
                    if ($self.data('callback')) {
                        $self.data('callback')();
                        $self.data('callback', null);
                    }
                    $u.get('DOC_TYPE').$el.trigger('search');
                });
            }
        });

        $u.buttons.addCustomHandler({
            'searchConsultation2': function (is_data) {
                var deferred = $.Deferred();
                $nst.is_data_nsReturn(is_data['FUNC_NAME'], is_data,
                    function (nsReturn) {
                        var os_text = nsReturn.getExportMap('OS_TEXT');
                        var os_data = nsReturn.getExportMap('OS_DATA');
                        var ot_data = nsReturn.getTableReturn('OT_DATA');
                        var ot_head = nsReturn.getTableReturns('OT_HEAD')['OT_HEAD'];
                        deferred.resolve($.extend(true, {}, os_data, os_text, {
                            'OT_DATA': ot_data ? ot_data : [],
                            'OT_HEAD': ot_head ? ot_head : []
                        }));
                    });

                return deferred.promise();
            },
            'searchConsultation': function (is_data) {
                var deferred = $.Deferred();
                $nst.is_data_nsReturn($u.programSetting.getValue('searchFunction'), is_data,
                    function (nsReturn) {
                        var os_text = nsReturn.getExportMap('OS_TEXT');
                        var os_data = nsReturn.getExportMap('OS_DATA');
                        var ot_data = nsReturn.getTableReturn('OT_DATA');
                        deferred.resolve($.extend(true, {}, os_data, os_text, {
                            'OT_DATA': ot_data ? ot_data : []
                        }));
                    });

                return deferred.promise();
            }
        });

        return function () {
            $u.page.setCustomParam('useCancelGroupOnApprovalPopupClose', true);
            if (pageParams['REQTXT']) {
                $u.setValues(pageParams);
                $u.buttons.triggerFormTableButtonClick('search-condition', function() {
                    gridObj.$V('SELECTED', 0, '1');
                    $u.buttons.runHandler('requestApproval');
                });
            }
            $u.get('DOC_TYPE').$el.trigger('search');
        }
    }
});
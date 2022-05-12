/**
 * @module vendorCustom/magnachip/view/customizeUD_0220_004
 */


define([], function () {
    return function (initFn) {
        initFn();
        var gridObj = $u.gridWrapper.getGrid();
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
                if(gridObj.getSELECTEDJSONData()[0].DOC_FLAG==='X'){
                    unidocuAlert('전표가 작성되지 않은 건이 있습니다. 전표 작성 완료 후 결재를 요청하세요.')
                    return false;
                }
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
                        os_text.TEXT4 = os_text.TEXT4.replaceAll('@_@','\n')
                        var os_data = nsReturn.getExportMap('OS_DATA');
                        var ot_data = nsReturn.getTableReturn('OT_DATA');
                        var ot_head = nsReturn.getTableReturns('OT_HEAD')['OT_HEAD'];
                        var ot_usr1 = nsReturn.getTableReturns('OT_HEAD')['OT_USR1'];
                        deferred.resolve($.extend(true, {}, os_data, os_text, {
                            'OT_DATA': ot_data ? ot_data : [],
                            'OT_HEAD': ot_head ? ot_head : [],
                            'OT_USR1': ot_usr1 ? ot_usr1 : [],
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
                        var ot_usr1 = nsReturn.getTableReturns('OT_HEAD')['OT_USR1'];
                        deferred.resolve($.extend(true, {}, os_data, os_text, {
                            'OT_DATA': ot_data ? ot_data : [],
                            'OT_USR1': ot_usr1 ? ot_usr1 : [],
                        }));
                    });

                return deferred.promise();
            }
        });
    }
});
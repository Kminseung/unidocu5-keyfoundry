/**
 * @module vendorCustom/magnachip/view/customizeDRAFT_0010
 */

define(function () {
    return function (initFn) {
        initFn();
        $magnachip.statementPop();
        $u.fileUI.getFineUploader().showAsList();

        function successProcess(importParams, tableParams) {
            $nst.is_data_tableParams_nsReturn('ApprovalStep', importParams, tableParams, function (nsReturn) {
                var message = nsReturn.getStringReturn('message');
                unidocuAlert(message, function () {
                    if ($u.isPopupView()) window.close();
                    else $u.pageReload();
                });
            });
        }

        $u.buttons.addHandler({
            "requestApproval": function () {
                function basicDraft() {
                    $nst.is_data_tableParams_nsReturn('ZUNIEWF_4201_MX', importParams, tableParams, function (nsReturn) {
                        var message = nsReturn.nsReturn.exportMaps['OS_RETURN']['MESSAGE'] + '\n현재 설정된 결재라인으로 상신하시겠습니까?';
                        if (nsReturn.nsReturn.exportMaps['OS_RETURN']['TYPE'] === 'W' && !confirm(message)) return false;
                        $nst.is_data_nsReturn('ZUNIEFI_4207', {GRONO: $u.page.getPageParams()["GRONO"]}, function (nsReturn) {
                            belparamstotal = nsReturn.getExportMaps().OS_HEAD;
                            for (var i = 0; i < nsReturn.getTableReturns().OT_DATA1.length; i++) {
                                if (nsReturn.getTableReturns().OT_DATA1[i].EVIKB === 'FI_01') {
                                    nsReturn.getTableReturns().OT_DATA1[i].LIFNR_TXT = nsReturn.getTableReturns().OT_DATA1[i].ZUONR_TXT
                                }
                            }
                            belparams = nsReturn.getTableReturns().OT_DATA1;

                            var belparamstotaltxt = belparamstotal.TOTAL_TXT.trim()
                            if (importParams.ID.charAt(0) === "9") {
                                importParams.ID = importParams.ID.replace("9", "U")
                            }
                            if(staticProperties.destinationAlias==='DEV_101'){
                                unidocuAlert('개발 그룹웨어연동 pass')
                                successProcess(importParams, tableParams)
                            }else{
                                gwAjax(importParams, tableParams,belparams,belparamstotaltxt)
                            }
                        })
                    });
                }
                function businessDraft() {
                    var pageparam = $u.page.getPageParams()
                    if(pageparam.WF_TYPE==='T21')pageparam.DOC_KINDS='A'
                    if(pageparam.WF_TYPE==='T23')pageparam.DOC_KINDS='B'
                    $nst.is_data_nsReturn('ZUNIEWF_6732', {GRONO: pageparam.GRONO, DOC_KINDS: pageparam.DOC_KINDS,REQNO:pageparam.REQNO}, function (nsReturn) {
                        belparamstotal = nsReturn.getExportMaps().OS_HEAD;
                        for (var i = 0; i < nsReturn.getTableReturns().OT_DATA1.length; i++) {
                            if (nsReturn.getTableReturns().OT_DATA1[i].EVIKB === 'FI_01') {
                                nsReturn.getTableReturns().OT_DATA1[i].LIFNR_TXT = nsReturn.getTableReturns().OT_DATA1[i].ZUONR_TXT
                            }
                        }
                        belparams = nsReturn.getTableReturns().OT_DATA1;

                        var belparamstotaltxt = belparamstotal.TOTAL_TXT.trim()
                        if (importParams.ID.charAt(0) === "9") {
                            importParams.ID = importParams.ID.replace("9", "U")
                        }
                        if(staticProperties.destinationAlias==='DEV_101'){
                            unidocuAlert('DEV_101 그룹웨어연동 pass')
                            successProcess(importParams, tableParams)
                        }else{
                            gwAjax(importParams, tableParams,belparams,belparamstotaltxt)
                        }
                    })
                }

                function gwAjax(importParams, tableParams,belparams,belparamstotaltxt) {
                    var jsonStringimportParams = JSON.stringify(importParams); // docinfo
                    var jsonStringbelparamsitdata1 = JSON.stringify(tableParams.IT_DATA1); // aprline 결재자
                    var jsonStringtableParamsitdata2 = JSON.stringify(tableParams.IT_DATA2); // circular 참조자 (회람자)
                    var jsonStringbelparams = JSON.stringify(belparams); // contents


                    $.ajax({
                        type: "POST",
                        url: "/magnachip/getValidationData",
                        data: {
                            "importParams": jsonStringimportParams,
                            "tableParamsitdata1": jsonStringbelparamsitdata1,
                            "tableParamsitdata2": jsonStringtableParamsitdata2,
                            "belparams": jsonStringbelparams,
                            "beltotal": belparamstotaltxt
                        },
                        success: function (result) {
                            console.log(result);
                            var data = result[Object.keys(result)]
                            var docinfo = JSON.parse(data)
                            if (docinfo.result === "success") {
                                unidocuAlert('그룹웨어 연동 성공하였습니다.')
                                importParams.DOCID = docinfo.docid;
                                //전표 관련 정보 매그나 웨어로 보내주기 위함
                                successProcess(importParams, tableParams)
                            } else {
                                unidocuAlert('그룹웨어 연동 실패하였습니다. 관리자에게 문의바랍니다.',
                                    function () {
                                        return false;
                                    })
                            }

                        },
                        error: function (request, status, error) {
                            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                        }
                    });
                }
                $u.validateRequired('uni-form-table5');
                var importParams = $.extend({}, $u.page.getPageParams(), $u.getValues('uni-form-table5'), staticProperties.user);
                var belparams;
                var belparamstotal;
                var id = importParams.ID;
                var tableReturns = $ewf.changeLine.getTableReturns();
                if (!importParams['WF_GB']) $.extend(importParams, {WF_GB: $ewf.draftUtil.getWF_GB()});
                importParams['WF_SECUR'] = $ewf.changeLine.getWF_SECUR();
                var tableParams = {
                    IT_DATA1: tableReturns['OT_DATA1'],
                    IT_DATA2: tableReturns['OT_DATA2'],
                    IT_DATA3: tableReturns['OT_DATA3'],
                    IT_DATA4: tableReturns['OT_DATA4'],
                    IT_WF_ORG: $ewf.getDocumentReferenceListWF_ORG()
                };
                $u.fileUI.setFileAttachKeyParam(importParams);
                $ewf.changeLine.validateApprovalLineSelected();
                for (var i = 0; i < tableParams.IT_DATA1.length; i++) {
                    var wfline = tableParams.IT_DATA1[i].WF_LINE_LEV;
                    if (isNaN(wfline)) {
                        tableParams.IT_DATA1[i].WF_LINE_LEV = tableParams.IT_DATA1[i].WF_LINE_LEV.replace("[", "");
                        tableParams.IT_DATA1[i].WF_LINE_LEV = tableParams.IT_DATA1[i].WF_LINE_LEV.replace("]", "");
                        tableParams.IT_DATA1[i].WF_LINE_LEV = Number(tableParams.IT_DATA1[i].WF_LINE_LEV);
                    }
                    var wf_id = tableParams.IT_DATA1[i].WF_ID;
                    if (wf_id.substr(0, 1) === "9") {
                        tableParams.IT_DATA1[i].WF_ID = tableParams.IT_DATA1[i].WF_ID.replace("9", "U");
                    }

                }
                if (id.substr(0, 1) === "9") {
                    importParams.ID = importParams.ID.replace("9", "U");
                }
                if (importParams['ADDAMT']) importParams['WF_AMOUNT'] = importParams['ADDAMT'];
                if (!importParams['WF_TITLE'] && importParams['TITLE']) importParams['WF_TITLE'] = importParams['TITLE'];
                $.extend(importParams, {
                    targetNamedServiceId: 'ZUNIEWF_4201',
                    tableParamsString: JSON.stringify(tableParams)
                })
                unidocuConfirm($mls.getByCode('M_proceedRequest'), function () {
                    if($u.page.getPageParams().GRONO.charAt(0) !== 'T')basicDraft()
                    else businessDraft()

                });

            }
        });
    }
});
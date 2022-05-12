/**
 * @module vendorCustom/magnachip/view/customizeDRAFT_0011
 */

define(function () {
    return function (initFn) {
        initFn();
        $u.fileUI.getFineUploader().showAsList();

        function ApprovalStep(importParam) {
            $nst.is_data_stringReturns('ApprovalStep', importParam, function (stringReturns) {
                unidocuAlert(stringReturns['message'], function () {
                    if ($u.isPopupView()) {
                        try {
                            opener.$u.buttons.triggerFormTableButtonClick();
                        } // 타 사이트에서 호출 되는 경우 DOMException: Blocked a frame with origin
                        catch (e) {
                            getLogger().log(e);
                        }
                        window.close();
                        location.href = $u.getUrlFromRoot('/unidocu/view.do?programId=UFL_0401_010');
                    } else history.back();
                });
            });
        }

        var messageCodeMap = $u.page.getCustomParam('messageCodeMap');
        var namedServiceIdMap = {
            B: 'ZUNIEWF_4320',
            C: 'ZUNIEWF_4320',
            D: 'ZUNIEWF_4320',
            E: 'ZUNIEWF_4320',
            G: 'ZUNIEWF_4320',
            F: 'ZUNIEWF_4321'
        };
        function gwApprovalAjax(importParam,docid) {
            var jsonimportparam = JSON.stringify(importParam);
            $.ajax({
                type: "POST",
                url: "/magnachip/updateStatus",
                data: {
                    "importparam": jsonimportparam,
                    "docinfo": docid,
                },
                success: function (result) {
                    console.log(result);
                    var data = result[Object.keys(result)]
                    var docinfo = JSON.parse(data)
                    if (docinfo.result === "success") {
                        unidocuAlert('그룹웨어 연동 성공')
                        //전표 관련 정보 매그나 웨어로 보내주기 위함
                        ApprovalStep(importParam)
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

        function businessApproval(importParam,GRONO,appr_stat,pageparam) {
            var doc_type = $('#DOC_TYPE')
            if(doc_type.text()==='T21') pageparam.DOC_KINDS ='A'
            if(doc_type.text()==='T23') pageparam.DOC_KINDS ='B'
            $nst.is_data_nsReturn("ZUNIEWF_6732", { DOC_KINDS: pageparam.DOC_KINDS,REQNO:pageparam.REQNO}, function (nsReturn) {
                var docid = nsReturn.getExportMaps().OS_HEAD.DOCID;
                //docid  zunefi_4207 exportmaps -> oshead
                $nst.is_data_tableReturns("ZUNIEWF_4203", pageparam, function (result) {
                    for (var i = 0; i < result.OT_DATA1.length; i++) {
                        if (result.OT_DATA1[i].WF_ID === importParam.ID) {
                            importParam.sn = (i + 2).toString();
                        } else {
                            if (appr_stat === "E") {
                                importParam.sn = "1";
                            }
                        }
                    }
                    var id = importParam.ID;
                    if (id.substr(0, 1) === "9") {
                        importParam.ID = importParam.ID.replace("9", "U");
                    }
                    gwApprovalAjax(importParam,docid)
                })

            })
        }
        function basicApproval(importParam,GRONO,appr_stat,pageparam) {
            $nst.is_data_nsReturn("ZUNIEFI_4207", {GRONO: GRONO}, function (nsReturn) {
                var docid = nsReturn.getExportMaps().OS_HEAD.DOCID;
                pageparam.GRONO = GRONO
                //docid  zunefi_4207 exportmaps -> oshead
                $nst.is_data_tableReturns("ZUNIEWF_4203", pageparam, function (result) {
                    for (var i = 0; i < result.OT_DATA1.length; i++) {
                        if (result.OT_DATA1[i].WF_ID === importParam.ID) {
                            importParam.sn = (i + 2).toString();
                        } else {
                            if (appr_stat === "E") {
                                importParam.sn = "1";
                            }
                        }
                    }
                    var id = importParam.ID;
                    if (id.substr(0, 1) === "9") {
                        importParam.ID = importParam.ID.replace("9", "U");
                    }
                    gwApprovalAjax(importParam,docid)
                })

            })
        }

        $u.buttons.addCustomHandler({
            approvalStepHandler: function (appr_stat) {
                var title = $mls.getByCode(messageCodeMap[appr_stat]);
                var useComments = false;
                var usePassword = false;
                var approvalPassword;
                var zuniewf_1103_os_data = $nst.is_data_os_data('ZUNIEWF_1103', {ID: staticProperties.user['ID']});

                if (appr_stat !== 'E') useComments = true;

                if (zuniewf_1103_os_data['FLAG_PW'] === 'X') usePassword = true;
                approvalPassword = zuniewf_1103_os_data['WF_PW2'];

                var $deferred = $.Deferred();
                if (useComments) {
                    $ewf.dialog.approvalCommentsDialog.open({
                        title: title,
                        usePassword: usePassword,
                        approvalPassword: approvalPassword,
                        confirmCallback: function (comments) {
                            $deferred.resolve(comments);
                        }
                    });
                } else {
                    unidocuConfirm($mls.getByCode('M_cancelRequest'), function () {
                        $deferred.resolve('');
                    });
                }
                $.when($deferred).done(function (comments) {
                    $u.buttons.runCustomHandler('requestApproval', appr_stat, comments);
                });
            },
            requestApproval: function (appr_stat, comments) {
                var pageparam = $u.page.getPageParams()
                var importParam = $.extend({}, $u.page.getPageParams(), staticProperties.user, {
                    APPR_STAT: appr_stat,
                    APPR_TEXT: comments,
                    comments: comments
                }, {targetNamedServiceId: namedServiceIdMap[appr_stat]});
                var GRONO = $u.page.getPageParams()["GRONO"]
                if (GRONO === "" || GRONO === undefined) {
                    GRONO = $('#GRONO').text();
                }
                if(GRONO.charAt(0) !== 'T')basicApproval(importParam,GRONO,appr_stat,pageparam);
                else businessApproval(importParam,GRONO,appr_stat,pageparam);

            },

        });

    }

});
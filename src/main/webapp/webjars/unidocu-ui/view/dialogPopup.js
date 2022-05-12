/**
 * @module unidocu-ui/view/dialogPopup
 */
define(function () {
    return function () {
        var $popupContents = $('#popup-contents');

        var pageParams = $u.page.getPageParams();
        var dialogType = pageParams['dialogType'];

        $u.buttons.addCustomHandler({
            getDialogFns: function () {
                return {
                    fineUploaderDialog: function () {
                        var fileGroupId = pageParams['fileGroupId'];
                        var readOnly = pageParams['readOnly'];
                        if (!fileGroupId) throw 'fileGroupId parameter is empty.';
                        var fineUploader = $u.fineUploader.renderFineuploader($popupContents.find('#file-attach-content'));
                        fineUploader.setFileGroupId(fileGroupId);
                        fineUploader.setReadOnly(readOnly === 'true');
                        fineUploader.hideToggleContentsVisibleButton();
                        window.resizeTo(1000, 350);
                    },
                    changePassword: function () {
                        var token = $u.page.getPageParams()['token'];
                        $nst.is_data_nsReturn('ChangePasswordWithEmailValidation', {
                            token: token,
                            mode: 'getValidationInfo'
                        }, function (nsReturn) {
                            $u.dialog.dialogLayout001({
                                subGroup: 'change_password_by_email',
                                dialogTitle: '비밀번호 재설정',
                                dialogButtons: [
                                    $u.baseDialog.getButton($mls.getByCode('DLB_confirm'), function () {
                                        var pw2 = $u.get('PW2').getValue();
                                        $u.buttons.runCustomHandler('chanePasswordValidation', pw2, $u.get('PW2_RE').getValue());

                                        var params = {mode: 'changePassword', token: token, pw2: $u.thirdParty.sha256(pw2)};
                                        $nst.is_data_returnMessage('ChangePasswordWithEmailValidation', params, function (message) {
                                            unidocuAlert(message, function(){
                                                $u.navigate('/');
                                            });
                                        });
                                    })
                                ],
                                ignoreGrid: true,
                                dialogWidth: 600
                            });

                            var remaining = nsReturn.getStringReturn('remaining');
                            var current = new Date();
                            current.setSeconds(current.getSeconds() + Number(remaining));
                            var countDownDate = current.getTime();
                            var interval = setInterval(function () {
                                var now = new Date().getTime();
                                var distance = countDownDate - now;
                                var minutes = Math.floor(distance  / (1000 * 60));
                                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                                $u.get('remain').setValue(minutes + '분 ' + seconds + '초');

                                if (distance < 0) {
                                    clearInterval(interval);
                                    $u.get('remain').setValue('EXPIRED');
                                }
                            }, 1000);

                            $('#PW2,#PW2_RE').keydown(function (e) {
                                if (e.which === 13) $('.ui-dialog-buttonset .unidocu-button').click();
                            })

                        }, function () {
                            $u.navigate('/');
                        });
                    }
                }
            },
            chanePasswordValidation: function(pw, checkPW){
                if(!pw || !checkPW) throw $mls.getByCode('M_enterPassword');
                if(pw !== checkPW) throw($mls.getByCode('M_incorrectPassword'));
            }
        });

        return function () {
            var dialogFns = $u.buttons.runCustomHandler('getDialogFns');
            if (!dialogFns[dialogType]) throw 'unknown dialog type. dialogType: ' + dialogType;
            dialogFns[dialogType]();
        }
    }
});
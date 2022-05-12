/**
 *
 * @module uni-e-fi/view/KD_0202_001
 */
define(function () {
    return function () {
        $('#searchForm').append($efi.mustache.amountDisplayWrapper());
        $u.unidocuUI();
        $efi.createStatementCommon.init();
        var gridObj = $u.gridWrapper.getGrid();

        $u.buttons.addCustomHandler({
            /**
             * 교통비 계산 로직
             *
             * 행추가
             * 교통수단 값에 따른 필드 제어
             *
             * 킬로당 금액(ZAMTPERKM)
             * ZGAS F4 추가 필드로 출력 ZAMTPERKM
             * ZBLDAT 값이 변경 되면 갱신
             * 유종(ZGAS), 거리(ZDIST), 통행료(ZTOLL) 변경시 금액 계산
             * 엑셀 업로드, block paste 이벤트시 금액 계산로직 추가
             * @param rowIndex
             */
            handleTransportCellsByRowIndex: function (rowIndex) {
                /**
                 * 증빙일, 유종에 해당하는 킬로당 금액 반환.
                 * @param zbldat 증빙일
                 * @param zgas 유종
                 * @returns {string} 킬로당 금액(ZAMTPERKM)
                 */
                function getZAMTPERKM(zbldat, zgas) {
                    var ZGAS_ZAMTPERKM_Map = $u.page.getCustomParam('ZGAS_ZAMTPERKM_Map');
                    if (!ZGAS_ZAMTPERKM_Map) {
                        ZGAS_ZAMTPERKM_Map = {};
                        $u.page.setCustomParam('ZGAS_ZAMTPERKM_Map', ZGAS_ZAMTPERKM_Map);
                    }
                    if (!ZGAS_ZAMTPERKM_Map[zbldat]) ZGAS_ZAMTPERKM_Map[zbldat] = $u.f4Data.getCodeMapWithParams('ZGAS', 'ZAMTPERKM', {BLDAT: zbldat});

                    $u.page.setCustomParam('ZGAS_ZAMTPERKM_Map', ZGAS_ZAMTPERKM_Map);
                    return ZGAS_ZAMTPERKM_Map[zbldat][zgas];
                }

                /**
                 * 교통 수단(ZTRANSPO) 값에 따른 필드 제어
                 * ** webdata code: 자가 1, 대중교통 2
                 * *** 자가 [1]
                 * **** 유종(ZGAS), 거리(ZDIST), 통행료(ZTOLL) 필수 입력
                 * **** WRBTR 자동 계산 수정 불가
                 * *** 대중교통 [2]
                 * **** 유종(ZGAS), 거리(ZDIST), 통행료(ZTOLL), 킬로당 금액(ZAMTPERKM) 수정 불가, 초기화
                 * **** WRBTR 수정 가능
                 * @param rowIndex
                 */
                function controllCellStatusByZTRANSPO(rowIndex) {
                    var ztranspo = gridObj.$V('ZTRANSPO', rowIndex);
                    $.each(['ZGAS', 'ZDIST', 'ZTOLL'], function (index, item) {
                        if (ztranspo === '1') {
                            gridObj.makeCellRequired(item, rowIndex);
                        } else {
                            gridObj.makeCellReadOnly(item, rowIndex);
                            gridObj.$V(item, rowIndex, '');
                        }
                    });
                    if (ztranspo === '1') {
                        gridObj.makeCellReadOnly('WRBTR', rowIndex);
                    } else {
                        gridObj.makeCellRequired('WRBTR', rowIndex);
                        gridObj.$V('ZAMTPERKM', rowIndex, '');
                    }
                }

                /**
                 * 킬로당 금액(ZAMTPERKM) 설정
                 * @param rowIndex
                 */
                function setZAMTPERKMByRowIndex(rowIndex) {
                    gridObj.$V('ZAMTPERKM', rowIndex, getZAMTPERKM(gridObj.$V('ZBLDAT', rowIndex), gridObj.$V('ZGAS', rowIndex)));
                }

                /**
                 * 자가인 경우 계산 금액으로 설정
                 * (킬로당 금액(ZAMTPERKM) * 거리(ZDIST)) + 통행료(ZTOLL)
                 * 대중 교통인 경우 수행하지 않음.
                 * @param rowIndex
                 */
                function calculateWRBTRByRowIndex(rowIndex) {
                    if (gridObj.$V('ZTRANSPO', rowIndex) !== '1') return;
                    // (킬로당 금액(ZAMTPERKM) * 거리(ZDIST)) + 통행료(ZTOLL)
                    var zamtperkm = Number(gridObj.$V('ZAMTPERKM', rowIndex));
                    var zdist = Number(gridObj.$V('ZDIST', rowIndex)) / 10;
                    var ztoll = Number(gridObj.$V('ZTOLL', rowIndex));
                    var ztranspo = gridObj.$V('ZTRANSPO', rowIndex);
                    if (ztranspo === '1') gridObj.$V('WRBTR', rowIndex, (zamtperkm * zdist) + ztoll);
                    $u.get('WRBTR').$el.change();
                }


                controllCellStatusByZTRANSPO(rowIndex);
                setZAMTPERKMByRowIndex(rowIndex);
                calculateWRBTRByRowIndex(rowIndex);
            },
            customAfterMultiCellChange: function () {
                gridObj.loopRowIndex(function (rowIndex) {
                    $u.buttons.runCustomHandler('handleTransportCellsByRowIndex', rowIndex);
                })
            }
        });
        $efi.createStatement.bindGridEvent();
        gridObj.onChangeCell(function (columnKey, rowIndex, oldValue, newValue, jsonObj) {
            $efi.createStatement.handleChangeCell(columnKey, rowIndex, oldValue, newValue, jsonObj);
            $u.buttons.runCustomHandler('handleTransportCellsByRowIndex', rowIndex);
        });

        $efi.createStatementCommon.bindFormButton();
        $u.buttons.addHandler({
            addRow: function () {
                $efi.createStatementCommon.addRow();
                var activeRowIndex = gridObj.getActiveRowIndex();
                $u.buttons.runCustomHandler('handleTransportCellsByRowIndex', activeRowIndex);
            },
            createStatement: function () {
                $efi.createStatement.validateCreateStatement();
                var params = $efi.createStatement.getCreateStatementCommonParams();
                params['useReload'] = true;
                $efi.createStatement.callCreateStatementFn(params);
            }
        });

        return function () {
            $efi.createStatement.bindEvent.bindCommonFormEvent();
            $efi.createStatement.bindEvent.triggerZTERM_BUDATChange();
            $efi.createStatement.bindEvent.triggerSGTXTChange();
            gridObj.setNumberNegative('WRBTR', 'false');
            gridObj.fitToWindowSize();
            $u.buttons.runHandler('addRow');
        }
    }
});
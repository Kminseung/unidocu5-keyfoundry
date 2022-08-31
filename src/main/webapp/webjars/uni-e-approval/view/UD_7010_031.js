/**
 * @module uni-e-approval/view/UD_7010_031
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var uniJsTree = $u.UniJsTree($('#pos-tree'), {
            load_node: function () {
                uniJsTree.open_all();
            },
            select_node: function (nodeData) {
                formHandler.hideAllForm();
                formHandler.setPosForm(nodeData);
            }
        });
        var formHandler = function () {
            var $posInfo = $('#pos-info').detach();
            var $uniButtonsPos = $('#uni-buttons-pos').detach();
            var $uniButtonsPosAdd = $('#uni-buttons-pos-insert').detach();
            var $uniButtons = $('#uni-buttons').detach();
            var $rightWrapper = $('#rightWrapper');
            var $leftWrapper = $('#leftWrapper');
            var $searchTable = $('.unidocu-table').detach();

            return {
                hideAllForm: function () {
                    $posInfo.detach();
                    $uniButtonsPos.detach();
                    $uniButtonsPosAdd.detach();
                    $uniButtons.detach();
                    $searchTable.detach();
                    $posInfo.find('input[type=text]').val('');
                },
                setPosForm: function (nodeData) {
                    $posInfo.appendTo($rightWrapper);
                    $uniButtonsPos.appendTo($rightWrapper);
                    $uniButtons.appendTo($leftWrapper);
                    $u.setValues('pos-info', nodeData);
                }
            }
        }();
        return function () {
            formHandler.hideAllForm();
            $('.unidocu-table').hide();
            $nst.is_data_ot_data('ZUNIEWF_1012', {}, function (ot_data) {
                $.each(ot_data, function (index, item) {
                    item.parent = item['HEAD_KEY'];
                    if (item.parent === '') item.parent = '#';
                    item.id = item['POS_KEY'];
                    item.text = item['POS_KEY_TXT'];
                });
                uniJsTree.setTreeData(ot_data);
            });
        }
    }
});
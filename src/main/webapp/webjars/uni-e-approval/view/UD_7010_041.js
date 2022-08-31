/**
 * @module uni-e-approval/view/UD_7010_041
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var uniJsTree = $u.UniJsTree($('#pos-tree'), {
            // load_node: function () {
            //     uniJsTree.open_all();
            // },
            select_node: function (nodeData) {
                formHandler.hideAllForm();
                formHandler.setJobForm(nodeData);
            }
        });
        var formHandler = function () {
            var $jobInfo = $('#job-info').detach();
            var $uniButtonsJob = $('#uni-buttons-job').detach();
            var $uniButtonsJobAdd = $('#uni-buttons-job-insert').detach();
            var $searchTable = $('.unidocu-table').detach();
            var $rightWrapper = $('#rightWrapper');

            function clearForm($el) {
                $el.find('input[type=text]').val('');
            }

            return {
                hideAllForm: function () {
                    $jobInfo.detach();
                    $uniButtonsJob.detach();
                    $uniButtonsJobAdd.detach();
                    $searchTable.detach();
                    clearForm($jobInfo);
                },
                setJobForm: function (nodeData) {
                    $jobInfo.appendTo($rightWrapper);
                    $uniButtonsJob.appendTo($rightWrapper);
                    $u.setValues('job-info', nodeData);
                }

            }
        }();


        return function () {
            formHandler.hideAllForm();
            $nst.is_data_ot_data('ZUNIEWF_1022', null, function (ot_data) {
                $.each(ot_data, function (index, item) {
                    item.parent = '#';
                    item.id = item['JOB_KEY'];
                    item.text = item['JOB_KEY_TXT'];
                });
                uniJsTree.setTreeData(ot_data);
            });
        }
    }
});
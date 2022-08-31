/**
 * @module unidocu-ui/view/LogStatistics
 */
define(function () {
    return function () {
        $u.unidocuUI();
        var $u_duration = $u.get('search-condition', 'duration');
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.fitToWindowSize();

        $u_duration.$el.change(function () {
            var isDailyDetail = $u_duration.getValue() === 'dailyDetail';
            if ($u.get('s_PROGRAM_ID')) $u.get('s_PROGRAM_ID').setEmptyValue().setReadOnly(!isDailyDetail);
            if ($u.get('s_userId')) $u.get('s_userId').setEmptyValue().setReadOnly(!isDailyDetail);

            $u.buttons.runCustomHandler('setFormTable');
            $u.buttons.triggerFormTableButtonClick('search-condition');
        });

        $u.buttons.addHandler({
            doQuery: function () {
                var searchCondition = $u.getValues('search-condition');
                if(searchCondition['date'] === staticProperties.user['TRDAT'].replace(/-/g, '')) searchCondition['date'] = 'current';
                $nst.is_data_tableReturns('NS_LogData', searchCondition, function (tableReturns) {
                    var data = tableReturns['data'];
                    gridObj.setJSONData(data);
                    gridObj.setActiveRowIndex(data.length - 1);
                }, gridObj.clearGridData());
            }
        });

        $u.buttons.addCustomHandler({
            setFormTable: function() {
                var duration = $u.get('duration').getValue();

                var $header = $('#search-condition');
                var $scope = $header.parent();
                var subGroup = $u.page.getPROGRAM_ID();
                if(duration !== 'dailyDetail') subGroup += '_' + duration;
                $header.data('subGroup', subGroup);
                $u.render.renderFormTable($scope, subGroup);

                $u.get('duration').$el.change(function() {
                    var isDailyDetail = $u.get('duration').getValue() === 'dailyDetail';
                    if ($u.get('s_PROGRAM_ID')) $u.get('s_PROGRAM_ID').setEmptyValue().setReadOnly(!isDailyDetail);
                    if ($u.get('s_userId')) $u.get('s_userId').setEmptyValue().setReadOnly(!isDailyDetail);

                    $u.buttons.runCustomHandler('setFormTable');
                    $u.buttons.triggerFormTableButtonClick('search-condition');
                });
            }
        });

        return function () {
            $u.buttons.triggerFormTableButtonClick('search-condition');
        }
    }
});
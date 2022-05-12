/**
 * @module unidocu-ui/view/LogStatistics
 */
define(function () {
    return function () {
        var $u_duration = $u.get('search-condition', 'duration');
        var $u_date = $u.get('search-condition', 'date');
        var gridObj = $u.gridWrapper.getGrid();
        var listStringMap;
        gridObj.fitToWindowSize();


        $u.buttons.addHandler({
            doQuery: function () {
                $nst.is_data_tableReturns('NS_LogData', $u.getValues('search-condition'), function (tableReturns) {
                    var data = tableReturns['data'];
                    gridObj.setJSONData(data);
                    gridObj.setActiveRowIndex(data.length - 1);
                });
            }
        });

        $u_duration.$el.change(function () {
            var gridSubId = 'GRIDHEADER';
            if ($u_duration.getValue() !== 'dailyDetail') gridSubId += '_' + 'summary';
            $(gridObj).data('subId', gridSubId);
            $u.renderGridSingle(gridObj);
            $(window).resize();

            var optionStringMap = listStringMap['dateList'];
            if ($u_duration.getValue() === 'dailySummary') optionStringMap = listStringMap['monthList'];
            if ($u_duration.getValue() === 'monthlySummary') optionStringMap = listStringMap['yearList'];

            var optionList = optionStringMap.split(',');
            var options = [];
            $.each(optionList, function (index, item) {
                options.push({value: item, text: item});
            });
            $u_date.setOptions(options);

            var isDailyDetail = $u_duration.getValue() === 'dailyDetail';
            if ($u.get('s_PROGRAM_ID')) $u.get('s_PROGRAM_ID').setEmptyValue().setReadOnly(!isDailyDetail);
            if ($u.get('s_userId')) $u.get('s_userId').setEmptyValue().setReadOnly(!isDailyDetail);

            $u.buttons.triggerFormTableButtonClick('search-condition');
        });

        return function () {
            $nst.is_data_stringReturns('NS_LogDateList', null, function (_listStringMap) {
                listStringMap = _listStringMap;
                $u_duration.$el.change();
            });
        }
    }
});
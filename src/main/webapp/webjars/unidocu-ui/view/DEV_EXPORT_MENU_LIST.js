/**
 * @module unidocu-ui/view/DEV_EXPORT_MENU_LIST
 */
define(function(){
    return function(){
        var gridObj = $u.gridWrapper.getGrid();
        gridObj.setSortEnable(false);
        gridObj._rg.gridView.setRowGroup({expandedAdornments: 'none'});
        gridObj.setGroupMerge('LEV1,LEV2,LEV1_TXT,LEV2_TXT');


        $u.buttons.addHandler({
            setByJSON: function () {
                $u.dialog.JSONInputDialog.open(function (json) {
                    gridObj.setJSONData(json);
                });
            },
            getMenuList: function(){
                var tableReturns = $nst.is_data_tableReturns('ZUNIECM_1000');
                var ot_data_2010 = $nst.is_data_ot_data('ZUNIECM_2010');

                var pathMapByProgramId = {};
                $.each(ot_data_2010, function(index, item){
                    pathMapByProgramId[item['PROGRAM_ID']] = item;
                });

                var ot_lev1 = tableReturns['OT_LEV1'];
                var ot_lev2 = tableReturns['OT_LEV2'];
                var ot_lev3 = tableReturns['OT_LEV3'];

                var lev1TextMap = {};
                var lev2TextMap = {};

                $.each(ot_lev1, function (index, item) {
                    if(item['USED']) return true;
                    lev1TextMap[item['LEV1']] = item['LEV1_TXT'];
                });

                $.each(ot_lev2, function (index, item) {
                    if(item['USED']) return true;
                    lev2TextMap[item['LEV1'] + item['LEV2']] = item['LEV2_TXT'];
                });

                var filteredOtLev3 = [];
                $.each(ot_lev3, function(index, item){
                    if(item['USED']) return true;
                    var lev1Text = lev1TextMap[item['LEV1']];
                    var lev2Text = lev2TextMap[item['LEV1'] + item['LEV2']];

                    if(!lev1Text) return true;
                    if(!lev2Text) return true;

                    item['LEV1_TXT'] = lev1Text;
                    item['LEV2_TXT'] = lev2Text;

                    $.extend(item, pathMapByProgramId[item['PROGRAM_ID']]);
                    filteredOtLev3.push(item);
                });

                gridObj.setJSONData(filteredOtLev3)
            }
        });

        return function(){

        }
    }
});
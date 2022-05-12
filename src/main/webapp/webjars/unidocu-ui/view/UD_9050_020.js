/**
 * UD_9050_020 UniDocu Code Test
 * @module unidocu-ui/view/UD_9050_020
 */
define(function() {
    return function(){
        $u.unidocuUI();
        var ot_input, ot_field;
        $nst.is_data_tableReturns('ZUNIECM_3000', {}, function(tableReturns){
            ot_input = tableReturns['OT_INPUT'];
            ot_field = tableReturns['OT_FIELD'];
            var fobjs = {};
            $.each(ot_input, function(index, item){ fobjs[item['FOBJ']] = item['FOBJ_TXT']; });
            $.each(ot_field, function(index, item){ fobjs[item['FOBJ']] = item['FOBJ_TXT']; });

            var optionList = [];
            $.each(fobjs, function(key, value){
                optionList.push({value: key, text: value});
            });

            $u.createSingleInput({"name": "popupKey", "type": "Uni_Combo", "options": optionList}, $('#popupKeyOptions')).$el.change(changePopup);
            $u.createSingleInput({"name": "comboKey", "type": "Uni_Combo", "options": optionList}, $('#comboKeyOptions')).$el.change(changeCombo);
        });

        function showFieldInfo(fobj) {
            if(!fobj) return;
            var $searchForm = $('#searchForm');
            $searchForm.find('#shwoFieldInfo').remove();

            var $showFieldInfo = $('<div id="shwoFieldInfo"></div>');
            var $ot_inputGrid = $('<div id="unidocu-grid-ot_input" class="unidocu-grid" data-sub-id="empty" style="height: 200px;"></div>');
            var $ot_fieldGrid = $('<div id="unidocu-grid-ot_field" class="unidocu-grid" data-sub-id="empty" style="height: 200px;"></div>');
            $('<p></p>').text('ot_input').appendTo($showFieldInfo);
            $ot_inputGrid.appendTo($showFieldInfo);
            $('<p></p>').text('ot_field').appendTo($showFieldInfo);
            $ot_fieldGrid.appendTo($showFieldInfo);
            $showFieldInfo.appendTo($searchForm);

            $u.renderUIComponents($showFieldInfo);
            $u.gridWrapper.getGrid('unidocu-grid-ot_input').setTextFieldJSONData(filterByFobj(fobj, ot_input));
            $u.gridWrapper.getGrid('unidocu-grid-ot_field').setTextFieldJSONData(filterByFobj(fobj, ot_field));
        }

        function filterByFobj(fobj, jsonArray) {
            var result = [];
            $.each(jsonArray, function(index, item){
                if(item['FOBJ'] === fobj) result.push(item);
            });
            return result;
        }

        function changePopup() {
            var popupKey = $u.get('popupKey').getValue();
            $u.createSingleInput({"name": popupKey, "type": "Uni_CodePopup", "codeKey": popupKey}, $('#unidocuPopup'));
            showFieldInfo(popupKey);
        }

        function changeCombo() {
            var comboKey = $u.get('comboKey').getValue();
            var comboParams = {};
            comboParams[comboKey] = {};
            $u.createSingleInput({"name": comboKey, "type": "Uni_Combo", options: $u.f4Data.getCodeComboOption(comboKey)}, $('#unidocuCombo'));
            showFieldInfo(comboKey);
        }
    }
});
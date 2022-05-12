/**
 * @module vendorCustom/magnachip/view/assertSameCardGroup
 */
define(function(){
    return /** assertSameCardGroup */ function(gridObj, rowIndex){
        var selectedRowData = gridObj.getJSONDataByRowIndex(rowIndex);
        var selectedRowYearMonth = selectedRowData['APPR_DATE'].replace(/-/g, '').substr(0,6);
        var selectedRowHasWMWST = gridObj.getJSONData()[rowIndex]['TAX'] !== '0';

        var selectedGridData = gridObj.getSELECTEDJSONData();
        for(var i= 0,len=selectedGridData.length;i<len;i++) {
            var yearMonth = selectedGridData[i]['APPR_DATE'].replace(/-/g, '').substr(0, 6);
            var hasWMWST = selectedGridData[i]['TAX'] !== '0';
            if(yearMonth !== selectedRowYearMonth) throw '승인일자의 년월이 틀린경우 함께 선택 할 수 없습니다.';
            if(hasWMWST !== selectedRowHasWMWST) throw '세액이 존재하는건과 존재하지 않는건은 함께 선택 할 수 없습니다.'
        }
    }
});
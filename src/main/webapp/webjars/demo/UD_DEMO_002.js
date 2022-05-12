/**
 * @module demo/UD_DEMO_002
 */
define(function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        $u.buttons.addHandler({
            "doQuery": function () {
                var ot_data = [
                    {"CAR_NM": "쏘렌토", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "A", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "800", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "그랜저 2.7", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "A", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "SM3", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "350", "TAX_RETURN_YN": "Y", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "Grand C4 Picasso 2.1", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "Accord 3.0", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "B", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "Y", "CAR_ID": "2021"},
                    {"CAR_NM": "K7", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "B", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "450", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "싼타페", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "550", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "말리부 2.0", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "580", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "제네시스 G80 2.2", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "A", "EFFICIENCY": "12", "OIL_TANK_CAPACITY": "800", "TAX_RETURN_YN": "N", "USE_YN": "Y", "CAR_ID": "2021"},
                    {"CAR_NM": "쏘렌토(c)", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "쏘나타(2007b)", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "B", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "쏘나타", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "A", "EFFICIENCY": "14", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "아반떼", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "16", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "K5", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "14", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "SM6", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "15", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"},
                    {"CAR_NM": "모닝", "PRODUCT_YEAR": "2021", "OIL_ITEM_TYPE": "C", "EFFICIENCY": "13", "OIL_TANK_CAPACITY": "500", "TAX_RETURN_YN": "N", "USE_YN": "N", "CAR_ID": "2021"}
                ];
                gridObj.setJSONData(ot_data);
            },
            "addCarMaster": function () {},
            "deleteCarMaster": function () {
                gridObj.asserts.rowSelected();
            }
        });
    };
});



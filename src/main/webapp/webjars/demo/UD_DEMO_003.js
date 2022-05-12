/**
 * @module demo/UP_DEMO_003
 * 차량마스터 관리
 */
define([], function () {
    return function () {
        var gridObj = $u.gridWrapper.getGrid();
        // gridObj.setColumnNumberPrecision('EFFICIENCY', 1);
        $u.buttons.addHandler({
            "doQuery": function () {
                var ot_data = [
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"제과재료유통팀",   ADMIN_EMP_NM: "심현성", ADMIN_EMP_CD: "UP213215", CAR_NUM: "01머3578", CAR_TYPE_CD: "자가차량", CAR_NM: "쏘렌토", PRODUCT_YEAR: "2018", OIL_ITEM_TYPE: "경유", EFFICIENCY: "7.7"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"제과재료유통팀",   ADMIN_EMP_NM: "이경훈", ADMIN_EMP_CD: "UP213289", CAR_NUM: "02무8747", CAR_TYPE_CD: "자가차량", CAR_NM: "그랜저 2.7", PRODUCT_YEAR: "2006", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "7.1"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"가공상품소싱팀",   ADMIN_EMP_NM: "김태훈", ADMIN_EMP_CD: "UP214647", CAR_NUM: "03서9179", CAR_TYPE_CD: "자가차량", CAR_NM: "SM3", PRODUCT_YEAR: "2005", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "8.7"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"PCR",   ADMIN_EMP_NM: "김종근", ADMIN_EMP_CD: "UP212732", CAR_NUM: "03소3551", CAR_TYPE_CD: "자가차량", CAR_NM: "Grand C4 Picasso 2.1", PRODUCT_YEAR: "2017", OIL_ITEM_TYPE: "경유", EFFICIENCY: "11.9"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"가공상품소싱팀",   ADMIN_EMP_NM: "김상덕", ADMIN_EMP_CD: "UP216277", CAR_NUM: "03조3489", CAR_TYPE_CD: "자가차량", CAR_NM: "Accord 3.0", PRODUCT_YEAR: "2004", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "7.1"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"서부유통팀",   ADMIN_EMP_NM: "이홍길", ADMIN_EMP_CD: "UP213216", CAR_NUM: "04루4450", CAR_TYPE_CD: "자가차량", CAR_NM: "K7", PRODUCT_YEAR: "2018", OIL_ITEM_TYPE: "경유", EFFICIENCY: "8.5"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"EMS기술영업팀",   ADMIN_EMP_NM: "이재훈", ADMIN_EMP_CD: "UP208272", CAR_NUM: "04저7919", CAR_TYPE_CD: "자가차량", CAR_NM: "싼타페", PRODUCT_YEAR: "2019", OIL_ITEM_TYPE: "경유", EFFICIENCY: "11.5"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"Specialty",   ADMIN_EMP_NM: "박인수", ADMIN_EMP_CD: "UP184388", CAR_NUM: "05라0214", CAR_TYPE_CD: "자가차량", CAR_NM: "말리부 2.0", PRODUCT_YEAR: "2013", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "8.9"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"동부유통팀",   ADMIN_EMP_NM: "류남길", ADMIN_EMP_CD: "UP216421", CAR_NUM: "05마9459", CAR_TYPE_CD: "자가차량", CAR_NM: "제네시스 G80 2.2", PRODUCT_YEAR: "2018", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "10.3"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"호남물류",   ADMIN_EMP_NM: "이송일", ADMIN_EMP_CD: "UP200036", CAR_NUM: "06누0988", CAR_TYPE_CD: "자가차량", CAR_NM: "쏘렌토(c)", PRODUCT_YEAR: "2016", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "10.4"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"실수요2팀",   ADMIN_EMP_NM: "이건완", ADMIN_EMP_CD: "UP212476", CAR_NUM: "06무3831", CAR_TYPE_CD: "자가차량", CAR_NM: "쏘나타(2007b)", PRODUCT_YEAR: "2007", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "8.2"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"기술영업2팀",   ADMIN_EMP_NM: "김종희", ADMIN_EMP_CD: "UP203064", CAR_NUM: "07어7209", CAR_TYPE_CD: "자가차량", CAR_NM: "쏘나타", PRODUCT_YEAR: "2018", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "10.2"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"프랜차이즈파트",   ADMIN_EMP_NM: "류태우", ADMIN_EMP_CD: "UP211082", CAR_NUM: "09구1772", CAR_TYPE_CD: "자가차량", CAR_NM: "아반떼", PRODUCT_YEAR: "2007", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "10.5"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"프랜차이즈파트",   ADMIN_EMP_NM: "최민숙", ADMIN_EMP_CD: "UP203047", CAR_NUM: "09다4116", CAR_TYPE_CD: "자가차량", CAR_NM: "K5", PRODUCT_YEAR: "2019", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "9.9"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"Specialty",   ADMIN_EMP_NM: "최재원", ADMIN_EMP_CD: "UP198092", CAR_NUM: "09다9680", CAR_TYPE_CD: "자가차량", CAR_NM: "SM6", PRODUCT_YEAR: "2017", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "8.8"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"전기전자팀",   ADMIN_EMP_NM: "지한울", ADMIN_EMP_CD: "UP217309", CAR_NUM: "09하6493", CAR_TYPE_CD: "렌트(법인)", CAR_NM: "모닝", PRODUCT_YEAR: "2018", OIL_ITEM_TYPE: "경유", EFFICIENCY: "13.1"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"동반성장팀",   ADMIN_EMP_NM: "김성미", ADMIN_EMP_CD: "UP200077", CAR_NUM: "09호0880", CAR_TYPE_CD: "렌트(법인)", CAR_NM: "쏘나타", PRODUCT_YEAR: "2019", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "10.2"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"LFT팀",   ADMIN_EMP_NM: "전형래", ADMIN_EMP_CD: "UP196189", CAR_NUM: "11고8149", CAR_TYPE_CD: "자가차량", CAR_NM: "CC 2.0 TSI", PRODUCT_YEAR: "2015", OIL_ITEM_TYPE: "경유", EFFICIENCY: "8.5"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"PCR",  ADMIN_EMP_NM: "최민수", ADMIN_EMP_CD: "UP193241", CAR_NUM: "11루1469", CAR_TYPE_CD: "자가차량", CAR_NM: "티구안 2.0", PRODUCT_YEAR: "2015", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "11.2"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"H&,W",  ADMIN_EMP_NM: "구철", ADMIN_EMP_CD: "UP192238", CAR_NUM: "11보3715", CAR_TYPE_CD: "자가차량", CAR_NM: "쏘나타", PRODUCT_YEAR: "2015", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "10.8"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"서부유통팀",   ADMIN_EMP_NM: "서대원", ADMIN_EMP_CD: "UP211214", CAR_NUM: "122하2755", CAR_TYPE_CD: "자가차량", CAR_NM: "싼타페a", PRODUCT_YEAR: "2020", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "10.5"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"제과재료유통팀",   ADMIN_EMP_NM: "박영제", ADMIN_EMP_CD: "UP213007", CAR_NUM: "124어4909", CAR_TYPE_CD: "자가차량", CAR_NM: "싼타페", PRODUCT_YEAR: "2020", OIL_ITEM_TYPE: "경유", EFFICIENCY: "8.1"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"Specialty팀",  ADMIN_EMP_NM: "박재훈", ADMIN_EMP_CD: "UP210149", CAR_NUM: "128하7397", CAR_TYPE_CD: "자가차량", CAR_NM: "트랙스 1.4", PRODUCT_YEAR: "2020", OIL_ITEM_TYPE: "경유", EFFICIENCY: "10"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"LFT팀",   ADMIN_EMP_NM: "박정훈", ADMIN_EMP_CD: "UP217323", CAR_NUM: "13가6871", CAR_TYPE_CD: "자가차량", CAR_NM: "그랜저HG 3.0", PRODUCT_YEAR: "2014", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "8.4"},
                    {column1: "재직", column2: "부서이동", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"H&,W",   ADMIN_EMP_NM: "김진태", ADMIN_EMP_CD: "UP217128", CAR_NUM: "13고8175", CAR_TYPE_CD: "자가차량", CAR_NM: "카니발", PRODUCT_YEAR: "2015", OIL_ITEM_TYPE: "경유", EFFICIENCY: "7.7"},
                    {column1: "재직", column2: "변동사항없음", ADMIN_CO:  "유니포스트", ADMIN_DEPT_CD: 	"LFT팀",  ADMIN_EMP_NM: "김인건", ADMIN_EMP_CD: "UP214013", CAR_NUM: "13머0832", CAR_TYPE_CD: "자가차량", CAR_NM: "투싼(2017a)", PRODUCT_YEAR: "2017", OIL_ITEM_TYPE: "휘발유", EFFICIENCY: "13.9" }
                ] ;
                gridObj.setJSONData(ot_data);
            },
            "manageCarHistory": function () {
            },
            "addCarMasterInfo": function () {
            },
            "deleteCarMasterInfo": function () {
                gridObj.asserts.rowSelected();
            }
        });
    };
});
let app = new Vue({
	el: '#app',
	data: {
		leftMenu: GX._METHODS_.createLeftMenu(),
		deptName: '',
		userName: '',
		params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트
        locationPath: location.pathname.replace(/\//g, '').replace('.html', ''),
        /**
         * rows.Query 조회 결과
         */
		rows: {
            Query: [],
        },
        /**
         * 조회 조건
         */
        queryForm: {
            CompanySeq: '',
            BizUnit: '',
            BizUnitName: '',
            PODateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            PODateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            DelvPlanDateFr: '',
            DelvPlanDateTo: '',
            SMCurrStatus: 0,
            SMCurrStatusName: '전체',
            // PONo: '',
            Dept: 0,
            DeptName: '전체',
            ItemName: '',
            ItemNo: '',
            // Spec: '',
            OrderItemNo: '',
            // OrderItemName: '',
            BuyerNo: '',
        },
        SMCurrStatusList: [],
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        },
        isCheckList: [],
        // 부서 리스트
        DeptNameList: [],
        // 부서 리스트
        KeepDeptNameList: [],
        // grid 내 날짜 edit 모드일 때 기존 데이터 유지
        objGridDatepicker: {
            boolEditingStart: false,
            strEditingStart: '',
        },
	},
    watch: {
        'rows.Query': 'saveHistory',
        'objGridDatepicker.boolEditingStart': 'postEditingStartEvt',
    },

    methods: {
        /**
         * 조회조건 SessionStorage에 담기
         */
        saveHistory: function() {
            try {
                GX.SessionStorage.set(this.locationPath + '-queryForm', JSON.stringify(this.queryForm));
            } catch (e) {
                toastr.warning('화면 이력을 저장하지 못하였습니다.');
            }
        },
        /**
         * SessionStorage에 담겨있는 조회조건 가져와서 세팅
         */
        loadHistory: function() {
            try {
                const vThis = this;
                const queryForm = GX._METHODS_.nvl(GX.SessionStorage.get(vThis.locationPath + '-queryForm')) == '' ? {} : JSON.parse(GX.SessionStorage.get(vThis.locationPath + '-queryForm'));

                if (Object.keys(queryForm).length > 0) {
                    vThis.queryForm = queryForm;
                /**
                    * Default data setting
                    * 부서명, 사용자명, 사업단위, CompanySeq, CustSeq 세팅
                    * BizUnitList: 사업단위가 여러개일 수 있어 배열로 담기
                    * CustSeq: 구매납품 업체 / 외주가공 업체 구분할 때 사용
                    */
                    vThis.deptName = GX.Cookie.get('DeptName');
                    vThis.userName = GX.Cookie.get('UserName');
                    vThis.BizUnitList = Object.values(JSON.parse(GX.Cookie.get('BizUnit_JsonFormatStringType')));
                    vThis.queryForm.CompanySeq = vThis.BizUnitList[0].CompanySeq;
                    vThis.queryForm.BizUnit = vThis.BizUnitList[0].BizUnit;
                    vThis.queryForm.BizUnitName = vThis.BizUnitList[0].BizUnitName;
                    vThis.queryForm.CustSeq = GX.Cookie.get('CustSeq');
                    
                    // tui-datepicker에서 날짜를 바인딩 시킬때 Date 형식으로 바인딩해야함 
                    vThis.rangePickerPODate.setStartDate(new Date(parseInt(vThis.queryForm.PODateFr.substring(0, 4)), parseInt(vThis.queryForm.PODateFr.substring(4, 6)) - 1, parseInt(vThis.queryForm.PODateFr.substring(6))));
                    vThis.rangePickerPODate.setEndDate(new Date(parseInt(vThis.queryForm.PODateTo.substring(0, 4)), parseInt(vThis.queryForm.PODateTo.substring(4, 6)) - 1, parseInt(vThis.queryForm.PODateTo.substring(6))));
                    vThis.rangePickerDelvPlanDate.setStartDate(new Date(parseInt(vThis.queryForm.DelvPlanDateFr.substring(0, 4)), parseInt(vThis.queryForm.DelvPlanDateFr.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvPlanDateFr.substring(6))));
                    vThis.rangePickerDelvPlanDate.setEndDate(new Date(parseInt(vThis.queryForm.DelvPlanDateTo.substring(0, 4)), parseInt(vThis.queryForm.DelvPlanDateTo.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvPlanDateTo.substring(6))));

                    // 조회 조건 로드 후 조회 실행
                    vThis.search();
                }
            } catch (e) {
                toastr.warning('화면 이력을 가져오는 중 문제가 발생하여 정상적으로 가져오지 못하였습니다.');
            }
        },
        /**
         * tui grid의 datepicker 셀이 editing 상태가 시작했을 때 발생하는 이벤트의 후처리 함수 
         * tui grid의 datepicker 셀이 editing 상태가 시작되면 해당 셀의 데이터가 사라지는 현상 때문에 추가
         * 'editingStart' 이벤트 내부에 watch에서 감시중인 객체의 데이터를 변경하여 아래 함수가 실행되도록하면
           마치 'editingStart' 이벤트 직후에 아래 함수가 실행되는것처럼됨 
         */
        postEditingStartEvt: function () {
            const vThis = this;
            if (vThis.objGridDatepicker.boolEditingStart)
                document.getElementsByClassName('tui-grid-datepicker-input')[0].value = vThis.objGridDatepicker.strEditingStart;
        },

        /**이벤트 처리 */
        eventCheck: function() {
            let vThis = this;
            let e = event;

			// Click Event
            if(e.type === 'click'){
                if(document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu'){
                    document.getElementsByClassName('left-menu')[0].style.display = 'none';
                }

                if((document.getElementsByClassName('drop-box')[0].style.display === 'block' || document.getElementsByClassName('drop-box')[1].style.display === 'block') && e.target.getAttribute('class') !== 'drop-box-input'){
                    document.getElementsByClassName('drop-box')[0].style.display = 'none';
                    document.getElementsByClassName('drop-box')[1].style.display = 'none';
                    // 부서 Select Box 초기화
                    if ((vThis.DeptNameList.length == 1 && (vThis.DeptNameList[0].val == '전체' || vThis.DeptNameList[0].val == '')) || vThis.queryForm.DeptName.replace(/\ /g, '') == '') {
                        vThis.DeptNameList = vThis.KeepDeptNameList;
                        vThis.queryForm.Dept = vThis.KeepDeptNameList[0].key;
                        vThis.queryForm.DeptName = vThis.KeepDeptNameList[0].val;
                    }
                }

                if (e.type === 'click' && e.target.getAttribute('class') !== 'tui-grid-content-text') {
                    // 현재 editing인 영역을 제외한 다른 영역 클릭 시 edit mode 종료
                    vThis.mainGrid.finishEditing(); // 수정한 데이터 적용된 상태로 종료. 반대는 cancelEditing()
                }
            }

            // Key Event
            else if(e.type === 'keyup'){
                switch(e.key.toLowerCase()){
                    case 'control': vThis.keyCombi.Control = false; break;
                    case 'q': vThis.keyCombi.Q = false; break;
                }
                vThis.keyCombi.isKeyHold = false;
            }
            else if(e.type === 'keydown'){
                switch(e.key.toLowerCase()){
                    case 'control': vThis.keyCombi.Control = true; break;
                    case 'q': vThis.keyCombi.Q = true; break;
                    case 'backspace':
                        if (e.target.getAttribute('id')) {
                            // 조회조건 납품예정일 데이터를 지웠을 때 연결되어있는 vThis.queryForm.DelvPlanDateFr 또는 vThis.queryForm.DelvPlanDateTo의 데이터도 제거
                            let eTemp = e.target.getAttribute('id').split('-')[0];
                            if (eTemp.substr(-2).toLowerCase() === 'fr') {
                                vThis.rangePickerDelvPlanDate.setStartDate(null)
                                vThis.queryForm[eTemp] = ''
                                vThis.queryForm[eTemp.substr(0, eTemp.length - 2) + 'To'] = ''
                            } else if (eTemp.substr(-2).toLowerCase() === 'to') {
                                vThis.rangePickerDelvPlanDate.setEndDate(null)
                                vThis.queryForm[eTemp] = ''
                            }
                        }
                        break;
                }

                if (!vThis.keyCombi.isKeyHold && vThis.keyCombi.Control && vThis.keyCombi.Q){
                    vThis.keyCombi.isKeyHold = true;
                    vThis.search();
                }
            }
        },
        /**조회 조건의 진행상태 열기/닫기 */
        openCloseDropBox: function(inputEleName = '') {
            let e = event;
            
            if (e.target.nodeName.toUpperCase() === 'LI') {
                if (inputEleName.length == 0) inputEleName = e.target.parentNode.previousElementSibling.name;
                this.queryForm[inputEleName.replace('Name', '')] = e.target.value;
                this.queryForm[inputEleName] = e.target.innerText;
                e.target.parentNode.style.display = 'none';
            } else {
                if (e.target.nextElementSibling.style.display == 'none' || e.target.nextElementSibling.style.display == '')
                    e.target.nextElementSibling.style.display = 'block';
                else
                    e.target.nextElementSibling.style.display = 'none';
            }
        },
        // 발주부서 input에 입력 시 리스트 변경
        likeSelect2: function(str = "Dept") {
            let e = event;
            let vThis = this;

            let strConcat = 'Keep' + str + 'NameList';

            let likeIndex = [];
            if (GX._METHODS_.nvl(e.target.value).length > 0) {
                vThis[strConcat].forEach((v, i) => {
                    if (v.val.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) likeIndex.push(i);
                });
            }

            if (likeIndex.length > 0) {
                let arrTemp = [];
                likeIndex.forEach(v => {
                    arrTemp.push(vThis[strConcat][v]);
                });
                vThis.DeptNameList = arrTemp;
            } else {
                vThis.DeptNameList = vThis[strConcat];
            }
        },
        init: function () {
            let vThis = this;
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
            vThis.queryForm.PODateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.PODateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.DelvPlanDateFr = '';
            vThis.queryForm.DelvPlanDateTo = '';
            vThis.queryForm.SMCurrStatus = 0;
            vThis.queryForm.SMCurrStatusName = '전체';
            // vThis.queryForm.PONo = '';
            vThis.queryForm.Dept = 0;
            vThis.queryForm.DeptName = '전체';
            vThis.queryForm.ItemName = '';
            vThis.queryForm.ItemNo = '';
            // vThis.queryForm.Spec = '';
            vThis.queryForm.OrderItemNo = '';
            vThis.queryForm.OrderItemName = '';
        },
        /**납품등록 화면으로 점프. 여러행 */
        pageJump: function () {
            const vThis = this;

            // 체크된 행만 가져오기
            let arr = vThis.mainGrid.getCheckedRows();

            if (arr.length > 0) {
                GX.SessionStorage.set('jumpData', JSON.stringify(arr));
                GX.SessionStorage.set('jumpSetMethodId', 'PUORDPOJump');
                location.href = 'purchase_delivery.html';
            } else{
                toastr.warning("선택된 데이터가 없습니다.");
            }
        },

        /**조회 */
        search: function(callback) {
            let vThis = this;

            // 포커스 제거
            document.activeElement.blur();

            let params = GX.deepCopy(vThis.queryForm);

            Object.keys(params).map((k) => {
                if (k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1) {
                    if (params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
            });

            // 부서코드 key 변경하여 넣기
            params.DeptSeq = params.Dept;

            vThis.rows.Query = [];
            
            GX._METHODS_
            .setMethodId('PUORDPOQuery')
            .ajax([params], [function (data) {
                if(data.length > 0){
                    let i = 0;
                    while (i < data.length) {
                        // 납품예정일에 데이터가 없을 경우 납기일 기본 세팅
                        if (GX._METHODS_.nvl(data[i].DelvPlanDate).length !== 8) {
                            data[i].DelvPlanDate = data[i].DelvDate;
                        }
                        i++;
                    }
                    vThis.rows.Query = data;
                    toastr.info('조회 결과: ' + vThis.rows.Query.length + '건');
                } else{
                    vThis.rows.Query = [];
                    toastr.info('조회 결과가 없습니다.');
                }

                if (typeof callback === 'function') callback();

                // 그리드에 데이터 바인딩
                vThis.mainGrid.resetData(vThis.rows.Query);

                // 조회 조건 영역 데이터 저장
                vThis.saveHistory();
            }])
        },
        save: function() {
            const vThis = this;

            // 현재 edit 상태인 셀 적용 처리
            vThis.mainGrid.blur();

            let getModiData = vThis.mainGrid.getModifiedRows({
                // checkedOnly: false, // defualt=false If set to true, only checked rows will be considered.
                withRawData: true, // defualt=false If set to true, the data will contains the row data for internal use.
                // rowKeyOnly: false, // defualt=false If set to true, only keys of the changed rows will be returned.
                // ignoredColumns: [], // A list of column name to be excluded.
            }).updatedRows;

            if (getModiData.length > 0) {
                // DataBlock1에 공통으로 들어가야 하는 파라미터 세팅
                for (let i = 0; i < getModiData.length; i++) {
                    getModiData[i].IDX_NO = parseInt(getModiData[i].rowKey) + 1;
                    getModiData[i].WorkingTag = 'U';
                    
                    // 날짜 형태의 데이터들 '-' 하이푼 있는지 확인하고 있을 경우 제거
                    Object.keys(getModiData[i]).map(k => {
                        if (k.toLowerCase().indexOf('date') > -1) {
                            if (GX._METHODS_.nvl(getModiData[i][k]).indexOf('-') > -1) {
                                getModiData[i][k] = getModiData[i][k].replace(/\-/g, '');
                            }
                        }
                    });
                }

                try {
                    GX._METHODS_
                    .setMethodId('PUORDPOSave')
                    .ajax(getModiData, [], [function(data){
                        toastr.info('저장 성공');
                        vThis.search();
                    }]);
                } catch(e) {
                    toastr.error('저장 중 에러 발생 \n' + e);
                }
            } else {
                toastr.warning('저장할 데이터가 없습니다.');
            }
        },

        /**엑셀 다운로드 xlxs */
        excelDownload: function () {
            const vThis = this;
            console.log(vThis.mainGrid.getCheckedRowKeys())

            const gridDt = document.getElementsByClassName('tui-grid-table');
            let gridTbodyTr = gridDt[gridDt.length - 1].getElementsByTagName('tbody')[0].cloneNode(true);

            if (gridTbodyTr.childElementCount > 0) {
                let summaryTbodyTr = gridDt[gridDt.length - 2].getElementsByTagName('tbody')[0].childNodes[0].cloneNode(true);
                let headerTbodyTr = gridDt[gridDt.length - 3].getElementsByTagName('tbody')[0].childNodes[0].cloneNode(true);
                gridTbodyTr.prepend(headerTbodyTr, summaryTbodyTr);
                let table = document.createElement('table');
                table.append(gridTbodyTr);
                
                GX._METHODS_.excelDownload(table);
            } else {
                toastr.warning('다운로드할 데이터가 없습니다.');
            }
        },
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login.html');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');
			
			document.addEventListener('click', vThis.eventCheck, false);
            document.addEventListener('keydown', vThis.eventCheck, false);
            document.addEventListener('keyup', vThis.eventCheck, false);

            /**
			 * Default data setting
			 * 부서명, 사용자명, 사업단위, CompanySeq, CustSeq 세팅
			 * BizUnitList: 사업단위가 여러개일 수 있어 배열로 담기
             * CustSeq: 구매납품 업체 / 외주가공 업체 구분할 때 사용
			 */
			vThis.deptName = GX.Cookie.get('DeptName');
			vThis.userName = GX.Cookie.get('UserName');
			vThis.BizUnitList = Object.values(JSON.parse(GX.Cookie.get('BizUnit_JsonFormatStringType')));
            vThis.queryForm.CompanySeq = vThis.BizUnitList[0].CompanySeq;
            vThis.queryForm.BizUnit = vThis.BizUnitList[0].BizUnit;
            vThis.queryForm.BizUnitName = vThis.BizUnitList[0].BizUnitName;
			vThis.queryForm.CustSeq = GX.Cookie.get('CustSeq');

            /**조회조건 Select box setting
            * 진행상태(구매): SMCurrStatusList
            */
            const objSelBoxQueryForm = {'SMCurrStatusList': 'PUOrd', 'DeptNameList': 'PODept'};
            Object.keys(objSelBoxQueryForm).map(k => {
                GX._METHODS_
                .setMethodId('SCMCodeHelp')
                .ajax([{ QryType: objSelBoxQueryForm[k] }], [function (data){
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            vThis[k].push({ key: data[i][Object.keys(data[i])[0]], val: data[i][Object.keys(data[i])[1]] })
                        }
                    }
                    // Select box의 경우 검색 기능 로직에서 원본 데이터를 따로 담아둘 배열이 하나 더 존재함.
                    if (typeof vThis['Keep' +k] === 'object') vThis['Keep' + k] = vThis[k];
                }]);
            });
        }
    },
    mounted() {
        const vThis = this;

        // init from to Datepicker
        const today = new Date();
        vThis.rangePickerPODate = new tui.DatePicker.createRangePicker({
            startpicker: {
                date: today,
                input: '#PODateFr-startpicker-input',
                container: '#PODateFr-startpicker-container'
            },
            endpicker: {
                date: today,
                input: '#PODateTo-endpicker-input',
                container: '#PODateTo-endpicker-container'
            },
            format: 'yyyy-MM-dd',
            language: 'ko',
            timePicker: false
        });
        vThis.rangePickerDelvPlanDate = new tui.DatePicker.createRangePicker({
            startpicker: {
                input: '#DelvPlanDateFr-startpicker-input',
                container: '#DelvPlanDateFr-startpicker-container'
            },
            endpicker: {
                input: '#DelvPlanDateTo-endpicker-input',
                container: '#DelvPlanDateTo-endpicker-container'
            },
            format: 'yyyy-MM-dd',
            language: 'ko',
            timePicker: false
        });

        // put default data into "this.queryForm.~"
        vThis.queryForm.PODateFr = vThis.rangePickerPODate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        vThis.queryForm.PODateTo = vThis.rangePickerPODate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');

        // regist range datepicker change event
        vThis.rangePickerPODate.on('change:start', () => {
            if (vThis.rangePickerPODate.getStartDate())
                vThis.queryForm.PODateFr = vThis.rangePickerPODate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });
        vThis.rangePickerPODate.on('change:end', () => {
            if (vThis.rangePickerPODate.getEndDate())
                vThis.queryForm.PODateTo = vThis.rangePickerPODate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });
        vThis.rangePickerDelvPlanDate.on('change:start', () => {
            if (vThis.rangePickerDelvPlanDate.getStartDate())
                vThis.queryForm.DelvPlanDateFr = vThis.rangePickerDelvPlanDate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });
        vThis.rangePickerDelvPlanDate.on('change:end', () => {
            if (vThis.rangePickerDelvPlanDate.getEndDate())
                vThis.queryForm.DelvPlanDateTo = vThis.rangePickerDelvPlanDate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });

        // init grid columns, set grid columns
        ToastUIGrid.setColumns
        .init()
        .setRowHeaders('rowNum', 'checkbox')
        .header('진행상태').name('SMCurrStatusName').align('center').width(90).whiteSpace().ellipsis().sortable(true).setRow()
        .header('발주일').name('PODate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        // .header('발주번호').name('PONo').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('발주부서').name('DeptName').align('center').width(150).whiteSpace().ellipsis().sortable(true).setRow()
        .header('납기일').name('DelvDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('납품예정일').name('DelvPlanDate').align('center').width(100).whiteSpace().ellipsis().editor('date').formatter('addHyphen8length').sortable(true).setRow()
        .header('품번').name('ItemNo').align('left').width(140).whiteSpace().ellipsis().sortable(true).setRow()
        .header('품명').name('ItemName').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('규격').name('Spec').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('단위').name('UnitName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('발주수량').name('Qty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('발주단가').name('Price').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('발주금액').name('CurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('부가세').name('CurVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('금액계').name('TotCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('미납수량').name('RemainQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('납품수량').name('DelvQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('납품금액').name('DelvCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('입고창고').name('WHName').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('비고').name('Remark1').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('Order품명').name('OrderItemName').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('Order품번').name('OrderItemNo').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('Order규격').name('OrderSpec').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('BuyerNo.').name('BuyerNo').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('사이즈').name('SizeName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('색상').name('ColorNo').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('사용부위').name('UseSelect').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        ;

        // create grid
        vThis.mainGrid = ToastUIGrid.initGrid('grid');

        // grid data init
        vThis.rows.Query = [];
        vThis.mainGrid.resetData(vThis.rows.Query);

        // grid afterSort event - 정렬(sorting) 시 다중 정렬 기능도 알림
        vThis.mainGrid.on('afterSort', (e) => {
            if (e.sortState.columns.length === 1) {
                toastr.info('다중 정렬은 "Ctrl" 키를 누른 상태로 다른 컬럼들 클릭하면 됩니다.')
            }
        });

        // grid click event
        vThis.mainGrid.on('click', function (e) {
            // e.targetType = cell / rowHeader / columnHeader / etc (cell 다중 선택)
            // if (GX._METHODS_.nvl(e.targetType) === 'cell') console.log('click', e);
            // console.log(e.targetType, e)
            // console.log(vThis.mainGrid.getCheckedRowKeys())
        });

        // grid dblclick event
        vThis.mainGrid.on('dblclick', function(e) {
            // 행 더블 클릭 시 점프
            if (e.rowKey || e.rowKey === 0) {
                // 입력 받는 컬럼은 제외
                if (e.columnName != 'DelvPlanDate') {
                    if (confirm('입력 화면으로 이동하시겠습니까?')) {
                        let arr = [];
                        arr.push(vThis.rows.Query[e.rowKey])
                        if (arr.length > 0) {
                            GX.SessionStorage.set('jumpData', JSON.stringify(arr));
                            GX.SessionStorage.set('jumpSetMethodId', 'PUORDPOJump');
                            location.href = 'purchase_delivery.html';
                        } else 
                            toastr.error('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
                    }
                }
            }
        });

        // grid editing mode start
        vThis.mainGrid.on('editingStart', function (e) {
            vThis.objGridDatepicker.boolEditingStart = true;
            vThis.objGridDatepicker.strEditingStart = e.value;
        })

        // grid editing mode finish
        vThis.mainGrid.on('editingFinish', function (e) {
            vThis.objGridDatepicker.boolEditingStart = false;
            vThis.objGridDatepicker.strEditingStart = '';
        })

        // 새로고침 수행 시 SessionStorage 삭제
        let reloadYN = false;
        const entries = performance.getEntriesByType("navigation");
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].type === "reload") {
                reloadYN = true;
                break;
            }
        }
        if (reloadYN) {
            try {
                GX.SessionStorage.remove(vThis.locationPath + '-queryForm');
            } catch (e) {
                console.log('SessionStorage 삭제 중 에러 발생', e);
            }
        } else {
            vThis.loadHistory();
        }
    }
});
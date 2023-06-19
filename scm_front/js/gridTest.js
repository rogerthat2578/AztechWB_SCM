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
         * Query: 조회 데이터
         * ChangeIdx: 수정이 발생한 행의 Index를 배열로 가지고 있음
         */
		rows: {
            Query: [],
            ChangeIdx: [],
        },
        /**
         * 조회 조건
         */
        queryForm: {
            CompanySeq: '',
            BizUnit: '',
            BizUnitName: '',
            PODateFr: '',
            PODateTo: '',
            DelvPlanDateFr: '',
            DelvPlanDateTo: '',
            SMCurrStatus: 0,
            SMCurrStatusName: '전체',
            Dept: 0,
            DeptName: '전체',
            ItemName: '',
            ItemNo: '',
            OrderItemNo: '',
            BuyerNo: '',
        },
        // 진행상태 리스트
        SMCurrStatusList: [],
        // 부서 리스트
        DeptNameList: [],
        // 부서 리스트 (원본)
        KeepDeptNameList: [],
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        },
        // checkbox 선택한 행
        selectedChkRow: {},
        objGridDatepicker: {
            boolEditingStart: false,
            strEditingStart: '',
        },
	},
    watch: {
        'rows.Query': 'saveHistory',
        'rows.ChangeIdx': 'saveChangedHistory',
        'objGridDatepicker.boolEditingStart': 'postEditingStartEvt',
    },
    methods: {
        /**
         * 조회조건, 조회결과 데이터 SessionStorage에 담기
         */
        saveHistory: function () {
            try {
                GX.SessionStorage.set(this.locationPath + '-queryForm', JSON.stringify(this.queryForm));
                GX.SessionStorage.set(this.locationPath + '-rows.Query', JSON.stringify(this.rows.Query));
            } catch (e) {
                toastr.warning('조회 결과가 너무 많아 화면 이력을 저장하지 못하였습니다.');
            }
        },
        saveChangedHistory: function () {
            try {
                GX.SessionStorage.set(this.locationPath + '-rows.ChangeIdx', JSON.stringify(this.rows.ChangeIdx));
            } catch (e) {
                toastr.warning('조회 결과가 너무 많아 화면 이력을 저장하지 못하였습니다.');
            }
        },
        loadHistory: function () {
            try {
                const vThis = this;
                const queryForm = GX._METHODS_.nvl(GX.SessionStorage.get(vThis.locationPath + '-queryForm')) == '' ? {} : JSON.parse(GX.SessionStorage.get(vThis.locationPath + '-queryForm'));
                const rowsQuery = GX._METHODS_.nvl(GX.SessionStorage.get(vThis.locationPath + '-rows.Query')) == '' ? [] : JSON.parse(GX.SessionStorage.get(vThis.locationPath + '-rows.Query'));
                const rowsChangeIdx = GX._METHODS_.nvl(GX.SessionStorage.get(vThis.locationPath + '-rows.ChangeIdx')) == '' ? [] : JSON.parse(GX.SessionStorage.get(vThis.locationPath + '-rows.ChangeIdx'));

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
                }
                if (rowsQuery.length > 0) {
                    vThis.rows.Query = rowsQuery;
                    vThis.rows.ChangeIdx = rowsChangeIdx;
                    vThis.mainGrid.resetData(vThis.rows.Query);
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
        eventCheck: function () {
            const vThis = this;
            const e = event;

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

                /**조회 조건 영역의 X 클릭 시 날짜가 들어있는 input 태그의 데이터 제거
                 * 모바일 환경에선 X 안보이게함
                 */
                if (e.target.getAttribute('class')?.indexOf('icon-x') > -1) {
                    const inputElementId = e.target.previousElementSibling.getAttribute('id') || '';
                    if (inputElementId) {
                        let splitEleId = inputElementId.split('-');
                        vThis['rangePicker' + splitEleId[0].substring(0, splitEleId[0].length - 2)]['set' + splitEleId[1].replace('picker', '').substring(0, 1).toUpperCase() + splitEleId[1].replace('picker', '').substring(1) + 'Date'](null)
                        // 조회조건 객체(queryForm)에 일자 데이터 갱신 (v-model이 안돼서 직접해줘야함)
                        vThis.queryForm[splitEleId[0]] = '';
                    }
                }

                /**tui grid의 datepicker에서 직접입력 버튼 클릭 시 달력 닫고 해당 input의 데이터 전체 선택되도록 */
                if (e.target.getAttribute('class') === 'direct-key-in' && document.querySelector('.tui-grid-editor-datepicker-layer') && document.querySelector('.tui-grid-datepicker-input')) {
                    document.querySelector('.tui-grid-editor-datepicker-layer').style.display = 'none';
                    document.querySelector('.tui-grid-datepicker-input').select();
                } else if (e.target.getAttribute('class') === 'tui-grid-date-icon' && document.querySelector('.tui-grid-editor-datepicker-layer')) {
                    document.querySelector('.tui-grid-editor-datepicker-layer').style.display = 'block';
                }

                /**조회 조건의 datepicker에서 직접입력 버튼 클릭 시 달력 닫고 해당 input의 데이터 전체 선택되도록 */
                if (e.target.getAttribute('class') === 'direct-key-in' && e.target.closest("[id]").children[0].className?.indexOf('tui-datepicker tui-rangepicker') > -1) {
                    e.target.closest("[id]").children[0].classList.add('tui-hidden');
                    document.getElementById(e.target.closest("[id]").id.replace('container', '') + 'input').select();
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

        /**발주부서 input에 입력 시 리스트 변경 */
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

        search: function () {
            const vThis = this;
            
            const params = GX.deepCopy(vThis.queryForm);

            // 부서코드 key 변경하여 넣기
            params.DeptSeq = params.Dept;

            GX._METHODS_
            .setMethodId('PUORDPOQuery')
            .ajax([params], [function (data) {
                if (data.length > 0) {
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
                } else {
                    vThis.rows.Query = [];
                    toastr.info('조회 결과가 없습니다.');
                }

                vThis.mainGrid.resetData(vThis.rows.Query);
                vThis.saveHistory();
            }])
        },

        save: function () {
            const vThis = this;

            toastr.info('테스트 화면은 저장 불가능.')

            // 현재 edit 상태인 셀 적용 처리
            vThis.mainGrid.blur();

            const getArrData = vThis.mainGrid.getData();
            let saveArrData = [];
            
            console.log(getArrData)
            console.log(vThis.rows.ChangeIdx)

            let test = vThis.mainGrid.getModifiedRows({
                // checkedOnly: false, // defualt=false If set to true, only checked rows will be considered.
                withRawData: true, // defualt=false If set to true, the data will contains the row data for internal use.
                // rowKeyOnly: false, // defualt=false If set to true, only keys of the changed rows will be returned.
                // ignoredColumns: [], // A list of column name to be excluded.
            })
            console.log('test', test)
            console.log('updatedRows', test.updatedRows)

            // DataBlock1에 공통으로 들어가야하는 파라메터 세팅
            for (let i in vThis.rows.ChangeIdx) {
                console.log(i)
            }

            /*
            for (let i = saveArrData.length - 1; i >= 0; i--) {
                if (saveArrData[i].RowEdit) {
                    saveArrData[i].IDX_NO = saveArrData[i].ROWNUM;
                    saveArrData[i].WorkingTag = 'U';
                    saveArrData[i].DelvPlanDate = saveArrData[i].DelvPlanDate.indexOf('-') > -1 ? saveArrData[i].DelvPlanDate.replace(/\-/g, "") : saveArrData[i].DelvPlanDate;
                } else {
                    saveArrData.splice(i, 1);
                }
            }
            */
        },

    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login.html');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');
			
			document.addEventListener('click', this.eventCheck, false);
            document.addEventListener('keydown', this.eventCheck, false);
            document.addEventListener('keyup', this.eventCheck, false);

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
        .header('진행상태').name('SMCurrStatusName').align('center').width(80).whiteSpace().ellipsis().setRow()
        .header('발주일').name('PODate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
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

        // grid click event
        // vThis.mainGrid.on('click', function (e) {
        //     // e.targetType = cell / rowHeader / columnHeader / etc (cell 다중 선택)
        //     if (GX._METHODS_.nvl(e.targetType) === 'cell') {
        //         console.log('click', e)
        //     }
        // });

        // grid dblclick event
        vThis.mainGrid.on('dblclick', function (e) {
            if (GX._METHODS_.nvl(e.targetType) === 'cell' && GX._METHODS_.nvl(e.columnName) !== 'DelvPlanDate') {
                console.log('dblclick', e)
            }
        });

        // grid afterSort event - 정렬(sorting) 시 다중 정렬 기능도 알림
        vThis.mainGrid.on('afterSort', (e) => {
            if (e.sortState.columns.length === 1) {
                toastr.info('다중 정렬은 "Ctrl" 키를 누른 상태로 다른 컬럼들 클릭하면 됩니다.')
            }
        });

        // grid rowHeader checkbox event : true
        vThis.mainGrid.on('check', (ev) => {
            vThis.selectedChkRow[ev.rowKey] = vThis.rows.Query[ev.rowKey];
        });
        
        // grid rowHeader checkbox event : false
        vThis.mainGrid.on('uncheck', (ev) => {
            delete vThis.selectedChkRow[ev.rowKey];
        });

        // grid rowHeader checkbox event : all check
        vThis.mainGrid.on('checkAll', (ev) => {
            vThis.rows.Query.map((v, i) => {
                vThis.selectedChkRow[i] = v;
            });
        });

        // grid rowHeader checkbox event : all uncheck
        vThis.mainGrid.on('uncheckAll', (ev) => {
            vThis.selectedChkRow = {};
        });

        // after editing grid data
        vThis.mainGrid.on('afterChange', function (e) {
            // 최초 값이랑 비교하는 로직은 없음. 현재 데이터와 현재 데이터 바로 직전 데이터 비교
            let i = 0;
            while (i < e.changes.length) {
                const changedOriginIdx = vThis.rows.ChangeIdx.findIndex(el => el == e.changes[i].rowKey);
                if (GX._METHODS_.nvl(e.changes[i].prevValue) != GX._METHODS_.nvl(e.changes[i].value)) {
                    vThis.rows.Query[e.changes[i].rowKey][e.changes[i].columnName] = GX._METHODS_.nvl(e.changes[i].value); // watch에서 감지 못함
                    if (changedOriginIdx == -1) vThis.rows.ChangeIdx.push(e.changes[i].rowKey);
                } else {
                    if (changedOriginIdx != -1) {
                        // 같은 값이 2개 들어가있다면 1개 삭제
                        let arrTemp = [];
                        let startIdx = vThis.rows.ChangeIdx.indexOf(e.changes[i].rowKey);
                        while (startIdx != -1) {
                            arrTemp.push(startIdx);
                            startIdx = vThis.rows.ChangeIdx.indexOf(e.changes[i].rowKey, startIdx + 1);
                        }
                        if (arrTemp.length > 1) vThis.rows.ChangeIdx.splice(changedOriginIdx, 1);
                    }
                }
                i++;

                if (i == e.changes.length) vThis.saveHistory();
            }
        });

        vThis.mainGrid.on('editingStart', function (e) {
            vThis.objGridDatepicker.boolEditingStart = true;
            vThis.objGridDatepicker.strEditingStart = e.value;
        })

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
                GX.SessionStorage.remove(vThis.locationPath + '-rows.Query');
                GX.SessionStorage.remove(vThis.locationPath + '-rows.ChangeIdx');
            } catch (e) {
                console.log('SessionStorage 삭제 중 에러 발생', e);
            }
        } else {
            vThis.loadHistory();
        }

    }
});

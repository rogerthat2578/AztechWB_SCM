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
            DelvDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            DelvDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            SMCurrStatus: 0,
            SMCurrStatusName: '전체',
            PONo: '',
            DelvNo: '',
            ItemName: '',
            ItemNo: '',
            Spec: '',
            Dept: 0,
            DeptName: '전체',
            Emp: 0,
            EmpName: '전체',
            OrderItemNo: '',
            BuyerNo: '',
            IsCompDelvIn: '2',
            IsCompDelvInName: '전체',
        },
        SMCurrStatusList: [],
        isCheckList: [],
        // 부서 리스트
        DeptNameList: [],
        // 부서 리스트
        KeepDeptNameList: [],
        // 담당자 리스트 (퇴사 제외)
        EmpNameList: [],
        // 담당자 리스트 (퇴사 제외)
        KeepEmpNameList: [],
        // (납품)완료구분 리스트
        IsCompDelvInNameList: [
            {key: 2, val: '전체'},
            {key: 0, val: '납품중'},
            {key: 1, val: '납품완료'}
        ],
        // (납품)완료구분 리스트
        KeepIsCompDelvInNameList: [
            {key: 2, val: '전체'},
            {key: 0, val: '납품중'},
            {key: 1, val: '납품완료'}
        ],
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        },
        // 모바일웹에서 더블클릭 처럼 동작하기위함
        objDblClick: {
            click: false,
            time: 0,
        },
	},
    // 변경 감시
    watch: {
        'rows.Query': 'saveHistory',
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
                    vThis.rangePickerDelvDate.setStartDate(new Date(parseInt(vThis.queryForm.DelvDateFr.substring(0, 4)), parseInt(vThis.queryForm.DelvDateFr.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvDateFr.substring(6))));
                    vThis.rangePickerDelvDate.setEndDate(new Date(parseInt(vThis.queryForm.DelvDateTo.substring(0, 4)), parseInt(vThis.queryForm.DelvDateTo.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvDateTo.substring(6))));

                    // 조회 조건 로드 후 조회 실행
                    vThis.search();
                }
            } catch (e) {
                toastr.warning('화면 이력을 가져오는 중 문제가 발생하여 정상적으로 가져오지 못하였습니다.');
            }
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

                if((document.getElementsByClassName('drop-box')[0].style.display === 'block' || document.getElementsByClassName('drop-box')[1].style.display === 'block' || document.getElementsByClassName('drop-box')[2].style.display === 'block' || document.getElementsByClassName('drop-box')[3].style.display === 'block') && e.target.getAttribute('class') !== 'drop-box-input'){
                    document.getElementsByClassName('drop-box')[0].style.display = 'none';
                    document.getElementsByClassName('drop-box')[1].style.display = 'none';
                    document.getElementsByClassName('drop-box')[2].style.display = 'none';
                    document.getElementsByClassName('drop-box')[3].style.display = 'none';
                    // 부서 Select Box 초기화
                    if ((vThis.DeptNameList.length == 1 && (vThis.DeptNameList[0].val == '전체' || vThis.DeptNameList[0].val == '')) || vThis.queryForm.DeptName.replace(/\ /g, '') == '') {
                        vThis.DeptNameList = vThis.KeepDeptNameList;
                        vThis.queryForm.Dept = vThis.KeepDeptNameList[0].key;
                        vThis.queryForm.DeptName = vThis.KeepDeptNameList[0].val;
                    }
                    // 담당자 Select Box 초기화
                    if ((vThis.EmpNameList.length == 1 && (vThis.EmpNameList[0].val == '전체' || vThis.EmpNameList[0].val == '')) || vThis.queryForm.EmpName.replace(/\ /g, '') == '') {
                        vThis.EmpNameList = vThis.KeepEmpNameList;
                        vThis.queryForm.Emp = vThis.KeepEmpNameList[0].key;
                        vThis.queryForm.EmpName = vThis.KeepEmpNameList[0].val;
                    }
                    // (납품)완료구분 리스트 Select Box 초기화
                    if ((vThis.IsCompDelvInNameList.length == 1 && (vThis.IsCompDelvInNameList[0].val == '전체' || vThis.IsCompDelvInNameList[0].val == '')) || vThis.queryForm.IsCompDelvInName.replace(/\ /g, '') == '') {
                        vThis.IsCompDelvInNameList = vThis.KeepIsCompDelvInNameList;
                        vThis.queryForm.IsCompDelvIn = vThis.KeepIsCompDelvInNameList[0].key;
                        vThis.queryForm.IsCompDelvInName = vThis.KeepIsCompDelvInNameList[0].val;
                    }
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
        // 발주부서 input에 입력 시 리스트 변경
        likeSelect2: function(str = "Dept") {
            let e = event;
            let vThis = this;

            let strKeepConcat = 'Keep' + str + 'NameList';
            let strConcat = str + 'NameList';

            let likeIndex = [];
            if (GX._METHODS_.nvl(e.target.value).length > 0) {
                vThis[strKeepConcat].forEach((v, i) => {
                    if (v.val.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) likeIndex.push(i);
                });
            }

            if (likeIndex.length > 0) {
                let arrTemp = [];
                likeIndex.forEach(v => {
                    arrTemp.push(vThis[strKeepConcat][v]);
                });
                vThis[strConcat] = arrTemp;
            } else {
                vThis[strConcat] = vThis[strKeepConcat];
            }
        },
        init: function () {
            let vThis = this;
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
            vThis.queryForm.DelvDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.DelvDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.SMCurrStatus = 0;
            vThis.queryForm.SMCurrStatusName = '전체';
            vThis.queryForm.PONo = '';
            vThis.queryForm.ItemName = '';
            vThis.queryForm.ItemNo = '';
            vThis.queryForm.Spec = '';
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

                if (k === 'Emp' || k === 'Dept') {
                    params[k + 'Seq'] = params[k];
                }
            });

            vThis.rows.Query = [];

            GX._METHODS_
            .setMethodId('DelvItemListQuery')
            .ajax([params], [function (data) {
                if(data.length > 0){
                    let i = 0;
                    while (i < data.length) {
                        // 납품예정일에 데이터가 없을 경우 납기일 기본 세팅
                        if (GX._METHODS_.nvl(data[i].WorkPlanDate).length !== 8) {
                            data[i].WorkPlanDate = GX._METHODS_.nvl(data[i].WorkDate) != '' ? data[i].WorkDate : '';
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

        /**엑셀 다운로드 xlxs */
        excelDownload: function () {
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
        toastr.options.progressBar = true;
        
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
            * 부서: DeptNameList
            * 담당자: EmpNameList
            */
            const objSelBoxQueryForm = {'SMCurrStatusList': 'PUDelv', 'DeptNameList': 'PODept', 'EmpNameList': 'POEmp'};
            Object.keys(objSelBoxQueryForm).map(k => {
                GX._METHODS_
                .setMethodId('SCMCodeHelp')
                .ajax([{ QryType: objSelBoxQueryForm[k] }], [function (data){
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            vThis[k].push({ key: data[i][Object.keys(data[i])[0]], val: data[i][Object.keys(data[i])[1]] })
                        }
                    }
                    // Select Box 검색 기능 로직에서 원본 데이터를 따로 담아둘 배열이 하나 더 존재함.
                    if (typeof vThis['Keep' + k] === 'object') vThis['Keep' + k] = vThis[k];
                }]);
            });

            
        }
    },
    mounted() {
        const vThis = this;

        // init from to Datepicker
        const today = new Date();
        vThis.rangePickerDelvDate = new tui.DatePicker.createRangePicker({
            startpicker: {
                date: today,
                input: '#DelvDateFr-startpicker-input',
                container: '#DelvDateFr-startpicker-container'
            },
            endpicker: {
                date: today,
                input: '#DelvDateTo-endpicker-input',
                container: '#DelvDateTo-endpicker-container'
            },
            format: 'yyyy-MM-dd',
            language: 'ko',
            timePicker: false
        });

        // put default data into "this.queryForm.~"
        vThis.queryForm.DelvDateFr = vThis.rangePickerDelvDate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        vThis.queryForm.DelvDateTo = vThis.rangePickerDelvDate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');

        // regist range datepicker change event
        vThis.rangePickerDelvDate.on('change:start', () => {
            if (vThis.rangePickerDelvDate.getStartDate())
                vThis.queryForm.DelvDateFr = vThis.rangePickerDelvDate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });
        vThis.rangePickerDelvDate.on('change:end', () => {
            if (vThis.rangePickerDelvDate.getEndDate())
                vThis.queryForm.DelvDateTo = vThis.rangePickerDelvDate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });

        ToastUIGrid.setColumns
        .init()
        .setRowHeaders('rowNum')
        .header('납품구분').name('IsCompDelvIn').align('center').width(65).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsCompDelvIn'}).sortable().setRow()
        .header('입고진행상태').name('SMDelvInTypeName').align('center').width(110).whiteSpace().ellipsis().sortable(true).setRow()
        .header('납품일').name('DelvDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('발주일').name('PODate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('발주부서').name('PODeptName').align('center').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('발주담당').name('POEmpName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('발주번호').name('PONo').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('검사구분').name('SMQcTypeName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('입고일').name('DelvInDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('품번').name('ItemNo').align('left').width(140).whiteSpace().ellipsis().sortable(true).setRow()
        .header('품명').name('ItemName').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('규격').name('Spec').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('단위').name('UnitName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('금회납품수량').name('Qty').align('right').width(110).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('부가세여부').name('IsVAT').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsVAT'}).sortable().setRow()
        .header('금액').name('CurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('부가세').name('CurVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('금액계').name('TotCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('통화').name('CurrName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('환율').name('ExRate').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').sortable(true).setRow()
        // .header('원화단가').name('OSPDomPrice').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        // .header('원화금액').name('OSPDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        // .header('원화부가세').name('OSPDomVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        // .header('원화금액계').name('OSPTotDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('원화단가').name('DomPrice').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('원화금액').name('DomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('원화부가세').name('DomVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('원화금액계').name('TotDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('창고').name('WHName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('비고').name('Remark').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('사이즈').name('SizeName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('용도').name('Purpose').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('색상').name('ColorNo').align('left').width(140).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('Order품명').name('OrderItemName').align('left').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('사용부위').name('UseSelect').align('left').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('방적형태').name('BangJukTypeName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('조달형태').name('ProcureName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('담농색구분').name('ColorGbn').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
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
        vThis.mainGrid.on('click', function(e) {
            // 행 더블 클릭 시 점프 - 모바일 웹에선 그리드 더블클릭 이벤트가 동작하지 않음
            const clickInterval = 600; // ms
            if (vThis.objDblClick.click) {
                if (new Date().getTime() - vThis.objDblClick.time <= clickInterval) {
                    if (e.rowKey || e.rowKey === 0) {
                        vThis.objDblClick.click = false;
                        vThis.objDblClick.time = 0;

                        const IsCompDelvInValue = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'IsCompDelvIn'));

                        if (IsCompDelvInValue == 1) {
                            toastr.warning('납품완료 상태는 수정, 삭제할 수 없습니다.');
                            return false;
                        }

                        if (confirm('입력 화면으로 이동하시겠습니까?')) {
                            let arr = [];
                            arr.push(vThis.rows.Query[e.rowKey])
                            if (arr.length > 0) {
                                GX.SessionStorage.set('jumpData', JSON.stringify(arr));
                                GX.SessionStorage.set('jumpSetMethodId', 'DelvItemListJump');
                                location.href = 'purchase_delivery.html';
                            } else 
                                toastr.error('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
                        }
                    }
                }
            }
            if (e.rowKey || e.rowKey === 0) {
                vThis.objDblClick.click = true;
                vThis.objDblClick.time = new Date().getTime();
                
                setTimeout(() => {
                    vThis.objDblClick.click = false;
                    vThis.objDblClick.time = 0;
                }, clickInterval)
            }
        });

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
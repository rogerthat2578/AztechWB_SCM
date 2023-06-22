let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: '',
        userName: '',
        params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트
        locationPath: location.pathname.replace(/\//g, '').replace('.html', ''),
        rows: {
            Query: [],
        },
        queryForm:{
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            WorkDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            GoodItemName: '',
            GoodItemNo: '',
            BuyerNo: '',
            Process: 0,
            ProcessName: '전체',
            Dept: 0,
            DeptName: '전체',
        },
        // 공정 리스트
        ProcessNameList: [],
        // 공정 리스트
        KeepProcessNameList: [],
        // 부서 리스트
        DeptNameList: [],
        // 부서 리스트
        KeepDeptNameList: [],
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

    methods:{
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
                    vThis.rangePickerWorkDate.setStartDate(new Date(parseInt(vThis.queryForm.WorkDateFr.substring(0, 4)), parseInt(vThis.queryForm.WorkDateFr.substring(4, 6)) - 1, parseInt(vThis.queryForm.WorkDateFr.substring(6))));
                    vThis.rangePickerWorkDate.setEndDate(new Date(parseInt(vThis.queryForm.WorkDateTo.substring(0, 4)), parseInt(vThis.queryForm.WorkDateTo.substring(4, 6)) - 1, parseInt(vThis.queryForm.WorkDateTo.substring(6))));

                    // 조회 조건 로드 후 조회 실행
                    vThis.search();
                }
            } catch (e) {
                toastr.warning('화면 이력을 가져오는 중 문제가 발생하여 정상적으로 가져오지 못하였습니다.');
            }
        },
        // 이벤트
        eventCheck: function(){
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
                    // 공정 Select Box 초기화
                    if ((vThis.ProcessNameList.length == 1 && (vThis.ProcessNameList[0].val == '전체' || vThis.ProcessNameList[0].val == '')) || vThis.queryForm.ProcessName.replace(/\ /g, '') == '') {
                        vThis.ProcessNameList = vThis.KeepProcessNameList;
                        vThis.queryForm.Process = vThis.KeepProcessNameList[0].key;
                        vThis.queryForm.ProcessName = vThis.KeepProcessNameList[0].val;
                    }
                    // 부서 Select Box 초기화
                    if ((vThis.DeptNameList.length == 1 && (vThis.DeptNameList[0].val == '전체' || vThis.DeptNameList[0].val == '')) || vThis.queryForm.DeptName.replace(/\ /g, '') == '') {
                        vThis.DeptNameList = vThis.KeepDeptNameList;
                        vThis.queryForm.Dept = vThis.KeepDeptNameList[0].key;
                        vThis.queryForm.DeptName = vThis.KeepDeptNameList[0].val;
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

        // Select box
        openCloseDropBox: function(inputEleName = '', useYN = '') {
            if (useYN === 'N') return false;

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

        // Select Box input에 입력 시 리스트 변경
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

        // 초기화
        init: function(){
            let vThis = this;
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
            vThis.queryForm.WorkDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.WorkDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.WorkOrderNo = '';
            vThis.queryForm.GoodItemName = '';
            vThis.queryForm.GoodItemNo = '';
            vThis.queryForm.GoodItemSpec = '';
            vThis.queryForm.CustSeq = '';
        },

        /** 조회 **/
        search: function(callback){
            let vThis = this;

            // 포커스 제거
            document.activeElement.blur();

            let params = GX.deepCopy(vThis.queryForm);
            Object.keys(params).map((k) => {
                if(k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1){
                    if(params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
                else if (k == 'Process') params.ProcSeq = params[k];
                else if (k == 'Dept') params.DeptSeq = params[k];
            });

            vThis.rows.Query = [];
            
            GX._METHODS_
            .setMethodId('PDWorkReportQuery')    // 여기에 호출ID를 입력해주세요.
            .ajax([params], [function (data){
                if(data.length > 0){
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
            }]);
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

    created(){
        toastr.options.progressBar = true;
        
        let vThis = this;

        if(!GX._METHODS_.isLogin()) location.replace('login.html');
        else{
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
            * 공정: ProcessNameList
            * 부서: DeptNameList
            */
            const objSelBoxQueryForm = {'ProcessNameList': 'PDProc', 'DeptNameList': 'PODept'};
            Object.keys(objSelBoxQueryForm).map(k => {
                GX._METHODS_
                .setMethodId('SCMCodeHelp')
                .ajax([{ QryType: objSelBoxQueryForm[k] }], [function (data){
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            vThis[k].push({ key: data[i][Object.keys(data[i])[0]], val: data[i][Object.keys(data[i])[1]] })
                        }
                    }

                    // 공정 기본 값 = 52:입고(의류)로 세팅
                    // 20230612 req 박태근 이사님 - 공정 기본값 입고(의류), 생지정포, 전체만 나오게 수정. 기본 세팅 = 전체
                    if (k === 'ProcessNameList') {
                        const tempList = vThis.ProcessNameList;
                        vThis.ProcessNameList = [];
                        for (let i = 0; i < tempList.length; i++) {
                            if ((tempList[i].val.indexOf('입고') > -1 && tempList[i].val.indexOf('의류') > -1)
                            || (tempList[i].val.indexOf('생지') > -1 && tempList[i].val.indexOf('정포') > -1)
                            || (tempList[i].val.indexOf('전체') > -1)) {
                                vThis.ProcessNameList.push(tempList[i]);
                            }
                            // 공정은 3개만 나오게함. 전체, 입고(의류), 생지정포
                            if (vThis.ProcessNameList.length === 3) break;
                        }
                        /*
                        for (let i = 0; i < vThis.ProcessNameList.length; i++) {
                            if (vThis.ProcessNameList[i].val.indexOf('입고') > -1 && vThis.ProcessNameList[i].val.indexOf('의류') > -1) {
                                vThis.queryForm.Process = vThis.ProcessNameList[i].key;
                                vThis.queryForm.ProcessName = vThis.ProcessNameList[i].val;
                                break;
                            }
                        }
                        */
                    }

                    // Select box의 경우 검색 기능 로직에서 원본 데이터를 따로 담아둘 배열이 하나 더 존재함.
                    if (k == 'ProcessNameList') {
                        // 공정은 3개만 나오게함. 전체, 입고(의류), 생지정포
                        vThis['Keep' + k] = vThis.ProcessNameList;
                    } else {
                        if (typeof vThis['Keep' + k] === 'object') vThis['Keep' + k] = vThis[k];
                    }
                }]);
            });
        }
    },

    mounted(){
        const vThis = this;

        // init from to Datepicker
        const today = new Date();
        vThis.rangePickerWorkDate = new tui.DatePicker.createRangePicker({
            startpicker: {
                date: today,
                input: '#WorkDateFr-startpicker-input',
                container: '#WorkDateFr-startpicker-container'
            },
            endpicker: {
                date: today,
                input: '#WorkDateTo-endpicker-input',
                container: '#WorkDateTo-endpicker-container'
            },
            format: 'yyyy-MM-dd',
            language: 'ko',
            timePicker: false
        });

        // put default data into "this.queryForm.~"
        vThis.queryForm.WorkDateFr = vThis.rangePickerWorkDate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        vThis.queryForm.WorkDateTo = vThis.rangePickerWorkDate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');

        // regist range datepicker change event
        vThis.rangePickerWorkDate.on('change:start', () => {
            if (vThis.rangePickerWorkDate.getStartDate())
                vThis.queryForm.WorkDateFr = vThis.rangePickerWorkDate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });
        vThis.rangePickerWorkDate.on('change:end', () => {
            if (vThis.rangePickerWorkDate.getEndDate())
                vThis.queryForm.WorkDateTo = vThis.rangePickerWorkDate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });

        ToastUIGrid.setColumns
        .init()
        .setRowHeaders('rowNum')
        .header('작업일').name('WorkDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('품번').name('GoodItemNo').align('left').width(140).whiteSpace().ellipsis().sortable(true).setRow()
        .header('품명').name('GoodItemName').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('Buyer No').name('BuyerNo').align('left').width(150).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('규격').name('GoodItemSpec').align('left').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('공정').name('ProcName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('단위').name('ProdUnitName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('발주수량').name('OrderQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('생산수량').name('ProdQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        // .header('불량수량').name('BadQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        // .header('양품수량').name('OKQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('단가').name('Price').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('부가세포함').name('IsVAT').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsVAT'}).sortable().setRow()
        .header('금액').name('OSPCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('부가세').name('OSPCurVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('금액계').name('OSPTotCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('통화').name('CurrName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('환율').name('ExRate').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').sortable(true).setRow()
        .header('원화단가').name('OSPDomPrice').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('원화금액').name('OSPDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('원화부가세').name('OSPDomVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('원화금액계').name('OSPTotDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
        .header('Size').name('SizeText').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('공정품번호').name('AssyItemNo').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('공정품명').name('AssyItemName').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('공정품규격').name('AssyItemSpec').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('최종공정').name('IsLastProc').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsLastProc'}).sortable().setRow()
        .header('자재투입').name('IsMatInput').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsMatInput'}).sortable().setRow()
        .header('입고').name('IsGoodIn').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsGoodIn'}).sortable().setRow()
        // .header('중량').name('Weight').align('right').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('Lot No.').name('RealLotNo').align('left').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('폭').name('Width').align('right').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('밀도').name('Density').align('right').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('사고지').name('IsAccident').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsAccident'}).sortable().setRow()
        .header('작업지시번호').name('WorkOrderNo').align('center').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('공정').name('ProcName').align('left').width(80).whiteSpace().ellipsis().sortable(true).setRow()
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

        // grid dblclick event
        // vThis.mainGrid.on('dblclick', function(e) {
        //     // 행 더블 클릭 시 점프
        //     if (e.rowKey || e.rowKey === 0) {
        //         if (confirm('입력 화면으로 이동하시겠습니까?')) {
        //             let arr = [];
        //             arr.push(vThis.rows.Query[e.rowKey])
        //             if (arr.length > 0) {
        //                 GX.SessionStorage.set('jumpData', JSON.stringify(arr));
        //                 GX.SessionStorage.set('jumpSetMethodId', 'PDWorkReportJumpQuery');
        //                 location.href = 'outsourcing_purchase_delivery.html';
        //             } else 
        //                 toastr.error('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
        //         }
        //     }
        // });

        vThis.mainGrid.on('click', function(e) {
            // 행 더블 클릭 시 점프 - 모바일 웹에선 그리드 더블클릭 이벤트가 동작하지 않음
            const clickInterval = 600; // ms
            if (vThis.objDblClick.click) {
                if (new Date().getTime() - vThis.objDblClick.time <= clickInterval) {
                    if (e.rowKey || e.rowKey === 0) {
                        vThis.objDblClick.click = false;
                        vThis.objDblClick.time = 0;
                        if (confirm('입력 화면으로 이동하시겠습니까?')) {
                            let arr = [];
                            arr.push(vThis.rows.Query[e.rowKey])
                            if (arr.length > 0) {
                                GX.SessionStorage.set('jumpData', JSON.stringify(arr));
                                GX.SessionStorage.set('jumpSetMethodId', 'PDWorkReportJumpQuery');
                                location.href = 'outsourcing_purchase_delivery.html';
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
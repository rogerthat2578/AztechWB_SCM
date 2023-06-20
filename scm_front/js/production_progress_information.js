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
            // WorkDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            // WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            ItemName: '',
            ItemNo: '',
            Spec: '',
            CustSeq: '',
            BuyerNo: '',
            Dept: 0,
            DeptName: '전체',
        },
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
                    vThis.rangePickerWorkOrderDate.setStartDate(new Date(parseInt(vThis.queryForm.WorkOrderDateFr.substring(0, 4)), parseInt(vThis.queryForm.WorkOrderDateFr.substring(4, 6)) - 1, parseInt(vThis.queryForm.WorkOrderDateFr.substring(6))));
                    vThis.rangePickerWorkOrderDate.setEndDate(new Date(parseInt(vThis.queryForm.WorkOrderDateTo.substring(0, 4)), parseInt(vThis.queryForm.WorkOrderDateTo.substring(4, 6)) - 1, parseInt(vThis.queryForm.WorkOrderDateTo.substring(6))));

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

        // 이벤트
        eventCheck: function(){
            let vThis = this;
            let e = event;

            // Click Event
            if(e.type === 'click'){
                if (document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu') {
                    document.getElementsByClassName('left-menu')[0].style.display = 'none';
                }

                if (document.getElementsByClassName('drop-box')[0].style.display === 'block' && e.target.getAttribute('class') !== 'drop-box-input') {
                    document.getElementsByClassName('drop-box')[0].style.display = 'none';
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
            // vThis.queryForm.WorkDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            // vThis.queryForm.WorkDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.WorkOrderDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅;
            vThis.queryForm.WorkOrderDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅;
            vThis.queryForm.ItemName = '';
            vThis.queryForm.ItemNo = '';
            vThis.queryForm.Spec = '';
            vThis.queryForm.CustSeq = '';
        },

        /**그리드 일자 비교
         * 재단최초투입일 <= 봉제최초투입일 <= 완성투입일
         */
        compareDate: function (idx = null, stdName = '') {
            let vThis = this;
            if (idx !== 0) {
                if (GX._METHODS_.nvl(idx).length == 0) {
                    toastr.warning('일자를 비교할 행의 인덱스가 이상합니다.');
                    return false;
                }
            }
            
            const queryIdx = vThis.mainGrid.getRow(idx);
            const cut = GX._METHODS_.nvl(queryIdx.CutInPutDate);
            const sew = GX._METHODS_.nvl(queryIdx.SewInPutDate);
            const fin = GX._METHODS_.nvl(queryIdx.FinishInPutDate);

            const cutDate = new Date(parseInt(cut.substring(0, 4)), parseInt(cut.substring(4, 6)) - 1, parseInt(cut.substring(6)));
            const sewDate = new Date(parseInt(sew.substring(0, 4)), parseInt(sew.substring(4, 6)) - 1, parseInt(sew.substring(6)));
            const finDate = new Date(parseInt(fin.substring(0, 4)), parseInt(fin.substring(4, 6)) - 1, parseInt(fin.substring(6)));

            if (stdName == 'CutInPutDate' || stdName == 'SewInPutDate' || stdName == 'FinishInPutDate') {
                let chk = false;
                if (!isNaN(cutDate) && !isNaN(sewDate) && cutDate > sewDate) {
                    // alert('"재단최초투입일" ≦ "봉제최초투입일"');
                    toastr.warning('"재단최초투입일" <= "봉제최초투입일"');
                    chk = true;
                } else if (!isNaN(cutDate) && !isNaN(finDate) && cutDate > finDate) {
                    // alert('"재단최초투입일" ≦ "완성투입일"');
                    toastr.warning('"재단최초투입일" <= "완성투입일"');
                    chk = true;
                } else if (!isNaN(sewDate) && !isNaN(finDate) && sewDate > finDate) {
                    // alert('"봉제최초투입일" ≦ "완성투입일"');
                    toastr.warning('"봉제최초투입일" <= "완성투입일"');
                    chk = true;
                }
                if (chk) vThis.mainGrid.setValue(idx, stdName, '');
            }
        },

        /**그리드 수량 비교
         * 재단량 >= 봉제량 >= 완성량
         */
        compareQty: function (idx = null, stdName = '') {
            let vThis = this;
            if (idx !== 0) {
                if (GX._METHODS_.nvl(idx).length == 0) {
                    toastr.warning('수량을 비교할 행의 인덱스가 이상합니다.');
                    return false;
                }
            }

            const queryIdx = vThis.mainGrid.getRow(idx);
            const cutQty = parseFloat(GX._METHODS_.nvl(queryIdx.CutQty).toString());
            const sewQty = parseFloat(GX._METHODS_.nvl(queryIdx.SewQty).toString());
            const finQty = parseFloat(GX._METHODS_.nvl(queryIdx.FinishQty).toString());
            if (idx != null && (stdName == 'CutQty' || stdName == 'SewQty' || stdName == 'FinishQty')) {
                let chk = false;
                if (!isNaN(cutQty) && !isNaN(sewQty) && cutQty < sewQty) {
                    // alert('"재단량" ≧ "봉제량"');
                    toastr.warning('"재단량" >= "봉제량"');
                    chk = true;
                } else if (!isNaN(cutQty) && !isNaN(finQty) && cutQty < finQty) {
                    // alert('"재단량" ≧ "완성량"');
                    toastr.warning('"재단량" >= "완성량"');
                    chk = true;
                } else if (!isNaN(sewQty) && !isNaN(finQty) && sewQty < finQty) {
                    // alert('"봉제량" ≧ "완성량"');
                    toastr.warning('"봉제량" >= "완성량"');
                    chk = true;
                }
                if (chk) vThis.mainGrid.setValue(idx, stdName, 0);
            }
        },

        /** 조회 **/
        search: function() {
            let vThis = this;

            let params = GX.deepCopy(vThis.queryForm);
            Object.keys(params).map((k) => {
                if(k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1){
                    if(params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
                else if (k == 'Dept') params.DeptSeq = params[k];
            });
            
            vThis.rows.Query = [];

            GX._METHODS_
                .setMethodId('ProdProgressInfoQuery')    // 여기에 호출ID를 입력해주세요.
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
                }])
        },

        /** 저장 **/
        save: function(){
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
                    .setMethodId('ProdProGressInfoSave')
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

    created(){
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
            * 부서: DeptNameList
            */
            const objSelBoxQueryForm = {'DeptNameList': 'PODept'};
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

    mounted(){
        const vThis = this;

        // init from to Datepicker
        const today = new Date();
        vThis.rangePickerWorkOrderDate = new tui.DatePicker.createRangePicker({
            startpicker: {
                date: today,
                input: '#WorkOrderDateFr-startpicker-input',
                container: '#WorkOrderDateFr-startpicker-container'
            },
            endpicker: {
                date: today,
                input: '#WorkOrderDateTo-endpicker-input',
                container: '#WorkOrderDateTo-endpicker-container'
            },
            format: 'yyyy-MM-dd',
            language: 'ko',
            timePicker: false
        });

        // put default data into "this.queryForm.~"
        vThis.queryForm.WorkOrderDateFr = vThis.rangePickerWorkOrderDate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        vThis.queryForm.WorkOrderDateTo = vThis.rangePickerWorkOrderDate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');

        // regist range datepicker change event
        vThis.rangePickerWorkOrderDate.on('change:start', () => {
            if (vThis.rangePickerWorkOrderDate.getStartDate())
                vThis.queryForm.WorkOrderDateFr = vThis.rangePickerWorkOrderDate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });
        vThis.rangePickerWorkOrderDate.on('change:end', () => {
            if (vThis.rangePickerWorkOrderDate.getEndDate())
                vThis.queryForm.WorkOrderDateTo = vThis.rangePickerWorkOrderDate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });

        // init grid columns, set grid columns
        ToastUIGrid.setColumns
        .init()
        .setRowHeaders('rowNum')
        .header('작업지시일').name('WorkOrderDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('납기일').name('WorkDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('납품예정일').name('WorkPlanDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
        .header('의뢰부서').name('DeptName').align('center').width(150).whiteSpace().ellipsis().sortable(true).setRow()
        .header('품번').name('ItemNo').align('left').width(140).whiteSpace().ellipsis().sortable(true).setRow()
        .header('품명').name('ItemName').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        .header('BuyerNo.').name('BuyerNo').align('left').width(130).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('규격').name('Spec').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('지시수량').name('OrderQty').align('right').width(90).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('재단최초투입일').name('CutInPutDate').align('center').width(120).whiteSpace().ellipsis().editor('date').formatter('addHyphen8length').sortable(true).setRow()
        .header('재단량').name('CutQty').align('right').width(90).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('봉제최초투입일').name('SewInPutDate').align('center').width(120).whiteSpace().ellipsis().editor('date').formatter('addHyphen8length').sortable(true).setRow()
        .header('봉제량').name('SewQty').align('right').width(90).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('완성투입일').name('FinishInPutDate').align('center').width(120).whiteSpace().ellipsis().editor('date').formatter('addHyphen8length').sortable(true).setRow()
        .header('완성량').name('FinishQty').align('right').width(90).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('작업지시번호').name('WorkOrderNo').align('center').width(120).whiteSpace().ellipsis().sortable(true).setRow()
        ;

        // create grid
        vThis.mainGrid = ToastUIGrid.initGrid('grid');

        // grid data init
        vThis.rows.Query = [];
        vThis.mainGrid.resetData(vThis.rows.Query);

        // grid afterSort event - 정렬(sorting) 시 다중 정렬 기능도 알림
        vThis.mainGrid.on('afterSort', (e) => {
            if (e.sortState.columns.length === 1) {
                const platform = (navigator.userAgentData?.platform || navigator.platform)?.toLowerCase();
                let rtn = '';
                if(platform.startsWith("win")) rtn = "windows";
                else if(platform.startsWith("mac")) rtn = "macos";
                else rtn = "unknown";

                if (rtn == 'macos')
                    toastr.info('다중 정렬은 "Command" 키를 누른 상태로 다른 컬럼들 클릭하면 됩니다.');
                else
                    toastr.info('다중 정렬은 "Ctrl" 키를 누른 상태로 다른 컬럼들 클릭하면 됩니다.');
            }
        });

        // grid editing mode start
        vThis.mainGrid.on('editingStart', function (e) {
            if (GX._METHODS_.nvl(e.columnName) === 'CutInPutDate' || GX._METHODS_.nvl(e.columnName) === 'SewInPutDate' || GX._METHODS_.nvl(e.columnName) === 'FinishInPutDate') {
                // 그리드 날짜 셀 수정 시
                vThis.objGridDatepicker.boolEditingStart = true;
                vThis.objGridDatepicker.strEditingStart = e.value;
            }
        })

        // grid editing mode finish
        vThis.mainGrid.on('editingFinish', function (e) {
            if (GX._METHODS_.nvl(e.columnName) === 'CutInPutDate' || GX._METHODS_.nvl(e.columnName) === 'SewInPutDate' || GX._METHODS_.nvl(e.columnName) === 'FinishInPutDate') {
                // 그리드 날짜 셀 수정 시
                vThis.objGridDatepicker.boolEditingStart = false;
                vThis.objGridDatepicker.strEditingStart = '';

                vThis.compareDate(e.rowKey, e.columnName);
            } else if (GX._METHODS_.nvl(e.columnName) === 'CutQty' || GX._METHODS_.nvl(e.columnName) === 'SewQty' || GX._METHODS_.nvl(e.columnName) === 'FinishQty') {
                vThis.compareQty(e.rowKey, e.columnName);
            }

            /**
             * 이 로직이 수행되는 시점이 dom에 데이터가 반영되기 이전이라 원하는 방향으로 구현되지 않음. - 보류
            // 수정한 행의 edit 가능한 셀들이 모두 데이터가 없다면 (0 || '' || null || undefined 같은) update된 행이 아니라고 처리
            const targetRowEditCell = document.querySelectorAll('.tui-grid-cell-editable[data-row-key="' + e.rowKey.toString() + '"]');
            let cnt = 0;
            for (let i = 0; i < targetRowEditCell.length; i++) {
                const txt = GX._METHODS_.nvl(targetRowEditCell[i].innerText).replace(/\ /g, '');
                if (txt.length == 0 || txt == '0') {
                    cnt++;
                }
            }
            if (cnt === targetRowEditCell.length) {
                console.log('123123')
            }
             */
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
})
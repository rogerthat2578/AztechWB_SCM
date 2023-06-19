let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: '',
        userName: '',
        params: GX.getParameters(),
        BizUnitList: [],

        rows:{
            Query: [],
        },
        // 조회 조건
        queryForm:{
            CompanySeq: '',
            BizUnit: '',
            BizUnitName: '',
            DelvDate: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            CustSeq: '',
        },
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        },
        jumpDataList: [],
        jumpSetMethodId: '',
        summaryArea: {
            SumOSPCurAmt: 0,
            SumOSPCurVAT: 0,
            SumOSPTotCurAmt: 0,
        },
        // grid 내 데이터 edit 모드일 때 기존 데이터 유지
        strBeforeEditData: '',
    },
    methods:{
        eventCheck: function(){
            let vThis = this;
            let e = event;

            if(e.type === 'click' && document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu'){
                document.getElementsByClassName('left-menu')[0].style.display = 'none';
            }
            
            if (e.type === 'click' && e.target.getAttribute('class') !== 'tui-grid-content-text') {
                // 현재 editing인 영역을 제외한 다른 영역 클릭 시 edit mode 종료
                vThis.mainGrid.finishEditing(); // 수정한 데이터 적용된 상태로 종료. 반대는 cancelEditing()
            }

            if (e.type === 'click' && e.target.getAttribute('id') === 'colHeaderIsEnd') {
                // 완료여부 컬럼 헤더의 체크 박스 클릭 시
                // 현재 컬럼 헤더의 체크 박스 체크 상태 true/false
                const boolCurChecked = e.target.checked;
                // 전체 체크/체크해제
                for (let i = 0; i < vThis.mainGrid.getData().length; i++) {
                    document.querySelectorAll('[name="AttrNameIsEnd"]')[i].checked = boolCurChecked;
                    vThis.mainGrid.setValue(i, 'IsEnd', boolCurChecked ? '1' : '0');
                }
            } else if (e.type === 'click' && e.target.getAttribute('name') === 'AttrNameIsEnd') {
                // 완료여부 컬럼 그리드 내부(셀)의 체크 박스 클릭 시
                // 그리드 내 체크 박스 체크 상태 true/false
                const boolCurChecked = e.target.checked;
                vThis.mainGrid.setValue([...e.target.parentElement.children].indexOf(e.target), 'IsEnd', boolCurChecked ? '1' : '0');
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
                    vThis.search(vThis.calSum);
                }
            }
        },
        init: function(){
            let vThis = this;
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.DelvDate = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.BizUnit = '1';
        },
        /**마스터 영역 금액 계산 */
        calSum: function () {
            let vThis = this;

            Object.keys(vThis.summaryArea).map(k => {
                vThis.summaryArea[k] = 0;
            });
            
            if (vThis.rows.Query.length > 0) {
                let calList = GX.deepCopy(vThis.rows.Query);
                for (let i in calList) {
                    if (calList.hasOwnProperty(i)) {
                        Object.keys(vThis.summaryArea).map(k => {
                            if (!isNaN(GX._METHODS_.nvl(calList[i][k.replace('Sum', '')]).toString().replace(/\,/, '')) && GX._METHODS_.nvl(calList[i][k.replace('Sum', '')]).toString().replace(/\,/, '') != '')
                                vThis.summaryArea[k] += parseFloat(GX._METHODS_.nvl(calList[i][k.replace('Sum', '')]).toString().replace(/\,/, ''));
                        });
                    }
                }
            }

            Object.keys(vThis.summaryArea).map(k => {
                vThis.summaryArea[k] = GX._METHODS_.nvl(vThis.summaryArea[k]).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
            });
        },

        /** 조회 **/
        search: function(callback){
            let vThis = this;
            
            let params = GX.deepCopy(vThis.queryForm);
            let paramsList = [];

            for(let i in vThis.jumpDataList){
                if(vThis.jumpDataList.hasOwnProperty(i))
                    paramsList.push(Object.assign(GX.deepCopy(params), vThis.jumpDataList[i]));
            }

            vThis.rows.Query = [];

            GX._METHODS_
                .setMethodId(vThis.jumpSetMethodId)
                .ajax(paramsList, [function (data) {
                    if (data[0]?.Status && data[0]?.Status != 0) {
                        alert(data[0].Result);
                        history.back(-1);
                    } else if(data.length > 0) {
                        vThis.rows.Query = data;
    
                        // 마스터 영역 데이터 바인딩
                        const masterData = vThis.rows.Query[0];
                        Object.keys(vThis.queryForm).map(k => {
                            if (k != 'CompanySeq' || k != 'BizUnit' || k != 'BizUnitName' || k != 'CustSeq') {
                                Object.keys(masterData).map(j => {
                                    let t = GX._METHODS_.nvl(masterData[j]);
    
                                    // 숫자는 문자로 변경해줘야 input에 정상적으로 표기됨
                                    if (!isNaN(t)) t = t.toString();
    
                                    if (k == j && t.length > 0) {
                                        if (k === 'DelvDate' && GX._METHODS_.nvl(masterData[j]).length === 8 && vThis.jumpSetMethodId != 'PDWorkReportJumpQuery')
                                            vThis.calendarDelvDate.setDate(new Date(parseInt(vThis.queryForm.DelvDate.substring(0, 4)), parseInt(vThis.queryForm.DelvDate.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvDate.substring(6))));
                                        else
                                            vThis.queryForm[k] = GX._METHODS_.nvl(masterData[j]);
                                    } else if (k === 'DelvDate' && j === 'WorkDate' && GX._METHODS_.nvl(masterData[j]).length === 8 && vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                                        vThis.queryForm[k] = GX._METHODS_.nvl(masterData[j]);
                                        vThis.calendarDelvDate.setDate(new Date(parseInt(vThis.queryForm.DelvDate.substring(0, 4)), parseInt(vThis.queryForm.DelvDate.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvDate.substring(6))))
                                    }
                                });
                            }
                        });
    
                        toastr.info('조회 결과: ' + vThis.rows.Query.length + '건');
                    } else {
                        vThis.rows.Query = [];
                        alert('조회 결과가 없습니다.');
                        history.back(-1);
                    }
    
                    if (typeof callback === 'function') callback();
    
                    // 그리드에 데이터 바인딩
                    vThis.mainGrid.resetData(vThis.rows.Query);
                }]);
        },

        save: function(){
            let vThis = this;

            // 현재 edit 상태인 셀 적용 처리
            vThis.mainGrid.blur();

            // 파라메터 선언
            let params1 = [], params2 = [];

            // 수정된 행만이 아닌 전체 다 저장해야함
            let getModiData = vThis.mainGrid.getData();

            // detail 공통 파라메터 세팅, 날짜 하이푼(-) 제거
            for (let i = 0; i < getModiData.length; i++) {
                // 입고창고가 없거나 이상하면 저장 막기. 화면에는 안보이지만 체크
                if (!isNaN(getModiData[i].InWHSeq) && getModiData[i].InWHSeq != undefined) {
                    if (getModiData[i].InWHSeq <= 0) {
                        toastr.warning((i + 1) + '행에 입고 창고 데이터가 이상하여 저장할 수 없습니다.');
                        return false;
                    }
                } else {
                    toastr.warning((i + 1) + '행에 입고 창고 데이터가 없어 저장할 수 없습니다.');
                    return false;
                }

                getModiData[i].IDX_NO = parseInt(getModiData[i].rowKey) + 1;
                if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                    // 외주납품품목조회 Jump
                    getModiData[i].WorkingTag = 'U';
                } else if (vThis.jumpSetMethodId == 'OSPWorkOrderJump') {
                    // 외주발주품목조회 Jump
                    getModiData[i].WorkingTag = 'A';
                }
                getModiData[i].DelvDate = GX._METHODS_.nvl(vThis.queryForm.DelvDate).replace(/\-/g, "");
                getModiData[i].WorkDate = GX._METHODS_.nvl(vThis.queryForm.DelvDate).replace(/\-/g, "");
            }
            params2 = getModiData;

            if (params2.length > 0) {
                GX._METHODS_
                .setMethodId('PDWorkReportSave')    // 여기에 API 키 입력
                .ajax(params2, [], [function (data) {
                    if (data[0].Status && data[0].Status != 0) {
                        // 뭔가 문제가 발생했을 때 리턴
                        toastr.error('저장 실패\n' + data[0].Result);
                    } else {
                        toastr.info('저장 성공');
                        vThis.search(vThis.calSum());
                    }
                }]);

            } else{
                toastr.warning('저장할 데이터가 없습니다.');
            }
        },

        delRow: function(){
            let vThis = this;
            
            // 체크된 행만 가져오기
            let arr = vThis.mainGrid.getCheckedRows();
            if (arr.length > 0) {
                if (vThis.mainGrid.getData().length == arr.length) {
                    // 행 전체 선택 시
                    if (vThis.jumpSetMethodId == 'OSPWorkOrderJump') {
                        // 외주발주품목조회에서 넘어온 데이터 전체 삭제 불가능
                        toastr.warning('"외주발주품목조회" 화면에서 넘어온 데이터는 "전체 삭제"가 불가능합니다.');
                    } else if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                        // 외주납품품목조회에서 넘어와 전체 행 선택 삭제(=전체 삭제)
                        // 파라메터 선언
                        let params1 = [], params2 = [];

                        // detail 공통 파레메터 세팅
                        for (let i = 0; i < arr.length; i++) {
                            arr[i].WorkingTag = 'D';
                        }
                        params2 = arr;

                        // master
                        // params1 = [params2[0]]; // 마스터 필요없다고함

                        if (params2.length > 0) {
                            GX._METHODS_
                            .setMethodId('PDWorkReportSave')    // 여기에 API 키 입력
                            .ajax(params2, [], [function (data){
                                if (data[0].Status && data[0].Status != 0) {
                                    // 뭔가 문제가 발생했을 때 리턴
                                    toastr.error('삭제 실패\n' + data[0].Result);
                                } else {
                                    toastr.info('삭제 성공');
                                    vThis.search(vThis.calSum());
                                }
                            }]);
                        } else {
                            toastr.warning('삭제할 데이터가 없습니다.');
                        }
                    }
                } else {
                    // 행 삭제 (전체 선택 삭제 아닐 경우)
                    if (vThis.jumpSetMethodId == 'OSPWorkOrderJump') {
                        // 외주발주조회에서 넘어온 데이터
                        if (confirm('선택한 ' + vThis.mainGrid.getCheckedRowKeys().length + '개 행을 삭제하시겠습니까?')) {
                            // 행 삭제
                            vThis.mainGrid.removeCheckedRows();
                            // this.rows.Query 데이터 갱신
                            vThis.rows.Query = vThis.mainGrid.getData();

                            // 마스터 영역 합계 계산
                            vThis.calSum();
                        }
                    } else if(vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                        // 외주납품조회에서 넘어온 데이터
                        // 파라메터 선언
                        let params1 = [], params2 = [];

                        // detail 공통 파레메터 세팅
                        for (let i = 0; i < arr.length; i++) {
                            arr[i].WorkingTag = 'D';
                        }
                        params2 = arr;
                        
                        // master
                        // params1 = [params2[0]] // 마스터 데이터는 넘겨줄 필요없다고함

                        if (params2.length > 0) {
                            GX._METHODS_
                            .setMethodId('PDWorkReportSave')
                            .ajax([], params2, [function (data) {
                                if (data[0].Status && data[0].Status != 0) {
                                    // 뭔가 문제가 발생했을 때 리턴
                                    toastr.error('삭제 실패\n' + data[0].Result);
                                } else {
                                    toastr.info('삭제 성공');
                                    vThis.search(vThis.calSum());
                                }
                            }, function (data) {
                            }]);
                        }
                    }
                }
            }
        },

        del: function(){
            let vThis = this;

            if (confirm('전체 삭제하시겟습니까?')) {
                if (vThis.jumpSetMethodId == 'OSPWorkOrderJump') {
                    // 외주발주품목조회에서 넘어온 데이터 전체 삭제 불가능
                    toastr.warning('"외주발주품목조회" 화면에서 넘어온 데이터는 "전체 삭제"가 불가능합니다.');
                } else if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                    // 외주납품조회에서 넘어온 데이터 전체 삭제
                    // 파라메터 선언
                    let params1 = [], params2 = [];

                    // 전체 삭제 버튼을 클릭했기에 그리드에 있는 모든 데이터 가져오기
                    let arr = vThis.mainGrid.getData();

                    // detail 공통 파레메터 세팅
                    for (let i = 0; i < arr.length; i++) {
                        arr[i].WorkingTag = 'D';
                    }
                    params2 = arr;

                    // master
                    // params1 = [params2[0]]

                    if (params2.length > 0) {
                        GX._METHODS_
                        .setMethodId('PDWorkReportSave')
                        .ajax(params2, [function (data) {
                            if (data[0].Status && data[0].Status != 0) {
                                // 뭔가 문제가 발생했을 때 리턴
                                toastr.error('삭제 실패\n' + data[0].Result);
                            } else {
                                toastr.info('삭제 성공');
                                vThis.search(vThis.calSum());
                            }
                        }]);
                    } else {
                        toastr.warning('삭제할 데이터가 없습니다.');
                    }
                }
            }
        }

        ,selectAll: function () {
            console.log('123123', e)
        }
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
        }
    },

    mounted(){
        const vThis = this;
        
        vThis.calendarDelvDate = new tui.DatePicker('#DelvDate-container', {
            input: {
                element: '#DelvDate-input',
                format: 'yyyy-MM-dd',
            },
            showAlways: false,
            type: 'date',
            language: 'ko',
        });

        // regist datepicker change event
        vThis.calendarDelvDate.on('change', () => {
            if (vThis.calendarDelvDate.getDate())
                vThis.queryForm.DelvDate = vThis.calendarDelvDate.getDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
        });

        // init grid columns, set grid columns
        ToastUIGrid.setColumns
        .init()
        .setRowHeaders('rowNum', 'checkbox')
        .header('품번').name('GoodItemNo').align('left').width(140).whiteSpace().ellipsis().setRow()
        .header('품명').name('GoodItemName').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('BuyerNo.').name('BuyerNo').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('의뢰부서').name('DeptName').align('center').width(150).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('규격').name('Spec').align('left').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        // .header('공정').name('ProcName').align('center').width(80).whiteSpace().ellipsis().sortable(true).setRow()
        .header('사이즈').name('SizeName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('단위').name('ProdUnitName').align('center').width(80).whiteSpace().ellipsis().setRow()
        .header('작업지시수량').name('OrderQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('기생산수량').name('ProgressQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('생산수량').name('ProdQty').align('right').width(80).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        // .header('양품수량').name('OKQty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        // .header('불량수량').name('BadQty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('입고창고').name('InWHName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
        .header('비고').name('Remark').align('left').width(140).whiteSpace().ellipsis().editor().setRow()
        .header('완료여부').name('IsEnd').align('center').width(90).whiteSpace().ellipsis().formatter('checkbox', {colKey: 'IsEnd', attrName: 'AttrNameIsEnd'}).setRow()
        .header('단가').name('OSPPrice').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('부가세포함').name('IsVAT').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsVAT'}).setRow()
        .header('금액').name('OSPCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('부가세').name('OSPCurVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('금액계').name('OSPTotCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('원화단가').name('OSPDomPrice').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('원화금액').name('OSPDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('원화부가세').name('OSPDomVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('원화금액계').name('OSPTotDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        // .header('공정품번호').name('AssyItemNo').align('left').width(100).whiteSpace().ellipsis().setRow()
        // .header('공정품명').name('AssyItemName').align('left').width(100).whiteSpace().ellipsis().setRow()
        // .header('공정품규격').name('AssyItemSpec').align('left').width(100).whiteSpace().ellipsis().setRow()
        // .header('생산계획번호').name('ProdPlanNo').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('작업지시번호').name('WorkOrderNo').align('center').width(120).whiteSpace().ellipsis().setRow()
        ;

        // create grid
        // vThis.mainGrid = ToastUIGrid.initGrid('grid', [], [], {height: 40, position: 'top', columnContent: {}});
        vThis.mainGrid = ToastUIGrid.initGrid('grid');

        // 완료여부 컬럼 헤더에 체크박스 추가 
        let createInput = document.createElement('input');
        createInput.setAttribute('type', 'checkbox');
        createInput.setAttribute('id', 'colHeaderIsEnd');
        createInput.setAttribute('value', '0');
        document.querySelector('.tui-grid-cell.tui-grid-cell-header[data-column-name="IsEnd"]').append(createInput);

        // grid data init
        vThis.rows.Query = [];
        vThis.mainGrid.resetData(vThis.rows.Query);

        // grid afterSort event - 정렬(sorting) 시 다중 정렬 기능도 알림
        vThis.mainGrid.on('afterSort', (e) => {
            if (e.sortState.columns.length === 1) {
                toastr.info('다중 정렬은 "Ctrl" 키를 누른 상태로 다른 컬럼들 클릭하면 됩니다.')
            }
        });

        // grid editing mode start
        vThis.mainGrid.on('editingStart', function (e) {
            // console.log('editingStart', e)
            // 수정 이전 데이터 가지고 있기
            if (GX._METHODS_.nvl(e.columnName) === 'ProdQty') vThis.strBeforeEditData = e.value || '0';
            else if (GX._METHODS_.nvl(e.columnName) === 'Remark') vThis.strBeforeEditData = e.value || '';
        });

        // grid editing mode finish
        vThis.mainGrid.on('editingFinish', function (e) {
            // console.log('editingFinish', e)
            // 생산수량 수정 시 비교, 계산 로직 태우기
            if (GX._METHODS_.nvl(e.columnName) === 'ProdQty') {
                // 입력한 데이터가 숫자인지 체크
                if (isNaN(e.value)) {
                    toastr.warning('생산수량에 숫자만 입력 가능합니다.');
                    vThis.mainGrid.setValue(e.rowKey, 'ProdQty', vThis.strBeforeEditData);
                    return false;
                }
                
                const qty = e.value || 0; // 생산수량 - 수정한거
                
                // 해당 행 금액, 부가세, 금액계, 원화금액, 원화부가세, 원화금액계 계산하여 갱신
                const price = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'OSPPrice')) || 0; // 단가
                const domPrice = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'OSPDomPrice')) || 0; // 원화단가
                const exRate = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'ExRate')) || 0; // 환율
                
                // 부가세 여부에 따라 계산 변경
                let [floatAmt, floatVat, floatTotAmt] = [1.0, 0.1, 1.0];
                if (vThis.mainGrid.getValue(e.rowKey, 'IsVAT') == '0') floatTotAmt += floatVat; // 부가세 별도
                else floatAmt -= floatVat; // 부가세 포함

                // 금액 계산 = 생산수량 * 단가 * 환율
                const cur = parseFloat(qty) * parseFloat(price) * parseFloat(exRate);
                // 원화 금액 계산 = 생산수량 * 원화단가
                const dom = parseFloat(qty) * parseFloat(domPrice);

                // 금액 = 생산수량 * 단가 * 환율 * [적용 부가세]
                vThis.mainGrid.setValue(e.rowKey, 'OSPCurAmt', (cur * floatAmt).toFixed(0));
                // 부가세 = 생산수량 * 단가 * 환율 * [적용 부가세]
                vThis.mainGrid.setValue(e.rowKey, 'OSPCurVAT', (cur * floatVat).toFixed(0));
                // 금액계 = 생산수량 * 단가 * 환율 * [적용 부가세]
                vThis.mainGrid.setValue(e.rowKey, 'OSPTotCurAmt', (cur * floatTotAmt).toFixed(0));

                // 원화금액 = 생산수량 * 원화단가 * [적용 부가세]
                vThis.mainGrid.setValue(e.rowKey, 'OSPDomAmt', (dom * floatAmt).toFixed(0));
                // 원화부가세 = 생산수량 * 원화단가 * [적용 부가세]
                vThis.mainGrid.setValue(e.rowKey, 'OSPDomVAT', (dom * floatVat).toFixed(0));
                // 원화금액계 = 생산수량 * 원화단가 * [적용 부가세]
                vThis.mainGrid.setValue(e.rowKey, 'OSPTotDomAmt', (dom * floatTotAmt).toFixed(0));

                // vThis.rows.Query에 수정된 데이터 넣기
                vThis.rows.Query = vThis.mainGrid.getData();
                
                // 마스터 영역 합계 계산
                vThis.calSum();
            }
        });

        let jumpData = GX.SessionStorage.get('jumpData') != null ? JSON.parse(GX.SessionStorage.get('jumpData')) : [];
        let jumpSetMethodId = GX.SessionStorage.get('jumpSetMethodId') != null ? GX.SessionStorage.get('jumpSetMethodId') : '';
        if(jumpData.length > 0 && jumpSetMethodId.length > 0){
            jumpData.forEach(v => {
                vThis.jumpDataList.push(v);
            });
            vThis.jumpSetMethodId = jumpSetMethodId;

            GX.SessionStorage.remove('jumpData');
            GX.SessionStorage.remove('jumpSetMethodId');

            vThis.search(vThis.calSum);
        } else{
            alert("선택한 행의 데이터가 이상합니다. 다시 시도해주세요.");
            history.back(-1);
        }
    }
})
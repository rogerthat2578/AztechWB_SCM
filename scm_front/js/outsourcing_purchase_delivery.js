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
        // 모바일웹에서 더블클릭 처럼 동작하기위함
        objDblClick: {
            click: false,
            time: 0,
        },
        // 팝업(window.open)에 접근하기 위함
        objWinOpen: null,
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

            if (e.type === 'click' && e.target.getAttribute('id') === 'btnTransData_wh') {
                vThis.popupClosed_wh();
            }

            if (e.type === 'click' && e.target.getAttribute('id') === 'btnTransData_pd') {
                vThis.popupClosed_pd();
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
            Object.keys(vThis.queryForm).map(k => {
                if (typeof vThis.queryForm[k] == 'string') {
                    vThis.queryForm[k] = '';
                } else if (typeof vThis.queryForm[k] == 'number') {
                    vThis.queryForm[k] = 0;
                } else {
                    vThis.queryForm[k] = null;
                }
            });
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.DelvDate = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.BizUnit = '1';
            
            vThis.rows.Query = [];
            vThis.mainGrid.resetData(vThis.rows.Query);
        },

        /**
         * 팝업 닫을 때 데이터 전달
         */
        popupClosed_wh: function () {
            const vThis = this;

            let transDataRowKey_wh = document.getElementById('transDataRowKey_wh').value;
            let transDataSeq_wh = document.getElementById('transDataSeq_wh').value;
            let transDataValue_wh = document.getElementById('transDataValue_wh').value;
            if (document.getElementById('transDataRowKey_wh')) document.getElementById('transDataRowKey_wh').remove();
            if (document.getElementById('transDataSeq_wh')) document.getElementById('transDataSeq_wh').remove();
            if (document.getElementById('transDataValue_wh')) document.getElementById('transDataValue_wh').remove();
            if (document.getElementById('btnTransData_wh')) document.getElementById('btnTransData_wh').remove();
            if (transDataRowKey_wh != null && transDataRowKey_wh != 'null' && transDataSeq_wh > 0 && transDataValue_wh != '') {
                vThis.mainGrid.setValue(transDataRowKey_wh, 'InWHSeq', transDataSeq_wh);
                vThis.mainGrid.setValue(transDataRowKey_wh, 'InWHName', transDataValue_wh);
            }
        },

        /**
         * 팝업 닫을 때 데이터 전달
         */
        popupClosed_pd: function () {
            const vThis = this;

            let transDataRowKey_pd = document.getElementById('transDataRowKey_pd').value;
            let transDataSeq_pd = document.getElementById('transDataSeq_pd').value;
            let transDataSumOkQty_pd = document.getElementById('transDataSumOkQty_pd').value;
            let transDataSumWeight_pd = document.getElementById('transDataSumWeight_pd').value;
            if (document.getElementById('transDataRowKey_pd')) document.getElementById('transDataRowKey_pd').remove();
            if (document.getElementById('transDataSeq_pd')) document.getElementById('transDataSeq_pd').remove();
            if (document.getElementById('transDataSumOkQty_pd')) document.getElementById('transDataSumOkQty_pd').remove();
            if (document.getElementById('transDataSumWeight_pd')) document.getElementById('transDataSumWeight_pd').remove();
            if (document.getElementById('btnTransData_pd')) document.getElementById('btnTransData_pd').remove();
            
            if (transDataRowKey_pd != null && transDataRowKey_pd != 'null') {
                vThis.mainGrid.setValue(transDataRowKey_pd, 'ProdQty', transDataSumOkQty_pd);
                vThis.mainGrid.setValue(transDataRowKey_pd, 'OKQty', transDataSumOkQty_pd); // 양품수량에도 생산수량 그대로 넣기
                vThis.mainGrid.setValue(transDataRowKey_pd, 'Weight', transDataSumWeight_pd);
            }
            if (transDataRowKey_pd != null && transDataRowKey_pd != 'null') {
                vThis.mainGrid.setValue(transDataRowKey_pd, 'Seq', transDataSeq_pd);
            }
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
                if(vThis.jumpDataList.hasOwnProperty(i)) {
                    paramsList.push(Object.assign(GX.deepCopy(params), vThis.jumpDataList[i]));
                }
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
                                        if (k === 'DelvDate' && GX._METHODS_.nvl(masterData[j]).length === 8 && vThis.jumpSetMethodId != 'PDWorkReportJumpQuery') {
                                            vThis.queryForm.DelvDate = GX._METHODS_.nvl(vThis.queryForm.DelvDate).replace(/-/g, '');
                                            vThis.calendarDelvDate.setDate(new Date(parseInt(vThis.queryForm.DelvDate.substring(0, 4)), parseInt(vThis.queryForm.DelvDate.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvDate.substring(6))));
                                        } else {
                                            vThis.queryForm[k] = GX._METHODS_.nvl(masterData[j]);
                                        }
                                    } else if (k === 'DelvDate' && j === 'WorkDate' && GX._METHODS_.nvl(masterData[j]).length === 8 && vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                                        vThis.queryForm[k] = GX._METHODS_.nvl(masterData[j]);
                                        vThis.queryForm.DelvDate = GX._METHODS_.nvl(vThis.queryForm.DelvDate).replace(/-/g, '');
                                        vThis.calendarDelvDate.setDate(new Date(parseInt(vThis.queryForm.DelvDate.substring(0, 4)), parseInt(vThis.queryForm.DelvDate.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvDate.substring(6))))
                                    }
                                });
                            }
                        });

                        vThis.rows.Query.map(q => {
                            if (!q.DelvDate && vThis.queryForm.DelvDate) q.DelvDate = vThis.queryForm.DelvDate;
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

            const eleToastTitle = document.querySelector('#toast-container .toast-title')?.innerText || '';
            if (eleToastTitle === 'Validation:fail') {
                toastr.warning('데이터 확인 후 저장해주세요.')
                return false;
            }

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
                    /* 20230926 req 박태근이사님 구매발주에서 넘어오더라도 수정,삭제 가능하게 해달라.
                    // 외주발주품목조회 Jump
                    getModiData[i].WorkingTag = 'A';
                    */
                    if (getModiData[i].WorkReportSeq && getModiData[i].WorkReportSeq != 0) {
                        getModiData[i].WorkingTag = 'U';
                    } else {
                        getModiData[i].WorkingTag = 'A';
                    }
                }
                getModiData[i].DelvDate = GX._METHODS_.nvl(vThis.queryForm.DelvDate).replace(/\-/g, "");
                getModiData[i].WorkDate = GX._METHODS_.nvl(vThis.queryForm.DelvDate).replace(/\-/g, "");
            }
            params2 = getModiData;

            if (params2.length > 0) {
                GX._METHODS_
                .setMethodId('PDWorkReportSave')    // 여기에 API 키 입력
                .ajax(params2, [], [function (data) {
                    // WorkReportSeq (실적Seq)이 1번째 응답에 담겨옴 (Serl은 없음)
                    if (data[0].Status && data[0].Status != 0) {
                        // 뭔가 문제가 발생했을 때 리턴
                        toastr.error('저장 실패\n' + data[0].Result);
                    } else {
                        toastr.info('저장 성공');
                        // 재조회를 하는게 아닌 데이터만 갱신
                        // vThis.search(vThis.calSum);

                        if (vThis.jumpSetMethodId == 'OSPWorkOrderJump') {
                            // 외주발주조회 Jump
                            if (data.length > 0) {
                                // 20230926 req 박태근이사님 외주발주에서 넘어오더라도 수정,삭제 가능하게 해달라.
                                let chk = true;
                                for (let i = 0; i < data.length; i++) {
                                    if (data[i].WorkReportSeq == 0) {
                                        chk = false;
                                    }
                                }

                                if (chk) {
                                    let renewArrIdx = [];
                                    for (let i = 0; i < data.length; i++) {
                                        // WorkOrderSeq = WorkOrderSeq 발주Seq, WorkOrderSerl = WorkOrderSerl 발주Serl
                                        for (let j = 0; j < vThis.rows.Query.length; j++) {
                                            if (data[i].WorkOrderSeq == vThis.rows.Query[i].WorkOrderSeq && data[i].WorkOrderSerl == vThis.rows.Query[i].WorkOrderSerl) {
                                                vThis.rows.Query[i].WorkReportSeq = data[i].WorkReportSeq;
                                                vThis.rows.Query[i].Seq = data[i].Seq;
                                                vThis.rows.Query[i].ProdQty = data[i].ProdQty;
                                                vThis.rows.Query[i].Weight = data[i].Weight;
                                            } else {
                                                renewArrIdx.push(j);
                                            }
                                        }
                                    }

                                    // this.rows.Query 배열의 데이터도 삭제하기위한 index 확인
                                    if (renewArrIdx.length > 0) {
                                        // index를 담아둔 배열 내림차순 정렬
                                        renewArrIdx.sort((a, b) => {
                                            return b - a;
                                        });
                                        // 배열 요소 삭제
                                        for (let i in vThis.rows.Query) {
                                            vThis.rows.Query[i].splice(i, 1);
                                        }
                                    }
                                    
                                    // 그리드에 데이터 바인딩
                                    vThis.mainGrid.resetData(vThis.rows.Query);
                                }
                            }
                        } else if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                            // 외주납품현황 Jump
    
                            vThis.search(vThis.calSum);
                        }
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
                    vThis.del();
                } else {
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
                                // 재조회 제거
                                // vThis.search(vThis.calSum);
                                vThis.mainGrid.removeCheckedRows(false);
                            }
                        }]);
                    } else {
                        toastr.warning('삭제할 데이터가 없습니다.');
                    }
                }
            } else {
                if (vThis.mainGrid.getData().length > 0) {
                    toastr.warning('삭제할 행을 선택해주세요.');
                } else {
                    toastr.warning('삭제할 데이터가 없습니다. 이전 화면에서 다시 등록 화면으로 넘어와주세요.');
                }
            }
        },

        del: function(){
            let vThis = this;

            if (confirm('전체 삭제하시겟습니까?')) {
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
                            // 재조회 제거
                            // vThis.search(vThis.calSum);
                            vThis.init();
                        }
                    }]);
                } else {
                    toastr.warning('삭제할 데이터가 없습니다.');
                }
            }
        }
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
        .header('중량').name('Weight').align('right').width(80).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
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
        .header('포장단위작업실적Seq').name('Seq').align('center').hidden(true).setRow() // hidden(true) : 컬럼 안보이게, default = false
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
                    toastr.warning('생산수량에 숫자만 입력 가능합니다.', 'Validation:fail');
                    vThis.mainGrid.setValue(e.rowKey, 'ProdQty', vThis.strBeforeEditData);
                    return false;
                }
                
                const qty = e.value || 0; // 생산수량 - 수정한거

                // 생산수량 수정 시 양품수량도 변경되도록 추가
                vThis.mainGrid.setValue(e.rowKey, 'OKQty', qty);
                
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

        // when data bound to the grid is changed 
        vThis.mainGrid.on('onGridUpdated', function (e) {
            // InWHName > 입고창고 다이얼로그 띄울 셀의 색상 변경
            const fillColor = document.querySelectorAll('.tui-grid-cell-has-input[data-column-name="InWHName"]');
            if (fillColor.length > 0) {
                for (let i = 0; i < fillColor.length; i++) {
                    fillColor[i].style.backgroundColor = '#dddddd';
                }
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
                        
                        if (e.columnName == 'InWHName') {
                            // 입고창고 컬럼
                            if(!GX._METHODS_.isLogin()) {
                                alert('로그인 정보가 만료되었습니다. 다시 로그인 후 진행해주세요.');
                                location.replace('login.html');
                                return false;
                            }

                            // SessionStorage로 데이터 전달
                            GX.SessionStorage.set('codehelp_popup_wh-queryForm', JSON.stringify(vThis.queryForm))
                            GX.SessionStorage.set('codehelp_popup_wh-queryRow', JSON.stringify(vThis.mainGrid.getRow(e.rowKey)))

                            // window.name = "부모창 이름";
                            window.name = 'parentPopup_wh';

                            let top = Math.floor(screen.availHeight / 17);
                            let left = Math.floor(screen.availWidth / 3);

                            // 이미 창이 열려있는지 확인
                            if (vThis.objWinOpen) {
                                if (vThis.objWinOpen.name == 'childPopup_wh') {
                                    toastr.info('이미 창이 열려있습니다.');
                                    vThis.objWinOpen.focus();
                                } else {
                                    vThis.objWinOpen = null;
                                }
                            }

                            if (!vThis.objWinOpen) {
                                // window.open("open할 window", "자식창 이름", "팝업창 옵션");
                                vThis.objWinOpen = window.open('codehelp_popup_wh.html', 'childPopup_wh', 'width=700, height=760, scrollbars=no, top=' + top + ', left=' + left);
                                vThis.objWinOpen.focus();
                            }
                        } else if (e.columnName != 'InWHName' && e.columnName != 'ProdQty' && e.columnName != 'Weight' && e.columnName != 'Remark' && e.columnName != 'IsEnd') {
                            // 입력/수정이 가능한 컬럼을 제외한 나머지
                            if(!GX._METHODS_.isLogin()) {
                                alert('로그인 정보가 만료되었습니다. 다시 로그인 후 진행해주세요.');
                                location.replace('login.html');
                                return false;
                            }

                            console.log(vThis.mainGrid.getRow(e.rowKey))

                            // SessionStorage로 데이터 전달
                            GX.SessionStorage.set('codehelp_popup_pd-queryForm', JSON.stringify(vThis.queryForm))
                            GX.SessionStorage.set('codehelp_popup_pd-queryRow', JSON.stringify(vThis.mainGrid.getRow(e.rowKey)))

                            // window.name = "부모창 이름";
                            window.name = 'parentPopup_pd';

                            let top = Math.floor(screen.availHeight / 17);
                            let left = Math.floor(screen.availWidth / 3);

                            // 이미 창이 열려있는지 확인
                            if (vThis.objWinOpen) {
                                if (vThis.objWinOpen.name == 'childPopup_pd') {
                                    toastr.info('이미 창이 열려있습니다.');
                                    vThis.objWinOpen.focus();
                                } else {
                                    vThis.objWinOpen = null;
                                }
                            }

                            if (!vThis.objWinOpen) {
                                // window.open("open할 window", "자식창 이름", "팝업창 옵션");
                                vThis.objWinOpen = window.open('codehelp_popup_pd.html', 'childPopup_pd', 'width=1000, height=800, scrollbars=no, top=' + top + ', left=' + left);
                                vThis.objWinOpen.focus();
                            }
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

        // after grid data changed
        vThis.mainGrid.on('afterChange', function (e) {
            if (e.changes.length > 0) {
                let boolRenew = false;
                for (let i = 0; i < e.changes.length; i++) {
                    if (e.changes[i].columnName == 'ProdQty') {
                        const qty = e.changes[i].value || 0;

                        // 해당 행 금액, 부가세, 금액계, 원화금액, 원화부가세, 원화금액계 계산하여 갱신
                        const price = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.changes[i].rowKey, 'OSPPrice')) || 0; // 단가
                        const domPrice = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.changes[i].rowKey, 'OSPDomPrice')) || 0; // 원화단가
                        const exRate = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.changes[i].rowKey, 'ExRate')) || 0; // 환율
                        
                        // 부가세 여부에 따라 계산 변경
                        let [floatAmt, floatVat, floatTotAmt] = [1.0, 0.1, 1.0];
                        if (vThis.mainGrid.getValue(e.changes[i].rowKey, 'IsVAT') == '0') floatTotAmt += floatVat; // 부가세 별도
                        else floatAmt -= floatVat; // 부가세 포함

                        // 금액 계산 = 생산수량 * 단가 * 환율
                        const cur = parseFloat(qty) * parseFloat(price) * parseFloat(exRate);
                        // 원화 금액 계산 = 생산수량 * 원화단가
                        const dom = parseFloat(qty) * parseFloat(domPrice);

                        // 금액 = 생산수량 * 단가 * 환율 * [적용 부가세]
                        vThis.mainGrid.setValue(e.changes[i].rowKey, 'OSPCurAmt', (cur * floatAmt).toFixed(0));
                        // 부가세 = 생산수량 * 단가 * 환율 * [적용 부가세]
                        vThis.mainGrid.setValue(e.changes[i].rowKey, 'OSPCurVAT', (cur * floatVat).toFixed(0));
                        // 금액계 = 생산수량 * 단가 * 환율 * [적용 부가세]
                        vThis.mainGrid.setValue(e.changes[i].rowKey, 'OSPTotCurAmt', (cur * floatTotAmt).toFixed(0));

                        // 원화금액 = 생산수량 * 원화단가 * [적용 부가세]
                        vThis.mainGrid.setValue(e.changes[i].rowKey, 'OSPDomAmt', (dom * floatAmt).toFixed(0));
                        // 원화부가세 = 생산수량 * 원화단가 * [적용 부가세]
                        vThis.mainGrid.setValue(e.changes[i].rowKey, 'OSPDomVAT', (dom * floatVat).toFixed(0));
                        // 원화금액계 = 생산수량 * 원화단가 * [적용 부가세]
                        vThis.mainGrid.setValue(e.changes[i].rowKey, 'OSPTotDomAmt', (dom * floatTotAmt).toFixed(0));

                        if (!boolRenew) boolRenew = true;
                    }
                }

                if (boolRenew) {
                    // vThis.rows.Query에 수정된 데이터 넣기
                    vThis.rows.Query = vThis.mainGrid.getData();

                    // 마스터 영역 합계 계산
                    vThis.calSum();
                }
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
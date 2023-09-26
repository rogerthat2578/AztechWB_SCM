let app = new Vue({
	el: '#app',
	data: {
		leftMenu: GX._METHODS_.createLeftMenu(),
		deptName: '',
		userName: '',
		params: GX.getParameters(),
		BizUnitList: [], // 사업 단위 리스트
        /**
         * rows.Query 조회 결과
         */
		rows: {
            Query: [],
        },
        /**
         * 조회 조건
         * 점프로 해당 화면으로 들어오면서 조회할때 사용함.
         */
        queryForm: {
            CompanySeq: '',
            BizUnit: '',
            BizUnitName: '',
            DelvDate: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            DelvNo: '',
            RemarkM: '',
            SMImpType: 8008001,
            SMImpTypeName: '내수',
            CurrName: '',
            CurrSeq: '',
            ExRate: '',
            CustSeq: '',
            DelvSeq: '',
        },
        /**내외자구분 */
        SMImpTypeList: [
            { key: 8008001, val: '내수' },
            { key: 8008002, val: 'Local1(후LC)' },
            { key: 8008003, val: 'Local2(선LC)' },
        ],
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
            SumCurAmt: 0,
            SumCurVAT: 0,
            SumTotCurAmt: 0,
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
    methods: {
        /**이벤트 처리 */
        eventCheck: function() {
            let vThis = this;
            let e = event;

			if (e.type === 'click' && document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu') {
				document.getElementsByClassName('left-menu')[0].style.display = 'none';
			}

            if (e.type === 'click' && document.getElementsByClassName('drop-box')[0].style.display === 'block' && e.target.getAttribute('class') !== 'drop-box-input') {
				document.getElementsByClassName('drop-box')[0].style.display = 'none';
			}

            if (e.type === 'click' && e.target.getAttribute('class') !== 'tui-grid-content-text') {
                // 현재 editing인 영역을 제외한 다른 영역 클릭 시 edit mode 종료
                vThis.mainGrid.finishEditing(); // 수정한 데이터 적용된 상태로 종료. 반대는 cancelEditing()
            }

            if (e.type === 'click' && e.target.getAttribute('id') === 'btnTransData') {
                vThis.popupClosed();
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
        init: function () {
            let vThis = this;
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.DelvDate = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.BizUnit = '1';
        },
        
        /**
         * 팝업 닫을 때 데이터 전달
         */
        popupClosed: function () {
            const vThis = this;

            let transDataRowKey = document.getElementById('transDataRowKey').value;
            let transDataSeq = document.getElementById('transDataSeq').value;
            let transDataSumQty = document.getElementById('transDataSumQty').value;
            if (document.getElementById('transDataRowKey')) document.getElementById('transDataRowKey').remove();
            if (document.getElementById('transDataSeq')) document.getElementById('transDataSeq').remove();
            if (document.getElementById('transDataSumQty')) document.getElementById('transDataSumQty').remove();
            if (document.getElementById('btnTransData')) document.getElementById('btnTransData').remove();

            if (transDataRowKey != null && transDataRowKey != 'null' && transDataSeq > 0) {
                vThis.mainGrid.setValue(transDataRowKey, 'Seq', transDataSeq);
            }
            if (transDataSumQty != undefined && transDataSumQty != null && transDataSumQty != 'null') {
                vThis.mainGrid.setValue(transDataRowKey, 'Qty', transDataSumQty);
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
        /**조회 */
        search: function(callback) {
            let vThis = this;

            let params = GX.deepCopy(vThis.queryForm);
            let paramsList = [];
            for (let i in vThis.jumpDataList) {
                if (vThis.jumpDataList.hasOwnProperty(i)) {
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
                                    if (k === 'DelvDate' && GX._METHODS_.nvl(masterData[j]).length === 8) {
                                        vThis.queryForm.DelvDate = GX._METHODS_.nvl(masterData.DelvDate).replace(/-/g, '');
                                        vThis.calendarDelvDate.setDate(new Date(parseInt(vThis.queryForm.DelvDate.substring(0, 4)), parseInt(vThis.queryForm.DelvDate.substring(4, 6)) - 1, parseInt(vThis.queryForm.DelvDate.substring(6))))
                                    } else {
                                        vThis.queryForm[k] = GX._METHODS_.nvl(masterData[j]);
                                    }
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
            }])
        },
        save: function() {
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
                getModiData[i].IDX_NO = parseInt(getModiData[i].rowKey) + 1;
                if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                    // 구매납품현황 Jump
                    getModiData[i].WorkingTag = 'U';
                } else if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                    // 구매발주조회 Jump
                    getModiData[i].WorkingTag = 'A';
                }
                getModiData[i].DelvDate = GX._METHODS_.nvl(vThis.queryForm.DelvDate).replace(/\-/g, "");
            }
            params2 = getModiData;

            // master
            params1 = [vThis.queryForm];
            params1[0].IDX_NO = getModiData[0].IDX_NO;
            params1[0].UserId = GX.Cookie.get('UserId');
            params1[0].DelvDate = params1[0].DelvDate.indexOf('-') > -1 ? params1[0].DelvDate.replace(/\-/g, "") : params1[0].DelvDate;

            if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                // 구매납품현황 Jump
                params1[0].WorkingTag = 'U';
            } else if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                // 구매발주조회 Jump
                params1[0].WorkingTag = 'A';
            }

            if (params1.length > 0 && params2.length > 0) {
                GX._METHODS_
                .setMethodId('PUDelvSave')
                .ajax(params1, params2, [function (data) {
                    if (data[0].Status && data[0].Status != 0) {
                        // 뭔가 문제가 발생했을 때 리턴
                        toastr.error('저장 실패\n' + data[0].Result);
                    } else {
                        toastr.info('저장 성공');
                        vThis.search(vThis.calSum);
                    }
                }, function (data) {
                }]);
            } else {
                toastr.warning('저장할 데이터가 없습니다.');
            }
        },
        delRow: function () {
            let vThis = this;
            
            // 체크된 행만 가져오기
            let arr = vThis.mainGrid.getCheckedRows();
            if (arr.length > 0) {
                if (vThis.mainGrid.getData().length == arr.length) {
                    // 행 전체 선택 시
                    if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                        // 구매발주품목조회에서 넘어온 데이터 전체 삭제 불가능
                        toastr.warning('"구매발주품목조회" 화면에서 넘어온 데이터는 "전체 삭제"가 불가능합니다.');
                    } else if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                        // 구매납품품목조회에서 넘어와 전체 행 선택 삭제(=전체 삭제)
                        // 파라메터 선언
                        let params1 = [], params2 = [];

                        // detail 공통 파레메터 세팅
                        for (let i = 0; i < arr.length; i++) {
                            arr[i].WorkingTag = 'D';
                        }
                        params2 = arr;

                        // master
                        params1 = [params2[0]]

                        if (params1.length > 0 && params2.length > 0) {
                            GX._METHODS_
                            .setMethodId('PUDelvSave')
                            .ajax(params1, params2, [function (data) {
                                if (data[0].Status && data[0].Status != 0) {
                                    // 뭔가 문제가 발생했을 때 리턴
                                    toastr.error('삭제 실패\n' + data[0].Result);
                                } else {
                                    toastr.info('삭제 성공');
                                    vThis.search(vThis.calSum);
                                }
                            }, function (data) {
                            }]);
                        } else {
                            toastr.warning('삭제할 데이터가 없습니다.');
                        }
                    }
                } else {
                    // 행 삭제 (전체 선택 삭제 아닐 경우)
                    if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                        // 구매발주조회에서 넘어온 데이터
                        if (confirm('선택한 ' + vThis.mainGrid.getCheckedRowKeys().length + '개 행을 삭제하시겠습니까?')) {
                            // 행 삭제
                            vThis.mainGrid.removeCheckedRows();
                            // this.rows.Query 데이터 갱신
                            vThis.rows.Query = vThis.mainGrid.getData();

                            // 마스터 영역 합계 계산
                            vThis.calSum();
                        }
                    } else if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                        // 구매납품조회에서 넘어온 데이터
                        // 파라메터 선언
                        let params1 = [], params2 = [];

                        // detail 공통 파레메터 세팅
                        for (let i = 0; i < arr.length; i++) {
                            arr[i].WorkingTag = 'D';
                        }
                        params2 = arr;
                        
                        // master
                        // params1 = [params2[0]] // 마스터 데이터는 넘겨줄 필요없다고함

                        GX._METHODS_
                        .setMethodId('PUDelvSave')
                        .ajax(params1, params2, [function (data) {
                            if (data[0].Status && data[0].Status != 0) {
                                // 뭔가 문제가 발생했을 때 리턴
                                toastr.error('삭제 실패\n' + data[0].Result);
                            } else {
                                toastr.info('삭제 성공');
                                vThis.search(vThis.calSum);
                            }
                        }, function (data) {
                        }]);
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
        del: function () {
            let vThis = this;

            if (confirm('전체 삭제하시겟습니까?')) {
                if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                    // 구매발주품목조회에서 넘어온 데이터 전체 삭제 불가능
                    toastr.warning('"구매발주품목조회" 화면에서 넘어온 데이터는 "전체 삭제"가 불가능합니다.');
                } else if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                    // 구매납품조회에서 넘어온 데이터 전체 삭제
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
                    params1 = [params2[0]]

                    if (params1.length > 0 && params2.length > 0) {
                        GX._METHODS_
                        .setMethodId('PUDelvSave')
                        .ajax(params1, params2, [function (data) {
                            if (data[0].Status && data[0].Status != 0) {
                                // 뭔가 문제가 발생했을 때 리턴
                                toastr.error('삭제 실패\n' + data[0].Result);
                            } else {
                                toastr.info('삭제 성공');
                                vThis.search(vThis.calSum);
                            }
                        }, function (data) {
                        }]);
                    } else {
                        toastr.warning('삭제할 데이터가 없습니다.');
                    }
                }
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
        }
    },
    mounted() {
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
        .header('Order품번').name('OrderItemNo').align('left').width(140).whiteSpace().ellipsis().setRow()
        .header('품번').name('ItemNo').align('left').width(140).whiteSpace().ellipsis().setRow()
        .header('BuyerNo.').name('BuyerNo').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('품명').name('ItemName').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('규격').name('Spec').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('단위').name('UnitName').align('center').width(100).whiteSpace().ellipsis().setRow()
        .header('발주수량').name('StdUnitQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('납품수량').name('Qty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('단가').name('Price').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('금액').name('CurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('부가세포함').name('IsVAT').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsVAT'}).setRow()
        .header('부가세').name('CurVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('금액계').name('TotCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('LOT-NO').name('Seq').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('원화단가').name('DomPrice').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('원화금액').name('DomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('원화부가세').name('DomVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('원화금액계').name('TotDomAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        // .header('창고').name('WHName').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('비고').name('Remark').align('left').width(140).whiteSpace().ellipsis().editor().setRow()
        .header('색상').name('ColorNo').align('center').width(100).whiteSpace().ellipsis().setRow()
        ;

        // create grid
        // vThis.mainGrid = ToastUIGrid.initGrid('grid', [], [], {height: 40, position: 'top', columnContent: {}});
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
            // 행 더블 클릭 시 다이이얼로그 띄우기 - 모바일 웹에선 그리드 더블클릭 이벤트가 동작하지 않음
            const clickInterval = 600; // ms
            if (vThis.objDblClick.click) {
                if (new Date().getTime() - vThis.objDblClick.time <= clickInterval) {
                    if (e.rowKey || e.rowKey === 0) {
                        if (e.columnName === 'Seq') {
                            if(!GX._METHODS_.isLogin()) {
                                alert('로그인 정보가 만료되었습니다. 다시 로그인 후 진행해주세요.');
                                location.replace('login.html');
                                return false;
                            }

                            // SessionStorage로 데이터 전달
                            GX.SessionStorage.set('codehelp_popup-queryForm', JSON.stringify(vThis.queryForm))
                            GX.SessionStorage.set('codehelp_popup-queryRow', JSON.stringify(vThis.mainGrid.getRow(e.rowKey)))

                            // window.name = "부모창 이름";
                            window.name = 'parentPopup';

                            let top = Math.floor(screen.availHeight / 17);
                            let left = Math.floor(screen.availWidth / 4);

                            // 이미 창이 열려있는지 확인
                            if (vThis.objWinOpen) {
                                if (vThis.objWinOpen.name == 'childPopup') {
                                    toastr.info('이미 창이 열려있습니다.');
                                    vThis.objWinOpen.focus();
                                } else {
                                    vThis.objWinOpen = null;
                                }
                            } 
                            
                            if (!vThis.objWinOpen) {
                                // window.open("open할 window", "자식창 이름", "팝업창 옵션");
                                vThis.objWinOpen = window.open('codehelp_popup.html', 'childPopup', 'width=1000, height=800, scrollbars=no, top=' + top + ', left=' + left);
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

        // grid editing mode start
        vThis.mainGrid.on('editingStart', function (e) {
            // console.log('editingStart', e)
            // 수정 이전 데이터 가지고 있기
            if (GX._METHODS_.nvl(e.columnName) === 'Qty') vThis.strBeforeEditData = e.value || '0';
            else if (GX._METHODS_.nvl(e.columnName) === 'Remark') vThis.strBeforeEditData = e.value || '';
        });

        // grid editing mode finish
        vThis.mainGrid.on('editingFinish', function (e) {
            // console.log('editingFinish', e)
            // 납품수량 수정 시 비교, 계산 로직 태우기
            if (GX._METHODS_.nvl(e.columnName) === 'Qty') {
                // 입력한 데이터가 숫자인지 체크
                if (isNaN(e.value)) {
                    toastr.warning('납품수량에 숫자만 입력 가능합니다.', 'Validation:fail');
                    vThis.mainGrid.setValue(e.rowKey, 'Qty', vThis.strBeforeEditData);
                    return false;
                }
                
                const stdUnitQty = vThis.mainGrid.getValue(e.rowKey, 'StdUnitQty') || 0; // 발주수량
                const qty = e.value || 0; // 납품수량 - 수정한거
                
                if (parseFloat(stdUnitQty) < parseFloat(qty)) {
                    // 발주수량 < 납품수량 == 에러 발생
                    toastr.warning('발주수량(' + stdUnitQty + ')은 납품수량(' + qty + ') 보다 크거나 같아야 합니다.', 'Validation:fail');
                    vThis.mainGrid.setValue(e.rowKey, 'Qty', vThis.strBeforeEditData);
                    return false;
                } else {
                    // 해당 행 금액, 부가세, 금액계, 원화금액, 원화부가세, 원화금액계 계산하여 갱신
                    const price = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'Price')) || 0; // 단가
                    const domPrice = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'DomPrice')) || 0; // 원화단가
                    const exRate = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'ExRate')) || 0; // 환율
                    
                    // 부가세 여부에 따라 계산 변경
                    let [floatAmt, floatVat, floatTotAmt] = [1.0, 0.1, 1.0];
                    if (vThis.mainGrid.getValue(e.rowKey, 'IsVAT') == '0') floatTotAmt += floatVat; // 부가세 별도
                    else floatAmt -= floatVat; // 부가세 포함

                    // 금액 계산 = 납품수량 * 단가 * 환율
                    const cur = parseFloat(qty) * parseFloat(price) * parseFloat(exRate);
                    // 원화 금액 계산 = 납품수량 * 원화단가
                    const dom = parseFloat(qty) * parseFloat(domPrice);

                    // 금액 = 납품수량 * 단가 * 환율 * [적용 부가세]
                    vThis.mainGrid.setValue(e.rowKey, 'CurAmt', (cur * floatAmt).toFixed(0));
                    // 부가세 = 납품수량 * 단가 * 환율 * [적용 부가세]
                    vThis.mainGrid.setValue(e.rowKey, 'CurVAT', (cur * floatVat).toFixed(0));
                    // 금액계 = 납품수량 * 단가 * 환율 * [적용 부가세]
                    vThis.mainGrid.setValue(e.rowKey, 'TotCurAmt', (cur * floatTotAmt).toFixed(0));

                    // 원화금액 = 납품수량 * 원화단가 * [적용 부가세]
                    vThis.mainGrid.setValue(e.rowKey, 'DomAmt', (dom * floatAmt).toFixed(0));
                    // 원화부가세 = 납품수량 * 원화단가 * [적용 부가세]
                    vThis.mainGrid.setValue(e.rowKey, 'DomVAT', (dom * floatVat).toFixed(0));
                    // 원화금액계 = 납품수량 * 원화단가 * [적용 부가세]
                    vThis.mainGrid.setValue(e.rowKey, 'TotDomAmt', (dom * floatTotAmt).toFixed(0));

                    // vThis.rows.Query에 수정된 데이터 넣기
                    vThis.rows.Query = vThis.mainGrid.getData();
                    
                    // 마스터 영역 합계 계산
                    vThis.calSum();
                }
            }
        });

        // when data bound to the grid is changed 
        vThis.mainGrid.on('onGridUpdated', function (e) {
            // LOT-NO > 포장단위 다이얼로그 띄울 셀의 색상 변경
            const fillColor = document.querySelectorAll('.tui-grid-cell-has-input[data-column-name="Seq"]');
            if (fillColor.length > 0) {
                for (let i = 0; i < fillColor.length; i++) {
                    fillColor[i].style.backgroundColor = '#dddddd';
                }
            }
        });

        let jumpData = GX.SessionStorage.get('jumpData') != null ? JSON.parse(GX.SessionStorage.get('jumpData')) : [];
        let jumpSetMethodId = GX.SessionStorage.get('jumpSetMethodId') != null ? GX.SessionStorage.get('jumpSetMethodId') : '';
        if (jumpData.length > 0 && jumpSetMethodId.length > 0) {
            jumpData.forEach(v => {
                vThis.jumpDataList.push(v);
            });
            vThis.jumpSetMethodId = jumpSetMethodId;

            GX.SessionStorage.remove('jumpData');
            GX.SessionStorage.remove('jumpSetMethodId');

            vThis.search(vThis.calSum);
        } else {
            alert('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
            history.back(-1);
        }
    }
});
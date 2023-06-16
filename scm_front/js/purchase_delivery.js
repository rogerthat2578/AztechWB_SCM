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
            Control: false,
            Q: false,
            Z: false,
        },
        isCheckList: [],
        jumpDataList: [],
        jumpSetMethodId: '',
        summaryArea: {
            SumCurAmt: 0,
            SumCurVAT: 0,
            SumTotCurAmt: 0,
        },
        // grid 내 데이터 edit 모드일 때 기존 데이터 유지
        strBeforeEditData: '',
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

            if (e.type === 'keyup') {
                if (e.key.toLowerCase() === 'control') {
                    vThis.keyCombi.Control = true;
                    setTimeout(() => {
                        if (vThis.keyCombi.Control) vThis.keyCombi.Control = false;
                    }, 1000)
                } else if (e.key.toLowerCase() === 'q') {
                    vThis.keyCombi.Q = true;
                    setTimeout(() => {
                        if (vThis.keyCombi.Q) vThis.keyCombi.Q = false;
                    }, 1000)
                } else if (e.key.toLowerCase() === 'z') {
                    vThis.keyCombi.Z = true;
                    setTimeout(() => {
                        if (vThis.keyCombi.Z) vThis.keyCombi.Z = false;
                    }, 1000)
                }

                if (vThis.keyCombi.Control && vThis.keyCombi.Q && !vThis.keyCombi.Z) {
                    vThis.search(vThis.calSum);
                    vThis.initKeyCombi();
                } else if (vThis.keyCombi.Control && vThis.keyCombi.Z && !vThis.keyCombi.Q) {
                    if (confirm('초기 상태로 복구하시겠습니까?')) {
                        vThis.mainGrid.restore();
                    }
                }
            }
        },
        init: function () {
            let vThis = this;
            vThis.initKeyCombi();
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
        },
        initKeyCombi: function () {
            Object.keys(this.keyCombi).map(k => {
                this.keyCombi[k] = false;
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
                if (data[0].Status && data[0].Status != 0) {
                    alert(data[0].Result);
                    history.back(-1);
                } else if(data.length > 0) {
                    let i = 0;
                    while (i < data.length) {
                        // 납품예정일에 데이터가 없을 경우 납기일 기본 세팅
                        if (GX._METHODS_.nvl(data[i].DelvPlanDate).length !== 8) {
                            data[i].DelvPlanDate = data[i].DelvDate;
                        }
                        i++;
                    }
                    vThis.rows.Query = data;
                    toastr.info('점프 결과: ' + vThis.rows.Query.length + '건');
                } else{
                    vThis.rows.Query = [];
                    toastr.info('점프 결과가 없습니다.');
                }

                if (typeof callback === 'function') callback();

                // 그리드에 데이터 바인딩
                vThis.mainGrid.resetData(vThis.rows.Query);
            }])
        },
        save: function() {
            let vThis = this;

            let params1 = [], params2 = [];
            let saveArrData = GX.deepCopy(vThis.rows.Query);

            // params2 공통으로 들어가야하는 파라메터 세팅
            for (let i = saveArrData.length - 1; i >= 0; i--) {
                if (saveArrData[i].RowEdit) {
                    saveArrData[i].IDX_NO = saveArrData[i].ROWNUM;
                    if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                        // 구매납품현황 Jump
                        saveArrData[i].WorkingTag = 'U';
                    } else if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                        // 구매발주조회 Jump
                        saveArrData[i].WorkingTag = 'A';
                    }
                    saveArrData[i].DelvDate = saveArrData[i].DelvDate.indexOf('-') > -1 ? saveArrData[i].DelvDate.replace(/\-/g, "") : saveArrData[i].DelvDate;
                } else {
                    saveArrData.splice(i, 1);
                }
            }
            
            // master
            params1 = [vThis.queryForm];
            params1[0].IDX_NO = saveArrData[0].ROWNUM;
            params1[0].UserId = GX.Cookie.get('UserId');
            params1[0].DelvDate = params1[0].DelvDate.indexOf('-') > -1 ? params1[0].DelvDate.replace(/\-/g, "") : params1[0].DelvDate;;
            if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                // 구매납품현황 Jump
                params1[0].WorkingTag = 'U';
            } else if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                // 구매발주조회 Jump
                params1[0].WorkingTag = 'A';
            }
            // detail
            params2 = saveArrData;

            if (params1.length > 0 && params2.length > 0) {
                GX._METHODS_
                .setMethodId('PUDelvSave')
                .ajax(params1, params2, [function (data) {
                    if (data[0].Status && data[0].Status != 0) {
                        // 뭔가 문제가 발생했을 때 리턴
                        alert('저장 실패\n' + data[0].Result);
                    } else {
                        vThis.initKeyCombi();
                        for (let i in vThis.rows.Query) {
                            if (vThis.rows.Query.hasOwnProperty(i))
                                vThis.rows.Query[i].RowEdit = false;
                        }
                        alert('저장 성공');
                    }
                }, function (data) {
                }]);
            } else {
                alert('저장할 데이터가 없습니다.');
            }
        },
        delRow: function () {
            let vThis = this;
            
            if (vThis.rows.Query.length < 1 || vThis.isCheckList.length == 0) {
                alert('삭제할 데이터가 없습니다. 삭제할 데이터를 선택 후 삭제해주세요.');
            } else if (vThis.rows.Query.length == vThis.isCheckList.length) {

                // 전체 선택 시 전체 삭제
                if (confirm('모든 데이터를 삭제하시겠습니까?')) {
                    
                    if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                        // 구매발주품목조회에서 넘어온 데이터 전체 삭제 시 뒤로가기
                        history.back(-1);
                    } else if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                        let delArrData = GX.deepCopy(vThis.rows.Query);

                        /*
                        // 오늘 날짜
                        let today = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "");
                        for (let i in delArrData) {
                            // 수정, 삭제 시 (최초)입력일자가 존재하고 저장할 때와 일자가 다른 경우 저장하지 못하게함. from 박태근이사
                            if (delArrData[i]?.InsDate) {
                                if (vThis.jumpSetMethodId == 'DelvItemListJump' && delArrData[i].InsDate != today) {
                                    alert('Order품번: ' + delArrData[i].OrderItemNo + '\n품번: ' + delArrData[i].ItemNo + '\n일일 마감되었습니다. 고객사 담당자에게 문의바랍니다.');
                                    return false;
                                }
                            }
                        }
                        */

                        let params1 = [], params2 = [];
                        for (let i in delArrData) {
                            let objParams = {};
                            if (delArrData.hasOwnProperty(i)) {
                                objParams.DelvSeq = delArrData[i].DelvSeq;
                                objParams.DelvSerl = delArrData[i].DelvSerl;
                                objParams.WorkingTag = 'D';
                                params2.push(objParams);
                            }
                        }
                        
                        params1.push(params2[0]);
        
                        if (params1.length > 0 && params2.length > 0) {
                            GX._METHODS_
                            .setMethodId('PUDelvSave')
                            .ajax(params1, params2, [function (data) {
                                if (data[0].Status && data[0].Status != 0) {
                                    // 뭔가 문제가 발생했을 때 리턴
                                    alert('삭제 실패\n' + data[0].Result);
                                } else {
                                    alert('삭제 성공');
                                }
                            }, function (data) {
                            }]);
                        } else {
                            alert('삭제할 데이터가 없습니다.');
                        }
                    }
                }
            } else {
                // 행 삭제
                if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                    // 구매발주조회
                    let temp = GX.deepCopy(vThis.rows.Query);
                    let tempChk = vThis.isCheckList.sort(function(a, b) {
                        return b - a;
                    });

                    for (let i in tempChk) {
                        if (tempChk.hasOwnProperty(i))
                            temp.splice(tempChk[i], 1);
                    }

                    for (let i in temp) {
                        if (temp.hasOwnProperty(i))
                            temp[i].ROWNUM = parseInt(i) + 1;
                    }
                    
                    vThis.rows.Query = temp;
                } else if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                    // 구매납품조회
                    let delArrData = GX.deepCopy(vThis.rows.Query);
                    let tempChk = vThis.isCheckList.sort(function(a, b) {
                        return b - a;
                    });
                    let params1 = [], params2 = [];
                    for (let i in tempChk) {
                        let objParams = {};
                        if (delArrData.hasOwnProperty(i)) {
                            objParams.DelvSeq = delArrData[tempChk[i]].DelvSeq;
                            objParams.DelvSerl = delArrData[tempChk[i]].DelvSerl;
                            objParams.WorkingTag = 'D';
                            params2.push(objParams);
                        }
                    }

                    /*
                    // 오늘 날짜
                    let today = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "");
                    for (let i in params2) {
                        // 수정, 삭제 시 (최초)입력일자가 존재하고 저장할 때와 일자가 다른 경우 저장하지 못하게함. from 박태근이사
                        if (params2[i]?.InsDate) {
                            if (vThis.jumpSetMethodId == 'DelvItemListJump' && params2[i].InsDate != today) {
                                alert('Order품번: ' + params2[i].OrderItemNo + '\n품번: ' + params2[i].ItemNo + '\n일일 마감되었습니다. 고객사 담당자에게 문의바랍니다.');
                                return false;
                            }
                        }
                    }
                    */

                    // params1.push(params2[0]);
                    
                    GX._METHODS_
                    .setMethodId('PUDelvSave')
                    .ajax(params1, params2, [function (data) {
                        if (data[0].Status && data[0].Status != 0) {
                            // 뭔가 문제가 발생했을 때 리턴
                            alert('삭제 실패\n' + data[0].Result);
                        } else {
                            alert('삭제 성공');
                            vThis.search(vThis.calSum);
                        }
                    }, function (data) {
                    }]);
                }
            }
        },
        del: function () {
            let vThis = this;
            
            if (confirm('모든 데이터를 삭제하시겠습니까?')) {
                if (vThis.jumpSetMethodId == 'PUORDPOJump') {
                    // 구매발주품목조회에서 넘어온 데이터 전체 삭제 시 뒤로가기
                    history.back(-1);
                } else if (vThis.jumpSetMethodId == 'DelvItemListJump') {
                    // 구매납품조회
                    let delArrData = GX.deepCopy(vThis.rows.Query);

                    /*
                    // 오늘 날짜
                    let today = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "");
                    for (let i in delArrData) {
                        console.log(delArrData[i]?.InsDate)
                        // 수정, 삭제 시 (최초)입력일자가 존재하고 저장할 때와 일자가 다른 경우 저장하지 못하게함. from 박태근이사
                        if (delArrData[i]?.InsDate) {
                            if (vThis.jumpSetMethodId == 'DelvItemListJump' && delArrData[i].InsDate != today) {
                                alert('Order품번: ' + delArrData[i].OrderItemNo + '\n품번: ' + delArrData[i].ItemNo + '\n일일 마감되었습니다. 고객사 담당자에게 문의바랍니다.');
                                return false;
                            }
                        }
                    }
                    */

                    let params1 = [], params2 = [];
                    for (let i in delArrData) {
                        let objParams = {};
                        if (delArrData.hasOwnProperty(i)) {
                            objParams.DelvSeq = delArrData[i].DelvSeq;
                            objParams.DelvSerl = delArrData[i].DelvSerl;
                            objParams.WorkingTag = 'D';
                            params2.push(objParams);
                        }
                    }
                    
                    params1.push(params2[0]);

                    GX._METHODS_
                    .setMethodId('PUDelvSave')
                    .ajax(params1, params2, [function (data) {
                        if (data[0].Status && data[0].Status != 0) {
                            // 뭔가 문제가 발생했을 때 리턴
                            alert('삭제 실패\n' + data[0].Result);
                        } else {
                            alert('삭제 성공');
                            location.reload()
                        }
                    }, function (data) {
                    }]);
                }
            }
        },
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login.html');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');
			
			document.addEventListener('click', vThis.eventCheck, false);
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
        
        vThis.calendarPODateFr = new tui.DatePicker('#DelvDate-container', {
            input: {
                element: '#DelvDate-input',
                format: 'yyyy-MM-dd',
            },
            showAlways: false,
            type: 'date',
            language: 'ko',
        });

        // init grid columns, set grid columns
        ToastUIGrid.setColumns
        .init()
        .setRowHeaders('rowNum', 'checkbox')
        .header('Order품번').name('OrderItemNo').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('품번').name('ItemNo').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('BuyerNo.').name('BuyerNo').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('품명').name('ItemName').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('규격').name('Spec').align('left').width(100).whiteSpace().ellipsis().setRow()
        .header('단위').name('UnitName').align('center').width(100).whiteSpace().ellipsis().setRow()
        .header('발주수량').name('STDUnitQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('납품수량').name('Qty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('단가').name('Price').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('금액').name('CurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('부가세포함').name('IsVAT').align('center').width(80).whiteSpace().ellipsis().formatter('checkbox', {attrDisabled: 'disabled', colKey: 'IsVAT'}).setRow()
        .header('부가세').name('CurVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('금액계').name('TotCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
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

        // grid editing mode start
        vThis.mainGrid.on('editingStart', function (e) {
            // console.log('editingStart', e)
            // 수정 이전 데이터 가지고 있기
            if (GX._METHODS_.nvl(e.columnName) === 'Qty') vThis.strBeforeEditData = e.value || '0';
            else if (GX._METHODS_.nvl(e.columnName) === 'Remark') vThis.strBeforeEditData = e.value || '';
        })

        // grid editing mode finish
        vThis.mainGrid.on('editingFinish', function (e) {
            // console.log('editingFinish', e)
            // 납품수량 수정 시 비교, 계산 로직 태우기
            if (GX._METHODS_.nvl(e.columnName) === 'Qty') {
                // 입력한 데이터가 숫자인지 체크
                if (isNaN(e.value)) {
                    toastr.warning('납품수량에 숫자만 입력 가능합니다.');
                    vThis.mainGrid.setValue(e.rowKey, 'Qty', vThis.strBeforeEditData);
                    return false;
                }
                
                const stdUnitQty = vThis.mainGrid.getValue(e.rowKey, 'STDUnitQty') || 0; // 발주수량
                const qty = e.value || 0; // 납품수량 - 수정한거
                
                if (parseFloat(stdUnitQty) < parseFloat(qty)) {
                    // 발주수량 < 납품수량 == 에러 발생
                    toastr.warning('발주수량(' + stdUnitQty + ')은 납품수량(' + qty + ') 보다 크거나 같아야 합니다.');
                    vThis.mainGrid.setValue(e.rowKey, 'Qty', vThis.strBeforeEditData);
                    return false;
                } else {
                    // 해당 행 금액, 부가세, 금액계, 원화금액, 원화부가세, 원화금액계 계산하여 갱신
                    const price = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'Price')) || 0; // 단가
                    const exRate = GX._METHODS_.nvl(vThis.mainGrid.getValue(e.rowKey, 'ExRate')) || 0; // 환율
                    
                    // 부가세 여부에 따라 계산 변경
                    let [floatAmt, floatVat, floatTotAmt] = [1.0, 0.1, 1.0];
                    if (vThis.mainGrid.getValue(e.rowKey, 'IsVAT') == '0') floatTotAmt += floatVat; // 부가세 별도
                    else floatAmt -= floatVat; // 부가세 포함

                    // 금액 계산 = 납품수량 * 단가 * 환율
                    const cur = parseFloat(qty) * parseFloat(price) * parseFloat(exRate)
                    // 원화 금액 계산 = 납품수량 * 원화단가
                    const dom = parseFloat(qty) * parseFloat(price)

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

                    console.log(vThis.mainGrid.getSummaryValues('TotCurAmt'))
                    console.log(vThis.mainGrid.getSummaryValues('CurAmt'))

                    // vThis.rows.Query에 수정된 데이터 넣기
                    vThis.rows.Query = vThis.mainGrid.getData();
                }
            }
        })

        

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
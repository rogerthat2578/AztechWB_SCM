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
         * rows.QuerySummary 조회 결과 합계 Object
         */
		rows: {
            Query: [],
            QuerySummary: {},
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
        },
        isCheckList: [],
        jumpDataList: [],
        jumpSetMethodId: '',
        summaryArea: {
            SumCurAmt: 0,
            SumCurVAT: 0,
            SumTotCurAmt: 0,
        },
        /**수량, 금액 관련 컬럼 3자리마다 쉼표(,) 삽입할 컬럼 */
        keyMapping: {
            Qty: '납품수량',
            Price: '단가',
            CurAmt: '금액',
            CurVAT: '부가세',
            TotCurAmt: '금액계',
            DomPrice: '원화단가',
            DomAmt: '원화금액',
            DomVAT: '원화부가세',
            TotDomAmt: '원화금액계',
        },
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
                }

                if (vThis.keyCombi.Control && vThis.keyCombi.Q) {
                    vThis.search(vThis.calSum);
                    vThis.initKeyCombi();
                }
            }
        },
        /**우측상단 유저 정보 클릭 시 */
		userInfoClick: function() {
			if (confirm('로그아웃 하시겠습니까?')) {
				GX.Cookie.set('UserId', '', 0);
				GX.Cookie.set('UserSeq', '', 0);
				GX.Cookie.set('UserName', '', 0);
				GX.Cookie.set('EmpSeq', '', 0);
				GX.Cookie.set('DeptName', '', 0);
				GX.Cookie.set('DeptSeq', '', 0);
				GX.Cookie.set('CompanySeq', '', 0);
				GX.Cookie.set('BizUnit', '', 0);
				GX.Cookie.set('BizUnitName', '', 0);
                GX.Cookie.set('BizUnit_JsonFormatStringType', '', 0);
                GX.Cookie.set('CustSeq', '', 0); // 거래처코드
				GX.Cookie.set('CustKind', '', 0); // 거래처타입
				location.href = 'login.html';
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
        /**날짜 번경 후처리 */
        updateDate: function(v = '', o = null) {
            this.queryForm.DelvDate = v;
        },
        /**
         * 
         */
        updateRowDelvPlanDate: function (idx = null) {
            let evtTarget = event.target;
            if (idx != null && evtTarget.name != null && evtTarget.name != undefined && evtTarget.name != ''
                && evtTarget.value != null && evtTarget.value != undefined && evtTarget.value != '') {
                this.rows.Query[idx][evtTarget.name] = evtTarget.value;
                this.rows.Query[idx].RowEdit = true;
                document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data');
            }
        },
        init: function () {
            let vThis = this;
            vThis.initKeyCombi();
            vThis.initSelected();
            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
        },
        initKeyCombi: function () {
            Object.keys(this.keyCombi).map(k => {
                this.keyCombi[k] = false;
            });
        },
        selectAll: function () {
            let obj = document.querySelectorAll('[name="RowCheck"]');
            let isCheckList = [];
            for (let i in obj) {
                if (obj.hasOwnProperty(i)) {
                    obj[i].checked = event.target.checked;
                    if (event.target.checked) isCheckList.push(Number(i));
                }
            }
            this.isCheckList = isCheckList;
        },
        initSelected: function () {
            this.isCheckList = [];
            let selAllObj = document.querySelector('thead [type="checkbox"]');
            if (selAllObj != null) {
                selAllObj.checked = true;
                selAllObj.click();
            }
        },
        isChecked: function (index) {
            return (this.isCheckList.indexOf(index) != -1);
        },
        selectedMark: function (index) {
            let idx = this.isCheckList.indexOf(index);
            if (event.target.checked) this.isCheckList.push(index);
            else if (idx != -1) this.isCheckList.splice(idx, 1);
        },
        applyAll: function (name, idx) {
            event.target.setAttribute('gx-datepicker', idx);
            GX.Calendar.openInRow(name, { useYN: true, idx: idx });
        },
        selectRow: function (idx) {
            let vThis = this;
            let e = event;

            // 무언가 스크립트가 꼬여 여러행에 fill-color-sel-row 클래스가 적용되어있어도 다시 하나만 적용될 수 있게
            document.querySelectorAll('tr.fill-color-sel-row').forEach(ele => {
                ele.classList.remove('fill-color-sel-row');
            });
            if (e.target.nodeName.toUpperCase() === 'TD')
                e.target.parentNode.classList.add('fill-color-sel-row');
        },
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
                            if (!isNaN(GX._METHODS_.nvl(calList[i][k.replace('Sum', '')]).toString().replace(/\,/, '')))
                                vThis.summaryArea[k] += parseFloat(GX._METHODS_.nvl(calList[i][k.replace('Sum', '')]).toString().replace(/\,/, ''));
                        });
                    }
                }
            }

            Object.keys(vThis.summaryArea).map(k => {
                vThis.summaryArea[k] = GX._METHODS_.nvl(vThis.summaryArea[k]).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
            });
        },
        updateRowQty: function (idx = null) {
            let evtTarget = event.target;

            if (idx != null && evtTarget.name != null && evtTarget.name != undefined && evtTarget.name != '' && evtTarget.value != null && evtTarget.value != undefined && evtTarget.value != '') {
                let queryIdx = this.rows.Query[idx]; // 해당 행 obj
                queryIdx[evtTarget.name] = evtTarget.value;
                queryIdx.RowEdit = true;
                document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data');

                // 납품수량
                let rowDelvQty = this.rows.Query[idx][evtTarget.name];

                // 부가세 여부에 따라 변경 값
                let mulVal = [];
                if (queryIdx.IsVAT == '0') mulVal = [1.0, 0.1, 1.1]; // 부가세 별도
                else mulVal = [0.9, 0.1, 1.0]; // 부가세 포함

                /**해당 행 금액들 수정 */
                // 금액 = 납품수량 * 단가 * 환율
                queryIdx.CurAmt = (parseFloat(rowDelvQty) * parseFloat(queryIdx.Price.replace(/\,/g, '')) * parseFloat(queryIdx.ExRate) * parseFloat(mulVal[0])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                // 부가세 = 납품수량 * 단가 * 환율 * 0.1
                queryIdx.CurVAT = (parseFloat(rowDelvQty) * parseFloat(queryIdx.Price.replace(/\,/g, '')) * parseFloat(queryIdx.ExRate) * parseFloat(mulVal[1])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                // 금액계 = 납품수량 * 단가 * 환율 * 1.1
                queryIdx.TotCurAmt = (parseFloat(rowDelvQty) * parseFloat(queryIdx.Price.replace(/\,/g, '')) * parseFloat(queryIdx.ExRate) * parseFloat(mulVal[2])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                // 통화가 KRW인 경우
                // 원화금액 = 납품수량 * 원화단가
                queryIdx.DomAmt = (parseFloat(rowDelvQty) * parseFloat(queryIdx.DomPrice.replace(/\,/g, '')) * parseFloat(mulVal[0])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                // 원화부가세 = 납품수량 * 원화단가 * 0.1
                queryIdx.DomVAT = (parseFloat(rowDelvQty) * parseFloat(queryIdx.DomPrice.replace(/\,/g, '')) * parseFloat(mulVal[1])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                // 원화금액계 = 납품수량 * 원화단가 * 1.1
                queryIdx.TotDomAmt = (parseFloat(rowDelvQty) * parseFloat(queryIdx.DomPrice.replace(/\,/g, '')) * parseFloat(mulVal[2])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');

                // 합계 수정
                for (let i in this.rows.Query) {
                    if (this.rows.Query.hasOwnProperty(i)) {
                        if (i == 0) Object.keys(this.summaryArea).map(k => this.summaryArea[k] = 0);
                        this.summaryArea.SumCurAmt = parseFloat(this.summaryArea.SumCurAmt.toString().replace(/\,/g, '')) + parseFloat(this.rows.Query[i].CurAmt.toString().replace(/\,/g, ''));
                        this.summaryArea.SumCurVAT = parseFloat(this.summaryArea.SumCurVAT.toString().replace(/\,/g, '')) + parseFloat(this.rows.Query[i].CurVAT.toString().replace(/\,/g, ''));
                        this.summaryArea.SumTotCurAmt = parseFloat(this.summaryArea.SumTotCurAmt.toString().replace(/\,/g, '')) + parseFloat(this.rows.Query[i].TotCurAmt.toString().replace(/\,/g, ''));
                        if (i == this.rows.Query.length - 1) Object.keys(this.summaryArea).map(k => this.summaryArea[k] = this.summaryArea[k].toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'));
                    }
                }
            }
        },
        updateRowRemark: function (idx = null) {
            let evtTarget = event.target;

            if (idx != null && evtTarget.name != null && evtTarget.name != undefined && evtTarget.name != '' && evtTarget.value != null && evtTarget.value != undefined && evtTarget.value != '') {
                this.rows.Query[idx][evtTarget.name] = evtTarget.value;
                this.rows.Query[idx].RowEdit = true;
                document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data');
            }
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

            GX._METHODS_
            .setMethodId(vThis.jumpSetMethodId)
            .ajax(paramsList, [function (data) {
                if (data[0].Status && data[0].Status != 0) {
                    alert(data[0].Result);
                    history.back(-1);
                } else if (data.length > 0) {
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            data[i].ROWNUM = parseInt(i) + 1;
                            data[i].RowEdit = true;
                            data[i].boolIsVAT = data[i].IsVAT != '0' ? true : false;

                            Object.keys(vThis.keyMapping).map((k) => {
                                data[i][k] = GX._METHODS_.nvl(data[i][k]).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                            });
                        }
                    }

                    // 그리드와 바인딩
                    vThis.rows.Query = data;

                    // 마스터 영역 데이터 바인딩
                    let oneData = data[0];
                    Object.keys(vThis.queryForm).map(k => {
                        if (k != 'CompanySeq' || k != 'BizUnit' || k != 'BizUnitName' || k != 'CustSeq') {
                            Object.keys(oneData).map(j => {
                                let t = '';
                                if (!isNaN(GX._METHODS_.nvl(oneData[j]))) t = GX._METHODS_.nvl(oneData[j]).toString();
                                else t = GX._METHODS_.nvl(oneData[j]);

                                if (k == j && t.length > 0) {
                                    if (k === 'DelvDate')
                                        vThis.queryForm[k] = oneData[j].length == 8 ? oneData[j].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : oneData[j];
                                    else
                                        vThis.queryForm[k] = oneData[j];
                                }
                            });
                        }
                    });
                } else {
                    alert('조회 결과가 없습니다.');
                    history.back(-1);
                }
                if (typeof callback === 'function') callback();
            }])
        },
        save: function() {
            let vThis = this;

            let params1 = [], params2 = [];
            let saveArrData = GX.deepCopy(vThis.rows.Query);

            // 수량, 금액 컬럼의 ,(쉼표) 제거
            for (let i in saveArrData) {
                Object.keys(vThis.keyMapping).map((k) => {
                    saveArrData[i][k] = GX._METHODS_.nvl(saveArrData[i][k]).toString().replace(/\,/g, '').length > 0 ? parseFloat(GX._METHODS_.nvl(saveArrData[i][k]).toString().replace(/\,/g, '')) : 0;
                });
            }
            
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
                        vThis.initSelected();
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
                    vThis.initSelected();
                    vThis.calSum();
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

                    // params1.push(params2[0]);
                    
                    GX._METHODS_
                    .setMethodId('PUDelvSave')
                    .ajax(params1, params2, [function (data) {
                    }, function (data) {
                        if (data[0].Status && data[0].Status != 0) {
                            // 뭔가 문제가 발생했을 때 리턴
                            alert('삭제 실패\n' + data[0].Result);
                        } else {
                            alert('삭제 성공');
                            vThis.initSelected();
                            vThis.search(vThis.calSum);
                        }
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
                    }, function (data) {
                        if (data[0].Status && data[0].Status != 0) {
                            // 뭔가 문제가 발생했을 때 리턴
                            alert('삭제 실패\n' + data[0].Result);
                        } else {
                            alert('삭제 성공');
                        }
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

            GX.VueGrid
            .bodyRow(':class="{\'check\':isChecked(index)}" @click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll()" /></div>', '')
                .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);" /></div>', '')
            .item('ItemNo').head('품번', '').body(null, 'text-l')
            .item('ItemName').head('품명', '').body(null, 'text-l')
            .item('Spec').head('규격', '').body(null, 'text-l')
            .item('UnitName').head('단위', '')
            .item('Qty', { styleSyntax: 'style="width: 110px;"' }).head('납품수량', '')
                .body('<div style="width: 104px;"><input type="text" style="border: 0px solid; text-align: center; background: transparent; width: 100%; text-align: right;" name="Qty" :value="row.Qty" @input="updateRowQty(index)" /></div>')
            .item('Price').head('단가', '').body(null, 'text-r')
            .item('CurAmt').head('금액', '').body(null, 'text-r')
            .item('IsVAT').head('부가세포함여부', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsVAT" v-model="row.boolIsVAT" :value="row.IsVAT" disabled="true" /></div>', '')
            .item('CurVAT').head('부가세', '').body(null, 'text-r')
            .item('TotCurAmt').head('금액계', '').body(null, 'text-r')
            .item('DomPrice').head('원화단가', '').body(null, 'text-r')
            .item('DomAmt').head('원화금액', '').body(null, 'text-r')
            .item('DomVAT').head('원화부가세', '').body(null, 'text-r')
            .item('TotDomAmt').head('원화금액계', '').body(null, 'text-r')
            .item('WHName').head('창고', '')
            .item('Remark').head('비고', '')
                .body('<div><input type="text" style="border: 0px solid; text-align: center; background: transparent; width: 100%; text-align: left;" name="Remark" :value="row.Remark" @input="updateRowRemark(index)" /></div>', '')
            .item('ColorNo').head('색상', '')
            .loadTemplate('#grid', 'rows.Query');
        }
    },
    mounted() {
        let vThis = this;

        GX.Calendar.datePicker('gx-datepicker', {
            height: '400px',
            monthSelectWidth: '25%',
            callback: function (result, attribute) {
                if (!isNaN(attribute)) {
                    vThis.rows.Query[attribute][GX.Calendar.openerName] = result;
                    vThis.rows.Query[attribute].RowEdit = true;
                    document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.add('no-data');
                } else {
                    const openerObj = document.querySelector('[name="' + GX.Calendar.openerName + '"]');
                    const info = GX.Calendar.dateFormatInfo(openerObj);
                    let keys = attribute.split('.');
                    if (keys.length == 1 && vThis[keys[0]] != null) vThis[keys[0]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                    else if (keys.length == 2 && vThis[keys[0]][keys[1]] != null) vThis[keys[0]][keys[1]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                    else if (keys.length == 3 && vThis[keys[0]][keys[1]][keys[2]] != null) vThis[keys[0]][keys[1]][keys[2]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                    vThis.updateDate(GX.formatDate(result, info.format), openerObj);
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
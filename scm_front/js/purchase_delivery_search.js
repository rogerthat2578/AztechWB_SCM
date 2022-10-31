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
         */
        queryForm: {
            CompanySeq: '',
            BizUnit: '',
            BizUnitName: '',
            DelvDateFr: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            DelvDateTo: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            SMCurrStatus: 0,
            SMCurrStatusName: '전체',
            PONo: '',
            DelvNo: '',
            ItemName: '',
            ItemNo: '',
            Spec: '',
        },
        SMCurrStatusList: [
            { key: 0, val: '전체' },
            { key: 1, val: '진행중' },
            { key: 2, val: '작성' },
            { key: 3, val: '확정' },
            // '전체', '진행중', '작성', '확정'
        ],
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
        keyCombi: {
            Control: false,
            Q: false,
        },
        isCheckList: [],
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
                    vThis.search();
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
				location.href = 'login.html';
			}
		},
        /**조회 조건의 진행상태 열기/닫기 */
        openCloseDropBox: function() {
            let e = event;

            if (e.target.nodeName.toUpperCase() === 'LI') {
                this.queryForm.SMCurrStatus = e.target.value;
                this.queryForm.SMCurrStatusName = e.target.innerText;
                e.target.parentNode.style.display = 'none';
            } else {
                if (e.target.nextElementSibling.style.display == 'none' || e.target.nextElementSibling.style.display == '')
                    e.target.nextElementSibling.style.display = 'block';
                else
                    e.target.nextElementSibling.style.display = 'none';
            }
        },
        /**날짜 번경 후처리
         * v: 날짜
         * o: 날짜 input 엘리먼트
         */
        updateDate: function(v = '', o = null) {
            if (v && o) {
                let vThis = this;

                let selEle = o;
                let selVal = v;
                let selEleName = selEle.getAttribute('name');
                if (selEleName.indexOf('Fr') > -1) { // 선택한 날짜가 from일 때 to와 비교.
                    if (new Date(selVal) > new Date(vThis.queryForm[selEleName.replace('Fr', 'To')])) {
                        let msg = selEle.parentNode.parentNode.childNodes[0].childNodes[0].innerText;
                        alert(msg + '이(가) 비정상입니다.');
                        vThis.queryForm[selEleName] = vThis.queryForm[selEleName.replace('Fr', 'To')];
                    }
                } else if (selEleName.indexOf('To') > -1) { // 선택한 날짜가 to일 때 from과 비교.
                    if (new Date(selVal) < new Date(vThis.queryForm[selEleName.replace('To', 'Fr')])) {
                        let msg = selEle.parentNode.parentNode.childNodes[0].childNodes[0].innerText;
                        alert(msg + '이(가) 비정상입니다.');
                        vThis.queryForm[selEleName] = vThis.queryForm[selEleName.replace('To', 'Fr')];
                    }
                }
            }
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
            vThis.queryForm.DelvDateFr = new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-");
            vThis.queryForm.DelvDateTo = new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-");
            vThis.queryForm.SMCurrStatus = 0;
            vThis.queryForm.SMCurrStatusName = '전체';
            vThis.queryForm.PONo = '';
            vThis.queryForm.ItemName = '';
            vThis.queryForm.ItemNo = '';
            vThis.queryForm.Spec = '';
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

            GX.doubleClickRun(event.target, function () {
                if (confirm('입력 화면으로 이동하시겠습니까?')) {
                    let tempObj = {}, jumpData = [];
                    tempObj.DelvSeq = vThis.rows.Query[idx].DelvSeq;
                    tempObj.DelvSerl = vThis.rows.Query[idx].DelvSerl;
                    jumpData.push(tempObj);
                    if (jumpData.length > 0 && !isNaN(tempObj.DelvSeq) && !isNaN(tempObj.DelvSerl)) {
                        GX.SessionStorage.set('jumpData', JSON.stringify(jumpData));
                        GX.SessionStorage.set('jumpSetMethodId', 'DelvItemListJump');
                        location.href = 'purchase_delivery.html';
                    } else 
                        alert('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
                }
            });
        },
        /**조회 */
        search: function(callback) {
            let vThis = this;

            vThis.initKeyCombi();

            let params = GX.deepCopy(vThis.queryForm);

            Object.keys(params).map((k) => {
                if (k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1) {
                    if (params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
            });

            GX._METHODS_
            .setMethodId('DelvItemListQuery')
            .ajax([params], [function (data) {
                if (data.length > 0) {
                    let summaryList = {sumQty: 0, sumCurAmt: 0, sumCurVAT: 0, sumTotCurAmt: 0, sumRemainQty: 0, sumDelvQty: 0, sumDelvCurAmt: 0};
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            data[i].ROWNUM = parseInt(i) + 1;
                            data[i].DelvInDate = data[i].DelvInDate.length == 8 ? (data[i].DelvInDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvInDate;
                            data[i].PODate = data[i].PODate.length == 8 ? (data[i].PODate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].PODate;
                            data[i].DelvDate = data[i].DelvDate.length == 8 ? (data[i].DelvDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvDate;

                            Object.keys(summaryList).map((k) => {
                                if (!isNaN(data[i][k.replace('sum', '')]))
                                    summaryList[k] += parseFloat(data[i][k.replace('sum', '')]);
                            });
                        }
                    }

                    // bind data, bind summary data
                    vThis.rows.Query = data;
                    vThis.rows.QuerySummary = summaryList;
                } else {
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
                    alert('조회 결과가 없습니다.');
                }
                if (typeof callback === 'function') callback();
            }])
        },
        save: function() {
            let vThis = this;

            let saveArrData = GX.deepCopy(vThis.rows.Query);

            // DataBlock1에 공통으로 들어가야하는 파라메터 세팅
            for (let i = saveArrData.length - 1; i >= 0; i--) {
                if (saveArrData[i].RowEdit) {
                    saveArrData[i].IDX_NO = saveArrData[i].ROWNUM;
                    saveArrData[i].WorkingTag = 'U';
                    saveArrData[i].DelvPlanDate = saveArrData[i].DelvPlanDate.indexOf('-') > -1 ? saveArrData[i].DelvPlanDate.replace(/\-/g, "") : saveArrData[i].DelvPlanDate;
                } else {
                    saveArrData.splice(i, 1);
                }
            }

            if (saveArrData.length > 0) {
                GX._METHODS_
                .setMethodId('PUORDPOSave')
                .ajax(saveArrData, [], [function (data) {
                    vThis.initSelected();
                    vThis.initKeyCombi();
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
                    alert('저장 성공');
                    vThis.search();
                }, function (data) {
                }]);
            } else {
                alert('파라메터 세팅 중<br>예외사항 발생.');
            }
        },
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login');
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
            .bodyRow('@click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('SMDelvInTypeName').head('입고진행상태', '')
            .item('DelvDate').head('납품일', '')
            .item('PODate').head('발주일', '')
            .item('PONo').head('발주번호', '')
            .item('SMQcTypeName').head('검사구분', '')
            .item('DelvInDate').head('입고일', '')
            .item('ItemNo').head('품번', '').body(null, 'text-l')
            .item('ItemName').head('품명', '').body(null, 'text-l')
            .item('Spec').head('규격', '').body(null, 'text-l')
            .item('UnitName').head('단위', '')
            .item('Price').head('납품단가', '').body(null, 'text-r')
            .item('Qty').head('금회납품수량', '').body(null, 'text-r')
            .item('IsVAT').head('부가세여부', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsVAT" :value="row.IsVAT" disabled="true" /></div>', '')
            .item('CurAmt').head('금액', '').body(null, 'text-r')
            .item('CurVAT').head('부가세', '').body(null, 'text-r')
            .item('TotCurAmt').head('금액계', '').body(null, 'text-r')
            .item('CurrName').head('통화', '')
            .item('ExRate').head('환율', '')
            .item('DomPrice').head('원화단가', '').body(null, 'text-r')
            .item('DomAmt').head('원화금액', '').body(null, 'text-r')
            .item('DomVAT').head('원화부가세', '').body(null, 'text-r')
            .item('TotDomAmt').head('원화금액계', '').body(null, 'text-r')
            .item('WHName').head('창고', '')
            .item('Remark').head('비고', '')
            .item('SizeName').head('사이즈', '')
            .item('Purpose').head('용도', '')
            .item('ColorNo').head('색상', '')
            .item('OrderItemNo').head('Order품번', '')
            .item('OrderItemName').head('Order품명', '')
            .item('UseSelect').head('사용부위', '')
            .item('BuyerNo').head('Buyer No.', '')
            .item('BangJukTypeName').head('방적형태', '')
            .item('ProcureName').head('조달형태', '')
            .item('ColorGbn').head('담농색구분', '')
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
    }
});
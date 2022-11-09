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
            PODateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            PODateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            DelvPlanDateFr: '',
            DelvPlanDateTo: '',
            SMCurrStatus: 0,
            SMCurrStatusName: '전체',
            PONo: '',
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
                    vThis.search(vThis.addSummary);
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
            vThis.queryForm.PODateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.PODateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.DelvPlanDateFr = '';
            vThis.queryForm.DelvPlanDateTo = '';
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
                    tempObj.POSeq = vThis.rows.Query[idx].POSeq;
                    tempObj.POSerl = vThis.rows.Query[idx].POSerl;
                    jumpData.push(tempObj);
                    if (jumpData.length > 0 && !isNaN(tempObj.POSeq) && !isNaN(tempObj.POSerl)) {
                        GX.SessionStorage.set('jumpData', JSON.stringify(jumpData));
                        GX.SessionStorage.set('jumpSetMethodId', 'PUORDPOJump');
                        location.href = 'purchase_delivery.html';
                    } else 
                        alert('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
                }
            });
        },
        /**납품등록 화면으로 점프. 여러행 */
        pageJump: function () {
            let vThis = this;

            let jumpData = [];
            for (let i in vThis.isCheckList) {
                if (vThis.isCheckList.hasOwnProperty(i)) {
                    let tempObj = {};
                    tempObj.POSeq = vThis.rows.Query[vThis.isCheckList[i]].POSeq;
                    tempObj.POSerl = vThis.rows.Query[vThis.isCheckList[i]].POSerl;
                    jumpData.push(tempObj);
                }
            }

            /**
             * sessionStorage 사용.
             * > 해당 탭 닫으면 없어짐.
             * > 현재 PDA, SCM이 돌고있는 Web Server를 수정할 수 없음.
             */
            if (jumpData.length > 0) {
                GX.SessionStorage.set('jumpData', JSON.stringify(jumpData));
                GX.SessionStorage.set('jumpSetMethodId', 'PUORDPOJump');
                location.href = 'purchase_delivery.html';
            } else
                alert('선택한 행이 없습니다.')
        },
        /**
         * 소계 행 추가
         */
        addSummary: function () {
            let vThis = this;

            if (document.querySelectorAll('[id="grid"] table thead tr').length > 1) {
                for (let i in document.querySelectorAll('[id="grid"] table thead tr')) {
                    if (document.querySelectorAll('[id="grid"] table thead tr').hasOwnProperty(i) && i > 0)
                        document.querySelectorAll('[id="grid"] table thead tr')[i].remove();
                }
            }

            if (vThis.rows.Query.length > 0) {
                let objQeury = GX.deepCopy(vThis.rows.QuerySummary);
                let trList = document.querySelectorAll('[id="grid"] table thead tr td');
                let strTd = '';
                const keyMapping = {
                    sumQty: '발주수량',
                    sumCurAmt: '발주금액',
                    sumCurVAT: '부가세',
                    sumTotCurAmt: '금액계',
                    sumRemainQty: '미납수량',
                    sumDelvQty: '납품수량',
                    sumDelvCurAmt: '납품금액'
                }

                for (let i in trList) {
                    if (trList.hasOwnProperty(i)) {
                        if (i >= 11 && i <= 18 && i != 12) {
                            Object.keys(keyMapping).forEach(k => {
                                if (trList[i].innerText == keyMapping[k])
                                    strTd += '<td class="text-r">' + objQeury[k].toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,') + '</td>';
                            });
                        } else { 
                            strTd += '<td></td>';
                        }
                    }
                }

                let createTr = document.createElement('tr');
                createTr.style.backgroundColor = '#e0fec0';
                createTr.style.color = 'black';
                createTr.innerHTML = strTd;
                document.querySelector('[id="grid"] table thead').append(createTr);
            }
        },
        /**조회 */
        search: function(callback) {
            let vThis = this;

            vThis.initKeyCombi();
            vThis.initSelected();

            let params = GX.deepCopy(vThis.queryForm);

            Object.keys(params).map((k) => {
                if (k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1) {
                    if (params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
            });

            GX._METHODS_
            .setMethodId('PUORDPOQuery')
            .ajax([params], [function (data) {
                if (data.length > 0) {
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
                    
                    // data for loop
                    let noDataIndex = [];
                    let summaryList = {sumQty: 0, sumCurAmt: 0, sumCurVAT: 0, sumTotCurAmt: 0, sumRemainQty: 0, sumDelvQty: 0, sumDelvCurAmt: 0, Price: 0 /**Price: 화면에 표시X */};
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            data[i].ROWNUM = parseInt(i) + 1;
                            data[i].RowEdit = false;
                            data[i].PODate = data[i].PODate.length == 8 ? (data[i].PODate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].PODate;
                            data[i].DelvDate = data[i].DelvDate.length == 8 ? (data[i].DelvDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvDate;
                            
                            if (data[i].DelvPlanDate != null && data[i].DelvPlanDate.replace(/\ /g, '') != '' && data[i].DelvPlanDate != undefined) {
                                data[i].DelvPlanDate = data[i].DelvPlanDate.length == 8 ? (data[i].DelvPlanDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvPlanDate;
                            } else {
                                data[i].DelvPlanDate = data[i].DelvDate.length == 8 ? (data[i].DelvDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvDate;
                                noDataIndex.push(i);
                            }

                            Object.keys(summaryList).map((k) => {
                                if(data[i][k.replace('sum', '')]) {
                                    if (!isNaN(GX._METHODS_.nvl(data[i][k.replace('sum', '')]))) {
                                        summaryList[k] += parseFloat(data[i][k.replace('sum', '')]);
                                        data[i][k.replace('sum', '')] = GX._METHODS_.nvl(data[i][k.replace('sum', '')]).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                                    } else
                                        summaryList[k] += 0;
                                }
                            });
                        }
                    }

                    // bind data, bind summary data
                    vThis.rows.Query = data;
                    vThis.rows.QuerySummary = summaryList;

                    /**DOM에 아직 그리드(table tags)가 다 그려지지 않아서 바로 DOM에 접근하면 Element를 못찾음... setTimeout 그냥 쓸까..? */
                    // element for loop
                    if (noDataIndex.length > 0) {
                        setTimeout(() => {
                            for (let i in noDataIndex) {
                                if (noDataIndex.hasOwnProperty(i)) {
                                    document.getElementsByName('DelvPlanDate')[noDataIndex[i]].parentNode.parentNode.classList.add('no-data');
                                    vThis.rows.Query[noDataIndex[i]].RowEdit = true;
                                }
                            }
                        }, 20);
                    }
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

            console.log()

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
                    vThis.search(vThis.addSummary);
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
            .bodyRow(':class="{\'check\':isChecked(index)}" @click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll()" /></div>', '')
                .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);" /></div>', '')
            .item('SMCurrStatusName').head('진행상태', '')
            .item('PODate').head('발주일', '')
            .item('PONo').head('발주번호', '')
            .item('DelvDate').head('납기일', '')
            .item('DelvPlanDate', { styleSyntax: 'style="width: 92px;"' }).head('납품예정일', '')
                .body('<div style="width: 90px;"><input type="text" class="datepicker" name="DelvPlanDate" gx-datepicker="" attr-condition="" :value="row.DelvPlanDate" @input="updateRowDelvPlanDate(index)" @click="applyAll(\'DelvPlanDate\', index)" style="border: 0px solid; text-align: center; background: transparent; width: 100%;" /></div>')
            .item('ItemNo').head('품번', '').body(null, 'text-l')
            .item('ItemName').head('품명', '').body(null, 'text-l')
            .item('Spec').head('규격', '').body(null, 'text-l')
            .item('UnitName').head('단위', '')
            .item('Qty').head('발주수량', '').body(null, 'text-r')
            .item('Price').head('발주단가', '').body(null, 'text-r')
            .item('CurAmt').head('발주금액', '').body(null, 'text-r')
            .item('CurVAT').head('부가세', '').body(null, 'text-r')
            .item('TotCurAmt').head('금액계', '').body(null, 'text-r')
            .item('RemainQty').head('미납수량', '').body(null, 'text-r')
            .item('DelvQty').head('납품수량', '').body(null, 'text-r')
            .item('DelvCurAmt').head('납품금액', '').body(null, 'text-r')
            .item('WHName').head('입고창고', '')
            .item('Remark1').head('비고', '')
            .item('OrderItemName').head('Order품명', '')
            .item('OrderItemNo').head('Order품번', '')
            .item('OrderSpec').head('Order규격', '')
            .item('BuyerNo').head('Buyer No.', '')
            .item('SizeName').head('사이즈', '')
            .item('ColorNo').head('색상', '').body(null, 'text-l')
            .item('UseSelect').head('사용부위', '').body(null, 'text-l')
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
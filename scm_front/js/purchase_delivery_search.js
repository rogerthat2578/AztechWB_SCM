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
        },
        SMCurrStatusList: [],
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
        keyCombi: {
            Control: false,
            Q: false,
        },
        isCheckList: [],
        // 부서 리스트
        DeptNameList: [],
        // 부서 리스트
        KeepDeptNameList: [],
        // 담당자 리스트 (퇴사 제외)
        EmpNameList: [],
        // 담당자 리스트 (퇴사 제외)
        KeepEmpNameList: [],
	},
    methods: {
        /**이벤트 처리 */
        eventCheck: function() {
            let vThis = this;
            let e = event;

			// Click Event
            if(e.type === 'click'){
                if(document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu'){
                    document.getElementsByClassName('left-menu')[0].style.display = 'none';
                }

                if((document.getElementsByClassName('drop-box')[0].style.display === 'block' || document.getElementsByClassName('drop-box')[1].style.display === 'block' || document.getElementsByClassName('drop-box')[2].style.display === 'block') && e.target.getAttribute('class') !== 'drop-box-input'){
                    document.getElementsByClassName('drop-box')[0].style.display = 'none';
                    document.getElementsByClassName('drop-box')[1].style.display = 'none';
                    document.getElementsByClassName('drop-box')[2].style.display = 'none';
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
                }
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
        init: function () {
            let vThis = this;
            vThis.initKeyCombi();
            vThis.initSelected();
            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};
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
                    sumPrice: '납품단가',
                    sumQty: '금회납품수량',
                    sumCurAmt: '금액',
                    sumCurVAT: '부가세',
                    sumTotCurAmt: '금액계',
                    sumDomPrice: '원화단가',
                    sumDomAmt: '원화금액',
                    sumDomVAT: '원화부가세',
                    sumTotDomAmt: '원화금액계'
                }

                // 합계란 만들기
                for (let i in trList) {
                    if (trList.hasOwnProperty(i)) {
                        if (i >= 13 && i <= 24 && i != 15 && i != 19 && i != 20) {
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

            let regex = new RegExp(/(\d)(?=(?:\d{3})+(?!\d))/g);
            
            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};

            GX._METHODS_
            .setMethodId('DelvItemListQuery')
            .ajax([params], [function (data) {
                if (data.length > 0) {
                    let summaryList = {sumPrice: 0, sumQty: 0, sumCurAmt: 0, sumCurVAT: 0, sumTotCurAmt: 0, sumDomPrice: 0, sumDomAmt: 0, sumDomVAT: 0, sumTotDomAmt: 0};
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            data[i].ROWNUM = parseInt(i) + 1;
                            data[i].DelvInDate = data[i].DelvInDate.length == 8 ? (data[i].DelvInDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvInDate;
                            data[i].PODate = data[i].PODate.length == 8 ? (data[i].PODate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].PODate;
                            data[i].DelvDate = data[i].DelvDate.length == 8 ? (data[i].DelvDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvDate;

                            Object.keys(summaryList).map((k) => {
                                if(data[i][k.replace('sum', '')]) {
                                    if (!isNaN(GX._METHODS_.nvl(data[i][k.replace('sum', '')]))) {
                                        summaryList[k] += parseFloat(data[i][k.replace('sum', '')]);
                                        data[i][k.replace('sum', '')] = GX._METHODS_.nvl(data[i][k.replace('sum', '')]).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                                    } else
                                        summaryList[k] += 0;

                                    if (GX._METHODS_.nvl(summaryList[k].toString().split('.')[1]).length > 0)
                                        summaryList[k] = parseFloat(summaryList[k].toFixed(2));
                                }
                            });
                        }
                    }

                    // 추가. 단가 = 금액합 / 수량합
                    let valSumPrice = summaryList.sumPrice.toString().replace(/\,/g, '');
                    let valSumQty = summaryList.sumQty.toString().replace(/\,/g, '');
                    if (isNaN(valSumPrice)) valSumPrice = 0; // 분자
                    if (isNaN(valSumQty)) valSumQty = 1; // 분모
                    else { if (parseFloat(valSumQty) <= 0) valSumQty = 1 }
                    summaryList.sumPrice = (parseFloat(valSumPrice) / parseFloat(valSumQty)).toFixed(2).toString().replace(regex, '$1,');

                    // bind data, bind summary data
                    vThis.rows.Query = data;
                    vThis.rows.QuerySummary = summaryList;
                } else {
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
                    vThis.search(vThis.addSummary);
                }, function (data) {
                }]);
            } else {
                alert('파라메터 세팅 중<br>예외사항 발생.');
            }
        },

        /**엑셀 다운로드 xlxs */
        excelDownload: function () {
            GX._METHODS_.excelDownload(document.querySelector('[id="grid"] table'));
        },

        /**비고 클릭 시 alert 대신 Toast 띄우기 */
        alertToast: function (text = '') {
            toastr.info(text);
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
                    if (typeof vThis['Keep' +k] === 'object') vThis['Keep' + k] = vThis[k];
                }]);
            });

            GX.VueGrid
            .bodyRow('@click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('SMDelvInTypeName').head('입고진행상태', '')
            .item('DelvDate').head('납품일', '')
            .item('PODate').head('발주일', '')
            .item('PODeptName').head('발주부서', '')
            .item('POEmpName').head('발주담당', '')
            // .item('PONo').head('발주번호', '')
            // .item('SMQcTypeName').head('검사구분', '')
            .item('DelvInDate').head('입고일', '')
            .item('OrderItemNo').head('Order품번', '').body(null, 'text-l')
            .item('BuyerNo').head('Buyer No.', '').body(null, 'text-l')
            .item('ItemNo').head('품번', '').body(null, 'text-l')
            .item('ItemName').head('품명', '')
                .body('<div style="width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" @click="alertToast(row.ItemName)">{{row.ItemName}}</div>', 'text-l')
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
                .body('<div style="width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" @click="alertToast(row.Remark)">{{row.Remark}}</div>', 'text-l')
            .item('SizeName').head('사이즈', '')
            // .item('Purpose').head('용도', '')
            .item('ColorNo').head('색상', '')
                .body('<div style="width: 140px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" @click="alertToast(row.ColorNo)">{{row.ColorNo}}</div>', 'text-l')
            // .item('OrderItemName').head('Order품명', '').body(null, 'text-l')
            // .item('UseSelect').head('사용부위', '').body(null, 'text-l')
            // .item('BangJukTypeName').head('방적형태', '')
            // .item('ProcureName').head('조달형태', '')
            // .item('ColorGbn').head('담농색구분', '')
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
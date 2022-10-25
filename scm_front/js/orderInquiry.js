let app = new Vue({
	el: '#app',
	data: {
		leftMenu: GX._METHODS_.createLeftMenu(),
		deptName: GX.Cookie.get('DeptName'),
		userName: GX.Cookie.get('UserName'),
		params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트
        /**
         * rows.Query 조회 결과
         * rows.QuerySummary 조회 결과 합계
         */
		rows: {
            Query: [],
            QuerySummary: [],
        },
        /**
         * 조회 조건
         */
        queryForm: {
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            PODateFr: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            PODateTo: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            DelvPlanDateFr: '',
            DelvPlanDateTo: '',
            ProcStatus: '전체',
            PoNo: '',
            ItemNm: '',
            ItemNo: '',
            Spec: '',
            test: '',
        },
        procStatusList: [
            '전체', '진행중', '작성', '확정'
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
                } else if (e.key.toLowerCase() === 'q') {
                    vThis.keyCombi.Q = true;
                }

                if (vThis.keyCombi.Control && vThis.keyCombi.Q) {
                    console.log('조회 실행')
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
                this.queryForm.ProcStatus = e.target.innerText;
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
         * o: 날짜 input 엘러먼트
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
        /**조회 */
        search: function() {
            let vThis = this; 

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
                    // data for loop
                    let sumQty, sumCurAmt, sumCurVAT, sumTotCurAmt, sumRemainQty, sumDelvQty, sumDelvCurAmt = 0;
                    let noDataIndex = [];
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            data[i].ROWNUM = parseInt(i) + 1;
                            data[i].PODate = data[i].PODate.length == 8 ? (data[i].PODate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].PODate;
                            data[i].DelvDate = data[i].DelvDate.length == 8 ? (data[i].DelvDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvDate;
                            if (data[i].DelvPlanDate != null && data[i].DelvPlanDate.replace(/\ /g, '') != '' && data[i].DelvPlanDate != undefined) {
                                data[i].DelvPlanDate = data[i].DelvPlanDate.length == 8 ? (data[i].DelvPlanDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvPlanDate;
                            } else {
                                data[i].DelvPlanDate = data[i].DelvDate.length == 8 ? (data[i].DelvDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvDate;
                                noDataIndex.push(i);
                            }
                            sumQty += parseFloat(data[i].Qty)
                            sumCurAmt += parseFloat(data[i].CurAmt)
                            sumCurVAT += parseFloat(data[i].CurVAT)
                            sumTotCurAmt += parseFloat(data[i].TotCurAmt)
                            sumRemainQty += parseFloat(data[i].RemainQty)
                            sumDelvQty += parseFloat(data[i].DelvQty)
                            sumDelvCurAmt += parseFloat(data[i].DelvCurAmt)
                        }
                    }
                    // bind data
                    vThis.rows.Query = data;

                    /**DOM에 아직 그리드가 다 그려지지 않음... setTimeOut 그냥 쓸까..? */
                    // element for loop
                    // if (noDataIndex.length > 0) {
                    //     for (let i in noDataIndex) {
                    //         if (noDataIndex.hasOwnProperty(i)) {
                    //             setTimeout(() => {
                    //                 console.log('DDDDDDDDDDDD ',document.getElementsByName('DelvPlanDate')[i])
                    //             },10)
                    //             console.log('TTTTTTTTTTT ',document.getElementsByName('DelvPlanDate')[i])
                    //             // document.getElementsByName('DelvPlanDate')[i].parentNode.parentNode.classList.add('no-data')
                    //         }
                    //     }
                    // }
                } else {
                    alert('조회 결과가 없습니다.');
                }
            }])
        },
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');
			
			document.addEventListener('click', vThis.eventCheck, false);
            document.addEventListener('keyup', vThis.eventCheck, false);

            // 사업단위가 여러개일 수 있기에 아래와 같이 set/get함
            let objBizUnitList = JSON.parse(GX.Cookie.get('BizUnit_JsonFormatStringType'));
            Object.keys(objBizUnitList).map((k) => {
                vThis.BizUnitList.push(objBizUnitList[k]);
            });
            vThis.queryForm.CompanySeq = vThis.BizUnitList[0].CompanySeq;
            vThis.queryForm.BizUnit = vThis.BizUnitList[0].BizUnit;
            vThis.queryForm.BizUnitName = vThis.BizUnitList[0].BizUnitName;

            GX.VueGrid
            .bodyRow(':class="{\'check\':isChecked(index)}"')
            .item('ROWNUM').head('No.', '')
            .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll()" /></div>', '')
                .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);" /></div>', '')
            .item('SMCurrStatusName').head('진행상태', '')
            .item('PODate').head('발주일', '')
            .item('PONo').head('발주번호', '')
            .item('DelvDate').head('납기일', '')
            .item('DelvPlanDate').head('납품예정일', '')
                .body('<div><input type="text" class="datepicker" name="DelvPlanDate" gx-datepicker="" attr-condition="" :value="row.DelvPlanDate" @click="applyAll(\'DelvPlanDate\', index)" style="border: 0px solid; background: transparent;" /></div>')
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
            .item('SizeName').head('사이즈', '')
            .item('ColorNo').head('색상', '')
            .item('UseSelect').head('사용부위', '')
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
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
            DelvDate: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            DelvNo: '',
            RemarkM: '',
            SMImpType: 8008001,
            SMImpTypeName: '내수',
            CurrName: '',
            ExRate: '',
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
				location.href = 'login.html';
			}
		},
        /**조회 조건의 진행상태 열기/닫기 */
        openCloseDropBox: function() {
            let e = event;

            if (e.target.nodeName.toUpperCase() === 'LI') {
                this.queryForm.SMImpType = e.target.value;
                this.queryForm.SMImpTypeName = e.target.innerText;
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
            
            if (vThis.rows.Query.length > 0) {
                let calList = GX.deepCopy(vThis.rows.Query);
                for (let i in calList) {
                    if (calList.hasOwnProperty(i)) {
                        Object.keys(vThis.summaryArea).map(k => {
                            if (!isNaN(calList[i][k.replace('Sum', '')]))
                                vThis.summaryArea[k] += parseFloat(calList[i][k.replace('Sum', '')]);
                        });
                    }
                }
            }
        },
        /**조회 */
        search: function(callback) {
            let vThis = this; 

            let params = GX.deepCopy(vThis.queryForm);
            
            let paramsList = [];
            for (let i in vThis.jumpDataList) {
                if (vThis.jumpDataList.hasOwnProperty(i))
                    paramsList.push(Object.assign(params, vThis.jumpDataList[i]));
            }

            GX._METHODS_
            .setMethodId(vThis.jumpSetMethodId)
            .ajax(paramsList, [function (data) {
                if (data.length > 0) {
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            data[i].ROWNUM = parseInt(i) + 1;
                        }
                    }
                    // 그리드와 바인딩
                    vThis.rows.Query = data;

                    // 마스터 영역 데이터 바인딩
                    let oneData = data[0];
                    Object.keys(vThis.queryForm).map(k => {
                        if (k != 'CompanySeq' || k != 'BizUnit' || k != 'BizUnitName') {
                            Object.keys(oneData).map(j => {
                                if (k == j && GX._METHODS_.nvl(oneData[j]).length > 0) {
                                    if (k === 'DelvDate')
                                        vThis.queryForm[k] = oneData[j].length == 8 ? oneData[j].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : oneData[j];
                                    else
                                        vThis.queryForm[k] = oneData[j];
                                }
                            });
                        }
                    });
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
                    saveArrData[i].DelvDate = saveArrData[i].DelvDate.indexOf('-') > -1 ? saveArrData[i].DelvDate.replace(/\-/g, "") : saveArrData[i].DelvDate;
                } else {
                    saveArrData.splice(i, 1);
                }
            }

            if (saveArrData.length > 0) {
                GX._METHODS_
                .setMethodId('')
                .ajax(saveArrData, [], [function (data) {
                    vThis.initSelected();
                    vThis.initKeyCombi();
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
                    alert('저장 성공');
                }, function (data) {
                }]);
            } else {
                alert('파라메터 세팅 중<br>예외사항 발생.');
            }
        },
        delRow: function () {
            let vThis = this;
            
            if (vThis.rows.Query.length < 1 || vThis.isCheckList.length == 0) {
                alert('삭제할 데이터가 없습니다<br>삭제할 데이터를 선택 후<br>삭제해주세요.');
            } else if (vThis.rows.Query.length == vThis.isCheckList.length) {
                // 전체 선택 시 전체 삭제
                if (confirm('모든 데이터를 삭제하시겠습니까?')) {
                    vThis.del();
                }
            } else {
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
            }
        },
        del: function () {
            let vThis = this;

            alert('전체 삭제');
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
            .item('ItemNo').head('품번', '').body(null, 'text-l')
            .item('ItemName').head('품명', '').body(null, 'text-l')
            .item('Spec').head('규격', '').body(null, 'text-l')
            .item('UnitName').head('단위', '')
            .item('Qty').head('납품수량', '')
                .body('<div><input type="text" style="border: 0px solid; text-align: center; background: transparent;" /></div>', '')
            .item('Price').head('단가', '').body(null, 'text-r')
            .item('CurAmt').head('금액', '').body(null, 'text-r')
            .item('IsVAT').head('부가세여부', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsVAT" :value="row.IsVAT" disabled="true" /></div>', '')
            .item('CurVAT').head('부가세', '').body(null, 'text-r')
            .item('TotCurAmt').head('금액계', '').body(null, 'text-r')
            .item('DomPrice').head('원화단가', '').body(null, 'text-r')
            .item('DomAmt').head('원화금액', '').body(null, 'text-r')
            .item('DomVAT').head('원화부가세', '').body(null, 'text-r')
            .item('TotDomAmt').head('원화금액계', '')
            .item('WHName').head('창고', '')
            .item('Remark').head('비고', '')
                .body('<div><input type="text" style="border: 0px solid; text-align: center; background: transparent;" /></div>', '')
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
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
         */
		rows: {
            Query: [],
        },
        /**
         * 조회 조건
         */
        queryForm: {
            CompanySeq: '1',
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
        /**조회 */
        search: function() {
            let vThis = this; 

            let params = GX.deepCopy(vThis.queryForm);

            console.log(params)

            GX._METHODS_
            .setMethodId('')
            .ajax([params], [function (data) {
                console.log(data)
            }])
        },
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_finger.gif" alt=""></div>', 'prepend');
			
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
            .item('ROWNUM').head('번호', 'num')
            .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="" /></div>', '')
            .body('<div class="chkBox"></div>', '')
            .item('ROWNUM').head('No.', '')
            .item('SMCurrStatusName').head('진행상태', '')
            .item('PODate').head('발주일', '')
            .item('PONo').head('발주번호', '')
            .item('DelvDate').head('납기일', '')
            .item('DelvPlanDate').head('납품예정일', '')
            .item('ItemNo').head('품번', '')
            .item('ItemName').head('품명', '')
            .item('Spec').head('규격', '')
            .item('UnitName').head('단위', '')
            .item('Qty').head('발주수량', '')
            .item('Price').head('발주단가', '')
            .item('CurAmt').head('발주금액', '')
            .item('CurVAT').head('부가세', '')
            .item('TotCurAmt').head('금액계', '')
            .item('RemainQty').head('미납수량', '')
            .item('DelvQty').head('납품수량', '')
            .item('DelvCurAmt').head('납품금액', '')
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
                const openerObj = document.querySelector('[name="' + GX.Calendar.openerName + '"]');
                const info = GX.Calendar.dateFormatInfo(openerObj);
                let keys = attribute.split('.');
                if (keys.length == 1 && vThis[keys[0]] != null) vThis[keys[0]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                else if (keys.length == 2 && vThis[keys[0]][keys[1]] != null) vThis[keys[0]][keys[1]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                else if (keys.length == 3 && vThis[keys[0]][keys[1]][keys[2]] != null) vThis[keys[0]][keys[1]][keys[2]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                vThis.updateDate(GX.formatDate(result, info.format), openerObj);
            }
        });
    }
});
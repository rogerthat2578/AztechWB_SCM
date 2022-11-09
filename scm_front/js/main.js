let app = new Vue({
	el: '#app',
	data: {
		leftMenu: GX._METHODS_.createLeftMenu(),
		deptName: '',
		userName: '',
		params: GX.getParameters(),
		BizUnitList: [], // 사업 단위 리스트
		/**
		 * 조회 결과
         * rows.NoticeQuery 공지사항 1,2
		 * rows.PODelvQuery 발주/납품 카드
		 * rows.POItemQuery 발주 품목 현황
		 * rows.PODelvMonthQuery 발주/납품 월별 현황
		 * rows.OrdRptQuery 작업지시/실적 카드
		 * rows.OrdItemQuery 작업지시 품목 조회
		 * rows.OrdRptMonthQuery 작업지시/실적 월별 현황
         */
		 rows: {
            NoticeQuery: [],
			PODelvQuery: {
				DelvTotBfDomAmt: 0,
				DelvTotBfQty: 0,
				DelvTotDayDomAmt: 0,
				DelvTotDayQty: 0,
				DelvTotDomAmt: 0,
				DelvTotQty: 0,
				PODelvRate: 0,
				POLessDomAmt: 0,
				POLessQty: 0,
				POTotBfDomAmt: 0,
				POTotBfQty: 0,
				POTotDayDomAmt: 0,
				POTotDayQty: 0,
				POTotDomAmt: 0,
				POTotQty: 0,
			},
			POItemQuery: [],
			PODelvMonthQuery: [],
			OrdRptQuery: {
				OrdTotBfDomAmt: 0,
				OrdTotBfQty: 0,
				OrdTotDayDomAmt: 0,
				OrdTotDayQty: 0,
				OrdTotDomAmt: 0,
				OrdTotQty: 0,
				OrdOkRate: 0,
				OrdLessDomAmt: 0,
				OrdLessQty: 0,
				RptTotBfDomAmt: 0,
				RptTotBfQty: 0,
				RptTotDayDomAmt: 0,
				RptTotDayQty: 0,
				RptTotDomAmt: 0,
				RptTotQty: 0,
				RptBadDomAmt: 0,
				RptBadQty: 0,
				RptBadRate: 0,
			},
			OrdItemQuery: [],
			OrdRptMonthQuery: [],
			ChartMonthDataLabel: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			POAmtValue: [],
			DelvAmtValue: [],
			BadRateValuePODelv: [],
			OkRateValuePODelv: [],
			OrdAmtValue: [],
			RptAmtValue: [],
			BadRateValueOrdRpt: [],
			OkRateValueOrdRpt: [],
			poDelvCtx1: null,
			poDelvCtx2: null,
			ordRptCtx1: null,
			ordRptCtx2: null,
			poDelvChartObj1: null,
			poDelvChartObj2: null,
			ordRptChartObj1: null,
			ordRptChartObj2: null,
        },
		/**
         * 조회 조건
         */
		 queryForm: {
            CompanySeq: '',
            BizUnit: '',
			DateYear: new Date().toLocaleDateString().substring(0, 4),
			CustSeq: '',
        },
		YearList: [],
		ValTimer: null,
	},
    methods: {
        /**이벤트 처리 */
        eventCheck: function() {
            let vThis = this;
            let e = event;
            
			// 메뉴 여닫는 버튼 클릭을 제외한 다른 영역 클릭 시 메뉴 닫기
			if (e.type === 'click' && document.getElementsByClassName('left-menu')[0].style.display === 'block'
				&& e.target.getAttribute('class') !== 'btn-menu') {
				document.getElementsByClassName('left-menu')[0].style.display = 'none';
			}

			if (e.type === 'click' && document.getElementsByClassName('drop-box')[0].style.display === 'block' && e.target.getAttribute('class') !== 'drop-box-input') {
				document.getElementsByClassName('drop-box')[0].style.display = 'none';
			}
			
			if (e.type === 'click' && e.target.getAttribute('data-tab') != null && e.target.getAttribute('data-tab').indexOf('info-') > -1) {
				let tabId = e.target.getAttribute('data-tab');
				
				document.getElementsByClassName('info-tab click')[0].classList.remove('click');
				document.getElementsByClassName('toggle-content click')[0].classList.remove('click');

				e.target.classList.add('click');
				document.getElementById(tabId).classList.add('click');

				// 구매 탭
				if (e.target.getAttribute('data-tab') == 'info-1') {
					if (vThis.poDelvChartObj1 == null)
						vThis.poDelvChartObj1 = vThis.newChart(vThis.poDelvCtx1, '발주금액', '납품금액', vThis.POAmtValue, vThis.DelvAmtValue, 'line');
					else {
						vThis.poDelvChartObj1.data.datasets[0].data = vThis.POAmtValue;
						vThis.poDelvChartObj1.update();
						vThis.poDelvChartObj1.data.datasets[1].data = vThis.DelvAmtValue;
						vThis.poDelvChartObj1.update();
					}

					if (vThis.poDelvChartObj2 == null)
						vThis.poDelvChartObj2 = vThis.newChart(vThis.poDelvCtx2, '납품율(%)', '불량율(%)', vThis.OkRateValuePODelv, vThis.BadRateValuePODelv, 'line');
					else {
						vThis.poDelvChartObj2.data.datasets[0].data = vThis.BadRateValuePODelv;
						vThis.poDelvChartObj2.data.datasets[1].data = vThis.OkRateValuePODelv;
					}
				} else if (e.target.getAttribute('data-tab') == 'info-2') {
					if (vThis.ordRptChartObj1 == null)
						vThis.ordRptChartObj1 = vThis.newChart(vThis.ordRptCtx1, '작업지시금액', '작업실적금액', vThis.OrdAmtValue, vThis.RptAmtValue, 'line');
					else {
						vThis.ordRptChartObj1.data.datasets[0].data = vThis.OrdAmtValue;
						vThis.ordRptChartObj1.data.datasets[1].data = vThis.RptAmtValue;
					}

					if (vThis.ordRptChartObj2 == null)
						vThis.ordRptChartObj2 = vThis.newChart(vThis.ordRptCtx2, '납품율(%)', '불량율(%)', vThis.OkRateValueOrdRpt, vThis.BadRateValueOrdRpt, 'line');
					else {
						vThis.ordRptChartObj2.data.datasets[0].data = vThis.BadRateValueOrdRpt;
						vThis.ordRptChartObj2.data.datasets[1].data = vThis.OkRateValueOrdRpt;
					}
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
				GX.Cookie.set('CustSeq', '', 0); // 거래처코드
				GX.Cookie.set('CustKind', '', 0); // 거래처타입
				location.href = 'login.html';
			}
		},
		/**조회 조건의 연도 열기/닫기 */
        openCloseDropBox: function(callback) {
            let e = event;

            if (e.target.nodeName.toUpperCase() === 'LI') {
                this.queryForm.DateYear = e.target.innerText;
                e.target.parentNode.style.display = 'none';
            } else {
                if (e.target.nextElementSibling.style.display == 'none' || e.target.nextElementSibling.style.display == '')
                    e.target.nextElementSibling.style.display = 'block';
                else
                    e.target.nextElementSibling.style.display = 'none';
            }

			if (typeof callback == 'function') {
				clearTimeout(this.ValTimer);
				if (document.getElementById('loading').className.length == 0) {
					document.getElementById('loading').classList.add('loading-wrap');
					document.getElementsByClassName('loading-container')[0].style.display = 'block';
				}
				callback(this.searchInterval);
			}
        },
		search: function(callback) {
            let vThis = this;
			let arg = Array.prototype.slice.call(arguments, 1); // 콜백함수 파라메터 하나 받기
            let params = GX.deepCopy(vThis.queryForm);

			GX._METHODS_
            .setMethodId('MainAllQuery')
            .ajax([params], [function (data) {
				// console.log('callback1', data)
				// 공지사항.
				if (data.length > 0) {
					for (let i in data) {
						if (data.hasOwnProperty(i)) 
							data[i].BegDate = GX._METHODS_.nvl(data[i].BegDate).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
					}
					vThis.rows.NoticeQuery = data;
				}
			}, function (data) {
				// console.log('callback2', data)
				// 구매. 발주/납품 이월/당월/누계/잔량/납품율
				if (data.length > 0) {
					Object.keys(vThis.rows.PODelvQuery).map(k => {
						vThis.rows.PODelvQuery[k] = data[0][k] ? Math.round(data[0][k]).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0;
					})
				}
			}, function (data) {
				// console.log('callback3', data)
				// 외주. 발주/납품 이월/당월/누계/잔량/납품율
				if (data.length > 0) {
					Object.keys(vThis.rows.OrdRptQuery).map(k => {
						vThis.rows.OrdRptQuery[k] = data[0][k] ? Math.round(data[0][k]).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",") : 0;
					})
				}
			}, function (data) {
				// console.log('callback4', data)
				// 구매
				if (data.length > 0) {
					for (let i in data) {
						if (data.hasOwnProperty(i)) {
							data[i].RowNum = parseInt(i) + 1;
							data[i].PODate = GX._METHODS_.nvl(data[i].PODate).length == 8 ? (data[i].PODate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].PODate;
							data[i].DelvDate = GX._METHODS_.nvl(data[i].DelvDate).length == 8 ? (data[i].DelvDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvDate;
							data[i].DelvPlanDate = GX._METHODS_.nvl(data[i].DelvPlanDate).length == 8 ? (data[i].DelvPlanDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].DelvPlanDate;
							data[i].POQty = GX._METHODS_.nvl(data[i].POQty).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
							data[i].LessQty = GX._METHODS_.nvl(data[i].LessQty).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
							// 글자 생략
							let defEllipsis = 12;
							if (data[i].ItemNo.length > defEllipsis) {
								data[i].ellipsisItemNo = data[i].ItemNo;
								data[i].ItemNo = data[i].ItemNo.substr(0, defEllipsis) + '...';
							}
							if (data[i].ItemName.length > defEllipsis) {
								data[i].ellipsisItemName = data[i].ItemName;
								data[i].ItemName = data[i].ItemName.substr(0, defEllipsis) + '...';
							}
							if (data[i].Spec.length > defEllipsis) {
								data[i].ellipsisSpec = data[i].Spec;
								data[i].Spec = data[i].Spec.substr(0, defEllipsis) + '...';
							}
						}
					}
					vThis.rows.POItemQuery = data;
				}
			}, function (data) {
				// console.log('callback5', data)
				// 외주
				if (data.length > 0) {
					for (let i in data) {
						if (data.hasOwnProperty(i)) {
							data[i].RowNum = parseInt(i) + 1;
							data[i].WorkOrderDate = GX._METHODS_.nvl(data[i].WorkOrderDate).length == 8 ? (data[i].WorkOrderDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkOrderDate;
							data[i].WorkDate = GX._METHODS_.nvl(data[i].WorkDate).length == 8 ? (data[i].WorkDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkDate;
							data[i].WorkPlanDate = GX._METHODS_.nvl(data[i].WorkPlanDate).length == 8 ? (data[i].WorkPlanDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkPlanDate;
							data[i].POQty = GX._METHODS_.nvl(data[i].POQty).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
							data[i].LessQty = GX._METHODS_.nvl(data[i].LessQty).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
							// 글자 생략
							let defEllipsis = 12;
							if (data[i].ItemNo.length > defEllipsis) {
								data[i].ellipsisItemNo = data[i].ItemNo;
								data[i].ItemNo = data[i].ItemNo.substr(0, defEllipsis) + '...';
							}
							if (data[i].ItemName.length > defEllipsis) {
								data[i].ellipsisItemName = data[i].ItemName;
								data[i].ItemName = data[i].ItemName.substr(0, defEllipsis) + '...';
							}
							if (data[i].Spec.length > defEllipsis) {
								data[i].ellipsisSpec = data[i].Spec;
								data[i].Spec = data[i].Spec.substr(0, defEllipsis) + '...';
							}
						}
					}
					vThis.rows.OrdItemQuery = data;
				}
			}, function (data) {
				// console.log('callback6', data)
				// 구매
				if (data.length > 0) {
					vThis.rows.PODelvMonthQuery = [];
					for (let i in data) {
						if (data.hasOwnProperty(i)) {
							let obj = {};
							let SumAvgAmt = 0;
							Object.keys(data[i]).map(k => {
								if (k.indexOf('DomAmt') > -1) {
									SumAvgAmt += data[i][k];
									if (data[i][k].toString().indexOf('.') > -1) obj[k] = data[i][k].toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
									else obj[k] = data[i][k].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
								} else {
									obj[k] = data[i][k];
								}
							})
							if (i < 2) obj.SumDomAmt = SumAvgAmt.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
							else obj.SumDomAmt = (SumAvgAmt / 12).toFixed(1);

							vThis.rows.PODelvMonthQuery.push(obj);
						}
					}
					
					// 구매 차트 데이터 배열에 담기
					let arrPOAmtValue = [], arrDelvAmtValue = [], arrBadRateValue = [], arrOkRateValue = [];
					Object.keys(data[0]).map(k => {
						if (k.indexOf('DomAmt') > -1) {
							arrPOAmtValue.push(data[0][k].toString());
							arrDelvAmtValue.push(data[1][k].toString());
							arrOkRateValue.push(data[2][k].toString());
							arrBadRateValue.push(data[3][k].toString());
						}
					});
					vThis.POAmtValue = arrPOAmtValue;
					vThis.DelvAmtValue = arrDelvAmtValue;
					vThis.BadRateValuePODelv = arrBadRateValue;
					vThis.OkRateValuePODelv = arrOkRateValue;
				}
			}, function (data) {
				// console.log('callback7', data)
				// 외주
				if (data.length > 0) {
					vThis.rows.OrdRptMonthQuery = [];
					for (let i in data) {
						if (data.hasOwnProperty(i)) {
							let obj = {};
							let SumAvgAmt = 0;
							Object.keys(data[i]).map(k => {
								if (k.indexOf('DomAmt') > -1) {
									SumAvgAmt += data[i][k];
									if (data[i][k].toString().indexOf('.') > -1) obj[k] = data[i][k].toFixed(2).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
									else obj[k] = data[i][k].toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
								} else {
									obj[k] = data[i][k];
								}
							})
							if (i < 2) obj.SumDomAmt = SumAvgAmt.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
							else obj.SumDomAmt = (SumAvgAmt / 12).toFixed(2);

							vThis.rows.OrdRptMonthQuery.push(obj);
						}
					}

					// 외주 차트 데이터 배열에 담기
					let arrOrdAmtValue = [], arrRptAmtValue = [], arrBadRateValue = [], arrOkRateValue = [];
					Object.keys(data[0]).map(k => {
						if (k.indexOf('DomAmt') > -1) {
							arrOrdAmtValue.push(data[0][k].toString());
							arrRptAmtValue.push(data[1][k].toString());
							arrOkRateValue.push(data[2][k].toString());
							arrBadRateValue.push(data[3][k].toString());
						}
					});
					vThis.OrdAmtValue = arrOrdAmtValue;
					vThis.RptAmtValue = arrRptAmtValue;
					vThis.BadRateValueOrdRpt = arrBadRateValue;
					vThis.OkRateValueOrdRpt = arrOkRateValue;
				}

				// 조회 콜백
				if (typeof callback == 'function') {
					if (arg.length > 0) callback(arg[0]);
					else callback();
				}
			}])
		},
		/**로딩 이미지 없이 조회 갱신.
		 * rtyTime: 기본 갱신 주기 1800초(=30분). 단위: s (초) -박태근이사님 요청
		 */
		searchInterval: function (rtyTime = 1800) {
			let vThis = this;

			if (document.querySelector('[class="info-tab click"]') != null)
				document.querySelector('[class="info-tab click"]').click();

			if (document.getElementById('loading').className.length > 0) {
				document.getElementById('loading').classList.remove('loading-wrap');
				document.getElementsByClassName('loading-container')[0].style.display = 'none';
			}

			vThis.ValTimer = setTimeout(() => {
				vThis.search(vThis.searchInterval, rtyTime);
			}, rtyTime * 1000)
		},
		openFakeDialog: function(idx = null, callback) {
			if (idx != null) {
				document.getElementsByClassName('fake-dialog-title')[0].innerText = this.rows.NoticeQuery[idx].Title;
				document.getElementsByClassName('fake-dialog-content')[0].innerText = this.rows.NoticeQuery[idx].Contant;
				document.getElementById('fakeDialog').style.display = 'block';
				if (typeof callback === 'function') callback;
			}
        },
        closeFakeDialog: function(callback) {
			document.getElementsByClassName('fake-dialog-title')[0].innerText = '';
			document.getElementsByClassName('fake-dialog-content')[0].innerText = '';
            document.getElementById('fakeDialog').style.display = 'none';
            if (typeof callback === 'function') callback;
        },
		/**차트
		 * chart.js
		 */
		newChart: function (ctx, dtLabel1, dtLabel2, data1, data2, chartType = 'line') {
			let vThis = this;
			return new Chart(ctx, {
				data: {
					labels: vThis.rows.ChartMonthDataLabel,
					datasets: [{
						label: dtLabel1,
						type: chartType,
						data: data1,
						borderWidth: 2,
						backgroundColor: ['#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c', '#0f1d6c'],
						borderColor: ['#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8', '#0f1d6cb8']
					},{
						label: dtLabel2,
						type: chartType,
						data: data2,
						borderWidth: 2,
						backgroundColor: ['#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384', '#ff6384'],
						borderColor: ['#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8', '#ff6384b8']
					}]
				},
				options: {
					responsive: false,
					scales: {
						y: {
							beginAtZero: true
						}
					}
				}
			});
		}
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login.html');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');
			
			document.addEventListener('click', vThis.eventCheck, false);

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

			let vYear = new Date().getFullYear();
			vThis.YearList.push(vYear.toString(), (vYear - 1).toString(), (vYear - 2).toString());

			GX.VueGrid
			.init()
			.bodyRow('@click="openFakeDialog(index);"')
            .item('RowNum').head('No.', '')
            .item('Title').head('제목', '').body()
            .item('BegDate').head('등록일', '')
            .loadTemplate('#noticeGrid1', 'rows.NoticeQuery');

			GX.VueGrid
			.init()
			.bodyRow('@click="openFakeDialog(index);"')
            .item('RowNum').head('No.', '')
            .item('Title').head('제목', '')
            .item('BegDate').head('등록일', '')
            .loadTemplate('#noticeGrid2', 'rows.NoticeQuery');

			GX.VueGrid
			.init()
            .item('RowNum').head('No.', '')
            .item('PODate').head('발주일', '')
            .item('DelvDate').head('납기일', '')
			.item('DelvPlanDate').head('납기예정일', '')
			.item('ItemNo').head('품번', '').body(null, 'text-l')
			.item('ItemName').head('품명', '').body(null, 'text-l')
			.item('Spec').head('규격', '').body(null, 'text-l')
			.item('UnitName').head('단위', '')
			.item('POQty').head('발주수량', '').body(null, 'text-r')
			.item('LessQty').head('잔량', '').body(null, 'text-r')
            .loadTemplate('#poItemGrid', 'rows.POItemQuery');

			GX.VueGrid
			.init()
            .item('RowNum').head('No.', '')
            .item('WorkOrderDate').head('작업지시일', '')
            .item('WorkDate').head('작업일', '')
			.item('WorkPlanDate').head('작업예정일', '')
			.item('ItemNo').head('품번', '').body(null, 'text-l')
			.item('ItemName').head('품명', '').body(null, 'text-l')
			.item('Spec').head('규격', '').body(null, 'text-l')
			.item('SizeText').head('사이즈', '')
			.item('UnitName').head('단위', '')
			.item('POQty').head('발주수량', '').body(null, 'text-r')
			.item('LessQty').head('잔량', '').body(null, 'text-r')
            .loadTemplate('#ordItemGrid', 'rows.OrdItemQuery');

			GX.VueGrid
			.init()
            .item('Gubun').head('구분', '')
            .item('DomAmt01').head('1월', '')
            .item('DomAmt02').head('2월', '')
			.item('DomAmt03').head('3월', '')
			.item('DomAmt04').head('4월', '')
			.item('DomAmt05').head('5월', '')
			.item('DomAmt06').head('6월', '')
			.item('DomAmt07').head('7월', '')
			.item('DomAmt08').head('8월', '')
			.item('DomAmt09').head('9월', '')
			.item('DomAmt10').head('10월', '')
			.item('DomAmt11').head('11월', '')
			.item('DomAmt12').head('12월', '')
			.item('SumDomAmt').head('년계', '')
            .loadTemplate('#poDelvMonthGrid', 'rows.PODelvMonthQuery');

			GX.VueGrid
			.init()
            .item('Gubun').head('구분', '')
            .item('DomAmt01').head('1월', '')
            .item('DomAmt02').head('2월', '')
			.item('DomAmt03').head('3월', '')
			.item('DomAmt04').head('4월', '')
			.item('DomAmt05').head('5월', '')
			.item('DomAmt06').head('6월', '')
			.item('DomAmt07').head('7월', '')
			.item('DomAmt08').head('8월', '')
			.item('DomAmt09').head('9월', '')
			.item('DomAmt10').head('10월', '')
			.item('DomAmt11').head('11월', '')
			.item('DomAmt12').head('12월', '')
			.item('SumDomAmt').head('년계', '')
            .loadTemplate('#ordRptMonthGrid', 'rows.OrdRptMonthQuery');
        }

    },
	mounted() {
		this.poDelvCtx1 = document.getElementById('PODelvChart1').getContext('2d');
		this.poDelvCtx2 = document.getElementById('PODelvChart2').getContext('2d');
		this.ordRptCtx1 = document.getElementById('OrdRptChart1').getContext('2d');
		this.ordRptCtx2 = document.getElementById('OrdRptChart2').getContext('2d');

		// this.search(this.searchInterval, 30);
		this.search(this.searchInterval);
	}
});

GX._DATAS_ = {
	ajaxDataBlockKeys:['DataBlock1','DataBlock2','DataBlock3','DataBlock4','DataBlock5','DataBlock6','DataBlock7'],
	ajaxTableNameKeys:['DataBlock1','DataBlock11','DataBlock12','DataBlock13','DataBlock14','DataBlock15','DataBlock16'],
	ajaxUrl:{
		get:'/Angkor.Ylw.Common.HttpExecute/RestOutsideService.svc/GetServiceMethodJson',
		post:'/Angkor.Ylw.Common.HttpExecute/RestOutsideService.svc/OpenApi/IsStoredProcedure/{methodId}'
	},
	ajaxSecurity:{
		get:'{certId:AZTW220704,certKey:AZTW,dsnOper:?,dsnBis:?,dsn:?,workingTag:,securityType:1,isDebug:0,companySeq:?,languageSeq:1,serviceId:IsStoredProcedure,methodId:?,hostComputername:,hostIPAddress:,userId:?,userPwd:,empSeq:?}',
		post:{
			"certId": "AZTW220704",
			"certKey": "AZTW",
			"dsnOper": "",
			"dsnBis": "",
			"dsn": "",
			"securityType": 1,
			"companySeq": 1,
			"languageSeq": 1,
			"userId": ""
		}
	},
	ajaxBaseDataBlock:{
		"WorkingTag": "",
		"SSOType": 2,
		"CompanySeq": "1",
		"EmpId": "",
		"UserId": "",
		"UserPwd": ""
	},
	ajaxInpuData:{
		"ROOT":{
			//"DataBlock1":[],
			//"DataBlock2":[]
		}
	},
	pageUrls1:{
		'1': { link: '', icon: '', pageName: '구매', pageSeq: 1004003 },
		'2': { link: '', icon: '', pageName: '외주가공', pageSeq: 1004005 },
	},
	pageUrls2:{
		'1': { bindPageUrls1: '1', class: 'menu-01', link: 'orderInquiry.html', icon: 'img/ic_menu_01.png', pageName: '구매발주품목조회' },
		'2': { bindPageUrls1: '1', class: 'menu-02', link: 'purchase_delivery_search.html', icon: 'img/ic_menu_02.png', pageName: '구매납품품목조회' },
		'3': { bindPageUrls1: '2', class: 'menu-03', link: 'outsourcing_orderInquiry.html', icon: 'img/ic_menu_03.png', pageName: '외주발주품목조회' },
		'4': { bindPageUrls1: '2', class: 'menu-04', link: 'outsourcing_purchase_delivery_search.html', icon: 'img/ic_menu_04.png', pageName: '외주납품품목조회' },
		'5': { bindPageUrls1: '2', class: 'menu-05', link: 'production_progress_information.html', icon: 'img/ic_menu_05.png', pageName: '의류생산진행정보입력' },
		'6': { bindPageUrls1: '2', class: 'menu-05', link: 'gridTest.html', icon: 'img/ic_menu_05.png', pageName: 'Grid test' },
	},
};

GX._METHODS_ = {
	/**
	 * Description: 브라우저 쿠키에 담아둔 UserSeq에 데이터가 존재하는지 확인
	 * 				+ CompanySeq도 확인
	 * Return: boolean type. true or false
	 */
	isLogin: function(){
		return (GX.Cookie.get('UserSeq') != null && GX.Cookie.get('UserSeq').length > 0 && GX.Cookie.get('CompanySeq') != null && GX.Cookie.get('CompanySeq').length > 0)
	},
	setSecurityProperty: function(key, value){
		let re = new RegExp('([,\{])' + key + ':[^:,\}]+');
		GX._DATAS_.ajaxSecurity.get = GX._DATAS_.ajaxSecurity.get.replace(re, '$1' + key + ':' + value);

		if(key == 'methodId') GX._DATAS_.ajaxUrl.post = GX._DATAS_.ajaxUrl.post.replace(/\/[^\/]+$/, '/' + value);
		else GX._DATAS_.ajaxSecurity.post[key] = value;
	},
	setBaseDataBlockProperty: function(key, value){
		if(GX._DATAS_.ajaxBaseDataBlock.hasOwnProperty(key)) GX._DATAS_.ajaxBaseDataBlock[key] = value;
	},
	setMethodId: function(methodId){
		if(this.isLogin()){
			this.setSecurityProperty('empSeq', GX.Cookie.get('EmpSeq'));
			this.setSecurityProperty('userId', GX.Cookie.get('UserId'));
			this.setSecurityProperty('companySeq', GX.Cookie.get('CompanySeq'));

			this.setBaseDataBlockProperty('UserId', GX.Cookie.get('UserId'));
			this.setBaseDataBlockProperty('CompanySeq', GX.Cookie.get('CompanySeq'));
		}
		else{
			this.setSecurityProperty('empSeq', '');
			this.setSecurityProperty('userId', '');
			this.setSecurityProperty('companySeq', '1');

			this.setBaseDataBlockProperty('UserId', '');
			this.setBaseDataBlockProperty('CompanySeq', '1');
		}

		this.setSecurityProperty('methodId', methodId);


		if(GX.Storage.data.hasOwnProperty('gx_dsn') && GX.Storage.data.hasOwnProperty('gx_anotherDsn')){
			let dsn = GX.Storage.get('gx_dsn');
			let anotherDsn = (methodId == 'LoginTest') ? dsn : GX.Storage.get('gx_anotherDsn');

			this.setSecurityProperty('dsnOper', dsn);
			this.setSecurityProperty('dsnBis', dsn);
			this.setSecurityProperty('dsn', anotherDsn); // dsn : knicdev_bis or dsn : knicdev_oper
		}

		return this;
	},
	ajax: function(){
		if(GX.Storage.data.hasOwnProperty('gx_dsn')){
			//[param,param,...], [callback, callback, ..], isMessage
			//[objects], [functions], boolean
			let method = 'post';
			let isMessage = true;
			let i = 0, si = 0;
			let jsonObj = GX.deepCopy(GX._DATAS_.ajaxInpuData);
			let inputData = GX.deepCopy(GX._DATAS_.ajaxInpuData);
			var callbacks = {};
			let args = arguments;
			for(i in args){
				if(Array.isArray(args[i])){
					for(si in args[i]){
						if(typeof args[i][si] === 'object'){
							let dataBlock = GX.deepCopy(GX._DATAS_.ajaxBaseDataBlock); //참조없는 복사
							Object.assign(dataBlock, args[i][si]);
							
							if(inputData.ROOT[GX._DATAS_.ajaxDataBlockKeys[i]] == null) inputData.ROOT[GX._DATAS_.ajaxDataBlockKeys[i]] = [];
							inputData.ROOT[GX._DATAS_.ajaxDataBlockKeys[i]].push(dataBlock);
						}
						else if(typeof args[i][si] === 'function') callbacks[GX._DATAS_.ajaxTableNameKeys[si]] = args[i][si];
					}
				}
				else if(typeof args[i] === 'boolean') isMessage = args[i];
				else if(typeof args[i] === 'string') method = args[i].toLowerCase();
			}

			if(!this.isLogin() && inputData.ROOT.DataBlock1 != null && inputData.ROOT.DataBlock1.length > 0 && inputData.ROOT.DataBlock1[0].UserId != null){
				this.setSecurityProperty('userId', inputData.ROOT.DataBlock1[0].UserId);
				this.setBaseDataBlockProperty('UserId', inputData.ROOT.DataBlock1[0].UserId);
			}
			
			if(isMessage == null) isMessage = true;
			jsonObj.ROOT = GX.deepCopy(GX._DATAS_.ajaxSecurity.post);
			jsonObj.ROOT.data = inputData;
			
			let params = {
				get:{
					params:{
						securityJson: GX._DATAS_.ajaxSecurity.get,
						dataJson: JSON.stringify(inputData),
						encryptionType: "0",
						timeOut: "30"
					}
				},
				//post:{data: jsonObj}
				post:jsonObj
			};

			let config = {
				get:{withCredentials:true},
				post:{}
			};
			
			GX.SpinnerBootstrap.show();
			
			axios[method](GX.Storage.get('gx_serverAddr') + GX._DATAS_.ajaxUrl[method], params[method], config[method]).then((response) => {
				try{
					if(response != null && response.statusText == 'OK' && response.data != null){
						data = (method == 'post') ? response.data : JSON.parse(response.data);
						let msg = '';

						if(method == 'post'){
							if(data != null){
								if(isMessage && data.ErrorMessage != null && data.ErrorMessage[0] != null && data.ErrorMessage[0].Result.length > 0) alert(data.ErrorMessage[0].Result);
								else {
									for(let tableName in data){
										if(data[tableName] != null){
											if(data[tableName].length > 0 && data[tableName][0].Result != null && data[tableName][0].Result.length > 0) msg = data[tableName][0].Result;
											if(callbacks[tableName] != null) callbacks[tableName](data[tableName]);
										}
									}
								}
							}
						}
						else {
							if(data['Tables'] != null && data['Tables'].length > 0){
								for(let i in data['Tables']){
									if(data['Tables'][i] != null && data['Tables'][i]['Rows'] != null){
										if(data['Tables'][i]['Rows'].length > 0 && data['Tables'][i]['Rows'][0].Result != null && data['Tables'][i]['Rows'][0].Result.length > 0) msg = data['Tables'][i]['Rows'][0].Result;
										if(callbacks[data.Tables[i].TableName] != null) callbacks[data.Tables[i].TableName](data['Tables'][i]['Rows']);
									}
								}
							}
						}

						if(isMessage && msg.length > 0) alert(msg);

						GX.SpinnerBootstrap.hide();
					}
				} catch(err){
					alert('예외 오류가 발생했습니다!');
					GX.SpinnerBootstrap.hide();
					//console.error(err);
					console.log(err);
				}
			}).catch((response) => {
                console.log(response)
				if(response != null && response.status == 403){
					alert('로그인 세션이 만료되었습니다.\n다시 로그인 해주십시오');
					location.href = "login.html";
				} else {
                    let resMessage = response.message ? response.message : '에러 발생';
                    alert(resMessage);
                }
                GX.SpinnerBootstrap.hide();
				//console.log(error.response.status, event.target.status);
				// 예외 처리
			});		
		}
		else alert('환경설정에서 네트워크 통신환경을 설정해주세요!');

		return this;
	},
	/**파라메터(element id)에서 포커스 해제 이후 해당 파라메터에 다시 포커스
	 * eleId typeof=string, element의 id
	 * emptyVal typeof=boolean, element의 value 초기화
	 * 인자 없이 넘어올 경우 gx-scanner="Y"인 element 중 값이 비어있는 곳으로 포커스
	 * 값이 비어있는 곳이 없을 경우 마지막 index로 포커스
	 */
	focusAfterBlur: function(eleId, emptyVal = false) {
		let vThis = this;
		
		if (typeof eleId === 'string' && document.getElementById(eleId) != null) {
			let p = document.getElementById(eleId);
			if (emptyVal) {
				if (vThis.queryForm[eleId]) {
					vThis.queryForm[eleId] = '';
				}
				p.value = '';
			}
			p.blur();
			setTimeout(function() {
				p.focus();
			}, 20);
		} else {
			let focusObj = document.querySelectorAll('[gx-scanner="Y"]');
			let focusObjId = '';
			for (let i in focusObj) {
				if (focusObj.hasOwnProperty(i)) {
					focusObjId = focusObj[i].getAttribute('id');
					if (document.getElementById(focusObjId).value.trim() === '')
						break;
				}
			}
			if (focusObjId === '') focusObjId = 'hiddenScanData'
			let p = document.getElementById(focusObjId);
			if (emptyVal) {
				if (vThis.queryForm[focusObjId]) {
					vThis.queryForm[focusObjId] = '';
				}
				p.value = '';
			}
			p.blur();
			setTimeout(function() {
				p.focus();
			}, 20);
		}
	},
	/**
	 * pageUrls1, pageUrls2 객체를 가져와 메뉴 구성
	 * v-html로 연결
	 */
	createLeftMenu: function() {
		let pageUrls1List = GX._DATAS_.pageUrls1;
		let pageUrls2List = GX._DATAS_.pageUrls2;
		let menu = [];

		// '1': 구매거래처타입, '2': 외주거래처타입
		let objCustKind = { '1': GX.Cookie.get('CustKind1'), '2': GX.Cookie.get('CustKind2') };

		menu.push('<div class="list-bg"></div>');

		for (let k in pageUrls1List) {
			if (pageUrls1List[k].pageSeq.toString() == objCustKind[k] || objCustKind[k] == '0') {
				menu.push('<div class="list-container">');
				menu.push('<div class="menu-title">' + pageUrls1List[k].pageName + '</div>');
				menu.push('<ul class="list-wrap">');
				
				for (let b in pageUrls2List) {
					if (k == pageUrls2List[b].bindPageUrls1) {
						menu.push('<li>');
						menu.push('<a href="' + pageUrls2List[b].link + '">');
						menu.push('<span class="list-img ' + pageUrls2List[b].class + '"></span>');
						menu.push('<span>' + pageUrls2List[b].pageName + '</span>');
						menu.push('</a>');
						menu.push('</li>');
					}
				}

				menu.push('</ul>');
				menu.push('</div>');
			}
		}
		
		return menu.join('');
	},
	/**
	 * left-menu 클릭 처리
	 * paramater: left menu 최상위 Element class name (default: left-menu)
	 */
	clickLeftMenu: function(leftMenuClassName = 'left-menu') {
		if (document.getElementsByClassName(leftMenuClassName)[0].style.display === 'block') document.getElementsByClassName(leftMenuClassName)[0].style.display = 'none';
		else document.getElementsByClassName(leftMenuClassName)[0].style.display = 'block';
	},
	/**hide 버튼(모바일에서만 사용) */
	hide: function() {
		if(document.getElementsByClassName('data-row-wrap')[0].style.display === 'block' || document.getElementsByClassName('data-row-wrap')[0].style.display == '') {
			document.getElementsByClassName('data-row-wrap')[0].style.display = 'none';
			document.getElementsByClassName('top-data-wrap')[0].style.paddingBottom = '5px';
			document.getElementsByClassName('data-table')[0].style.height = '720px';
		} else {
			document.getElementsByClassName('data-row-wrap')[0].style.display = 'block';
			document.getElementsByClassName('top-data-wrap')[0].style.paddingBottom = '20px';
			document.getElementsByClassName('data-table')[0].style.height = '508px';
		}
	},
	/**문자열 체크
	 * @param str: 체크할 문자열
	 * @param defaultStr: 문자열이 비어있을 경우 리턴할 기본 문자열
	 */
	nvl: function(str, defaultStr = '') {
		if(typeof str == "undefined" || str == null || str == "")
			str = defaultStr;
		return str;
	},
	/**엑셀 다운로드 (확장자: xlsx)
	 * 옵션 raw (boolean): 숫자도 문자 취급 (default: false 이지만 true로 고정)
	 * @param table element
	 * @param 파일명, 시트명 (default: document.title)
	 */
	excelDownload: function (eleTable) {
		// 파라메터에 데이터 확인 - table > tbody > tr 있는지 확인
		if (eleTable && typeof eleTable === 'object') {
			if (eleTable.getElementsByTagName('tbody').length > 0) {
				if (eleTable.getElementsByTagName('tbody')[0].getElementsByTagName('tr').length) {
					const strDateTime =  new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"}).replace(/[^0-9]/g, '');
					let strName = document.title ? document.title + '_' + strDateTime : '' + strDateTime;

					let wb = XLSX.utils.table_to_book(eleTable, {sheet: strName, raw: true});
					XLSX.writeFile(wb, (strName + '.xlsx'));
				} else {
					alert('조회 결과가 있어야 엑셀 다운로드가 가능합니다.');
					return false;
				}
			} else {
				alert('테이블 비정상');
				return false;
			}
		} else {
			alert('엑셀 다운로드 실패');
			return false;
		}
	},

	/**
	 * 비밀번호변경, 로그아웃 레이어 띄우기, 숨기기
	 */
	userLayerShowHide: function () {
		if (document.getElementsByClassName('user-layer')[0].classList.length === 1) document.getElementsByClassName('user-layer')[0].classList.add('invisible');
		else if (document.getElementsByClassName('user-layer')[0].classList.length === 2) document.getElementsByClassName('user-layer')[0].classList.remove('invisible');
	},
	/**
	 * 로그아웃, 로그인 화면으로 이동
	 */
	logout: function () {
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
	},
	/**
	 * 비밀번호 변경 다이얼로그 띄우기
	 */
	changePwDialogShow: function () {
		GX._METHODS_.userLayerShowHide();
		document.getElementById('changePwDialog').style.display = 'block';
	},
	/**
	 * 비밀번호 변경 다이얼로그 닫기
	 */
	changePwDialogHide: function () {
		GX._METHODS_.pwChangePwInit();
	},
	/**
	 * 변경 비밀번호 저장
	 */
	saveChangePw: function () {
		let valNowPw = document.getElementById('nowPw').value;
		let valNewPw = document.getElementById('newPw').value;
		let valNewPwChk = document.getElementById('newPwChk').value;
		let sameNewPw = document.getElementById('pNewPwChk').style.color == 'green' ? true : false;

		// 비밀번호 확인: true, 비밀번호 칸들이 모두 채워져 있을 때
		if (sameNewPw && valNowPw.length > 0 && valNewPw.length > 0 && valNewPwChk.length) {
			// 기존 로그인 로직을 먼저 태우고 성공 시 update 로직 태우기
			GX._METHODS_
			.setMethodId('LoginTest')
			.ajax([{ QryType: 'LoginCheck', CompansySeq: GX.Cookie.get('CompanySeq'), UserId: GX.Cookie.get('UserId'), UserPwd: valNowPw }], [function (data) {
				if (data[0] != null && data[0].UserSeq != null) {
					GX._METHODS_
					.setMethodId('LoginTest')
					.ajax([{ QryType: 'UpdatePw', CompansySeq: GX.Cookie.get('CompanySeq'), UserId: GX.Cookie.get('UserId'), UserPwd: valNewPw }], [function (data1) {
						if (data1[0].Status == 0) { // 정상
							GX._METHODS_.pwChangePwInit();
							if (confirm('정상적으로 변경되었습니다. 다시 로그인하시겠습니까?')) {
								GX._METHODS_.logout();
							}
						} else {
							document.getElementById('nowPw').value = '';
							document.getElementById('pNowPw').style.color = 'red';
							document.getElementById('pNowPw').innerText = '비밀번호가 잘못되었습니다.';
							alert(data1[0].Result);
						}
					}], true);
				} else {
					document.getElementById('nowPw').value = '';
					document.getElementById('pNowPw').style.color = 'red';
					document.getElementById('pNowPw').innerText = '비밀번호가 잘못되었습니다.';
				}
			}], true);
		}
	},
	/**
	 * 비밀번호 변경 다이얼로그 내의 내용 초기화
	 */
	pwChangePwInit: function () {
		if (document.getElementById('changePwDialog').style.display === 'block') document.getElementById('changePwDialog').style.display = 'none';
		document.getElementById('nowPw').value = '';
		document.getElementById('newPw').value = '';
		document.getElementById('newPwChk').value = '';
		document.getElementById('pNowPw').innerText = '-';
		document.getElementById('pNewPwChk').innerText = '-';
		document.getElementById('pNowPw').style.color = 'white';
		document.getElementById('pNewPwChk').style.color = 'white';
	},
	/**
	 * 비밀번호 변경 - 신규 비밀번호 / 비밀번호 확인 칸에 입력했을때 비밀번호가 같은지 비교
	 */
	pwChk: function () {
		let e = event;
		if (e.type == 'keyup' && (e.target.id == 'newPw' || e.target.id == 'newPwChk')) {
			let valNewPw = document.getElementById('newPw').value;
			let valNewPwChk = document.getElementById('newPwChk').value;
			if (valNewPw != valNewPwChk) {
				document.getElementById('pNewPwChk').style.color = 'red';
				document.getElementById('pNewPwChk').innerText = '비밀번호가 다릅니다.';
			} else if (valNewPw == valNewPwChk && valNewPw.length > 0 && valNewPwChk.length > 0) {
				document.getElementById('pNewPwChk').style.color = 'green';
				document.getElementById('pNewPwChk').innerText = '비밀번호가 동일합니다.';
			} else if (valNewPw == valNewPwChk && valNewPw.length == 0 && valNewPwChk.length == 0) {
				document.getElementById('pNewPwChk').innerText = '-';
				document.getElementById('pNewPwChk').style.color = 'white';
			}
		} else if (e.type == 'keyup' && e.target.id == 'nowPw') {
			document.getElementById('pNowPw').innerText = '-';
			document.getElementById('pNowPw').style.color = 'white';
		}
	},
};
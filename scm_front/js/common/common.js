GX._DATAS_ = {
	ajaxDataBlockKeys:['DataBlock1','DataBlock2'],
	ajaxTableNameKeys:['DataBlock1','DataBlock11'],
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
		'1': { link: '', icon: '', pageName: '구매' },
		'2': { link: '', icon: '', pageName: '외주가공' },
	},
	pageUrls2:{
		'1': { bindPageUrls1: '1', class: 'menu-01', link: 'orderInquiry', icon: 'img/ic_menu_01.png', pageName: '구매발주품목조회' },
		'2': { bindPageUrls1: '1', class: 'menu-02', link: 'purchase_delivery_search', icon: 'img/ic_menu_02.png', pageName: '구매납품품목조회' },
		'3': { bindPageUrls1: '2', class: 'menu-03', link: 'outsourcing_orderInquiry', icon: 'img/ic_menu_03.png', pageName: '외주발주품목조회' },
		'4': { bindPageUrls1: '2', class: 'menu-04', link: 'outsourcing_purchase_delivery_search', icon: 'img/ic_menu_04.png', pageName: '외주납품품목조회' },
		'5': { bindPageUrls1: '2', class: 'menu-05', link: 'production_progress_information', icon: 'img/ic_menu_05.png', pageName: '의류생산진행정보입력' },
	},
};

GX._METHODS_ = {
	/**
	 * Description: 브라우저 쿠키에 담아둔 UserSeq에 데이터가 존재하는지 확인
	 * Return: boolean type. true or false
	 */
	isLogin: function(){
		return (GX.Cookie.get('UserSeq') != null && GX.Cookie.get('UserSeq').length > 0)
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
		menu.push('<div class="list-bg"></div>');
		for (let a in pageUrls1List) {
			if (pageUrls1List.hasOwnProperty(a)) {
				menu.push('<div class="list-container">');
				menu.push('<div class="menu-title">' + pageUrls1List[a].pageName + '</div>');
				menu.push('<ul class="list-wrap">');
				
				for (let b in pageUrls2List) {
					if (pageUrls2List.hasOwnProperty(b)) {
						if (a == pageUrls2List[b].bindPageUrls1) {
							menu.push('<li>');
							menu.push('<a href="' + pageUrls2List[b].link + '">');
							menu.push('<span class="list-img ' + pageUrls2List[b].class + '"></span>');
							menu.push('<span>' + pageUrls2List[b].pageName + '</span>');
							menu.push('</a>');
							menu.push('</li>');
						}
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
		if(document.getElementsByClassName('data-row-wrap')[0].style.display === 'block') {
			document.getElementsByClassName('data-row-wrap')[0].style.display = 'none';
			document.getElementsByClassName('top-data-wrap')[0].style.paddingBottom = '5px';
			document.getElementsByClassName('data-table')[0].style.height = '720px';
		} else {
			document.getElementsByClassName('data-row-wrap')[0].style.display = 'block';
			document.getElementsByClassName('top-data-wrap')[0].style.paddingBottom = '20px';
			document.getElementsByClassName('data-table')[0].style.height = '508px';
		}
	},
};
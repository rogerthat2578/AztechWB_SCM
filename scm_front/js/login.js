let app = new Vue({
	el: '#app',
	data: {
		params: GX.getParameters(),
		rows: {
			IDCheck: [],
		},
		companySeq: '',
		userId: '',
		userPwd: '',
		isSaveId: [],
        settingItems: { //아즈텍WB는 따로 환경설정 변경 없이 기본 셋팅
			dsn: 'aztw_oper',
			work: 'AZTW220704',
			serverAddr: 'http://222.96.95.26:8080',
			anotherDsn: 'aztw_bis'
		},
	},
    methods: {
        /**이벤트 처리 */
        eventCheck: function() {
            let vThis = this;
            let e = event;
            
            if (e.type == 'keyup' && e.key == 'Enter' && (e.target.getAttribute('id') == 'userId' || e.target.getAttribute('id') == 'userPwd')) {   
                if (e.target.getAttribute('id') == 'userId') {
                    GX._METHODS_.focusAfterBlur('userPwd');
                    vThis.chkCompany();
                } else if (e.target.getAttribute('id') == 'userPwd') {
                    if (vThis.rows.IDCheck.length > 0) {
                        vThis.login();
                    } else {
                        vThis.chkCompany(vThis.login());
                    }
                }
            }
        },
        saveId: function () {
			if (event.target.checked) {
				if (this.userId.trim().length > 0) GX.Storage.set('gx_saveId', this.userId);
			}
			else GX.Storage.remove('gx_saveId');
		},
        /**사업장 체크 */
        chkCompany: function() {
            let vThis = this;
 
            if (vThis.userId && vThis.userId != GX.Storage.get('gx_saveId')) {
                GX._METHODS_
                .setMethodId('LoginTest')
                .ajax([{ QryType: 'IDCheck', UserId: vThis.userId }], [function (data) {
                    vThis.rows.IDCheck = (data[0] != null && data[0].Result != null) ? [] : data;
                    if (vThis.rows.IDCheck.length > 0) {
                        vThis.companySeq = data[0].CompanySeq;
                        GX.Storage.set('gx_anotherDsn', data[0].Dsn);
                        if (vThis.isSaveId[0] === '1')
                            GX.Storage.set('gx_saveId', vThis.userId);
                    } else {
                        vThis.companySeq = "";
                        GX.Storage.set('gx_anotherDsn', '');
                    }
                }], true);
            }
        },
        /**로그인 */
        login: function() {
            let vThis = this;

            if (vThis.userId && vThis.userPwd) {
                GX._METHODS_
                .setMethodId('LoginTest')
                .ajax([{ QryType: 'LoginCheck', CompansySeq: vThis.companySeq, UserId: vThis.userId, UserPwd: vThis.userPwd }], [function (data) {
                    if (data[0] != null && data[0].UserSeq != null) {
                        GX.Cookie.set('UserId', vThis.userId, 1);
                        GX.Cookie.set('UserSeq', data[0].UserSeq, 1);
                        GX.Cookie.set('UserName', data[0].UserName, 1);
                        GX.Cookie.set('EmpSeq', data[0].EmpSeq, 1);
                        GX.Cookie.set('DeptName', data[0].DeptName, 1);
                        GX.Cookie.set('DeptSeq', data[0].DeptSeq, 1);
                        GX.Cookie.set('CompanySeq', vThis.companySeq, 1); // 법인코드

                        /* 사업단위 객체로 담기
                        ** 하나의 법인코드에 n개 존재할 수 있음
                        ** 예시) CompanySeq:1,BizUnit:1,BizUnitName:본사/CompanySeq:1,BizUnit:1,BizUnitName:본사/
                        ** 구분자(행) : /
                        ** 쿠키에 ,(쉼표)를 구분자로 문자열로 저장
                        ** Modified : Json Format의 String Type으로 저장하도록 수정. index를 key로 가지는
                        */
                        let objBizUnitList = {};
                        data[0].BizData.replace(/\s/g, '').split('/').forEach((vLvl1, idx1, arr1) => {
                            let temp = '';
                            if (arr1.length > 0 && vLvl1.length > 0) {
                                vLvl1.split(',').forEach((vLvl2, idx2, arr2) => {
                                    idx2 === 0 ? temp += '{' : '';
                                    vLvl2.split(':').forEach((vLvl3, idx3) => {
                                        idx3 % 2 === 0 ? temp += '"' + vLvl3 + '":' : isNaN(vLvl3) ? temp += '"' + vLvl3 + '"' : temp += vLvl3; 
                                    })
                                    arr2.length - 1 !== idx2 ? temp += ',' : temp += '';
                                    idx2 === arr2.length - 1 ? temp += '}' : '';
                                })
                                let jsonParseBizData = JSON.parse(temp);
                                objBizUnitList[idx1.toString()] = jsonParseBizData;
                            }
                        });
                        GX.Cookie.set('BizUnit_JsonFormatStringType', JSON.stringify(objBizUnitList), 1);
                        location.href = 'main.html';
                    }
                }], true);
            } else {
                GX._METHODS_.focusAfterBlur();
                alert('ID, Password를 올바르게 입력해주세요.')
            }
        },
    },
    created() {
        let vThis = this;

        // PDA 처럼 따로 환경 설정하는 것 없이 바로 할 수 있도록
        for (let i in vThis.settingItems) {
            if(vThis.settingItems.hasOwnProperty(i)) {
                if (GX.Storage.get('gx_' + i)) {
                    GX.Storage.set('gx_' + i, vThis.settingItems[i]);
                }
            }
        }

		if (GX._METHODS_.isLogin()) location.replace('main');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_finger.gif" alt=""></div>', 'prepend');
 
            if (GX.Storage.get('gx_saveId') != null && GX.Storage.get('gx_saveId').length > 0) {
				vThis.isSaveId = [1];
				vThis.userId = GX.Storage.get('gx_saveId');
			}

            // 이벤트 등록
            document.body.addEventListener('keyup', vThis.eventCheck, false); // Enter
        }
    },
});
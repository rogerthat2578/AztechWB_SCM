let app = new Vue({
	el: '#app',
	data: {
		params: GX.getParameters(),
		rows: {
			'IDCheck': [],
		},
		companySeq: '',
		userId: '',
		userPwd: '',
		isSaveIds: 0,
        settingItems: { //아즈텍WB는 따로 환경설정 변경 없이 기본 셋팅
			dsn: 'aztw_oper',
			work: 'AZTW220704',
			serverAddr: 'http://222.96.95.26:8080',
			anotherDsn: 'aztw_bis'
		},
	},
    methods: {
        /**사업장 체크 */
        chkCompany: function() {
            let vThis = this;

            if (vThis.userId) {
                GX._METHODS_
                .setMethodId('LoginTest')
                .ajax([{ QryType: 'IDCheck', UserId: vThis.userId }], [function (data) {
                    vThis.rows['IDCheck'] = (data[0] != null && data[0].Result != null) ? [] : data;
                    if (data.length == 1) {
                        vThis.companySeq = data[0].CompanySeq;
                        GX.Storage.set('gx_anotherDsn', data[0].Dsn);
                        if (vThis.isSaveIds[0] === '1')
                            GX.Storage.set('gx_saveId', vThis.userId);
                    } else {
                        vThis.companySeq = "";
                        GX.Storage.set('gx_anotherDsn', '');
                    }
                }], true);
            }
        },
    },
    created() {
        let vThis = this;

        // PDA 처럼 따로 환경 설정 없이 바로 할 수 있도록
        for (let i in vThis.settingItems) {
            if(vThis.settingItems.hasOwnProperty(i)) {
                if (GX.Storage.get('gx_' + i)) {
                    GX.Storage.set('gx_' + i, vThis.settingItems[i]);
                }
            }
        }

		if (GX._METHODS_.isLogin()) location.replace('main');
        else {
            if (GX.Storage.get('gx_saveId')) {
				vThis.isSaveIds = 1;
				vThis.userId = GX.Storage.get('gx_saveId');

			}
        }
    },
});
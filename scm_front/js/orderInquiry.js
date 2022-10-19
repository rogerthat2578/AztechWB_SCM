let app = new Vue({
	el: '#app',
	data: {
		leftMenu: GX._METHODS_.createLeftMenu(),
		deptName: GX.Cookie.get('DeptName'),
		userName: GX.Cookie.get('UserName'),
		params: GX.getParameters(),
        /**
         * rows.Query 조회 결과
         */
		rows: {
            Query: [],
        },
        /**
         * 조회 조건
         * 
         */
        queryForm: {
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '',
            OrderDateFrom: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            OrderDateTo: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            DeliveryDateFrom: '',
            DeliveryDateTo: '',
            ProcStatus: '',
            PoNo: '',
            ItemNm: '',
            ItemNo: '',
            Spec: '',
        }
	},
    methods: {
        /**날짜 담기 */
        updateDate: function(d) {
            console.log(d)
            let vThis = this;
            vThis.queryForm.InvoiceDate = d;
        },
        /**이벤트 처리 */
        eventCheck: function() {
            let vThis = this;
            let e = event;
            
			// 메뉴 여닫는 버튼 클릭을 제외한 다른 영역 클릭 시 메뉴 닫기
			if (e.type === 'click' && document.getElementsByClassName('left-menu')[0].style.display === 'block'
				&& e.target.getAttribute('class') !== 'btn-menu') {
				document.getElementsByClassName('left-menu')[0].style.display = 'none';
			}
        },
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_finger.gif" alt=""></div>', 'prepend');
			
			document.addEventListener('click', vThis.eventCheck, false);
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
            }
        });
    }
});
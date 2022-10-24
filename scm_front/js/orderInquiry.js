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
         */
        queryForm: {
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '',
            OrderDateFrom: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            OrderDateTo: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            DeliveryDateFrom: '',
            DeliveryDateTo: '',
            ProcStatus: '전체',
            PoNo: '',
            ItemNm: '',
            ItemNo: '',
            Spec: '',
        },
        procStatusList: [
            '전체', '진행중', '작성', '확정'
        ],
	},
    methods: {
        /**이벤트 처리 */
        eventCheck: function() {
            let vThis = this;
            let e = event;
            
            console.log('11111', document.getElementsByClassName('drop-box')[0].nextElementSibling.style.display)
            console.log('2222222', e.target.nextElementSibling.getAttribute('class'))

			if (e.type === 'click' && document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu') {
				document.getElementsByClassName('left-menu')[0].style.display = 'none';
			} else if (e.type === 'click' && document.getElementsByClassName('drop-box')[0].style.display === 'block' && e.target.getAttribute('class') !== 'drop-box') {
                // document.getElementsByClassName('drop-box')[0].style.display = 'none';
            }

            if (e.type === 'click' && document.getElementsByClassName('drop-box')[0].nextElementSibling.style.display === 'block' && e.target.nextElementSibling.getAttribute('class') === 'drop-box') {
                document.getElementsByClassName('drop-box')[0].style.display = 'none';
            } else if (e.type === 'click' && document.getElementsByClassName('drop-box')[0].nextElementSibling.style.display !== 'block' && e.target.nextElementSibling.getAttribute('class') === 'drop-box') {
                document.getElementsByClassName('drop-box')[0].style.display = 'block';
                //@click="openDropBox" 
            } else if (e.type === 'click' && document.getElementsByClassName('drop-box')[0].style.display === 'block' && e.target.nodeName.toUpperCase() == 'LI') {
                if (e.target.innerText && e.target.innerText != '') {
                    vThis.queryForm.ProcStatus = e.target.innerText;
                    document.getElementsByClassName('drop-box')[0].style.display = 'none'
                }
            }
        },
        /**조회 조건의 진행상태 열기 */
        openDropBox: function() {
            let e = event;
            if (e.target.nextElementSibling.style.display == 'none' || e.target.nextElementSibling.style.display == '')
                e.target.nextElementSibling.style.display = 'block';
            else
                e.target.nextElementSibling.style.display = 'none';
        }
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
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
        }
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
			
			if (e.type === 'click' && e.target.getAttribute('data-tab') != null && e.target.getAttribute('data-tab').indexOf('info-') > -1) {
				let tabId = e.target.getAttribute('data-tab');
				
				document.getElementsByClassName('info-tab click')[0].classList.remove('click');
				document.getElementsByClassName('toggle-content click')[0].classList.remove('click');

				e.target.classList.add('click');
				document.getElementById(tabId).classList.add('click');
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
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_finger.gif" alt=""></div>', 'prepend');
			
			document.addEventListener('click', vThis.eventCheck, false);
        }
    },
});

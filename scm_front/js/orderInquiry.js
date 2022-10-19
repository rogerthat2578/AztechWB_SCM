let app = new Vue({
	el: '#app',
	data: {
		leftMenu: GX._METHODS_.createLeftMenu(),
		deptName: '',
		userName: '',
		params: GX.getParameters(),
		rows: [],
	},
    methods: {
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
    },
    created() {
        let vThis = this;

		if (!GX._METHODS_.isLogin()) location.replace('login');
        else {
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_finger.gif" alt=""></div>', 'prepend');
			
			vThis.deptName = GX.Cookie.get('DeptName');
			vThis.userName = GX.Cookie.get('UserName');
			
			document.addEventListener('click', vThis.eventCheck, false);
        }
    },
});
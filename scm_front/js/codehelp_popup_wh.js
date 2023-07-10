let app = new Vue({
	el: '#app',
	data: {
        deptName: '',
		userName: '',
        BizUnitList: [], // 사업 단위 리스트
        // 구매납품입력 화면의 queryForm
        queryForm: {
            CompanySeq: '',
            BizUnit: '',
            BizUnitName: '',
        },
        // 구매납품입력 화면의 더블클릭한 행에 대한 데이터
        queryRow: {},
        /**
         * rows.Query 포장단위입출고입력 다이얼로그 그리드
         */
		rows: {
            Query: [],
        },
        // grid 내 데이터 edit 모드일 때 기존 데이터 유지
        strBeforeEditData: '',
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        },
        // 모바일웹에서 더블클릭 처럼 동작하기위함
        objDblClick: {
            click: false,
            time: 0,
        },
        selectedRowKey: 0,
	},
    methods: {
        /**이벤트 처리 */
        eventCheck: function() {
            const vThis = this;
            const e = event;

            // Key Event
            if(e.type === 'keyup'){
                switch(e.key.toLowerCase()){
                    case 'control': vThis.keyCombi.Control = false; break;
                    case 'q': vThis.keyCombi.Q = false; break;
                }
                vThis.keyCombi.isKeyHold = false;
            }
            else if(e.type === 'keydown'){
                switch(e.key.toLowerCase()){
                    case 'control': vThis.keyCombi.Control = true; break;
                    case 'q': vThis.keyCombi.Q = true; break;
                }

                if (!vThis.keyCombi.isKeyHold && vThis.keyCombi.Control && vThis.keyCombi.Q){
                    vThis.keyCombi.isKeyHold = true;
                    vThis.search();
                }
            }
        },

        /**
         * 부모창에 값 전달
         */
        transDataToParent: function () {
            const vThis = this;

            if (vThis.rows.Query.length > 0) {
                let transDataRowKey = vThis.queryRow.rowKey;
                let transDataSeq = vThis.rows.Query[vThis.selectedRowKey].WHSeq || 0;
                let transDataValue = vThis.rows.Query[vThis.selectedRowKey].WHName || '';

                if (window.opener.name == 'parentPopup') {
                    if (window.opener.document.getElementById('transDataRowKey')) {
                        window.opener.document.getElementById('transDataRowKey').value = transDataRowKey;
                    } else {
                        let element = window.opener.document.createElement('input');
                        element.setAttribute('type', 'hidden');
                        element.setAttribute('id', 'transDataRowKey');
                        element.setAttribute('value', transDataRowKey);
                        window.opener.document.body.appendChild(element);
                    }

                    if (window.opener.document.getElementById('transDataSeq') && window.opener.document.getElementById('transDataValue')) {
                        window.opener.document.getElementById('transDataSeq').value = transDataSeq;
                        window.opener.document.getElementById('transDataValue').value = transDataValue;
                    } else {
                        let element1 = window.opener.document.createElement('input');
                        element1 = window.opener.document.createElement('input');
                        element1.setAttribute('type', 'hidden');
                        element1.setAttribute('id', 'transDataSeq');
                        element1.setAttribute('value', transDataSeq);
                        window.opener.document.body.appendChild(element1);

                        let element2 = window.opener.document.createElement('input');
                        element2 = window.opener.document.createElement('input');
                        element2.setAttribute('type', 'hidden');
                        element2.setAttribute('id', 'transDataValue');
                        element2.setAttribute('value', transDataValue);
                        window.opener.document.body.appendChild(element2);
                    }

                    if (!window.opener.document.getElementById('btnTransData')) {
                        let btnElement = window.opener.document.createElement('button');
                        btnElement.setAttribute('id', 'btnTransData');
                        window.opener.document.body.appendChild(btnElement);
                    }
                }

                window.close();
            } else {
                toastr.warning('적용할 행이 없습니다.');
            }
        },

        /**
         * 창고 리스트 가져오기
         * 코드도움을 오픈한 행의 창고가 "생지창고"일 경우 조회조건 없이 전체 조회 (=생지창고는 기본 세팅 창고라서 생지창고로 들어온다는건 신규 입력일 가능성이 높음)
         * @param {function} callback 
         */
        search: function (callback) {
            const vThis = this;

            let params = GX.deepCopy(vThis.queryForm);
            params.EmpSeq = vThis.queryRow.EmpSeq || 0;
            params.DeptSeq = vThis.queryRow.DeptSeq || 0;
            // params.WHName = vThis.queryRow.WHSeq == '생지창고' ? '' : vThis.queryRow.WHName; // 생지창고 = WHSeq: 15
            params.WHName = vThis.queryRow.WHName; // 조회조건의 창고 input의 model은 queryRow.WHName과 연결되어있음

            GX._METHODS_
            .setMethodId('WHCodeHelp')
            .ajax([params], [function (data) {
                if(data.length > 0){
                    vThis.rows.Query = data;
                    toastr.info('조회 결과: ' + vThis.rows.Query.length + '건');
                } else{
                    vThis.rows.Query = [];
                    toastr.info('조회 결과가 없습니다.');
                }

                // 그리드에 데이터 바인딩
                vThis.mainGrid.resetData(vThis.rows.Query);

                // 콜백 실행
                if (typeof callback === 'function') callback();
            }])
        },

        /**
         * @param {int} 선택한 행의 index
         */
        apply: function () {
            const vThis = this;

            vThis.transDataToParent();
        },
    },
    created() {
        toastr.options.progressBar = true;

        const vThis = this;

        GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');

        document.addEventListener('keydown', vThis.eventCheck, false);
        document.addEventListener('keyup', vThis.eventCheck, false);

        window.addEventListener('beforeunload', function (e) {
            e.preventDefault();
            window.opener.document.getElementById('btnTransData').click();
        });

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
    },
    mounted() {
        const vThis = this;

        // dialog grid
        // init grid columns, set grid columns
        ToastUIGrid.setColumns
        .init('noSummary') //.init()
        .setRowHeaders('rowNum')
        .header('창고명').name('WHName').align('left').width(200).whiteSpace().ellipsis().setRow()
        .header('창고Seq').name('WHSeq').align('left').width(80).whiteSpace().ellipsis().setRow()
        ;

        // create dialog grid
        vThis.mainGrid = ToastUIGrid.initGrid('mainGrid');

        vThis.mainGrid.setBodyHeight(200);

        // dialog grid data init
        vThis.rows.Query = [];
        vThis.mainGrid.resetData(vThis.rows.Query);

        // grid editing mode start
        vThis.mainGrid.on('editingStart', function (e) {
            // console.log('editingStart', e)
            // 수정 이전 데이터 가지고 있기
            if (GX._METHODS_.nvl(e.columnName) === 'OkQty' || GX._METHODS_.nvl(e.columnName) === 'Weight' || GX._METHODS_.nvl(e.columnName) === 'GrossQty' || GX._METHODS_.nvl(e.columnName) === 'Stain') {
                vThis.strBeforeEditData = e.value || '0';
            } else {
                vThis.strBeforeEditData = e.value;
            }
        });

        // grid editing mode finish
        vThis.mainGrid.on('editingFinish', function (e) {
            // console.log('editingFinish', e)
            // 숫자인 컬럼 체크
            if (GX._METHODS_.nvl(e.columnName) === 'OkQty' || GX._METHODS_.nvl(e.columnName) === 'Weight' || GX._METHODS_.nvl(e.columnName) === 'GrossQty' || GX._METHODS_.nvl(e.columnName) === 'Stain') {
                // 입력한 데이터가 숫자인지 체크
                if (isNaN(e.value)) {
                    toastr.warning(vThis.mainGrid.getColumn(e.columnName).header + ' : 숫자만 입력 가능합니다.', 'Validation:fail');
                    vThis.mainGrid.setValue(e.rowKey, e.columnName, vThis.strBeforeEditData);
                    return false;
                } else {
                    // 마스터 영역의 합계수량과 디테일 영역의 수량 비교
                    const detailGridQtySum = vThis.mainGrid.getSummaryValues('OkQty').sum;
                    const masterQtySum = GX._METHODS_.nvl(vThis.queryRow.Qty) == '' ? 0 : vThis.queryRow.Qty;

                    // javascript 숫자 12.1000000000000001 이런거 때문에 2째자리에서 반올림하여 비교하도록 수정
                    if (parseFloat(masterQtySum).toFixed(2) < parseFloat(detailGridQtySum).toFixed(2)) {
                        // 마스터 영역의 합계수량 > 디테일 영역의 수량 합계 == 에러 발생
                        toastr.warning('합계(납품)수량(' + masterQtySum + ')은 포장단위입출고 수량(' + detailGridQtySum + ') 보다 작거나 같아야 합니다.', 'Validation:fail');
                        vThis.mainGrid.setValue(e.rowKey, 'OkQty', vThis.strBeforeEditData);
                        return false;
                    }
                }
            }
        });

        // when data bound to the grid is changed 
        vThis.mainGrid.on('onGridUpdated', function (e) {
            // 적재위치 컬럼 다이얼로그 띄울 셀의 색상 변경
            const fillColor = document.querySelectorAll('.tui-grid-cell-has-input[data-column-name="Location"]');
            if (fillColor.length > 0) {
                for (let i = 0; i < fillColor.length; i++) {
                    fillColor[i].style.backgroundColor = '#dddddd';
                }
            }
        });

        // SessionStorage에 있는거 꺼내오기
        vThis.queryForm = GX.SessionStorage.get('codehelp_popup_wh-queryForm') != null ? JSON.parse(GX.SessionStorage.get('codehelp_popup_wh-queryForm')) : {};
        vThis.queryRow = GX.SessionStorage.get('codehelp_popup_wh-queryRow') != null ? JSON.parse(GX.SessionStorage.get('codehelp_popup_wh-queryRow')) : {};
        // 정상적으로 담았으면 SessionStorage 삭제
        if (Object.keys(vThis.queryForm).length > 0 && Object.keys(vThis.queryRow).length > 0) {
            GX.SessionStorage.remove('codehelp_popup_wh-queryForm');
            GX.SessionStorage.remove('codehelp_popup_wh-queryRow');
            // 해당 행에서 가지고 있던 입고창고 세팅
            vThis.queryRow.WHSeq = vThis.queryRow.InWHSeq
            vThis.queryRow.WHName = vThis.queryRow.InWHName
        }

        // grid click event
        vThis.mainGrid.on('click', function(e) {
            vThis.selectedRowKey = e.rowKey || 0;

            // 행 더블 클릭 시 점프 - 모바일 웹에선 그리드 더블클릭 이벤트가 동작하지 않음
            const clickInterval = 600; // ms
            if (vThis.objDblClick.click) {
                if (new Date().getTime() - vThis.objDblClick.time <= clickInterval) {
                    if (e.rowKey || e.rowKey === 0) {
                        vThis.selectedRowKey = e.rowKey;
                        vThis.apply();
                    }
                }
            }
            if (e.rowKey || e.rowKey === 0) {
                vThis.objDblClick.click = true;
                vThis.objDblClick.time = new Date().getTime();
                
                setTimeout(() => {
                    vThis.objDblClick.click = false;
                    vThis.objDblClick.time = 0;
                }, clickInterval)
            }
        });

        // 새로고침 수행 시 SessionStorage 삭제
        let reloadYN = false;
        const entries = performance.getEntriesByType("navigation");
        for (let i = 0; i < entries.length; i++) {
            if (entries[i].type === "reload") {
                reloadYN = true;
                break;
            }
        }
        if (reloadYN) {
            try {
                GX.SessionStorage.remove('codehelp_popup_wh-queryForm');
                GX.SessionStorage.remove('codehelp_popup_wh-queryRow');
            } catch (e) {
                console.log('SessionStorage 삭제 중 에러 발생', e);
            } finally {
                window.close();
            }
        }

        // 화면 처음 열리면 바로 조회
        vThis.search();
    }
});
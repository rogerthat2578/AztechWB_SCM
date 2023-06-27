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
         * @param {String} 생성한 그리드 변수명 (=그리드 id와 맞춰야함)
         */
        gridAppendRow: function (gridId = '') {
            const vThis = this;

            if (GX._METHODS_.nvl(gridId).length > 0) {
                // 행에 컬럼들
                let newRowData = {
                    Seq: 0,
                    Serl: 0,
                    ItemSeq: 0,
                    InOutSeq: 0,
                    InOutSerl: 0,
                    InOutType: 160,
                    InWHSeq: 40,
                    OutWHSeq: 0,
                    AddPackNo: '',
                    StockOkQty: 0,
                    OkQty: 0,
                    StockWeight: 0,
                    Weight: 0,
                    GrossQty: 0,
                    Stain: '0',
                    Shade: '',
                    GradeSeq: 0,
                    Grade: null,
                    Remark: '',
                    InLocationSeq: 12152,
                    InLocationName: '세울D',
                    OutLocationSeq: 0,
                    OutLocationName: ''
                }

                const addIdx = vThis[gridId].getRowCount();
                // let newRowData = {};
                let newRowOptions = {
                    at: addIdx, // The index at which new row will be inserted
                    // extendPrevRowSpan: false, // If set to true and the previous row at target index has a rowspan data, the new row will extend the existing rowspan data.
                    focus: true, // If set to true, move focus to the new row after appending
                };

                vThis[gridId].getColumns().map(k => {
                    if (typeof k.formatter === undefined || typeof k.formatter === 'undefined')
                        newRowData[k.name] = '';
                    else
                        newRowData[k.name] = 0;
                });
                newRowData.InLocationSeq = vThis.queryForm.InLocationSeq || 0;
                newRowData.InLocationName = vThis.queryForm.InLocationName || '';
                newRowData.InOutSeq = vThis.queryRow.DelvSeq || 0;
                newRowData.InOutSerl = vThis.queryRow.DelvSerl || 0;
                newRowData.Seq = vThis.queryRow.Seq || 0;
                newRowData.ItemSeq = vThis.queryRow.ItemSeq || 0;

                vThis[gridId].appendRow(newRowData, newRowOptions);
            }
        },

        /**
         * 화면 로드 시 해당 창고에 속한 적재위치를 가져와 첫번째 적재위치 가지고 있기
         * 행 추가 시 가지고있던 적재위치로 세팅
         */
        getFirstLocation: function () {
            const vThis = this;

            const params = GX.deepCopy(vThis.queryForm);

            params.WHSeq = vThis.queryRow.WHSeq;
            params.WHName = vThis.queryRow.WHName;

            GX._METHODS_
            .setMethodId('LocationCodeHelp')
            .ajax([params], [function (data) {
                // console.log('창고Seq로 Location 가져오기', data)
                if (data.length > 0) {
                    vThis.queryForm.InLocationSeq = data[0].LocationSeq;
                    vThis.queryForm.InLocationName = data[0].LocationName;
                } else {
                    toastr.info('해당 창고에 속한 적재위치가 없습니다.');
                }
            }])
        },
        

        search: function () {
            const vThis = this;

            let params = GX.deepCopy(vThis.queryForm);
            params.InOutDate = vThis.queryRow.DelvDate || ''; // (납품)일자
            params.InOutSeq = vThis.queryRow.DelvSeq || 0; // 입출고내부코드 (DelvSeq)
            params.InOutSerl = vThis.queryRow.DelvSerl || 0; // 입출고내부순번 (DelvSerl)
            params.ItemSeq = vThis.queryRow.ItemSeq || 0; // 품목코드
            params.WHSeq = vThis.queryRow.WHSeq || 0; // 창고코드 (입고창고 고정)
            params.Seq = vThis.queryRow.Seq || 0; // 내부코드 (포장단위코드) (포장단위 테이블의 내부코드)
            params.EmpSeq = vThis.queryRow.EmpSeq || 0;
            params.DeptSeq = vThis.queryRow.DeptSeq || 0;

            GX._METHODS_
            .setMethodId('PackingUnitQuery')
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
            }])
        },
        save: function () {
            const vThis = this;

            // 현재 edit 상태인 셀 적용 처리
            vThis.mainGrid.blur();

            const eleToastTitle = document.querySelector('#toast-container .toast-title')?.innerText || '';
            if (eleToastTitle === 'Validation:fail') {
                toastr.warning('데이터 확인 후 저장해주세요.')
                return false;
            } 

            // 파라메터 선언
            let params = [];

            let getCreated = vThis.mainGrid.getModifiedRows({
                // checkedOnly: false, // defualt=false If set to true, only checked rows will be considered.
                withRawData: false, // defualt=false If set to true, the data will contains the row data for internal use.
                // rowKeyOnly: false, // defualt=false If set to true, only keys of the changed rows will be returned.
                // ignoredColumns: [], // A list of column name to be excluded.
            }).createdRows;

            let getUpdated = vThis.mainGrid.getModifiedRows({
                // checkedOnly: false, // defualt=false If set to true, only checked rows will be considered.
                withRawData: false, // defualt=false If set to true, the data will contains the row data for internal use.
                // rowKeyOnly: false, // defualt=false If set to true, only keys of the changed rows will be returned.
                // ignoredColumns: [], // A list of column name to be excluded.
            }).updatedRows;

            for (let i = 0; i < getCreated.length; i++) {
                getCreated[i].WorkingTag = 'A';
                getCreated[i].BizUnit = vThis.queryRow.BizUnit || 1;
                getCreated[i].EmpSeq = vThis.queryRow.EmpSeq || 0;
                getCreated[i].DeptSeq = vThis.queryRow.DeptSeq || 0;
                getCreated[i].IDX_NO = getCreated[i].rowKey + 1;
                params.push(getCreated[i]);
            }

            for (let i = 0; i < getUpdated.length; i++) {
                getUpdated[i].WorkingTag = 'U';
                getUpdated[i].BizUnit = vThis.queryRow.BizUnit || 1;
                getUpdated[i].EmpSeq = vThis.queryRow.EmpSeq || 0;
                getUpdated[i].DeptSeq = vThis.queryRow.DeptSeq || 0;
                getUpdated[i].IDX_NO = getUpdated[i].rowKey + 1;
                params.push(getUpdated[i]);
            }

            console.log(params)

            if (params.length > 0) {
                toastr.info('저장.');
            } else {
                toastr.warning('저장할 데이터가 없습니다.');
            }
        },
        delRow: function () {
            const vThis = this;

            // 체크된 행만 가져오기
            let arr = vThis.mainGrid.getCheckedRows();
            if (arr.length > 0) {
                if (confirm('선택한 ' + vThis.mainGrid.getCheckedRowKeys().length + '개 행을 삭제하시겠습니까?')) {
                    // 행 삭제
                    vThis.mainGrid.removeCheckedRows();
                    // this.rows.Query 데이터 갱신
                    vThis.rows.Query = vThis.mainGrid.getData();
                }
            } else {
                if (vThis.mainGrid.getData().length > 0) {
                    toastr.warning('삭제할 행을 선택해주세요.');
                } else {
                    toastr.warning('삭제할 데이터가 없습니다. 이전 화면에서 다시 등록 화면으로 넘어와주세요.');
                }
            }
        },
        del: function () {
            const vThis = this;

            toastr.warning('전체 삭제');
        },
    },
    created() {
        toastr.options.progressBar = true;

        const vThis = this;

        GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');

        document.addEventListener('keydown', vThis.eventCheck, false);
        document.addEventListener('keyup', vThis.eventCheck, false);

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
        .init() // .init('noSummary')
        .setRowHeaders('rowNum', 'checkbox')
        .header('적재위치(입고)').name('InLocationName').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('필번(Box)').name('AddPackNo').align('left').width(100).whiteSpace().ellipsis().editor().setRow()
        .header('재고수량').name('StockOkQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('수량').name('OkQty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('중량(실량)').name('Weight').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('재고중량(실량)').name('StockWeight').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('Gross량').name('GrossQty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('Stain').name('Stain').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('Shade').name('Shade').align('left').width(100).whiteSpace().ellipsis().editor().setRow()
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
        vThis.queryForm = GX.SessionStorage.get('codehelp_popup-queryForm') != null ? JSON.parse(GX.SessionStorage.get('codehelp_popup-queryForm')) : {};
        vThis.queryRow = GX.SessionStorage.get('codehelp_popup-queryRow') != null ? JSON.parse(GX.SessionStorage.get('codehelp_popup-queryRow')) : {};
        // 정상적으로 담았으면 SessionStorage 삭제
        if (Object.keys(vThis.queryForm).length > 0 && Object.keys(vThis.queryRow).length > 0) {
            GX.SessionStorage.remove('codehelp_popup-queryForm');
            GX.SessionStorage.remove('codehelp_popup-queryRow');
            vThis.queryRow.MasterQty = GX._METHODS_.nvl(vThis.queryRow.Qty).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
            // 구매납품입력의 입출고유형은 고정 160
            vThis.queryRow.InOutType = 160;
            // vThis.queryRow.InOutTypeGubn = 1;
        }

        // 창고Seq가 있으면 기본 세팅 적재위치 가져오기
        if (vThis.queryRow?.WHSeq) vThis.getFirstLocation();
        
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
                GX.SessionStorage.remove('codehelp_popup-queryForm');
                GX.SessionStorage.remove('codehelp_popup-queryRow');
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
let app = new Vue({
	el: '#app',
	data: {
        queryForm: {},
        // 한개 행에 대한 데이터
        queryRow: {},
        /**
         * rows.Query 포장단위입출고입력 다이얼로그 그리드
         */
		rows: {
            Query: [],
        },
	},
    methods: {
        /**
         * @param {String} 생성한 그리드 변수명 (=그리드 id와 맞춰야함)
         */
        gridAppendRow: function (gridId = '') {
            const vThis = this;

            if (GX._METHODS_.nvl(gridId).length > 0) {
                const addIdx = vThis[gridId].getRowCount();
                let newRowData = {};
                let newRowOptions = {
                    at: addIdx, // The index at which new row will be inserted
                    // extendPrevRowSpan: false, // If set to true and the previous row at target index has a rowspan data, the new row will extend the existing rowspan data.
                    // focus: false, // If set to true, move focus to the new row after appending
                };

                vThis[gridId].getColumns().map(k => {
                    if (typeof k.formatter === undefined || typeof k.formatter === 'undefined')
                        newRowData[k.name] = '';
                    else
                        newRowData[k.name] = 0;
                });

                vThis[gridId].appendRow(newRowData, newRowOptions);
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
        apply: function () {
            const vThis = this;

            // 현재 edit 상태인 셀 적용 처리
            vThis.mainGrid.blur();

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
                params.push(getCreated[i]);
            }

            for (let i = 0; i < getUpdated.length; i++) {
                getUpdated[i].WorkingTag = 'U';
                params.push(getUpdated[i]);
            }

            if (params.length > 0) {
                toastr.info('저장.');
            } else {
                toastr.warning('저장할 데이터가 없습니다.');
            }
        },
    },
    created() {},
    mounted() {
        const vThis = this;

        // dialog grid
        // init grid columns, set grid columns
        ToastUIGrid.setColumns
        .init() // .init('noSummary')
        .setRowHeaders('rowNum', 'checkbox')
        .header('적재위치(입고)').name('Location').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('필번').name('BoxNo').align('left').width(100).whiteSpace().ellipsis().editor().setRow()
        .header('재고수량').name('StockQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('수량').name('Qty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('중량(실량)').name('Wight').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('재고중량(실량)').name('StockWight').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('Gross량').name('Gross').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('Stain').name('Stain').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('Shade').name('Shade').align('left').width(100).whiteSpace().ellipsis().editor().setRow()
        ;

        // create dialog grid
        vThis.mainGrid = ToastUIGrid.initGrid('mainGrid');

        vThis.mainGrid.setBodyHeight(200);

        // dialog grid data init
        vThis.rows.Query = [];
        vThis.mainGrid.resetData(vThis.rows.Query);

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

        // grid dblclick event
        vThis.mainGrid.on('dblclick', function(e) {
            // 행 더블 클릭 시 다이이얼로그 띄우기
            if (e.rowKey || e.rowKey === 0) {
                if (e.columnName === 'Location') {
                    // SessionStorage로 데이터 전달
                    GX.SessionStorage.set('location_popup-queryForm', JSON.stringify(vThis.queryForm))
                    GX.SessionStorage.set('location_popup-queryRow', JSON.stringify(vThis.mainGrid.getRow(e.rowKey)))

                    // window.name = "부모창 이름";
                    window.name = 'parentPopup';

                    let top = Math.floor(screen.availHeight / 4.7);
                    let left = Math.floor(screen.availWidth / 3.8);
                    
                    // window.open("open할 window", "자식창 이름", "팝업창 옵션");
                    vThis.objWinOpen = window.open('location_popup.html', 'childPopup', 'width=800, height=490, scrollbars=no, top=' + top + ', left=' + left);
                    vThis.objWinOpen.focus();
                }
            }
        });

        // SessionStorage에 있는거 꺼내오기
        vThis.queryForm = GX.SessionStorage.get('location_popup-queryForm') != null ? JSON.parse(GX.SessionStorage.get('location_popup-queryForm')) : {};
        vThis.queryRow = GX.SessionStorage.get('location_popup-queryRow') != null ? JSON.parse(GX.SessionStorage.get('location_popup-queryRow')) : {};
        // 정상적으로 담았으면 SessionStorage 삭제
        if (Object.keys(vThis.queryForm).length > 0 && Object.keys(vThis.queryRow).length > 0) {
            GX.SessionStorage.remove('location_popup-queryForm');
            GX.SessionStorage.remove('location_popup-queryRow');
        }
        
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
    }
});
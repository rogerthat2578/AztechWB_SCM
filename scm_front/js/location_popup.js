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
    created() {
        toastr.options.progressBar = true;
    },
    mounted() {
        const vThis = this;

        // dialog grid
        // init grid columns, set grid columns
        ToastUIGrid.setColumns
        .init('noSummary')
        .setRowHeaders('rowNum', 'checkbox')
        .header('적재위치').name('Location').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('적재위치코드').name('LocationSeq').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('창고').name('WHName').align('left').width(120).whiteSpace().ellipsis().setRow()
        .header('창고코드').name('WHSeq').align('left').width(120).whiteSpace().ellipsis().setRow()
        ;

        // create dialog grid
        vThis.mainGrid = ToastUIGrid.initGrid('mainGrid');

        vThis.mainGrid.setBodyHeight(200);

        // dialog grid data init
        vThis.rows.Query = [];
        vThis.mainGrid.resetData(vThis.rows.Query);

        // grid dblclick event
        vThis.mainGrid.on('dblclick', function(e) {
            
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
                GX.SessionStorage.remove('location_popup-queryForm');
                GX.SessionStorage.remove('location_popup-queryRow');
            } catch (e) {
                console.log('SessionStorage 삭제 중 에러 발생', e);
            } finally {
                window.close();
            }
        }
    }
});
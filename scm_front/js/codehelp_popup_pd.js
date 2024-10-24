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
        // 신규 행 추가 시
        newRowData: {
            Seq: 0,
            Serl: 0,
            ItemSeq: 0,
            InOutSeq: 0,
            InOutSerl: 0,
            InOutType: 130,
            InWHSeq: 0,
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
            InLocationSeq: 0,
            InLocationName: '',
            OutLocationSeq: 0,
            OutLocationName: '',
            KonQty: 0
        }
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
                let newRowData = vThis.newRowData;

                const addIdx = vThis[gridId].getRowCount();
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
                newRowData.InOutSeq = vThis.queryRow.WorkReportSeq || 0;
                // newRowData.InOutSerl = vThis.queryRow.DelvSerl || 0;
                newRowData.Seq = vThis.queryRow.Seq || 0;
                newRowData.ItemSeq = vThis.queryRow.ItemSeq || 0;

                vThis[gridId].appendRow(newRowData, newRowOptions);
            }
        },

        /**
         * 화면 로드 시 해당 창고에 속한 적재위치를 가져와 첫번째 적재위치 가지고 있기
         * 행 추가 시 가지고있던 적재위치로 세팅
         */
        /*
        getFirstLocation: function () {
            const vThis = this;

            const params = GX.deepCopy(vThis.queryForm);

            params.InWHSeq = vThis.queryRow.InWHSeq;
            params.InWHName = vThis.queryRow.InWHName;

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
        */

        /**
         * 부모창에 값 전달
         */
        transSeqToParent: function () {
            const vThis = this;

            // if (vThis.rows.Query.length > 0) {
            let transDataRowKey_pd = vThis.queryRow.rowKey || '0';
            let transDataSeq_pd = vThis.rows.Query[0]?.Seq || 0;
            let transDataSumOkQty_pd = vThis.mainGrid.getSummaryValues('OkQty').sum || '0';
            let transDataSumWeight_pd = vThis.mainGrid.getSummaryValues('Weight').sum || '0';

            if (window.opener.name == 'parentPopup_pd') {
                if (window.opener.document.getElementById('transDataRowKey_pd')) {
                    window.opener.document.getElementById('transDataRowKey_pd').value = transDataRowKey_pd;
                } else {
                    let element = window.opener.document.createElement('input');
                    element.setAttribute('type', 'hidden');
                    element.setAttribute('id', 'transDataRowKey_pd');
                    element.setAttribute('value', transDataRowKey_pd);
                    window.opener.document.body.appendChild(element);
                }

                if (window.opener.document.getElementById('transDataSeq_pd')) {
                    window.opener.document.getElementById('transDataSeq_pd').value = transDataSeq_pd;
                } else {
                    let element = window.opener.document.createElement('input');
                    element = window.opener.document.createElement('input');
                    element.setAttribute('type', 'hidden');
                    element.setAttribute('id', 'transDataSeq_pd');
                    element.setAttribute('value', transDataSeq_pd);
                    window.opener.document.body.appendChild(element);
                }

                if (window.opener.document.getElementById('transDataSumOkQty_pd')) {
                    window.opener.document.getElementById('transDataSumOkQty_pd').value = transDataSumOkQty_pd;
                } else {
                    let element = window.opener.document.createElement('input');
                    element = window.opener.document.createElement('input');
                    element.setAttribute('type', 'hidden');
                    element.setAttribute('id', 'transDataSumOkQty_pd');
                    element.setAttribute('value', transDataSumOkQty_pd);
                    window.opener.document.body.appendChild(element);
                }

                if (window.opener.document.getElementById('transDataSumWeight_pd')) {
                    window.opener.document.getElementById('transDataSumWeight_pd').value = transDataSumWeight_pd;
                } else {
                    let element = window.opener.document.createElement('input');
                    element = window.opener.document.createElement('input');
                    element.setAttribute('type', 'hidden');
                    element.setAttribute('id', 'transDataSumWeight_pd');
                    element.setAttribute('value', transDataSumWeight_pd);
                    window.opener.document.body.appendChild(element);
                }

                if (!window.opener.document.getElementById('btnTransData_pd')) {
                    let btnElement = window.opener.document.createElement('button');
                    btnElement.setAttribute('id', 'btnTransData_pd');
                    window.opener.document.body.appendChild(btnElement);
                }
            }
            // }
        },

        search: function (callback) {
            const vThis = this;

            let params = GX.deepCopy(vThis.queryForm);
            params.InOutDate = vThis.queryRow.DelvDate || ''; // (납품)일자
            params.InOutSeq = vThis.queryRow.WorkReportSeq || 0; // 입출고내부코드 (DelvSeq)
            // params.InOutSerl = vThis.queryRow.DelvSerl || 0; // 입출고내부순번 (DelvSerl)
            params.ItemSeq = vThis.queryRow.GoodItemSeq || 0; // 품목코드
            params.InWHSeq = vThis.queryRow.InWHSeq || 0; // 창고코드 (입고창고 고정)
            params.Seq = vThis.queryRow.Seq || 0; // 내부코드 (포장단위코드) (포장단위 테이블의 내부코드)
            params.EmpSeq = vThis.queryRow.EmpSeq || 0;
            params.DeptSeq = vThis.queryRow.DeptSeq || 0;

            GX._METHODS_
            .setMethodId('PackingUnitQuery')
            .ajax([params], [function (data) {
                if(data.length > 0){
                    vThis.rows.Query = data;
                    vThis.queryRow.Seq = vThis.rows.Query[0].Seq || 0;
                    // toastr.info('조회 결과: ' + vThis.rows.Query.length + '건');
                } else{
                    vThis.rows.Query = [];
                    vThis.queryRow.Seq = 0;
                    // toastr.info('조회 결과가 없습니다.');
                }

                // 그리드에 데이터 바인딩
                vThis.mainGrid.resetData(vThis.rows.Query);

                // 콜백 실행
                if (typeof callback === 'function') callback();
            }])
        },

        save: function () {
            const vThis = this;

            // 현재 edit 상태인 셀 적용 처리
            vThis.mainGrid.blur();

            /**
             * 필수값 체크
             * 필번(Box)
             */
            const arrValidation = vThis.mainGrid.validate();
            if (arrValidation.length > 0) {
                let strMsg = '';
                for (let i = 0; i < arrValidation.length; i++) {
                    strMsg += arrValidation[i].rowKey.toString() + '행'
                    if (i != arrValidation.length - 1) strMsg += ', ';
                    else if (i == arrValidation.length - 1) {
                        const colName = vThis.mainGrid.getColumn(arrValidation[i].errors[0].columnName);
                        strMsg += ' ' + colName.header + ' :: ' + '필수값을 입력해주세요.';
                    }
                }
                toastr.warning(strMsg);
                return false;
            }

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
                getCreated[i].InOutDate = vThis.queryRow.DelvDate || '';
                getCreated[i].IDX_NO = getCreated[i].rowKey + 1;
                params.push(getCreated[i]);
            }

            for (let i = 0; i < getUpdated.length; i++) {
                getUpdated[i].WorkingTag = 'U';
                getUpdated[i].BizUnit = vThis.queryRow.BizUnit || 1;
                getUpdated[i].EmpSeq = vThis.queryRow.EmpSeq || 0;
                getUpdated[i].DeptSeq = vThis.queryRow.DeptSeq || 0;
                getUpdated[i].InOutDate = vThis.queryRow.DelvDate || '';
                getUpdated[i].IDX_NO = getUpdated[i].rowKey + 1;
                params.push(getUpdated[i]);
            }

            if (params.length > 0) {
                GX._METHODS_
                .setMethodId('PackingUnitSave')
                .ajax([], params, [function (data) {
                    if (data[0].Status && data[0].Status != 0) {
                        // 뭔가 문제가 발생했을 때 리턴
                        toastr.error('저장 실패 : ' + data[0].Result);
                    } else {
                        toastr.info('저장 성공');
                        vThis.queryRow.Seq = data[0].Seq || 0;
                        vThis.search(vThis.transSeqToParent);
                    }
                }, function (data) {
                }]);
            } else {
                toastr.warning('저장할 데이터가 없습니다.');
            }
        },
        delRow: function () {
            const vThis = this;

            // 체크된 행만 가져오기
            let arr = vThis.mainGrid.getCheckedRows();
            if (arr.length > 0 && arr.length != vThis.mainGrid.getRowCount()) {
                // 전체가 아닌 행 삭제
                if (confirm('선택한 ' + vThis.mainGrid.getCheckedRowKeys().length + '개 행을 삭제하시겠습니까?')) {
                    // 선택한 행 중 테이블에 존재하는 데이터인지 아닌지에 따라 로직 다르게
                    let delRowsServer = []; // SP로 던질거
                    let delRowsClient = []; // 화면에서 삭제할거

                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i].Serl != 0 && arr[i].Serl) {
                            // 삭제 : WorkingTag = 'D'
                            arr[i].WorkingTag = 'D';
                            // 실테이블에 존재하는 데이터는 SP로 삭제를 해야하기에 담아두기
                            delRowsServer.push(arr[i]);
                            // 실테이블에 존재하는 데이터는 SP로 삭제를 해야하기에 체크만 해제
                            vThis.mainGrid.uncheck(arr[i].rowKey);
                        } else {
                            delRowsClient.push(arr[i]);
                        }
                    }

                    if (delRowsServer.length > 0) {
                        // SP로 던질거
                        GX._METHODS_
                        .setMethodId('PackingUnitSave')
                        .ajax([], delRowsServer, [function (data) {
                            if (data[0].Status && data[0].Status != 0) {
                                // 뭔가 문제가 발생했을 때 리턴
                                toastr.error('삭제 실패 : ' + data[0].Result);
                            } else {
                                // 화면에서 지울거
                                if (delRowsClient.length > 0) {
                                    // 행 삭제 - 현재 화면에 남아있는 체크는 실테이블에 없는 데이터라 화면에서 바로 삭제
                                    vThis.mainGrid.removeCheckedRows();
                                }
                                toastr.info('삭제 성공');
                                // 재조회
                                vThis.search(vThis.transSeqToParent);
                            }
                        }, function (data) {
                        }]);
                    } else if (delRowsServer.length == 0 && delRowsClient.length > 0) {
                        // 화면에서 지울거
                        // 행 삭제 - 현재 화면에 남아있는 체크는 실테이블에 없는 데이터라 화면에서 바로 삭제
                        vThis.mainGrid.removeCheckedRows();
                    } else {
                        toastr.warning('삭제할 데이터가 없습니다.');
                    }

                    // this.rows.Query 데이터 갱신
                    vThis.rows.Query = vThis.mainGrid.getData();
                }
            } else if (arr.length > 0 && arr.length == vThis.mainGrid.getRowCount()) {
                // 전체 체크해서 행 삭제 클릭 시 = 전체 삭제
                vThis.del();
            } else {
                // 삭제할 행 없음
                if (vThis.mainGrid.getData().length > 0) {
                    toastr.warning('삭제할 행을 선택해주세요.');
                } else {
                    toastr.warning('삭제할 데이터가 없습니다. 이전 화면에서 다시 등록 화면으로 넘어와주세요.');
                }
            }
        },
        del: function () {
            const vThis = this;

            if (confirm('전체 삭제하시겠습니까?')) {
                // 전체 체크
                vThis.mainGrid.checkAll();
                let arr = vThis.mainGrid.getCheckedRows();
                let chkClient = 0;
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].Serl == 0 || !arr[i].Serl) {
                        chkClient++;
                    }
                }

                if (chkClient == vThis.mainGrid.getRowCount()) {
                    vThis.mainGrid.removeCheckedRows();
                    vThis.rows.Query = [];
                    vThis.mainGrid.resetData(vThis.rows.Query);
                    toastr.info('삭제 성공');
                    return false;
                }

                let delMaster = vThis.mainGrid.getRow(0);
                delMaster.WorkingTag = 'D';

                GX._METHODS_
                .setMethodId('PackingUnitSave')
                .ajax([delMaster], [], [function (data) {
                    if (data[0].Status && data[0].Status != 0) {
                        // 뭔가 문제가 발생했을 때 리턴
                        toastr.error('삭제 실패 : ' + data[0].Result);
                    } else {
                        toastr.info('삭제 성공');
                        // 재조회
                        vThis.search(vThis.transSeqToParent);
                    }
                }, function (data) {
                }]);
            }
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
            window.opener.document.getElementById('btnTransData_pd').click();
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
        .init() // .init('noSummary')
        .setRowHeaders('rowNum', 'checkbox')
        .header('적재위치(입고)').name('InLocationName').align('left').width(100).whiteSpace().ellipsis().editor().validation().setRow()
        .header('필번(Box)').name('AddPackNo').align('left').width(100).whiteSpace().ellipsis().editor().validation().setRow()
        .header('실량(G.W)').name('Weight').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('정량(G.W)').name('OkQty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('콘수').name('KonQty').align('right').width(100).whiteSpace().ellipsis().editor().formatter('addCommaThreeNumbers').setSummary().setRow()
        .header('비고').name('Remark').align('left').width(140).whiteSpace().ellipsis().editor().setRow()
        ;

        // create dialog grid
        vThis.mainGrid = ToastUIGrid.initGrid('mainGrid');

        vThis.mainGrid.setBodyHeight(445);

        // dialog grid data init
        vThis.rows.Query = [];
        vThis.mainGrid.resetData(vThis.rows.Query);

        // grid editing mode start
        vThis.mainGrid.on('editingStart', function (e) {
            // console.log('editingStart', e)
            // 수정 이전 데이터 가지고 있기
            if (GX._METHODS_.nvl(e.columnName) === 'Weight' || GX._METHODS_.nvl(e.columnName) === 'OkQty' || GX._METHODS_.nvl(e.columnName) === 'KonQty') {
                vThis.strBeforeEditData = e.value || '0';
            } else {
                vThis.strBeforeEditData = e.value;
            }
        });

        // grid editing mode finish
        vThis.mainGrid.on('editingFinish', function (e) {
            // console.log('editingFinish', e)
            // 숫자인 컬럼 체크
            if (GX._METHODS_.nvl(e.columnName) === 'Weight' || GX._METHODS_.nvl(e.columnName) === 'OkQty' || GX._METHODS_.nvl(e.columnName) === 'KonQty') {
                // 입력한 데이터가 숫자인지 체크
                if (isNaN(e.value)) {
                    toastr.warning(vThis.mainGrid.getColumn(e.columnName).header + ' : 숫자만 입력 가능합니다.', 'Validation:fail');
                    vThis.mainGrid.setValue(e.rowKey, e.columnName, vThis.strBeforeEditData);
                    return false;
                }
                /* 20230914 수량비교 제거 (박태근이사 요청)
                else {
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
                */
            } else if (GX._METHODS_.nvl(e.columnName) === 'InLocationName') {
                // 적재위치(입고) 명칭으로 조회
                let params = {};
                params.BizUnit = vThis.queryForm.BizUnit || 0;
                params.WHSeq = vThis.queryRow.InWHSeq || 0;
                params.LocationName = e.value || '';
                if (params.BizUnit == 0) {
                    toastr.error('BizUnit이 올바르지 않습니다.');
                    return false;
                } else if (params.WHSeq == 0) {
                    toastr.error('창고가 올바르지 않습니다.');
                    return false;
                } else if (params.LocationName == '') {
                    // toastr.warning('적재위치가 올바르지 않습니다.');
                    return false;
                }

                GX._METHODS_
                .setMethodId('LocationCodeHelp')
                .ajax([params], [function (data) {
                    if (data.length == 1) {
                        vThis.mainGrid.setValue(e.rowKey, 'InLocationSeq', data[0].LocationSeq);
                        vThis.mainGrid.setValue(e.rowKey, 'InLocationName', data[0].LocationName);
                    } else if (data.length > 1) {
                        toastr.warning('조회 결과가 다수입니다. 첫번째 적재위치를 세팅합니다.');
                        vThis.mainGrid.setValue(e.rowKey, 'InLocationSeq', data[0].LocationSeq);
                        vThis.mainGrid.setValue(e.rowKey, 'InLocationName', data[0].LocationName);
                    } else if (data.length == 0) {
                        toastr.warning('조회 결과가 없습니다.');
                        vThis.mainGrid.setValue(e.rowKey, 'InLocationSeq', 0);
                        vThis.mainGrid.setValue(e.rowKey, 'InLocationName', '');
                    }
                }]);
            } else if (GX._METHODS_.nvl(e.columnName) === 'AddPackNo') {
                // 필번 중복 체크
                // 같은 필번이 있는지
                let boolSame = false;
                vThis.mainGrid.getData().some(r1 => {
                    if (e.rowKey != r1.rowKey) {
                        // 현재 비교할 필번의 행은 제외
                        if (GX._METHODS_.nvl(e.value) == r1.AddPackNo && GX._METHODS_.nvl(e.value) != '') {
                            // 빈값은 비교 제외, 같은 필번 있는지
                            vThis.mainGrid.setValue(e.rowKey, e.columnName, '');
                            boolSame = true;
                            return boolSame;
                        }
                    }
                });

                if (boolSame) {
                    toastr.warning('필번이 중복 입력되어 삭제하였습니다.');
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

        vThis.mainGrid.on('afterChange', function (e) {
            if (e.origin == 'paste') {
                // 붙여넣기 발생 시
                // 붙여넣기 발생한 행의 행index, 컬럼, 이전 데이터, 현재 데이터
                let arrChanges = e.changes;
                let arrRowKeys = [];
                let boolPasteLoca = false;
                for (let i = 0; i < arrChanges.length; i++) {
                    arrRowKeys.push(arrChanges[i].rowKey);
                    let getRow = GX.deepCopy(vThis.mainGrid.getRow(arrChanges[i].rowKey));
                    Object.keys(vThis.newRowData).map((k) => {
                        if (GX._METHODS_.nvl(getRow[k]).length == 0) {
                            // 추가된 행에 없는 컬럼, 데이터 추가
                            if (arrChanges[i].columnName == k && arrChanges[i].columnName == 'AddPackNo') {
                                // 필번(Box) 컬럼에 붙여넣기 발생 시 붙여넣을 데이터 그대로 넣기
                                getRow[k] = arrChanges[i].value;
                            } else if (arrChanges[i].columnName == k && arrChanges[i].columnName == 'InLocationName') {
                                // 적재위치(입고) 컬럼에 붙여넣기 발생 시 붙여넣을 데이터 그대로 넣기
                                getRow[k] = arrChanges[i].value;
                            } else if (arrChanges[i].columnName == k && (arrChanges[i].columnName == 'Weight' || arrChanges[i].columnName == 'OkQty' || arrChanges[i].columnName == 'KonQty' || arrChanges[i].columnName == 'Remark')) {
                                // 입력되는 컬럼들이 새로만들어지는 두번째 행부터 값이 정상적으로 안들어감.
                                // 그래서 입력될 수 있는 컬럼들에 데이터 넣는 부분 추가
                                if (isNaN(arrChanges[i].value)) {
                                    getRow[k] = arrChanges[i].value || '';
                                } else {
                                    getRow[k] = arrChanges[i].value || 0;
                                }
                            } else {
                                getRow[k] = vThis.newRowData[k];
                            }
                        } else {
                            if (arrChanges[i].columnName == k && arrChanges[i].columnName == 'InLocationName') {
                                // 적재위치seq를 가져와야하는지
                                boolPasteLoca = true;
                            }
                        }
                    });

                    vThis.mainGrid.setRow(arrChanges[i].rowKey, getRow);
                }
                
                if (boolPasteLoca) {
                    // 적재위치 명칭으로 조회. 이전의 적재위치 명칭과 같을 경우 조회 안함.
                    let tempLocaName = '';
                    let tempLocaSeq = 0;
                    vThis.mainGrid.getData().map(r => {
                        if (arrRowKeys.length > 0 && arrRowKeys.some((v) => v == r.rowKey)) {
                            let params = {};
                            params.BizUnit = vThis.queryForm.BizUnit || 0;
                            params.WHSeq = vThis.queryRow.InWHSeq || 0;
                            params.LocationName = r.InLocationName || '';
                            if (params.BizUnit == 0) {
                                toastr.error('BizUnit이 올바르지 않습니다.');
                                return false;
                            } else if (params.WHSeq == 0) {
                                toastr.error('창고가 올바르지 않습니다.');
                                return false;
                            } else if (params.LocationName == '') {
                                toastr.warning(r.rowKey + 1 + '번 행의 적재위치명이 없습니다.');
                            } else {
                                if (params.LocationName != tempLocaName) {
                                    // 이전의 적재위치 명칭과 다른 경우 조회
                                    GX._METHODS_
                                    .setMethodId('LocationCodeHelp')
                                    .ajax([params], [function (data) {
                                        if (data.length == 1) {
                                            tempLocaSeq = data[0].LocationSeq;
                                            tempLocaName = data[0].LocationName;
                                            vThis.mainGrid.setValue(r.rowKey, 'InLocationSeq', tempLocaSeq);
                                            vThis.mainGrid.setValue(r.rowKey, 'InLocationName', tempLocaName);
                                        } else if (data.length > 1) {
                                            toastr.warning(r.rowKey + 1 + '번 행의 적재위치 조회 결과가 다수입니다. 첫번째 적재위치를 세팅합니다.');
                                            tempLocaSeq = data[0].LocationSeq;
                                            tempLocaName = data[0].LocationName;
                                            vThis.mainGrid.setValue(r.rowKey, 'InLocationSeq', tempLocaSeq);
                                            vThis.mainGrid.setValue(r.rowKey, 'InLocationName', tempLocaName);
                                        } else if (data.length == 0) {
                                            toastr.warning(r.rowKey + 1 + '번 행의 적재위치 조회 결과가 없습니다.');
                                            tempLocaSeq = 0;
                                            tempLocaName = '';
                                            vThis.mainGrid.setValue(r.rowKey, 'InLocationSeq', 0);
                                            vThis.mainGrid.setValue(r.rowKey, 'InLocationName', '');
                                        }
                                    }]);
                                } else {
                                    // 이전의 적재위치 명칭과 같을 경우 조회 안하고 이전 적재위치 명칭과 Seq를 세팅
                                    vThis.mainGrid.setValue(r.rowKey, 'InLocationSeq', tempLocaSeq);
                                    vThis.mainGrid.setValue(r.rowKey, 'InLocationName', tempLocaName);
                                }
                            }
                        }
                    });
                }

                let arrWarningMsg = [];
                // 필번 중복 체크
                vThis.mainGrid.getData().map(r1 => {
                    // 같은 필번이 있는지
                    let boolSame = false;

                    // 비교 대상 필번을 위한 반복
                    vThis.mainGrid.getData().map(r2 => {
                        if (r1.rowKey != r2.rowKey && r1.rowKey < r2.rowKey) {
                            // 현재 비교할 필번의 행은 제외
                            if (GX._METHODS_.nvl(r1.AddPackNo) == GX._METHODS_.nvl(r2.AddPackNo) && GX._METHODS_.nvl(r1.AddPackNo) != '' && GX._METHODS_.nvl(r2.AddPackNo) != '') {
                                // 빈값은 비교 제외, 같은 필번 있는지
                                vThis.mainGrid.setValue(r2.rowKey, 'AddPackNo', '');
                                arrWarningMsg.push(r2.rowKey + 1 + '행 ')

                                // 중복된 값이 있는 경우 한번만 변경
                                if (!boolSame) boolSame = true;
                            }
                        }
                    });
                });

                if (arrWarningMsg.length > 0) {
                    toastr.warning(arrWarningMsg.join('') + '중복 입력된 필번을 삭제하였습니다.');
                }
            }
        });

        // SessionStorage에 있는거 꺼내오기
        vThis.queryForm = GX.SessionStorage.get('codehelp_popup_pd-queryForm') != null ? JSON.parse(GX.SessionStorage.get('codehelp_popup_pd-queryForm')) : {};
        vThis.queryRow = GX.SessionStorage.get('codehelp_popup_pd-queryRow') != null ? JSON.parse(GX.SessionStorage.get('codehelp_popup_pd-queryRow')) : {};
        // 정상적으로 담았으면 SessionStorage 삭제
        if (Object.keys(vThis.queryForm).length > 0 && Object.keys(vThis.queryRow).length > 0) {
            GX.SessionStorage.remove('codehelp_popup_pd-queryForm');
            GX.SessionStorage.remove('codehelp_popup_pd-queryRow');
            vThis.queryRow.MasterQty = GX._METHODS_.nvl(vThis.queryRow.ProdQty).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
            // 외주납품입력의 입출고유형은 고정 130
            vThis.queryRow.InOutType = 130;
            // vThis.queryRow.InOutTypeGubn = 1;
        }

        // 창고Seq가 있으면 기본 세팅 적재위치 가져오기
        // if (vThis.queryRow?.InWHSeq) vThis.getFirstLocation();
        
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
                GX.SessionStorage.remove('codehelp_popup_pd-queryForm');
                GX.SessionStorage.remove('codehelp_popup_pd-queryRow');
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
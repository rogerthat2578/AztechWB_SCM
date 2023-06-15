ToastUIGrid = {
    /**
     * @param {String} 그리드를 출력할 div 태그의 id
     * @param {Object} 컬럼 설정 (Array) ex. [{header: 'No',....}, {header: '발주번호',....}, {header: '발주일자',....},]
     * @param {Object} Row의 헤더 설정 (Array) ex. [{type: 'ROWNUM'},{type: 'RowCheck'}]
     * @param {Object} 합계 행 설정 (Object) ex. {height: 40, position: 'top', columnContent: { price: { template(valueMap) { return `합계 : ${valueMap.sum}원`; } } }}
     * @returns tui-grid Object
     * @call const valGrid = ToastUIGrid.initGrid(p1, p2, p3);
     */
    initGrid: (targetElementId = 'grid', arrColumn = [], arrRowHeader = [], objSummary = {}) => {
        // 그리드 객체
        const Grid = tui.Grid;

        /**
         * Grid 테마 커스텀
         * Grid.applyTheme('striped', {...}) : 
         * @param {String} default : 프리셋 (기본)
         * @param {String} striped : 프리셋 (줄무늬)
         * @param {String} clean : 프리셋 (클린)
         *      - preset theme name. Available values are 'default', 'striped' and 'clean'.
         *      - https://nhn.github.io/tui.grid/latest/Grid#applyTheme
         */
        Grid.applyTheme('defualt',  {
            cell: {
                // normal: {
                //     border: 'black'
                // },
                // header: {
                //     background: 'gray',
                //     text: 'white'
                // },
                // evenRow: {
                //     background: '#fee'
                // }
            }
        });

        /**
         * 그리드 설정
         * @variable {Dom} el : 그리드 element(DOM)
         * @variable {boolean} scrollX : X 스크롤 사용여부
         * @variable {boolean} scrollY : Y 스크롤 사용여부
         * @variable {boolean} draggable : 드래그 사용 여부. 드래그: Row를 드래그&드랍으로 위치 이동
         * @variable {Object} header
         *      - @variable {Number} height : 헤더 높이
         * @variable {Number || String} bodyHeight : 그리드 바디 높이 [Default: 'auto']
         *      - @variable number | 'auto' | 'fitToParent'
         * @variable {*} contextMenu : 마우스 우클릭 옵션
         * @variable {Array} columns :
         *      - @variable {String} header : 컬럼명(헤더)
         *      - @variable {String} name : 컬럼 name (input data와 이름이 일치해야함)
         *      - @variable {String} align : 정렬
         *      - @variable {Number} width : 너비
         *      - @variable {String} whiteSpace : 줄바꿈 설정
         *      - @variable {Function} formatter : 출력 포멧
         * @variable {Object} columnOptions : 컬럼 옵션
         *      - @variable {boolean} resizable : 컬럼 사이즈 조정 가능 여부. default: false
         * @variable {Object} summary : 합계 행 추가
         *      - @variable {String} height : 합계 행 높이
         *      - @variable {String} position: 합계 행 출력 위치. 'top'/'bottom
         *      - @variable {Object}  ex. columnContent: {price(컬럼key): {template(valueMap) { return `${valueMap.sum}`.toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'); }},}
         * 기타 옵션은 공식 document를 참조하자.
         */
        const setTuiGrid = new Grid({
            el: document.getElementById(targetElementId),
            scrollX: true,
            scrollY: true,
            draggable: false,
            header: { },
            bodyHeight: Object.keys(objSummary).length == 0 ? ToastUIGrid.setColumns.summary.height == 0 ? 612 : 612 - ToastUIGrid.setColumns.summary.height : 612 - objSummary.height, // 612, 572,
            contextMenu: ({ rowKey, columnName }) => (
                [
                    [
                        {
                            name: 'alertToast',
                            label: '텍스트 전체 보기',
                            action: function () {
                                // 말줄임 표시되어 있는거 Toastr로 보여주기
                                toastr.info(this.data.DataBlock1[rowKey][columnName]);
                            }
                        },
                    ],
                ]
            ),
            rowHeaders: arrRowHeader.length == 0 ? ToastUIGrid.setColumns.rowHeaders : arrRowHeader,
            columns: arrColumn.length == 0 ? ToastUIGrid.setColumns.pushColDatas : arrColumn,
            columnOptions: {
                resizable: true,
            },
            summary: Object.keys(objSummary).length == 0 ? ToastUIGrid.setColumns.summary : objSummary,
        });

        return setTuiGrid;
    },

    /**
     * @call ToastUIGrid.setColumns.
     */
    setColumns: {
        pushColDatas: [],
        options: {},
        rowHeaders: [],
        summary: {
            height: 0,
            position: 'top',
            columnContent: {}
        },
        setRowHeaders: function (...arg) {
            if (arg.length > 0) {
                this.rowHeaders = [];
                arg.forEach(v => {
                    let objTemp = {};
                    /*
                    if (v == 'checkbox') {
                        objTemp.type = 'checkbox';
                        objTemp.header = `
                            <label for="all-checkbox" class="checkbox">
                                <input type="checkbox" id="all-checkbox" class="hidden-input" name="_checked" />
                            </label>` // <span class="custom-input">all</span> -> checkbox 옆에 라벨 추가. 라벨 클릭 시 체크됨
                    } else {
                        objTemp.type = v;
                    }
                    */
                    objTemp.type = v;
                    this.rowHeaders.push(objTemp)
                });
            }
            return this;
        },
        setSummary: function (v) {
            v = GX._METHODS_.nvl(v) == '' ? this.options.name : v;
            this.summary.height = 40;
            this.summary.columnContent[v] = {
                template: function (valueMap) {
                    return `${valueMap.sum || 0}`.toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                }
            }
            return this;
        },
        header: function (v) {
            this.options.header = v ? v : '';
            return this;
        },
        name: function (v) {
            this.options.name = v ? v : '';
            return this;
        },
        align: function (v) {
            this.options.align = v ? v : 'center';
            return this;
        },
        width: function (v) {
            this.options.width = v ? v : 80;
            return this;
        },
        /**@param {String} 줄바꿈 여부 nowrap/normal/pre... Default: nowrap */
        whiteSpace: function (v = 'nowrap') {
            this.options.whiteSpace = v ? 'nowrap' : v;
            return this;
        },
        /**@param {boolean} 말줄임 표시 true/false. Default: true */
        ellipsis: function (v = true) {
            this.options.ellipsis = v ? true : false;
            return this;
        },
        /**@param {boolean} 정렬 여부 true/false. Default: false, sortingType: ase */
        sortable: function (v = false) {
            this.options.sortable = v ? true : false;
            this.options.sortingType = 'desc';
            return this;
        },
        editor: function (v, listItems = []) {
            if (v === 'date') {
                this.options.editor = {
                    type: 'datePicker',
                    options: {
                        language: 'ko',
                        // format: 'yyyy-MM-dd', // format 옵션이 안먹힘
                    }
                }
            } else if (v === 'selectBox') {
                this.options.editor = {
                    type: 'select',
                    options: {
                        listItems: listItems
                    }
                }
            } else {
                this.options.editor = v ? v : 'text';
            }
            return this;
        },
        formatter: function (v, o = {}) {
            if (GX._METHODS_.nvl(v) !== '') {
                
                switch (v) {
                    case 'addWonTextAfter':
                        this.options = {
                            ...this.options,
                            formatter ({value}) {
                                return `${value}원`;
                            }
                        }
                        break;
                    case 'addCommaThreeNumbers':
                        this.options = {
                            ...this.options,
                            formatter ({value}) {
                                return `${value || 0}`.toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                            }
                        }
                        break;
                    case 'addHyphen8length':
                        this.options = {
                            ...this.options,
                            formatter ({value}) {
                                if (GX._METHODS_.nvl(`${value}`).length === 8)
                                    return `${value}`.toString().replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
                                else
                                    return `${value}`;
                            }
                        }
                        break;
                    case 'selectBox':
                        // 내장 포매터 = listItemText
                        this.options = {
                            ...this.options,
                            formatter: 'listItemText'
                        }
                        break;
                    case 'checkbox':
                        this.options = {
                            ...this.options,
                            formatter: function (r) {
                                const pObj = Object.keys(o);

                                if (pObj.length > 0) {
                                    const attrDisabled = o[pObj.filter(f => f === 'attrDisabled' ? o[f] : '')];
                                    const strColKey = o[pObj.filter(f => f === 'colKey' ? o[f] : '')];

                                    if (r.row[strColKey] === 'Y' || r.row[strColKey] === 'N') {
                                        return r.row[strColKey] === 'Y' ? `<input type="checkbox" value="${r.row[strColKey]}" ${attrDisabled} checked />` : `<input type="checkbox" value="${r.row[strColKey]}" ${attrDisabled} />`
                                    } else {
                                        // 0 or 1 | true or false -> 문자열로 인식하는 경우가 있기에 조건식에 JSON.parse를 해준다.
                                        return JSON.parse(r.row[strColKey]) ? `<input type="checkbox" value="${r.row[strColKey]}" ${attrDisabled} checked />` : `<input type="checkbox" value="${r.row[strColKey]}" ${attrDisabled} />`
                                    }
                                }
                            }
                        }
                        break;
                    default:
                        break;
                }
                return this;
            }
        },
        setRow: function () {
            this.pushColDatas.push(this.options);
            this.options = {};
            return this;
        },
        init: function () {
            this.pushColDatas = [];
            this.options = {};
            this.rowHeaders = [];
            this.summary = {
                height: 40,
                position: 'top',
                columnContent: {}
            };
            return this;
        },
    },
};
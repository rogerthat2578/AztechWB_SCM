# AztechWB_SCM
### 아즈텍WB PDA, SCM 접속 정보, 서버 정보, 소스 반영 위치는 IMS에서 확인
- http://ims.gaonsoft.com/projects/k-system/wiki/AZTECHWB


## 로컬에서 개발 시 
### VSCode
1. git clone으로 소스 받기
2. VSCode에서 해당 프로젝트 폴더 오픈
3. VSCode의 Terminal에서 노드 모듈들 설치
- 폴더 오픈으로 열었으면 Terminal 기본 위치가 해당 프로젝트 폴더 내부일것임. 해당 프로젝트 폴더 내부에서 설치 진행
```bach
npm install
```
4. VSCode의 Terminal에서 "nodeWebServer.js"를 node로 실행
- 폴더 오픈으로 열었으면 Terminal 기본 위치가 해당 프로젝트 폴더 내부일것임. 해당 프로젝트 폴더 내부에 "nodeWebServer.js" 파일이 있음
```bash
node nodeWebServer.js
```


### TUI
- Toast UI Grid Github : https://github.com/nhn/tui.grid
- Toast UI Grid Web Page : https://nhn.github.io/tui.grid/latest/

# 아즈텍WB SCM Test Project 

## DataTable을 Toast UI Grid로 변경
 - 정렬
 - Cell 단위 Copy & Paste
 - 컬럼 사이즈 조정
 - 대용량 데이터 랜더링

## 이전 화면 이력 유지
 - 초기 설계부터 TabView와 같은 이전 화면을 유지하는것을 고려 안함
 - 현재 상태에서 전체 구조를 수정하는것 보다 빠르게 구현 가능함


### Toast UI Grid 

1. 소스 구성
 - js > lib > tui-grid.js : Toast UI Grid 라이브러리
 - js > lib > tui-data-picker.js : Toast UI DatePicker 라이브러리
 - js > common > tuiGrid.js : 사용하기 편하도록 모듈화
 - js > gridTest.js, gridTest.html : 구매발주품목조회 화면을 토대로 그리드를 적용한 테스트 스크립트, 화면

2. Grid
 - Vue 2.X 기준 mounted 매소드 내부에서 그리드 초기 설정해아함.
 - 그리드 설정
  > 컬럼, 컬럼 헤더, 행, 행 헤더, 바인딩 키, 데이터 포맷, 데이터 align(left, center, right), 정렬(Sort) 여부, 합계 행, ...등등
  > 길고 복잡한 그리드 설정을 tuiGrid.js에 매소드들로 만들어두어 행 단위로 설정할 수 있도록함. 행의 마지막은 setRow()로 마무리
 ```
const vThis = this;

ToastUIGrid.setColumns
.init()
.setRowHeaders('rowNum', 'checkbox')
.header('진행상태').name('SMCurrStatusName').align('center').width(80).whiteSpace().ellipsis().setRow()
.header('발주일').name('PODate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
.header('발주부서').name('DeptName').align('center').width(150).whiteSpace().ellipsis().sortable(true).setRow()
.header('납기일').name('DelvDate').align('center').width(100).whiteSpace().ellipsis().formatter('addHyphen8length').sortable(true).setRow()
.header('납품예정일').name('DelvPlanDate').align('center').width(100).whiteSpace().ellipsis().editor('date').formatter('addHyphen8length').sortable(true).setRow()
.header('품번').name('ItemNo').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
.header('품명').name('ItemName').align('left').width(120).whiteSpace().ellipsis().sortable(true).setRow()
.header('규격').name('Spec').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('단위').name('UnitName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('발주수량').name('Qty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('발주단가').name('Price').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('발주금액').name('CurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('부가세').name('CurVAT').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('금액계').name('TotCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('미납수량').name('RemainQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('납품수량').name('DelvQty').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('납품금액').name('DelvCurAmt').align('right').width(100).whiteSpace().ellipsis().formatter('addCommaThreeNumbers').setSummary().sortable(true).setRow()
.header('입고창고').name('WHName').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('비고').name('Remark1').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('Order품명').name('OrderItemName').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('Order품번').name('OrderItemNo').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('BuyerNo.').name('BuyerNo').align('left').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('사이즈').name('SizeName').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('색상').name('ColorNo').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
.header('사용부위').name('UseSelect').align('center').width(100).whiteSpace().ellipsis().sortable(true).setRow()
;
```
 - 그리드 생성, 변수에 할당
  > mainGrid : 생성한 그리드를 할당할 변수명
  > 'grid' : 그리드가 들어갈 Element id
```
vThis.mainGrid = ToastUIGrid.initGrid('grid');
```
 - 그리드 데이터 초기화 or 그리드 데이터 바인딩
  > vThis.rows.Query : 조회 결과를 담아둘 변수
  > vThis.rows.Query = [] : 초기화
  > vThis.mainGrid.resetData(vThis.rows.Query) : resetData()에 배열 형태의 데이터를 담으면 그리드에 해당 데이터를 출력함. 현재는 [] 비어있기에 아무 데이터를 출력하지 않음
```
vThis.rows.Query = [];
vThis.mainGrid.resetData(vThis.rows.Query);
```
 - 그리드 이벤트 (+ 이벤트 함수 안쪽 로직 수정하여 사용하면됨)
  > 클릭, 더블클릭, 행 헤더 체크박스 체크 활성화, 행 헤더 체크박스 체크 비활성화, 그리드 셀 데이터 변경 후(edit 상태 빠져나왔을때), ...등등
  > 이벤트 함수 내부에서 this 사용시 함수 내부의 this로 인식하게되기에 상단에서 선언한 const vThis = this; vThis를 사용함.
  > afterChange 이벤트의 마지막 부분에 saveHistory 함수는 이전 이력 유지 기능의 함수임. 데이터가 변경되었을 경우 변경된 데이터를 SessionStorage에 갱신해주기 위함
```
// grid click event
vThis.mainGrid.on('click', function (e) {
    // e.targetType = cell / rowHeader / columnHeader / etc (cell 다중 선택)
    if (GX._METHODS_.nvl(e.targetType) === 'cell') {
        console.log('click', e)
    }
});

// grid dblclick event
vThis.mainGrid.on('dblclick', function (e) {
    if (GX._METHODS_.nvl(e.targetType) === 'cell' && GX._METHODS_.nvl(e.columnName) !== 'DelvPlanDate') {
        console.log('dblclick', e)
    }
});

// grid rowHeader checkbox event : true
vThis.mainGrid.on('check', (ev) => {
    // alert(`check: ${ev.rowKey}`);
    vThis.selectedChkRow[ev.rowKey] = vThis.rows.Query[ev.rowKey];
});

// grid rowHeader checkbox event : false
vThis.mainGrid.on('uncheck', (ev) => {
    // alert(`uncheck: ${ev.rowKey}`);
    delete vThis.selectedChkRow[ev.rowKey];
});

// after editing grid data
vThis.mainGrid.on('afterChange', function (e) {
    // 최초 값이랑 비교하는 로직은 없음. 현재 데이터와 현재 데이터 바로 직전 데이터 비교
    let i = 0;
    while (i < e.changes.length) {
        const changedOriginIdx = vThis.rows.ChangeIdx.findIndex(el => el == e.changes[i].rowKey);
        if (GX._METHODS_.nvl(e.changes[i].prevValue) != GX._METHODS_.nvl(e.changes[i].value)) {
            vThis.rows.Query[e.changes[i].rowKey][e.changes[i].columnName] = GX._METHODS_.nvl(e.changes[i].value); // watch에서 감지 못함
            if (changedOriginIdx == -1) vThis.rows.ChangeIdx.push(e.changes[i].rowKey);
        } else {
            if (changedOriginIdx != -1) {
                // 같은 값이 2개 들어가있다면 1개 삭제
                let arrTemp = [];
                let startIdx = vThis.rows.ChangeIdx.indexOf(e.changes[i].rowKey);
                while (startIdx != -1) {
                    arrTemp.push(startIdx);
                    startIdx = vThis.rows.ChangeIdx.indexOf(e.changes[i].rowKey, startIdx + 1);
                }
                if (arrTemp.length > 1) vThis.rows.ChangeIdx.splice(changedOriginIdx, 1);
            }
        }
        i++;

        if (i == e.changes.length) vThis.saveHistory();
    }
});
```

### 이전 화면 이력 유지

1. SessionStorage 사용
 - javascript SessionStorage 문법을 그대로 사용해도됨
 - 해당 프로젝트에서 만들어둔 SessionStorage 관련 메소드가 있어서 사용함
```
해당 프로젝트에서만들어둔 SessionStorage 메소드 예시)
GX.SessionStorage.set(세션스토리지 키, 데이터-문자열)
GX.SessionStorage.get(세션스토리지 키)
```

2. 이전 이력 관리 방식
 - Vue 2.X methods 객체 내부에 아래 내용 추가
```
/**
* 조회조건, 조회결과 데이터 SessionStorage에 담기
*/
saveHistory: function () {
    GX.SessionStorage.set(this.locationPath + '-queryForm', JSON.stringify(this.queryForm));
    GX.SessionStorage.set(this.locationPath + '-rows.Query', JSON.stringify(this.rows.Query));
},
saveChangedHistory: function () {
    GX.SessionStorage.set(this.locationPath + '-rows.ChangeIdx', JSON.stringify(this.rows.ChangeIdx));
},
loadHistory: function () {
    const vThis = this;
    const queryForm = GX._METHODS_.nvl(GX.SessionStorage.get(vThis.locationPath + '-queryForm')) == '' ? {} : JSON.parse(GX.SessionStorage.get(vThis.locationPath + '-queryForm'));
    const rowsQuery = GX._METHODS_.nvl(GX.SessionStorage.get(vThis.locationPath + '-rows.Query')) == '' ? [] : JSON.parse(GX.SessionStorage.get(vThis.locationPath + '-rows.Query'));
    const rowsChangeIdx = GX._METHODS_.nvl(GX.SessionStorage.get(vThis.locationPath + '-rows.ChangeIdx')) == '' ? [] : JSON.parse(GX.SessionStorage.get(vThis.locationPath + '-rows.ChangeIdx'));

    if (Object.keys(queryForm).length > 0) {
        vThis.queryForm = queryForm;
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
    }
    if (rowsQuery.length > 0) {
        vThis.rows.Query = rowsQuery;
        vThis.rows.ChangeIdx = rowsChangeIdx;
        vThis.mainGrid.resetData(vThis.rows.Query);
    }
},
```
 - watch 메소드 사용
  > Vue 2.X의 watch 사용
  > this.rows.Query가 변경될 경우 saveHistory 함수 실행
  > this.rows.ChangeIdx가 변경될 경우 saveChangedHistory 함수 실행. ChangeIdx는 데이터 변경이 발생한 행의 index만 가지고 있는 변수
  > 단, 해당 변수가 [{}, {}, {}, ...] 와 같이 배열<객체들>이고 객체들 중 하나의 요소가 변경될 경우 감지하지 못함.
```
watch: {
    'rows.Query': 'saveHistory',
    'rows.ChangeIdx': 'saveChangedHistory'
},
```
 - Vue 2.X 기준 mounted 매소드 내부에 아래 내용 추가
  > 새로고침 수행 시 해당 화면의 SessionStorage를 삭제하며 새로고침의 목적대로 화면 초기화 수행할 수 있도록함.
```
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
    GX.SessionStorage.remove(vThis.locationPath + '-queryForm');
    GX.SessionStorage.remove(vThis.locationPath + '-rows.Query');
    GX.SessionStorage.remove(vThis.locationPath + '-rows.ChangeIdx');
} else {
    vThis.loadHistory();
}
```
> 아래 부분은 reload (새로고침) 발생 여부를 감지하기 위한 로직
```
let reloadYN = false;
const entries = performance.getEntriesByType("navigation");
for (let i = 0; i < entries.length; i++) {
    if (entries[i].type === "reload") {
        reloadYN = true;
        break;
    }
}
```

### Toast UI Datepicker

1. 조회 조건 from-to 날짜 입력 받는 부분에 사용
> html
```
<li class="date">
    <div class="tui-datepicker-input tui-datetime-input-custom-short tui-has-focus">
        <input type="text" id="PODateFr-startpicker-input" aria-label="Date" style="font-size: 14px;">
        <span class="icon-x web">X</span>
        <div id="PODateFr-startpicker-container" style="margin-left: -1px;"></div>
    </div>
    <div class="tui-datepicker-input tui-datetime-input-custom-short tui-has-focus">
        <input id="PODateTo-endpicker-input" type="text" aria-label="Date" style="font-size: 14px;">
        <span class="icon-x web">X</span>
        <div id="PODateTo-endpicker-container" style="margin-left: -1px;"></div>
    </div>
</li>
```
> js
- init from to Datepicker
```
const today = new Date();
vThis.rangePickerPODate = new tui.DatePicker.createRangePicker({
    startpicker: {
        date: today,
        input: '#PODateFr-startpicker-input',
        container: '#PODateFr-startpicker-container'
    },
    endpicker: {
        date: today,
        input: '#PODateTo-endpicker-input',
        container: '#PODateTo-endpicker-container'
    },
    format: 'yyyy-MM-dd',
    language: 'ko',
    timePicker: false
});
```
- put default data into "this.queryForm.~"
```
vThis.queryForm.PODateFr = vThis.rangePickerPODate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
```
- regist range datepicker change event
```
vThis.rangePickerPODate.on('change:start', () => {
    if (vThis.rangePickerPODate.getStartDate())
        vThis.queryForm.PODateFr = vThis.rangePickerPODate.getStartDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
});
vThis.rangePickerPODate.on('change:end', () => {
    if (vThis.rangePickerPODate.getEndDate())
        vThis.queryForm.PODateTo = vThis.rangePickerPODate.getEndDate().toLocaleDateString('ko-kr', {year: 'numeric', month: '2-digit', day: '2-digit'}).replace(/\./g, '').replace(/\ /g, '');
});
```

- tui-datepicker에서 날짜를 바인딩 시킬때 Date 형식으로 바인딩해야함 
```
vThis.rangePickerPODate.setStartDate(new Date(parseInt(vThis.queryForm.PODateFr.substring(0, 4)), parseInt(vThis.queryForm.PODateFr.substring(4, 6)) - 1, parseInt(vThis.queryForm.PODateFr.substring(6))));
vThis.rangePickerPODate.setEndDate(new Date(parseInt(vThis.queryForm.PODateTo.substring(0, 4)), parseInt(vThis.queryForm.PODateTo.substring(4, 6)) - 1, parseInt(vThis.queryForm.PODateTo.substring(6))));
```
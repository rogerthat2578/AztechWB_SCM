let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: '',
        userName: '',
        params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트
        isCheckList: [],

        // 조회결과
        rows: {
            Query: [],
            QuerySummary: {},
        },

        // 조회조건
        queryForm:{
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            // WorkDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            // WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderNo: '',
            GoodItemName: '',
            GoodItemNo: '',
            BuyerNo: '',
            // GoodItemSpec: '',
            CustSeq: '',
            SMCurrStatus: 0,
            SMCurrStatusName: '전체',
            Process: 0,
            ProcessName: '전체',
            Dept: 0,
            DeptName: '전체',
        },

        // 진행상태
        SMCurrStatusList: [],

        // 공정 리스트
        ProcessNameList: [],
        // 공정 리스트
        KeepProcessNameList: [],
        // 부서 리스트
        DeptNameList: [],
        // 부서 리스트
        KeepDeptNameList: [],

        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        },
    },

    methods:{
        // 이벤트
        eventCheck: function(){
            let vThis = this;
            let e = event;

            // Click Event
            if(e.type === 'click'){
                if(document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu'){
                    document.getElementsByClassName('left-menu')[0].style.display = 'none';
                }

                if((document.getElementsByClassName('drop-box')[0].style.display === 'block' || document.getElementsByClassName('drop-box')[1].style.display === 'block' || document.getElementsByClassName('drop-box')[2].style.display === 'block') && e.target.getAttribute('class') !== 'drop-box-input'){
                    document.getElementsByClassName('drop-box')[0].style.display = 'none';
                    document.getElementsByClassName('drop-box')[1].style.display = 'none';
                    // 공정 Select Box 초기화
                    if ((vThis.ProcessNameList.length == 1 && (vThis.ProcessNameList[0].val == '전체' || vThis.ProcessNameList[0].val == '')) || vThis.queryForm.ProcessName.replace(/\ /g, '') == '') {
                        vThis.ProcessNameList = vThis.KeepProcessNameList;
                        vThis.queryForm.Process = vThis.KeepProcessNameList[0].key;
                        vThis.queryForm.ProcessName = vThis.KeepProcessNameList[0].val;
                    }
                    // 부서 Select Box 초기화
                    if ((vThis.DeptNameList.length == 1 && (vThis.DeptNameList[0].val == '전체' || vThis.DeptNameList[0].val == '')) || vThis.queryForm.DeptName.replace(/\ /g, '') == '') {
                        vThis.DeptNameList = vThis.KeepDeptNameList;
                        vThis.queryForm.Dept = vThis.KeepDeptNameList[0].key;
                        vThis.queryForm.DeptName = vThis.KeepDeptNameList[0].val;
                    }
                }
            }

            // Key Event
            else if(e.type === 'keyup'){
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
                    vThis.search(vThis.addSummary);
                }
            }
        },

        // 사용자 인터페이스 클릭
        userInfoClick: function(){
            if(confirm('로그아웃 하시겠습니까?')){
                GX.Cookie.set('UserId', '', 0);
                GX.Cookie.set('UserSeq', '', 0);
                GX.Cookie.set('UserName', '', 0);
                GX.Cookie.set('EmpSeq', '', 0);
                GX.Cookie.set('DeptName', '', 0);
                GX.Cookie.set('DeptSeq', '', 0);
                GX.Cookie.set('CompanySeq', '', 0);
                GX.Cookie.set('BizUnit', '', 0);
                GX.Cookie.set('BizUnitName', '', 0);
                GX.Cookie.set('BizUnit_JsonFormatStringType', '', 0);
                GX.Cookie.set('CustSeq', '', 0); // 거래처코드
				GX.Cookie.set('CustKind', '', 0); // 거래처타입
                location.href = 'login.html';
            }
        },

        // Select box
        openCloseDropBox: function(inputEleName = '', useYN = '') {
            if (useYN === 'N') return false;

            let e = event;
            
            if (e.target.nodeName.toUpperCase() === 'LI') {
                if (inputEleName.length == 0) inputEleName = e.target.parentNode.previousElementSibling.name;
                this.queryForm[inputEleName.replace('Name', '')] = e.target.value;
                this.queryForm[inputEleName] = e.target.innerText;
                e.target.parentNode.style.display = 'none';
            } else {
                if (e.target.nextElementSibling.style.display == 'none' || e.target.nextElementSibling.style.display == '')
                    e.target.nextElementSibling.style.display = 'block';
                else
                    e.target.nextElementSibling.style.display = 'none';
            }
        },

        // Select Box input에 입력 시 리스트 변경
        likeSelect2: function(str = "Dept") {
            let e = event;
            let vThis = this;

            let strKeepConcat = 'Keep' + str + 'NameList';
            let strConcat = str + 'NameList';

            let likeIndex = [];
            if (GX._METHODS_.nvl(e.target.value).length > 0) {
                vThis[strKeepConcat].forEach((v, i) => {
                    if (v.val.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1) likeIndex.push(i);
                });
            }

            if (likeIndex.length > 0) {
                let arrTemp = [];
                likeIndex.forEach(v => {
                    arrTemp.push(vThis[strKeepConcat][v]);
                });
                vThis[strConcat] = arrTemp;
            } else {
                vThis[strConcat] = vThis[strKeepConcat];
            }
        },

        // DateBox 업데이트
        updateDate: function(v = '', o = null) {
            if (v && o) {
                let vThis = this;

                let selEle = o;
                let selVal = v;
                let selEleName = selEle.getAttribute('name');
                if (selEleName.indexOf('Fr') > -1) { // 선택한 날짜가 from일 때 to와 비교.
                    if (new Date(selVal) > new Date(vThis.queryForm[selEleName.replace('Fr', 'To')])) {
                        let msg = selEle.parentNode.parentNode.childNodes[0].childNodes[0].innerText;
                        alert(msg + '이(가) 비정상입니다.');
                        vThis.queryForm[selEleName] = vThis.queryForm[selEleName.replace('Fr', 'To')];
                    }
                } else if (selEleName.indexOf('To') > -1) { // 선택한 날짜가 to일 때 from과 비교.
                    if (new Date(selVal) < new Date(vThis.queryForm[selEleName.replace('To', 'Fr')])) {
                        let msg = selEle.parentNode.parentNode.childNodes[0].childNodes[0].innerText;
                        alert(msg + '이(가) 비정상입니다.');
                        vThis.queryForm[selEleName] = vThis.queryForm[selEleName.replace('To', 'Fr')];
                    }
                }
            }
        },

        updateRowWorkPlanDate: function(idx = null){
            let evtTarget = event.target;
            if(idx != null && evtTarget.name != null && evtTarget.name != undefined && evtTarget.name != ''
                && evtTarget.value != null && evtTarget.value != undefined && evtTarget.value != ''){
                this.rows.Query[idx][evtTarget.name] = evtTarget.value;
                this.rows.Query[idx].RowEdit = true;
                document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data');
            }
        },

        // 초기화
        init: function(){
          let vThis = this;
          vThis.initKeyCombi();
          vThis.initSelected();
          vThis.rows.Query = [];
          vThis.rows.QuerySummary = {};
          vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
          vThis.queryForm.BizUnit = '1';
        //   vThis.queryForm.WorkDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
        //   vThis.queryForm.WorkDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
          vThis.queryForm.WorkOrderDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
          vThis.queryForm.WorkOrderDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
          vThis.queryForm.WorkOrderNo = '';
          vThis.queryForm.GoodItemName = '';
          vThis.queryForm.GoodItemNo = '';
        //   vThis.queryForm.GoodItemSpec = '';
          vThis.queryForm.CustSeq = '';
          vThis.queryForm.Process = '';
          vThis.queryForm.ProcessName = '';
          vThis.queryForm.BuyerNo = '';
        },

        initKeyCombi: function(){
            Object.keys(this.keyCombi).map(k => {
               this.keyCombi[k] = false;
            });
        },

        selectAll: function(){
            let obj = document.querySelectorAll('[name="RowCheck"]');
            let isCheckList = [];
            for (let i in obj) {
                if (obj.hasOwnProperty(i)) {
                    obj[i].checked = event.target.checked;
                    if (event.target.checked) isCheckList.push(Number(i));
                }
            }
            this.isCheckList = isCheckList;
        },
        initSelected: function () {
            this.isCheckList = [];
            let selAllObj = document.querySelector('thead [type="checkbox"]');
            if (selAllObj != null) {
                selAllObj.checked = true;
                selAllObj.click();
            }
        },
        isChecked: function (index) {
            return (this.isCheckList.indexOf(index) != -1);
        },

        selectedMark: function (index) {
            let idx = this.isCheckList.indexOf(index);
            if (event.target.checked) this.isCheckList.push(index);
            else if (idx != -1) this.isCheckList.splice(idx, 1);
        },

        applyAll: function (name, idx) {
            event.target.setAttribute('gx-datepicker', idx);
            GX.Calendar.openInRow(name, { useYN: true, idx: idx });
        },

        /**행 클릭(선택), 행 더블 시
         * 클릭(선택) 행 색상으로 표시
         * 입력화면으로 점프
         */
         selectRow: function (idx) {
            let vThis = this;
            let e = event;

            // 무언가 스크립트가 꼬여 여러행에 fill-color-sel-row 클래스가 적용되어있어도 다시 하나만 적용될 수 있게
            document.querySelectorAll('tr.fill-color-sel-row').forEach(ele => {
                ele.classList.remove('fill-color-sel-row');
            });
            if (e.target.nodeName.toUpperCase() === 'TD')
                e.target.parentNode.classList.add('fill-color-sel-row');

            // 2022.11.07 더블 클릭 화면 점프 기능 주석 처리. 박태근 이사님 요청
            // GX.doubleClickRun(event.target, function () {
            //     if (confirm('입력 화면으로 이동하시겠습니까?')) {
            //         let tempObj = {}, jumpData = [];
            //         tempObj.WorkOrderSeq = vThis.rows.Query[idx].WorkOrderSeq;
            //         tempObj.WorkOrderSerl = vThis.rows.Query[idx].WorkOrderSerl;
            //         tempObj.SizeName = vThis.rows.Query[idx].SizeName;
            //         tempObj.DivSerl = vThis.rows.Query[idx].DivSerl;
            //         tempObj.BizUnit = vThis.rows.Query[idx].BizUnit;
            //         jumpData.push(tempObj);
            //         if (jumpData.length > 0 && !isNaN(tempObj.WorkOrderSeq) && !isNaN(tempObj.WorkOrderSerl)) {
            //             GX.SessionStorage.set('jumpData', JSON.stringify(jumpData));
            //             GX.SessionStorage.set('jumpSetMethodId', 'OSPWorkOrderJump');
            //             location.href = 'outsourcing_purchase_delivery.html';
            //         } else 
            //             alert('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
            //     }
            // });
        },

        /**
         * 소계 행 추가
         */
         addSummary: function () {
            let vThis = this;

            if (document.querySelectorAll('[id="grid"] table thead tr').length > 1) {
                for (let i in document.querySelectorAll('[id="grid"] table thead tr')) {
                    if (document.querySelectorAll('[id="grid"] table thead tr').hasOwnProperty(i) && i > 0)
                        document.querySelectorAll('[id="grid"] table thead tr')[i].remove();
                }
            }

            if (vThis.rows.Query.length > 0) {
                let objQeury = GX.deepCopy(vThis.rows.QuerySummary);
                let trList = document.querySelectorAll('[id="grid"] table thead tr td');
                let strTd = '';
                const keyMapping = {
                    sumOrderQty: '지시수량',
                    sumProgressQty: '실적진행수량',
                    sumNonProgressQty: '미진행수량',
                    sumProdQty: '생산수량',
                    sumOKQty: '양품수량',
                    sumBadQty: '불량수량',
                }

                for (let i in trList) {
                    if (trList.hasOwnProperty(i)) {
                        if (i >= 12 && i <= 14) {
                            Object.keys(keyMapping).forEach(k => {
                                if (trList[i].innerText == keyMapping[k])
                                    strTd += '<td class="text-r">' + objQeury[k].toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,') + '</td>';
                            });
                        } else { 
                            strTd += '<td></td>';
                        }
                    }
                }

                let createTr = document.createElement('tr');
                createTr.style.backgroundColor = '#e0fec0';
                createTr.style.color = 'black';
                createTr.innerHTML = strTd;
                document.querySelector('[id="grid"] table thead').append(createTr);
            }
        },

        /** 조회 **/
        search: function(callback){
            let vThis = this;

            vThis.initKeyCombi();
            vThis.initSelected();

            let params = GX.deepCopy(vThis.queryForm);
            Object.keys(params).map((k) => {
                if (k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1) {
                    if(params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
                else if (k == 'Process') params.ProcSeq = params[k];
                else if (k == 'Dept') params.DeptSeq = params[k];
                else if (k == 'SMCurrStatus') params.ProgStatus = params[k];
            });

            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};

            GX._METHODS_
            .setMethodId('OSPWorkOrderQuery')
            .ajax([params], [function (data){
                if (data.length > 0) {
                    let noDataIndex = [];
                    let summaryList = {sumOrderQty: 0, sumProgressQty: 0, sumNonProgressQty: 0, sumProdQty: 0, sumOKQty: 0, sumBadQty: 0};

                    // 조회 결과를 가져와서 그리드에 출력한다.
                    for(let i in data){
                        if(data.hasOwnProperty(i)) {
                            data[i].ROWNUM = parseInt(i) + 1;
                            data[i].RowEdit = false;
                            data[i].WorkOrderDate = data[i].WorkOrderDate.length == 8 ? (data[i].WorkOrderDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkOrderDate;
                            data[i].WorkDate = data[i].WorkDate.length == 8 ? (data[i].WorkDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkDate;

                            // 작업예정일에 데이터가 있으면 그대로 출력하고 없을 경우 작업지시일 날짜를 그대로 가져온다.
                            if(data[i].WorkPlanDate != null && data[i].WorkPlanDate.replace(/\ /g, '') != '' && data[i].WorkPlanDate != undefined){
                                data[i].WorkPlanDate = data[i].WorkPlanDate.length == 8 ? (data[i].WorkPlanDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkPlanDate;
                            } else{
                                data[i].WorkPlanDate = data[i].WorkDate.length == 8 ? (data[i].WorkDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkDate;
                                noDataIndex.push(i);
                            }

                            Object.keys(summaryList).map((k) => {
                                if(data[i][k.replace('sum', '')]) {
                                    if (!isNaN(GX._METHODS_.nvl(data[i][k.replace('sum', '')])))
                                        summaryList[k] += parseFloat(data[i][k.replace('sum', '')]);
                                    else
                                        summaryList[k] += 0;
                                    
                                    if (GX._METHODS_.nvl(summaryList[k].toString().split('.')[1]).length > 0)
                                        summaryList[k] = parseFloat(summaryList[k].toFixed(2));
                                }
                            });
                        }
                    }
                    
                    vThis.rows.Query = data;
                    vThis.rows.QuerySummary = summaryList;

                    // 작업예정일이 없는 데이터 행에 대한 처리
                    if(noDataIndex.length > 0){
                        setTimeout(() => {
                            for (let i in noDataIndex) {
                                if (noDataIndex.hasOwnProperty(i)) {
                                    document.getElementsByName('WorkPlanDate')[noDataIndex[i]].parentNode.parentNode.classList.add('no-data');
                                    vThis.rows.Query[noDataIndex[i]].RowEdit = true;
                                }
                            }
                        }, 20);
                    }
                } else{
                    alert('조회 결과가 없습니다.');
                }

                if (typeof callback === 'function') callback();
            }]);
        },

        /** 저장 **/
        save: function(){
            let vThis = this;
            let saveArrData = GX.deepCopy(vThis.rows.Query);

            // DataBlock1에 공통으로 들어가야 하는 파라미터 세팅
            for(let i = saveArrData.length - 1; i >= 0; i--){
                if(saveArrData[i].RowEdit){
                    saveArrData[i].IDX_NO = saveArrData[i].ROWNUM;
                    saveArrData[i].WorkingTag = 'U';
                    saveArrData[i].WorkPlanDate = saveArrData[i].WorkPlanDate.indexOf('-') > -1 ? saveArrData[i].WorkPlanDate.replace(/\-/g, "") : saveArrData[i].WorkPlanDate;

                } else{
                    saveArrData.splice(i, 1);
                }
            }

            if(saveArrData.length > 0){
                GX._METHODS_
                .setMethodId('OSPWorkOrderSave')
                .ajax(saveArrData, [], [function(data){
                    vThis.initSelected();
                    vThis.initKeyCombi();
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
                    alert('저장 성공');
                    vThis.search(vThis.addSummary);
                }]);

            } else{
                alert('파라메터 세팅 중<br>예외사항 발생.');
            }
        },

        /** 납품등록 점프 **/
        jumpOutPoDelv: function(){
            let vThis = this;
            let jumpData = [];

            for(let i in vThis.isCheckList){
                let tempObj = {};
                //tempObj.POSeq = vThis.rows.Query[vThis.isCheckList[i]].POSeq;
                //tempObj.POSerl = vThis.rows.Query[vThis.isCheckList[i]].POSerl;
                tempObj.WorkOrderSeq = vThis.rows.Query[vThis.isCheckList[i]].WorkOrderSeq;
                tempObj.WorkOrderSerl = vThis.rows.Query[vThis.isCheckList[i]].WorkOrderSerl;
                tempObj.SizeName = vThis.rows.Query[vThis.isCheckList[i]].SizeName;
                tempObj.DivSerl = vThis.rows.Query[vThis.isCheckList[i]].DivSerl;
                tempObj.BizUnit = vThis.rows.Query[vThis.isCheckList[i]].BizUnit;
                jumpData.push(tempObj);
            }

            if(jumpData.length > 0){
                GX.SessionStorage.set('jumpData', JSON.stringify(jumpData));
                GX.SessionStorage.set('jumpSetMethodId', 'OSPWorkOrderJump');
                location.href = 'outsourcing_purchase_delivery.html';

            } else{
                alert("선택된 데이터가 없습니다.");
            }
        },

        /**엑셀 다운로드 xlxs */
        excelDownload: function () {
            GX._METHODS_.excelDownload(document.querySelector('[id="grid"] table'));
        },

        /**비고 클릭 시 alert 대신 Toast 띄우기 */
        alertToast: function (text = '') {
            toastr.info(text);
        },
    },

    created(){
        let vThis = this;

        if(!GX._METHODS_.isLogin()) location.replace('login.html');
        else{
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');

            document.addEventListener('click', vThis.eventCheck, false);
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

            /**조회조건 Select box setting
            * 진행상태(구매): SMCurrStatusList
            * 공정: ProcessNameList
            * 부서: DeptNameList
            */
            const objSelBoxQueryForm = {'SMCurrStatusList': 'PDWorkOrder', 'ProcessNameList': 'PDProc', 'DeptNameList': 'PODept'};
            Object.keys(objSelBoxQueryForm).map(k => {
                GX._METHODS_
                .setMethodId('SCMCodeHelp')
                .ajax([{ QryType: objSelBoxQueryForm[k] }], [function (data){
                    for (let i in data) {
                        if (data.hasOwnProperty(i)) {
                            vThis[k].push({ key: data[i][Object.keys(data[i])[0]], val: data[i][Object.keys(data[i])[1]] })
                        }
                    }
                    // Select box의 경우 검색 기능 로직에서 원본 데이터를 따로 담아둘 배열이 하나 더 존재함.
                    if (typeof vThis['Keep' +k] === 'object') vThis['Keep' + k] = vThis[k];
                    
                    // 공정 기본 값 = 52:입고(의류)로 세팅
                    if (k === 'ProcessNameList') {
                        for (let i = 0; i < vThis.ProcessNameList.length; i++) {
                            if (vThis.ProcessNameList[i].val.indexOf('입고') > -1 && vThis.ProcessNameList[i].val.indexOf('의류') > -1) {
                                vThis.queryForm.Process = vThis.ProcessNameList[i].key;
                                vThis.queryForm.ProcessName = vThis.ProcessNameList[i].val;
                                break;
                            }
                        }
                    }
                }]);
            });

            GX.VueGrid
            .bodyRow(':class="{\'check\':isChecked(index)}" @click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll();" /></div>', '')
                .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);"/></div>', '')
            .item('WorkOrderDate').head('작업지시일', '')
            .item('WorkDate').head('납기일', '')
            .item('WorkPlanDate', { styleSyntax: 'style="width: 92px;"' }).head('납품예정일', '')
                .body('<div style="width: 90px;"><input type="text" class="datepicker" name="WorkPlanDate" gx-datepicker="" attr-condition="" :value="row.WorkPlanDate" @input="updateRowWorkPlanDate(index)" @click="applyAll(\'WorkPlanDate\', index)" style="border: 0px solid; text-align: center; background: transparent; width: 100%;" /></div>')
            .item('DeptName').head('의뢰부서', '')
            .item('ProgStatusName').head('진행상태', '')
            .item('ProcName').head('공정', '')
            .item('GoodItemName').head('제품명', '').body(null, 'text-l')
            .item('GoodItemNo').head('제품번호', '').body(null, 'text-l')
            // .item('GoodItemSpec').head('제품규격', '').body(null, 'text-l')
            .item('BuyerNo').head('Buyer No', '').body(null, 'text-l')
            .item('SizeName').head('사이즈', '')
            .item('OrderQty').head('지시수량', '').body(null, 'text-r')
            // .item('ProgressQty').head('생산진행수량', '').body(null, 'text-r')
            .item('ProdQty').head('생산수량', '').body(null, 'text-r')
            .item('NonProgressQty').head('미진행수량', '').body(null, 'text-r')
            // .item('OKQty').head('양품수량', '').body(null, 'text-r')
            // .item('BadQty').head('불량수량', '').body(null, 'text-r')
            .item('Remark').head('특이사항', '')
                .body('<div style="width: 120px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" @click="alertToast(row.Remark)">{{row.Remark}}</div>', 'text-l')
            .item('WorkOrderNo').head('작업지시번호', '')
            .loadTemplate('#grid', 'rows.Query');
        }
    },

    mounted(){
        let vThis = this;

        GX.Calendar.datePicker('gx-datepicker', {
           height: '400px',
           monthSelectWidth: '25%',
           callback: function(result, attribute){
               if(!isNaN(attribute)){
                   vThis.rows.Query[attribute][GX.Calendar.openerName] = result;
                   vThis.rows.Query[attribute].RowEdit = true;
                   document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.add('no-data');
               } else {
                   const openerObj = document.querySelector('[name="' + GX.Calendar.openerName + '"]');
                   const info = GX.Calendar.dateFormatInfo(openerObj);
                   let keys = attribute.split('.');
                   if (keys.length == 1 && vThis[keys[0]] != null) vThis[keys[0]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                   else if (keys.length == 2 && vThis[keys[0]][keys[1]] != null) vThis[keys[0]][keys[1]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                   else if (keys.length == 3 && vThis[keys[0]][keys[1]][keys[2]] != null) vThis[keys[0]][keys[1]][keys[2]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                   vThis.updateDate(GX.formatDate(result, info.format, openerObj));
               }
           }
        });
    }
});
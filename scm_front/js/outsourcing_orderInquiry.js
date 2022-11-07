let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: GX.Cookie.get('DeptName'),
        userName: GX.Cookie.get('UserName'),
        params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트
        isCheckList: [],

        // 조회결과
        rows: {
            Query: [],
            QuerySummary: {},
            ProcessNameListQuery: [], // 공정 리스트 담아둘 리스트
        },

        // 조회조건
        queryForm:{
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            WorkDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateFr: '',
            WorkOrderDateTo: '',
            ProcStatus: '전체',
            WorkOrderNo: '',
            GoodItemName: '',
            GoodItemNo: '',
            GoodItemSpec: '',
            CustSeq: '',
            ProcessSeq: '',
            ProcessName: '',
        },

        procStatusList:[
            '전체', '진행중', '작성', '확정'
        ],

        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        },

        codeHelp: {
            ProcessName: '',
        },
        codeHelpRequest: {},
        codeHelpResponse: {
            ProcessName: ['ProcessSeq', 'ProcessName'],
        },
        codeHelpDependencyKey: {
            // ToolNo: 'ToolName'
        },
        codeHelpGroupKey: {
            // ToolName: 'ToolNo'
        },
        codeHelpQryTypeMapKey: {},
        nowOpenCodeHelp: '',
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

                if(document.getElementsByClassName('drop-box')[0].style.display === 'block' && e.target.getAttribute('class') !== 'drop-box-input'){
                    document.getElementsByClassName('drop-box')[0].style.display = 'none';
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
                location.href = 'login.html';
            }
        },

        // 콤보박스 (진행상태)
        openCloseDropBox: function(){
            let e = event;

            if(e.target.nodeName.toUpperCase() === 'LI'){
                this.queryForm.ProcStatus = e.target.innerText;
                e.target.parentNode.style.display = 'none';
            } else{
                if(e.target.nextElementSibling.style.display == 'none' || e.target.nextElementSibling.style.display == '')
                    e.target.nextElementSibling.style.display = 'block';
                else
                    e.target.nextElementSibling.style.display = 'none';
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
          vThis.queryForm.WorkDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
          vThis.queryForm.WorkDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
          vThis.queryForm.WorkOrderDateFr = '';
          vThis.queryForm.WorkOrderDateTo = '';
          vThis.queryForm.ProcStatus = '전체';
          vThis.queryForm.WorkOrderNo = '';
          vThis.queryForm.GoodItemName = '';
          vThis.queryForm.GoodItemNo = '';
          vThis.queryForm.GoodItemSpec = '';
          vThis.queryForm.CustSeq = '';
          vThis.queryForm.ProcessSeq = '';
          vThis.queryForm.ProcessName = '';
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
                        if (i >= 12 && i <= 17) {
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
                if(k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1){
                    if(params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
            });

            GX._METHODS_
            .setMethodId('OSPWorkOrderQuery')
            .ajax([params], [function (data){
                if(data.length > 0){
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
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
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

        showCodeHelp: function (targetName) {
            let obj = document.querySelector('[code-help="' + targetName + '"]');
            if (obj != null) {
                if (!GX.isShowElement(obj)) {
                    document.body.style.overflow = 'hidden';
                    obj.style.display = 'block';
                }
            }
        },
        openCodeHelp: function () {
            let targetName = event.target.name;
            let targetValue = event.target.value;

            let vThis = this;
            GX.doubleClickRun(event.target, function () {
                vThis.nowOpenCodeHelp = targetName;
                vThis.focusCodeHelp(targetName);
                vThis.codeHelp[targetName] = targetValue;
                vThis.searchCodeHelp(targetName, false);

                if (vThis.codeHelpDependencyKey[targetName] != null) {
                    targetName = vThis.codeHelpDependencyKey[targetName];
                }

                vThis.showCodeHelp(targetName);
            });
        },
        closeCodeHelp: function (targetName) {
            let obj = document.querySelector('[code-help="' + targetName + '"]');
            if (obj != null) {
                if (GX.isShowElement(obj)) {
                    obj.style.display = 'none';
                    document.body.style.overflow = 'unset';

                    let keys = this.codeHelpResponse[targetName];

                    for (let i in keys) {
                        if (keys.hasOwnProperty(i)) {
                            if (this.codeHelp[keys[i]] != null) this.codeHelp[keys[i]] = '';
                            let comebackObj = document.querySelector('[check-double-click][name="' + keys[i] + '"]');
                            if (comebackObj != null) comebackObj.focus();
                        }
                    }
                }
            }
        },
        focusCodeHelp: function (targetName) {
            let tempTargetName = (this.codeHelpDependencyKey[targetName] != null) ? this.codeHelpDependencyKey[targetName] : targetName;
            if (this.codeHelpGroupKey[tempTargetName] != null) this.codeHelpGroupKey[tempTargetName] = targetName;

            if (event.type == 'click') {
                if (tempTargetName != targetName && this.codeHelp[tempTargetName] != null) this.codeHelp[tempTargetName] = '';

                for (let i in this.codeHelpDependencyKey) {
                    if (this.codeHelpDependencyKey.hasOwnProperty(i) && this.codeHelpDependencyKey[i] == tempTargetName) {
                        this.codeHelp[i] = '';
                    }
                }
            }
        },
        inputSearchCodeHelp: function () {
            this.focusCodeHelp(event.target.name);
            this.codeHelp[event.target.name] = event.target.value;
            this.searchCodeHelp(event.target.name, true);
        },
        searchCodeHelp: function (qryType, isOnePick) {
            let keys = this.codeHelpResponse[qryType];
            let tempQryType = (this.codeHelpDependencyKey[qryType] != null) ? this.codeHelpDependencyKey[qryType] : qryType;

            //let targetName = (this.codeHelpDependencyKey[tempQryType] != null) ? this.codeHelpDependencyKey[event.target.name] : event.target.name;
            if (this.codeHelpGroupKey[tempQryType] != null) qryType = this.codeHelpGroupKey[tempQryType];

            let obj = document.querySelector('#grid-' + (tempQryType.toLowerCase()) + ' tbody tr.check-codehelp');
            if (obj != null) obj.className = '';

            let params = {};
            //if(this.codeHelp[qryType] != null) params[qryType] = this.codeHelp[qryType];
            if (this.codeHelpRequest[qryType] == null) this.codeHelpRequest[qryType] = [qryType];

            let paramKeyParse = [];
            let dataKey = '';
            for (let i in this.codeHelpRequest[qryType]) {
                if (this.codeHelpRequest[qryType].hasOwnProperty(i)) {
                    paramKeyParse = this.codeHelpRequest[qryType][i].split('=');
                    dataKey = (paramKeyParse.length == 2) ? paramKeyParse[1] : paramKeyParse[0];
                    params[paramKeyParse[0]] = (this.codeHelp[dataKey] != null) ? this.codeHelp[dataKey] : this.queryForm[dataKey];
                    params[paramKeyParse[0].replace('Out', '').replace('In', '')] = (this.codeHelp[dataKey] != null) ? this.codeHelp[dataKey] : this.queryForm[dataKey];
                }
            }

            params.QryType = qryType;

            if (qryType == 'InWHName' && this.queryForm.OutWHSeq.toString().replace(/\ /g, '').length != 0
                && this.queryForm.OutWHName.replace(/\ /g, '').length != 0)
                params.WHSeq = this.queryForm.OutWHSeq;
            else if (qryType == 'OutWHName' && this.queryForm.InWHSeq.toString().replace(/\ /g, '').length != 0
                && this.queryForm.InWHName.replace(/\ /g, '').length != 0)
                params.WHSeq = this.queryForm.InWHSeq;
            
            params.BizUnit = this.queryForm.BizUnit;

            let vThis = this;
            GX._METHODS_
            .setMethodId('WHCodeHelp')
            .ajax([params], [function (data) {
                for (let di in data) {
                    if (data.hasOwnProperty(di)) {
                        data[di].SerialNo = Number(di) + 1;
                        data[di][qryType] = data[di].WHName;
                        data[di][qryType.replace('Name', 'Seq')] = data[di].WHSeq; // Name -> Seq 바꾸기
                    }
                }

                if (isOnePick) {
                    if (data.length == 1) {
                        for (let i in keys) {
                            if (keys.hasOwnProperty(i)) vThis.queryForm[keys[i]] = data[0][keys[i]];
                        }
                    }
                    else if (data.length > 1) vThis.showCodeHelp(tempQryType);
                }
                
                vThis.rows[tempQryType.substring(0, 1).toUpperCase() + tempQryType.substring(1, tempQryType.length) + 'ListQuery'] = (data.length == 0 || (data[0].Status != null && String(data[0].Status).length > 0)) ? [] : data;
            }]);
            
            if (event.type == 'click') event.target.blur();
        },
        selectCodeHelp: function (index) {
            if (event.target.closest('tr') != null) {
                event.target.selectedIndex = index;
                let obj = event.target.closest('tbody').children;
                for (let i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        obj[i].selectedIndex = i;
                        obj[i].className = (i == String(index)) ? 'check-codehelp' : '';
                    }
                }
            }
            else {
                event.target.selectedIndex = index;
                event.target.className = 'check-codehelp';
            }

            let vThis = this;
            let nowOpenedCodehelp = vThis.nowOpenCodeHelp;
            GX.doubleClickRun(event.target, function () {
                vThis.selectedApplyCodeHelp(nowOpenedCodehelp);
            });
        },
        selectedApplyCodeHelp: function (qryType) {
            let vThis = this;
            
            if (qryType == 'InWHName' || qryType == 'OutWHName') {
                // 창고 코드도움에서 선택 시
                let keys = vThis.codeHelpResponse[qryType];
                let obj = document.querySelector('#grid-' + (qryType.toLowerCase()) + ' tbody tr.check-codehelp');
                
                if (obj != null) {
                    for (let i in keys) {
                        if (keys.hasOwnProperty(i))
                            vThis.queryForm[keys[i]] = vThis.rows[qryType.substring(0, 1).toUpperCase() + qryType.substring(1, qryType.length) + 'ListQuery'][obj.selectedIndex][keys[i]];
                    }

                    vThis.closeCodeHelp(qryType);
                } else {
                    vThis.openDummyAlert('시트에서 사용할 코드를<br>선택후 선택하기 버튼을<br>눌러주세요.');
                }
            } else {
                vThis.openDummyAlert('코드도움 창을 닫고<br>다시 열어주세요');
            }
        },
    },

    created(){
        let vThis = this;

        if(!GX._METHODS_.isLogin()) location.replace('login');
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

            GX.VueGrid
            .bodyRow(':class="{\'check\':isChecked(index)}" @click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll();" /></div>', '')
                .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);"/></div>', '')
            .item('WorkOrderDate').head('작업지시일', '')
            .item('WorkDate').head('작업예정일', '')
            .item('WorkPlanDate', { styleSyntax: 'style="width: 92px;"' }).head('납품예정일', '')
                .body('<div style="width: 90px;"><input type="text" class="datepicker" name="WorkPlanDate" gx-datepicker="" attr-condition="" :value="row.WorkPlanDate" @input="updateRowWorkPlanDate(index)" @click="applyAll(\'WorkPlanDate\', index)" style="border: 0px solid; text-align: center; background: transparent; width: 100%;" /></div>')
            .item('WorkOrderNo').head('작업지시번호', '')
            .item('ProgStatusName').head('진행상태', '')
            .item('ProcName').head('공정', '')
            .item('GoodItemName').head('제품명', '').body(null, 'text-l')
            .item('GoodItemNo').head('제품번호', '').body(null, 'text-l')
            .item('GoodItemSpec').head('제품규격', '').body(null, 'text-l')
            .item('SizeName').head('사이즈', '')
            .item('OrderQty').head('지시수량', '').body(null, 'text-r')
            .item('ProgressQty').head('실적진행수량', '').body(null, 'text-r')
            .item('NonProgressQty').head('미진행수량', '').body(null, 'text-r')
            .item('ProdQty').head('생산수량', '').body(null, 'text-r')
            .item('OKQty').head('양품수량', '').body(null, 'text-r')
            .item('BadQty').head('불량수량', '').body(null, 'text-r')
            .item('Remark').head('특이사항', '').body(null, 'text-l')
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
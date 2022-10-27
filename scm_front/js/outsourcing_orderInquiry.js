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
            QuerySummary: {}
        },

        // 조회조건
        queryForm:{
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            WorkDateFr: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            WorkDateTo: new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-"),
            WorkOrderDateFr: '',
            WorkOrderDateTo: '',
            ProcStatus: '전체',
            WorkOrderNo: '',
            GoodItemName: '',
            GoodItemNo: '',
            GoodItemSpec: '',
            CustSeq: ''
        },

        procStatusList:[
            '전체', '진행중', '작성', '확정'
        ],

        keyCombi: {
            isKeyHold: false,
            Control: false,
            Q: false,
        }
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
                    vThis.search();
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
          vThis.queryForm.WorkDateFr = new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-");
          vThis.queryForm.WorkDateTo = new Date().toLocaleDateString().replace(/\./g, "").replace(/\ /g, "-");
          vThis.queryForm.WorkOrderDateFr = '';
          vThis.queryForm.WorkOrderDateTo = '';
          vThis.queryForm.ProcStatus = '전체';
          vThis.queryForm.WorkOrderNo = '';
          vThis.queryForm.GoodItemName = '';
          vThis.queryForm.GoodItemNo = '';
          vThis.queryForm.GoodItemSpec = '';
          vThis.queryForm.CustSeq = '';
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

        /** 조회 **/
        search: function(){
            let vThis = this;

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
                                    if(!isNaN(data[i][k.replace('sum', '')]))
                                        summaryList[k] += parseFloat(data[i][k.replace('sum', '')]);
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

            console.log(saveArrData);

            if(saveArrData.length > 0){
                GX._METHODS_
                    .setMethodId('OSPWorkOrderSave')
                    .ajax(saveArrData, [], [function(data){
                        vThis.initSelected();
                        vThis.initKeyCombi();
                        vThis.rows.Query = [];
                        vThis.rows.QuerySummary = {};
                        alert('저장 성공');
                        vThis.search();
                    }]);

            } else{
                alert('파라메터 세팅 중<br>예외사항 발생.');
            }
        },

        /** 납품등록 점프 **/
        jumpOutPoDelv: function(){
            let vThis = this;
            let current = vThis.isCheckList.length - 1;

            if(current >= 0) {
                let jumpData = GX.deepCopy(vThis.rows.Query);
                for (let i = jumpData.length - 1; i >= 0; i--) {
                    if (vThis.isCheckList.indexOf(i) == -1) {
                        jumpData.splice(i, 1);
                    }
                }
                // 세션 스토리지에 체크한 값을 넣고 납품등록 화면으로 이동
                GX.SessionStorage.set('jumpData', JSON.stringify(jumpData));
                location.href = 'purchase_delivery.html';

            } else{
                alert("선택된 데이터가 없습니다.");
            }
        }
    },

    created(){
        let vThis = this;

        if(!GX._METHODS_.isLogin()) location.replace('login');
        else{
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');

            document.addEventListener('click', vThis.eventCheck, false);
            document.addEventListener('keydown', vThis.eventCheck, false);
            document.addEventListener('keyup', vThis.eventCheck, false);

            // 사업단위가 여러개일 수 있기에 아래와 같이 set/get함
            let objBizUnitList = JSON.parse(GX.Cookie.get('BizUnit_JsonFormatStringType'));
            Object.keys(objBizUnitList).map((k) => {
                vThis.BizUnitList.push(objBizUnitList[k]);
            });
            vThis.queryForm.CompanySeq = vThis.BizUnitList[0].CompanySeq;
            vThis.queryForm.BizUnit = vThis.BizUnitList[0].BizUnit;
            vThis.queryForm.BizUnitName = vThis.BizUnitList[0].BizUnitName;

            GX.VueGrid
                .bodyRow(':class="{\'check\':isChecked(index)}"')
                .item('ROWNUM').head('No.', '')
                .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll();" /></div>', '')
                    .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);"/></div>', '')
                .item('WorkOrderDate').head('작업지시일', '')
                .item('WorkDate').head('작업예정일', '')
                .item('WorkPlanDate').head('납품예정일', '')
                    .body('<div><input type="text" class="datepicker" name="WorkPlanDate" gx-datepicker="" attr-condition="" :value="row.WorkPlanDate" @input="updateRowWorkPlanDate(index)" @click="applyAll(\'WorkPlanDate\', index)" style="border: 0px solid; text-align: center; background: transparent;" /></div>')
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
                //.item('WorkOrderSeq').head('', '')
                //.item('WorkOrderSerl').head('', '')
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
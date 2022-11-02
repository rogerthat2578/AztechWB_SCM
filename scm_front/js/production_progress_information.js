let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: GX.Cookie.get('DeptName'),
        userName: GX.Cookie.get('UserName'),
        params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트
        isCheckList: [],

        rows: {
            Query: [],
        },
        queryForm:{
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            WorkDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateFr: '',
            WorkOrderDateTo: '',
            ItemName: '',
            ItemNo: '',
            Spec: '',
            CustSeq: ''
        },
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

        updateRowData: function(idx = null){
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
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
            vThis.queryForm.WorkDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.WorkDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.WorkOrderDateFr = '';
            vThis.queryForm.WorkOrderDateTo = '';
            vThis.queryForm.ItemName = '';
            vThis.queryForm.ItemNo = '';
            vThis.queryForm.Spec = '';
            vThis.queryForm.CustSeq = '';
        },

        initKeyCombi: function(){
            Object.keys(this.keyCombi).map(k => {
                this.keyCombi[k] = false;
            });
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
                .setMethodId('ProdProgressInfoQuery')    // 여기에 호출ID를 입력해주세요.
                .ajax([params], [function (data){
                    if(data.length > 0){

                        // 조회 결과를 가져와서 그리드에 출력한다.
                        for(let i in data){
                            if(data.hasOwnProperty(i)){
                                data[i].ROWNUM = parseInt(i) + 1;
                                data[i].RowEdit = false;
                                data[i].WorkOrderDate = data[i].WorkOrderDate.length == 8 ? (data[i].WorkOrderDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkOrderDate;
                                data[i].WorkDate = data[i].WorkDate.length == 8 ? (data[i].WorkDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkDate;

                                if(data[i].CutInPutDate != null && data[i].CutInPutDate.replace(/\ /g, '') != '' && data[i].CutInPutDate != undefined){
                                    data[i].CutInPutDate = data[i].CutInPutDate.length == 8 ? (data[i].CutInPutDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].CutInPutDate;
                                }
                                if(data[i].SewInPutDate != null && data[i].SewInPutDate.replace(/\ /g, '') != '' && data[i].SewInPutDate != undefined){
                                    data[i].SewInPutDate = data[i].SewInPutDate.length == 8 ? (data[i].SewInPutDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].SewInPutDate;
                                }
                                if(data[i].FinishInPutDate != null && data[i].FinishInPutDate.replace(/\ /g, '') != '' && data[i].FinishInPutDate != undefined){
                                    data[i].FinishInPutDate = data[i].FinishInPutDate.length == 8 ? (data[i].FinishInPutDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].FinishInPutDate;
                                }
                            }
                        }
                        vThis.rows.Query = data;

                    } else{
                        vThis.rows.Query = [];
                        alert('조회 결과가 없습니다.');
                    }
                }])
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
                    saveArrData[i].CutInPutDate = saveArrData[i].CutInPutDate.indexOf('-') > -1 ? saveArrData[i].CutInPutDate.replace(/\-/g, "") : saveArrData[i].CutInPutDate;
                    saveArrData[i].SewInPutDate = saveArrData[i].SewInPutDate.indexOf('-') > -1 ? saveArrData[i].SewInPutDate.replace(/\-/g, "") : saveArrData[i].SewInPutDate;
                    saveArrData[i].FinishInPutDate = saveArrData[i].FinishInPutDate.indexOf('-') > -1 ? saveArrData[i].FinishInPutDate.replace(/\-/g, "") : saveArrData[i].FinishInPutDate;
                } else{
                    saveArrData.splice(i, 1);
                }
            }

            console.log(saveArrData);

            if(saveArrData.length > 0){
                GX._METHODS_
                    .setMethodId('ProdProGressInfoSave')
                    .ajax(saveArrData, [], [function(data){
                        vThis.initKeyCombi();
                        vThis.rows.Query = [];
                        alert('저장 성공');
                        vThis.search();
                    }]);

            } else{
                alert('파라메터 세팅 중<br>예외사항 발생.');
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
                //.bodyRow(':class="{\'check\':isChecked(index)}"')
                .item('ROWNUM').head('No.', '')
                .item('WorkOrderDate').head('작업지시일', '')
                .item('WorkDate').head('작업예정일', '')
                .item('WorkOrderNo').head('작업지시번호', '')
                .item('ItemName').head('품명', '').body(null, 'text-l')
                .item('ItemNo').head('품번', '').body(null, 'text-l')
                .item('Spec').head('규격', '').body(null, 'text-l')
                .item('CutInPutDate').head('재단최초투입일', '')
                    .body('<div><input type="text" class="datepicker" name="CutInPutDate" gx-datepicker="" attr-condition="" :value="row.CutInPutDate" @input="updateRowData(index)" @click="applyAll(\'CutInPutDate\', index)" style="border: 0px solid; text-align: center; background: transparent;" /></div>')
                .item('CutQty').head('재단량', '')
                    .body('<div><input type="number" name="CutQty" attr-condition="" :value="row.CutQty" @input="updateRowData(index)" style="border: 0px solid; text-align: right; background: transparent;" /></div>')
                .item('SewInPutDate').head('봉제최초투입일', '')
                    .body('<div><input type="text" class="datepicker" name="SewInPutDate" gx-datepicker="" attr-condition="" :value="row.SewInPutDate" @input="updateRowData(index)" @click="applyAll(\'SewInPutDate\', index)" style="border: 0px solid; text-align: center; background: transparent;" /></div>')
                .item('SewQty').head('봉제량', '')
                    .body('<div><input type="number" name="SewQty" attr-condition="" :value="row.SewQty" @input="updateRowData(index)" style="border: 0px solid; text-align: right; background: transparent;" /></div>')
                .item('FinishInPutDate').head('완성투입일', '')
                    .body('<div><input type="text" class="datepicker" name="FinishInPutDate" gx-datepicker="" attr-condition="" :value="row.FinishInPutDate" @input="updateRowData(index)" @click="applyAll(\'FinishInPutDate\', index)" style="border: 0px solid; text-align: center; background: transparent;" /></div>')
                .item('FinishQty').head('완성량', '')
                    .body('<div><input type="number" name="FinishQty" attr-condition="" :value="row.FinishQty" @input="updateRowData(index)" style="border: 0px solid; text-align: right; background: transparent;" /></div>')
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
                } else{
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
})
let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: '',
        userName: '',
        params: GX.getParameters(),
        BizUnitList: [],

        rows:{
            Query: [],
            QuerySummary: [],
        },

        // 조회 조건
        queryForm:{
            CompanySeq: '',
            BizUnit: '',
            BizUnitName: '',
            DelvDate: ''
        },

        isCheckList: [],
        jumpDataList: [],
        jumpSetMethodId: '',
        summaryArea: {
            SumOSPCurAmt: 0,
            SumOSPCurVAT: 0,
            SumOSPTotCurAmt: 0,
        },
    },
    methods:{
        eventCheck: function(){
            let vThis = this;
            let e = event;

            if(e.type === 'click' && document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu'){
                document.getElementsByClassName('left-menu')[0].style.display = 'none';
            }
        },

        userInfoClick: function() {
            if (confirm('로그아웃 하시겠습니까?')) {
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

        updateDate: function(v = '', o = null) {
            this.queryForm.DelvDate = v;
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

        init: function(){
            let vThis = this;
            vThis.initSelected();
            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
        },
        selectAll: function(){
            let obj = document.querySelectorAll('[name="RowCheck"]');
            let isCheckList = [];
            for(let i in obj){
                if(obj.hasOwnProperty(i)){
                    obj[i].checked = event.target.checked;
                    if(event.target.checked) isCheckList.push(Number(i));
                }
            }
            this.isCheckList = isCheckList;
        },
        initSelected: function(){
            this.isCheckList = [];
            let setAllObj = document.querySelector('thead [type="checkbox"]');
            if(selAllObj != null){
                selAllObj.checked = true;
                selAllObj.click();
            }
        },
        isChecked: function(index){
            return (this.isCheckList.indexOf(index) != -1);
        },
        selectedMark: function(index){
            let idx = this.isCheckList.indexOf(index);
            if(event.target.checked) this.isCheckList.push(index);
            else if(idx != -1) this.isCheckList.splice(idx, 1);
        },
        applyAll: function(name, idx){
            event.target.setAttribute('gx-datepicker', idx);
            GX.Calendar.openInRow(name, {useYN: true, idx: idx});
        },
        selectRow: function(idx){
            let vThis = this;
            let e = event;

            document.querySelectorAll('tr.fill-color-sel-row').forEach(ele => {
                ele.classList.remove('fill-color-sel-row');
            });
            if(e.target.nodeName.toUpperCase() === 'TD'){
                e.target.parentNode.classList.add('fill-color-sel-row');
            }
        },
        calSum: function(){
            let vThis = this;

            if(vThis.rows.Query.length > 0){
                let calList = GX.deepCopy(vThis.rows.Query);
                for(let i in calList){
                    if (calList.hasOwnProperty(i)) {
                        Object.keys(vThis.summaryArea).map(k => {
                            if (!isNaN(calList[i][k.replace('Sum', '')]))
                                vThis.summaryArea[k] += parseFloat(calList[i][k.replace('Sum', '')]);
                        });
                    }
                }
            }
        },

        /** 조회 **/
        search: function(callback){
            let vThis = this;
            let params = GX.deepCopy(vThis.queryForm);
            let paramsList = [];

            for(let i in vThis.jumpDataList){
                if(vThis.jumpDataList.hasOwnProperty(i))
                    paramsList.push(Object.assign(GX.deepCopy(params), vThis.jumpDataList[i]));
            }

            console.log(paramsList);
            console.log("jump : " + vThis.jumpSetMethodId);
            GX._METHODS_
                .setMethodId(vThis.jumpSetMethodId)
                .ajax(paramsList, [function (data){
                    if(data.length > 0) {
                        for (let i in data) {
                            if (data.hasOwnProperty(i)) {
                                data[i].ROWNUM = parseInt(i) + 1
                            }
                        }
                        vThis.rows.Query = data;

                        let oneData = data[0];
                        Object.keys(vThis.queryForm).map(k => {
                            if (k != 'CompanySeq' || k != 'BizUnit' || k != 'BizUnitName') {
                                Object.keys(oneData).map(j => {
                                    if (k == j && GX._METHODS_.nvl(oneData[j]).length > 0) {
                                        if (k === 'DelvDate')
                                            vThis.queryForm[j] = oneData[j].length == 8 ? oneData[j].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : oneData[j];
                                        else
                                            vThis.queryForm[k] = oneData[j];
                                    }
                                });
                            }
                        });
                    } else{
                        vThis.rows.Query = [];
                        vThis.rows.QuerySummary = {};
                        alert('조회 결과가 없습니다.');
                    }
                    if(typeof callback === 'function') callback();
                }]);
        },

        save: function(){
            let vThis = this;
            alert('준비중');
        },

        delRow: function(){
            let vThis = this;
            alert('준비중');
        },

        del: function(){
            let vThis = this;
            alert('준비중');
        }
    },

    created(){
        let vThis = this;

        if(!GX._METHODS_.isLogin()) location.replace('login');
        else{
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');

            document.addEventListener('click', vThis.eventCheck, false);

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
                .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll()" /></div>', '')
                    .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);" /></div>', '')
                .item('WorkOrderNo').head('작업지시번호', '').body(null, 'text-l')
                .item('GoodItemNo').head('품번', '').body(null, 'text-l')
                .item('GoodItemName').head('품명', '').body(null, 'text-l')
                .item('GoodItemSpec').head('규격', '').body(null, 'text-l')
                .item('ProcName').head('공정', '').body(null, 'text-l')
                .item('SizeName').head('사이즈', '')
                .item('ProdUnitName').head('단위', '')
                .item('OrderQty').head('작업지시수량', '').body(null, 'text-r')
                .item('ProgressQty').head('기생산수량', '').body(null, 'text-r')
                .item('ProdQty').head('생산수량', '')
                    .body('<div><input type="number" name="ProdQty" attr-condition="" :value="row.ProdQty" @input="updateRowData(index)" style="border: 0px solid; text-align: right; background: transparent;" /></div>')
                .item('OKQty').head('양품수량', '')
                    .body('<div><input type="number" name="OKQty" attr-condition="" :value="row.OKQty" @input="updateRowData(index)" style="border: 0px solid; text-align: right; background: transparent;" /></div>')
                .item('BadQty').head('불량수량', '').body(null, 'text-r')
                    .body('<div><input type="number" name="BadQty" attr-condition="" :value="row.BadQty" @input="updateRowData(index)" style="border: 0px solid; text-align: right; background: transparent;" /></div>')
                .item('InWHName').head('입고창고', '').body(null, 'text-l')
                .item('Remark').head('특이사항', '')
                    .body('<div><input type="text" name="Remark" attr-condition="" :value="row.Remark" @input="updateRowData(index)" style="border: 0px solid; text-align: left; background: transparent;" /></div>')
                .item('IsEnd').head('완료여부', '') // 입력가능, 전체체크항목 있음.
                    .body('<div><input type="checkbox" name="IsEnd" attr-condition="" :value="row.IsEnd" @input="updateRowData(index);" /></div>', '')
                .item('OSPPrice').head('단가', '').body(null, 'text-r')
                .item('IsVAT').head('부가세포함', '')
                .item('OSPCurAmt').head('금액', '').body(null, 'text-r')
                .item('OSPCurVAT').head('부가세', '').body(null, 'text-r')
                .item('OSPTotCurAmt').head('금액계', '').body(null, 'text-r')
                .item('CurrName').head('통화', '')
                .item('ExRate').head('환율', '')
                .item('OSPDomPrice').head('원화단가', '').body(null, 'text-r')
                .item('OSPDomVAT').head('원화부가세', '').body(null, 'text-r')
                .item('OSPDomAmt').head('원화금액', '').body(null, 'text-r')
                .item('OSPTotDomAmt').head('원화금액계', '').body(null, 'text-r')
                .item('AssyItemNo').head('공정품번호', '').body(null, 'text-l')
                .item('AssyItemName').head('공정품명', '').body(null, 'text-l')
                .item('AssyItemSpec').head('공정품규격', '').body(null, 'text-l')
                .item('ProdPlanNo').head('생산계획번호', '').body(null, 'text-l')
                .loadTemplate('#grid', 'rows.Query');
        }
    },

    mounted(){
        let vThis = this;

        GX.Calendar.datePicker('gx-datepicker', {
            height: '400px',
            monthSelectWidth: '25%',
            callback: function (result, attribute) {
                if (!isNaN(attribute)) {
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
                    vThis.updateDate(GX.formatDate(result, info.format), openerObj);
                }
            }
        });

        let jumpData = GX.SessionStorage.get('jumpData') != null ? JSON.parse(GX.SessionStorage.get('jumpData')) : [];
        let jumpSetMethodId = GX.SessionStorage.get('jumpSetMethodId') != null ? GX.SessionStorage.get('jumpSetMethodId') : '';
        if(jumpData.length > 0 && jumpSetMethodId.length > 0){
            jumpData.forEach(v => {
                vThis.jumpDataList.push(v);
            });
            vThis.jumpSetMethodId = jumpSetMethodId;

            GX.SessionStorage.remove('jumpData');
            GX.SessionStorage.remove('jumpSetMethodId');
            vThis.search(vThis.calSum());
        } else{
            alert("선택한 행의 데이터가 이상합니다. 다시 시도해주세요.");
            history.back(-1);
        }
    }
})
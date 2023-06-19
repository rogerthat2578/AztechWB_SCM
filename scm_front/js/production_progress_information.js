let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: '',
        userName: '',
        params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트
        isCheckList: [],

        rows: {
            Query: [],
        },
        queryForm:{
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            // WorkDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            // WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            ItemName: '',
            ItemNo: '',
            Spec: '',
            CustSeq: '',
            BuyerNo: '',
            Dept: 0,
            DeptName: '전체',
        },

        // 부서 리스트
        DeptNameList: [],
        // 부서 리스트
        KeepDeptNameList: [],
        /**단축키로 기능 실행 (K-System 참고)
         * Control + Q = 조회
         */
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
                if (document.getElementsByClassName('left-menu')[0].style.display === 'block' && e.target.getAttribute('class') !== 'btn-menu') {
                    document.getElementsByClassName('left-menu')[0].style.display = 'none';
                }

                if (document.getElementsByClassName('drop-box')[0].style.display === 'block' && e.target.getAttribute('class') !== 'drop-box-input') {
                    document.getElementsByClassName('drop-box')[0].style.display = 'none';
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
                    vThis.search();
                }
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

        updateRowData: function(idx = null){
            let evtTarget = event.target;
            if (idx != null && evtTarget.name != null && evtTarget.name != undefined && evtTarget.name != '' && evtTarget.value != null && evtTarget.value != undefined && evtTarget.value != '') {
                this.rows.Query[idx][evtTarget.name] = evtTarget.value;
                this.rows.Query[idx].RowEdit = true;
                if (document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.contains('possible-input-data')) {
                    document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.remove('possible-input-data');
                    document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data');
                } else {
                    document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data')
                }
            }
        },

        // 초기화
        init: function(){
            let vThis = this;
            vThis.rows.Query = [];
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
            // vThis.queryForm.WorkDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            // vThis.queryForm.WorkDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.WorkOrderDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅;
            vThis.queryForm.WorkOrderDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅;
            vThis.queryForm.ItemName = '';
            vThis.queryForm.ItemNo = '';
            vThis.queryForm.Spec = '';
            vThis.queryForm.CustSeq = '';
        },

        applyAll: function (name, idx) {
            event.target.setAttribute('gx-datepicker', idx);
            GX.Calendar.openInRow(name, { useYN: true, idx: idx });
        },

        /**그리드 일자 비교
         * 재단최초투입일 <= 봉제최초투입일 <= 완성투입일
         */
        compareDate: function (idx = null, stdName = '') {
            let vThis = this;
            let queryIdx = vThis.rows.Query[idx];
            const cutDate = +new Date(GX._METHODS_.nvl(queryIdx.CutInPutDate).split('-')[0], GX._METHODS_.nvl(queryIdx.CutInPutDate).split('-')[1], GX._METHODS_.nvl(queryIdx.CutInPutDate).split('-')[2]);
            const sewDate = +new Date(GX._METHODS_.nvl(queryIdx.SewInPutDate).split('-')[0], GX._METHODS_.nvl(queryIdx.SewInPutDate).split('-')[1], GX._METHODS_.nvl(queryIdx.SewInPutDate).split('-')[2]);
            const finDate = +new Date(GX._METHODS_.nvl(queryIdx.FinishInPutDate).split('-')[0], GX._METHODS_.nvl(queryIdx.FinishInPutDate).split('-')[1], GX._METHODS_.nvl(queryIdx.FinishInPutDate).split('-')[2]);
            if (stdName == 'CutInPutDate' || stdName == 'SewInPutDate' || stdName == 'FinishInPutDate') {
                let chk = false;
                if (!isNaN(cutDate) && !isNaN(sewDate) && cutDate > sewDate) {
                    // alert('"재단최초투입일" ≦ "봉제최초투입일"');
                    alert('"재단최초투입일" <= "봉제최초투입일"');
                    chk = true;
                } else if (!isNaN(cutDate) && !isNaN(finDate) && cutDate > finDate) {
                    // alert('"재단최초투입일" ≦ "완성투입일"');
                    alert('"재단최초투입일" <= "완성투입일"');
                    chk = true;
                } else if (!isNaN(sewDate) && !isNaN(finDate) && sewDate > finDate) {
                    // alert('"봉제최초투입일" ≦ "완성투입일"');
                    alert('"봉제최초투입일" <= "완성투입일"');
                    chk = true;
                }
                if (chk) queryIdx[stdName] = '';
            }
        },

        /**그리드 수량 비교
         * 재단량 >= 봉제량 >= 완성량
         */
        compareQty: function (idx = null, stdName = '') {
            let vThis = this;
            let queryIdx = vThis.rows.Query[idx];
            const cutQty = parseFloat(GX._METHODS_.nvl(queryIdx.CutQty).toString().replace(/\,/g, ''));
            const sewQty = parseFloat(GX._METHODS_.nvl(queryIdx.SewQty).toString().replace(/\,/g, ''));
            const finQty = parseFloat(GX._METHODS_.nvl(queryIdx.FinishQty).toString().replace(/\,/g, ''));
            if (idx != null && (stdName == 'CutQty' || stdName == 'SewQty' || stdName == 'FinishQty')) {
                let chk = false;
                if (!isNaN(cutQty) && !isNaN(sewQty) && cutQty < sewQty) {
                    // alert('"재단량" ≧ "봉제량"');
                    alert('"재단량" >= "봉제량"');
                    chk = true;
                } else if (!isNaN(cutQty) && !isNaN(finQty) && cutQty < finQty) {
                    // alert('"재단량" ≧ "완성량"');
                    alert('"재단량" >= "완성량"');
                    chk = true;
                } else if (!isNaN(sewQty) && !isNaN(finQty) && sewQty < finQty) {
                    // alert('"봉제량" ≧ "완성량"');
                    alert('"봉제량" >= "완성량"');
                    chk = true;
                }
                if (chk) queryIdx[stdName] = '';
            }
        },

        /** 조회 **/
        search: function() {
            let vThis = this;

            let params = GX.deepCopy(vThis.queryForm);
            Object.keys(params).map((k) => {
                if(k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1){
                    if(params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
                else if (k == 'Dept') params.DeptSeq = params[k];
            });
            
            vThis.rows.Query = [];

            GX._METHODS_
                .setMethodId('ProdProgressInfoQuery')    // 여기에 호출ID를 입력해주세요.
                .ajax([params], [function (data){
                    if (data.length > 0) {
                        // 조회 결과를 가져와서 그리드에 출력한다.
                        for(let i in data){
                            if(data.hasOwnProperty(i)){
                                data[i].ROWNUM = parseInt(i) + 1;
                                data[i].RowEdit = false;
                                data[i].WorkOrderDate = data[i].WorkOrderDate.length == 8 ? (data[i].WorkOrderDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkOrderDate;
                                data[i].WorkDate = data[i].WorkDate.length == 8 ? (data[i].WorkDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkDate;
                                data[i].WorkPlanDate = data[i].WorkPlanDate.length == 8 ? (data[i].WorkPlanDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkPlanDate;

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

            if(saveArrData.length > 0){
                GX._METHODS_
                .setMethodId('ProdProGressInfoSave')
                .ajax(saveArrData, [], [function(data){
                    vThis.rows.Query = [];
                    alert('저장 성공');
                    vThis.search();
                }]);

            } else{
                alert('파라메터 세팅 중<br>예외사항 발생.');
            }
        },

        /**엑셀 다운로드 xlxs */
        excelDownload: function () {
            GX._METHODS_.excelDownload(document.querySelector('[id="grid"] table'));
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
            * 부서: DeptNameList
            */
            const objSelBoxQueryForm = {'DeptNameList': 'PODept'};
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
                }]);
            });

            GX.VueGrid
            //.bodyRow(':class="{\'check\':isChecked(index)}"')
            .item('ROWNUM').head('No.', '')
            .item('WorkOrderDate').head('작업지시일', '')
            .item('WorkDate').head('납기일', '') // 작업예정일
            .item('WorkPlanDate').head('납품예정일', '') // 추가
            .item('DeptName').head('의뢰부서', '').body(null, 'text-l')
            .item('ItemNo').head('품번', '').body(null, 'text-l')
            .item('ItemName', { styleSyntax: 'style="width: 90px;"' }).head('품명', '')
                .body('<div style="width: 90px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{row.ItemName}}</div>', 'text-l')
            .item('BuyerNo').head('Buyer No', '').body(null, 'text-l')
            // .item('Spec').head('규격', '').body(null, 'text-l')
            .item('OrderQty', { styleSyntax: 'style="width: 92px;"' }).head('지시수량', '')
                .body('<div style="width: 90px;"><input type="number" name="OrderQty" attr-condition="" :value="row.OrderQty" @input="updateRowData(index)" style="border: 0px solid; text-align: right; background: transparent; width: 100%;" /></div>', 'possible-input-data')
            .item('CutInPutDate').head('재단최초투입일', '')
                .body('<div><input type="text" class="datepicker" name="CutInPutDate" gx-datepicker="" attr-condition="" :value="row.CutInPutDate" @input="updateRowData(index)" @click="applyAll(\'CutInPutDate\', index)" style="border: 0px solid; text-align: center; background: transparent;" /></div>', 'possible-input-data')
            .item('CutQty').head('재단량', '')
                .body('<div><input type="number" name="CutQty" attr-condition="" :value="row.CutQty" @input="updateRowData(index)" @blur="compareQty(index, \'CutQty\')" style="border: 0px solid; text-align: right; background: transparent;" /></div>', 'possible-input-data')
            .item('SewInPutDate').head('봉제최초투입일', '')
                .body('<div><input type="text" class="datepicker" name="SewInPutDate" gx-datepicker="" attr-condition="" :value="row.SewInPutDate" @input="updateRowData(index)" @click="applyAll(\'SewInPutDate\', index)" style="border: 0px solid; text-align: center; background: transparent;" /></div>', 'possible-input-data')
            .item('SewQty').head('봉제량', '')
                .body('<div><input type="number" name="SewQty" attr-condition="" :value="row.SewQty" @input="updateRowData(index)" @blur="compareQty(index, \'SewQty\')" style="border: 0px solid; text-align: right; background: transparent;" /></div>', 'possible-input-data')
            .item('FinishInPutDate').head('완성투입일', '')
                .body('<div><input type="text" class="datepicker" name="FinishInPutDate" gx-datepicker="" attr-condition="" :value="row.FinishInPutDate" @input="updateRowData(index)" @click="applyAll(\'FinishInPutDate\', index)" style="border: 0px solid; text-align: center; background: transparent;" /></div>', 'possible-input-data')
            .item('FinishQty').head('완성량', '')
                .body('<div><input type="number" name="FinishQty" attr-condition="" :value="row.FinishQty" @input="updateRowData(index)" @blur="compareQty(index, \'FinishQty\')" style="border: 0px solid; text-align: right; background: transparent;" /></div>', 'possible-input-data')
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
                if (!isNaN(attribute)) {
                    vThis.rows.Query[attribute][GX.Calendar.openerName] = result;
                    vThis.rows.Query[attribute].RowEdit = true;
                    if (document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.contains('possible-input-data')) {
                        document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.remove('possible-input-data');
                        document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.add('no-data');
                    } else {
                        document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.add('no-data');
                    }
                    // 그리드 날짜 비교
                    vThis.compareDate(attribute, GX.Calendar.openerName);
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
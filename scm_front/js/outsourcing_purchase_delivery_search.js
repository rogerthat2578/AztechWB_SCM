let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: GX.Cookie.get('DeptName'),
        userName: GX.Cookie.get('UserName'),
        params: GX.getParameters(),
        BizUnitList: [], // 사업 단위 리스트

        rows: {
            Query: [],
            QuerySummary: {}
        },

        queryForm:{
            CompanySeq: GX.Cookie.get('CompanySeq'),
            BizUnit: '1',
            WorkDateFr: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            GoodItemName: '',
            GoodItemNo: '',
            BuyerNo: '',
            Process: 0,
            ProcessName: '전체',
            Dept: 0,
            DeptName: '전체',
        },

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

                if((document.getElementsByClassName('drop-box')[0].style.display === 'block' || document.getElementsByClassName('drop-box')[1].style.display === 'block') && e.target.getAttribute('class') !== 'drop-box-input'){
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

        // 초기화
        init: function(){
            let vThis = this;
            vThis.initKeyCombi();
            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.BizUnit = '1';
            vThis.queryForm.WorkDateFr = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            vThis.queryForm.WorkDateTo = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
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

            GX.doubleClickRun(event.target, function () {
                if (confirm('입력 화면으로 이동하시겠습니까?')) {
                    let tempObj = {}, jumpData = [];
                    tempObj.WorkReportSeq = vThis.rows.Query[idx].WorkReportSeq;
                    jumpData.push(tempObj);
                    if (jumpData.length > 0 && !isNaN(tempObj.WorkReportSeq)) {
                        GX.SessionStorage.set('jumpData', JSON.stringify(jumpData));
                        GX.SessionStorage.set('jumpSetMethodId', 'PDWorkReportJumpQuery');
                        location.href = 'outsourcing_purchase_delivery.html';
                    } else 
                        alert('선택한 행의 데이터가 이상합니다. 다시 시도해주세요.');
                }
            });
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
                    sumOrderQty: '발주수량',
                    sumProdQty: '생산수량',
                    sumBadQty: '불량수량',
                    sumOKQty: '양품수량',
                    sumPrice: '단가',
                    sumOSPCurAmt: '금액',
                    sumOSPCurVAT: '부가세',
                    sumOSPTotCurAmt: '금액계',
                    sumOSPDomPrice: '원화단가',
                    sumOSPDomAmt: '원화금액',
                    sumOSPDomVAT: '원화부가세',
                    sumOSPTotDomAmt: '원화금액계',
                }

                for (let i in trList) {
                    if (trList.hasOwnProperty(i)) {
                        if (i >= 6 && i <= 18 && i != 9 && i != 13 && i != 14) {
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

            let params = GX.deepCopy(vThis.queryForm);
            Object.keys(params).map((k) => {
                if(k.indexOf('DateFr') > -1 || k.indexOf('DateTo') > -1){
                    if(params[k].length > 0 && params[k].indexOf('-') > -1)
                        params[k] = params[k].replace(/\-/g, '');
                }
                else if (k == 'Process') params.ProcSeq = params[k];
                else if (k == 'Dept') params.DeptSeq = params[k];
            });

            let regex = new RegExp(/(\d)(?=(?:\d{3})+(?!\d))/g);

            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};
            
            GX._METHODS_
            .setMethodId('PDWorkReportQuery')    // 여기에 호출ID를 입력해주세요.
            .ajax([params], [function (data){
                if(data.length > 0){
                    let summaryList = {
                        sumProdQty: 0, sumBadQty: 0, sumOKQty: 0, sumPrice: 0, sumOSPCurAmt: 0, sumOSPCurVAT: 0, sumOSPTotCurAmt: 0,
                        sumOSPDomPrice: 0, sumOSPDomAmt: 0, sumOSPDomVAT: 0, sumOSPTotDomAmt: 0, sumOrderQty: 0
                    }

                    for(let i in data){
                        if(data.hasOwnProperty(i)){
                            data[i].ROWNUM = parseInt(i) + 1;
                            data[i].WorkDate = data[i].WorkDate.length == 8 ? (data[i].WorkDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')) : data[i].WorkDate;
                            data[i].IsVAT = parseInt(data[i].IsVAT);
                            data[i].IsLastProc = parseInt(data[i].IsLastProc);
                            data[i].IsMatInput = parseInt(data[i].IsMatInput);
                            data[i].IsGoodIn = parseInt(data[i].IsGoodIn);
                            data[i].IsAccident = parseInt(data[i].IsAccident);
                            data[i].OrderQty = data[i].OrderQty.toString().replace(regex, '$1,');
                            data[i].ProdQty = data[i].ProdQty.toString().replace(regex, '$1,');
                            data[i].BadQty = data[i].BadQty.toString().replace(regex, '$1,');
                            data[i].OKQty = data[i].OKQty.toString().replace(regex, '$1,');
                            data[i].Price = data[i].Price.toString().replace(regex, '$1,');
                            data[i].OSPCurAmt = data[i].OSPCurAmt.toString().replace(regex, '$1,');
                            data[i].OSPCurVAT = data[i].OSPCurVAT.toString().replace(regex, '$1,');
                            data[i].OSPTotCurAmt = data[i].OSPTotCurAmt.toString().replace(regex, '$1,');
                            data[i].ExRate = data[i].ExRate.toString().replace(regex, '$1,');
                            data[i].OSPDomPrice = data[i].OSPDomPrice.toString().replace(regex, '$1,');
                            data[i].OSPDomAmt = data[i].OSPDomAmt.toString().replace(regex, '$1,');
                            data[i].OSPDomVAT = data[i].OSPDomVAT.toString().replace(regex, '$1,');
                            data[i].OSPTotDomAmt = data[i].OSPTotDomAmt.toString().replace(regex, '$1,');

                            Object.keys(summaryList).map((k) => {
                                if(data[i][k.replace('sum', '')].replace(/\,/g, '')) {
                                    if (!isNaN(GX._METHODS_.nvl(data[i][k.replace('sum', '')].replace(/\,/g, ''))))
                                        summaryList[k] += parseFloat(data[i][k.replace('sum', '')].replace(/\,/g, ''));
                                    else
                                        summaryList[k] += 0;

                                    if (GX._METHODS_.nvl(summaryList[k].toString().split('.')[1]).length > 0)
                                        summaryList[k] = parseFloat(summaryList[k].toFixed(2));
                                }
                            });
                        }
                    }

                    // 추가. 단가 = 단가합 / 수량합
                    let valSumPrice = summaryList.sumPrice.toString().replace(/\,/g, '');
                    let valSumProdQty = summaryList.sumProdQty.toString().replace(/\,/g, '');
                    if (isNaN(valSumPrice)) valSumPrice = 0; // 분자
                    if (isNaN(valSumProdQty)) valSumProdQty = 1; // 분모
                    else { if (parseFloat(valSumProdQty) <= 0) valSumProdQty = 1 }
                    summaryList.sumPrice = (parseFloat(valSumPrice) / parseFloat(valSumProdQty)).toFixed(2).toString().replace(regex, '$1,');
                    
                    vThis.rows.Query = data;
                    vThis.rows.QuerySummary = summaryList;
                } else{
                    alert('조회 결과가 없습니다.');
                }

                if (typeof callback === 'function') callback();
            }]);
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
            * 공정: ProcessNameList
            * 부서: DeptNameList
            */
            const objSelBoxQueryForm = {'ProcessNameList': 'PDProc', 'DeptNameList': 'PODept'};
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
            .bodyRow('@click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('WorkDate').head('작업일', '')
            .item('GoodItemNo').head('품번', '').body(null, 'text-l')
            .item('GoodItemName', { styleSyntax: 'style="width: 90px;"' }).head('품명', '')
                .body('<div style="width: 90px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">{{row.GoodItemName}}</div>', 'text-l')
            .item('BuyerNo').head('Buyer No', '').body(null, 'text-l')
            // .item('GoodItemSpec').head('규격', '').body(null, 'text-l')
            // .item('ProcName').head('공정', '').body(null, 'text-l')
            .item('ProdUnitName').head('단위', '')
            .item('OrderQty').head('발주수량', '').body(null, 'text-r')
            .item('ProdQty').head('생산수량', '').body(null, 'text-r')
            // .item('BadQty').head('불량수량', '').body(null, 'text-r')
            // .item('OKQty').head('양품수량', '').body(null, 'text-r')
            .item('Price').head('단가', '').body(null, 'text-r')
            .item('IsVAT').head('부가세포함', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsVAT" :value="row.IsVAT" :checked="row.IsVAT" disabled/></div>')
            .item('OSPCurAmt').head('금액', '').body(null, 'text-r')
            .item('OSPCurVAT').head('부가세', '').body(null, 'text-r')
            .item('OSPTotCurAmt').head('금액계', '').body(null, 'text-r')
            .item('CurrName').head('통화', '')
            .item('ExRate').head('환율', '').body(null, 'text-r')
            .item('OSPDomPrice').head('원화단가', '').body(null, 'text-r')
            .item('OSPDomAmt').head('원화금액', '').body(null, 'text-r')
            .item('OSPDomVAT').head('원화부가세', '').body(null, 'text-r')
            .item('OSPTotDomAmt').head('원화금액계', '').body(null, 'text-r')
            .item('SizeText').head('Size', '')
            // .item('AssyItemNo').head('공정품번호', '').body(null, 'text-l')
            // .item('AssyItemName').head('공정품명', '').body(null, 'text-l')
            // .item('AssyItemSpec').head('공정품규격', '').body(null, 'text-l')
            .item('IsLastProc').head('최종공정', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsLastProc" :value="row.IsLastProc" :checked="row.IsLastProc" disabled/></div>')
            .item('IsMatInput').head('자재투입', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsMatInput" :value="row.IsMatInput" :checked="row.IsMatInput" disabled/></div>')
            .item('IsGoodIn').head('입고', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsGoodIn" :value="row.IsGoodIn" :checked="row.IsGoodIn" disabled/></div>')
            // .item('Weight').head('중량', '').body(null, 'text-r') // +추가필요
            // .item('RealLotNo').head('Lot No.', '').body(null, 'text-l')
            // .item('Width').head('폭', '').body(null, 'text-r') // +추가필요
            // .item('Density').head('밀도', '').body(null, 'text-r')
            // .item('IsAccident').head('사고지', '')
            //     .body('<div class="chkBox"><input type="checkbox" name="IsAccident" :value="row.IsAccident" :checked="row.IsAccident" disabled/></div>')
            .item('WorkOrderNo').head('작업지시번호', '').body(null, 'text-l')
            .loadTemplate('#grid', 'rows.Query');

            // 참고화면 : FrmWPDSFCWorkReport_03_KNIC
        }
    },

    mounted(){
        let vThis = this;

        GX.Calendar.datePicker('gx-datepicker', {
            height: '400px',
            monthSelectWidth: '25%',
            callback: function(result, attribute){
                const openerObj = document.querySelector('[name="' + GX.Calendar.openerName + '"]');
                const info = GX.Calendar.dateFormatInfo(openerObj);
                let keys = attribute.split('.');
                if (keys.length == 1 && vThis[keys[0]] != null) vThis[keys[0]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                else if (keys.length == 2 && vThis[keys[0]][keys[1]] != null) vThis[keys[0]][keys[1]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
                else if (keys.length == 3 && vThis[keys[0]][keys[1]][keys[2]] != null) vThis[keys[0]][keys[1]][keys[2]] = (result.length == 0) ? '' : GX.formatDate(result, info.format);
            }
        });
    }
});
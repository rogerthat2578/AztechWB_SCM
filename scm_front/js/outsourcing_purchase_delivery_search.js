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
            WorkDate: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkDateTo: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            WorkOrderNo: '',
            GoodItemName: '',
            GoodItemNo: '',
            GoodItemSpec: '',
            CustSeq: ''
        },

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
            vThis.queryForm.WorkDate = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
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
                        if (i >= 8 && i <= 21 && i != 12 && i != 16 && i != 17) {
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
            });

            let regex = new RegExp(/(\d)(?=(?:\d{3})+(?!\d))/g);

            GX._METHODS_
            .setMethodId('PDWorkReportQuery')    // 여기에 호출ID를 입력해주세요.
            .ajax([params], [function (data){
                if(data.length > 0){
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
                    
                    let summaryList = {
                        sumProdQty: 0, sumBadQty: 0, sumOKQty: 0, sumPrice: 0, sumOSPCurAmt: 0, sumOSPCurVAT: 0, sumOSPTotCurAmt: 0,
                        sumOSPDomPrice: 0, sumOSPDomAmt: 0, sumOSPDomVAT: 0, sumOSPTotDomAmt: 0
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
                    
                    vThis.rows.Query = data;
                    vThis.rows.QuerySummary = summaryList;
                } else{
                    vThis.rows.Query = [];
                    vThis.rows.QuerySummary = {};
                    alert('조회 결과가 없습니다.');
                }

                if (typeof callback === 'function') callback();
            }]);
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
            .bodyRow('@click="selectRow(index);"')
            .item('ROWNUM').head('No.', '')
            .item('WorkDate').head('작업일', '')
            .item('WorkOrderNo').head('작업지시번호', '').body(null, 'text-l')
            .item('GoodItemNo').head('품번', '').body(null, 'text-l')
            .item('GoodItemName').head('품명', '').body(null, 'text-l')
            .item('GoodItemSpec').head('규격', '').body(null, 'text-l')
            .item('ProcName').head('공정', '').body(null, 'text-l')
            .item('ProdUnitName').head('단위', '')
            .item('ProdQty').head('생산수량', '').body(null, 'text-r')
            .item('BadQty').head('불량수량', '').body(null, 'text-r')
            .item('OKQty').head('양품수량', '').body(null, 'text-r')
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
            .item('SizeText').head('필번', '')
            .item('AssyItemNo').head('공정품번호', '').body(null, 'text-l')
            .item('AssyItemName').head('공정품명', '').body(null, 'text-l')
            .item('AssyItemSpec').head('공정품규격', '').body(null, 'text-l')
            .item('IsLastProc').head('최종공정', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsLastProc" :value="row.IsLastProc" :checked="row.IsLastProc" disabled/></div>')
            .item('IsMatInput').head('자재투입', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsMatInput" :value="row.IsMatInput" :checked="row.IsMatInput" disabled/></div>')
            .item('IsGoodIn').head('입고', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsGoodIn" :value="row.IsGoodIn" :checked="row.IsGoodIn" disabled/></div>')
            .item('Weight').head('중량', '').body(null, 'text-r') // +추가필요
            .item('RealLotNo').head('Lot No.', '').body(null, 'text-l')
            .item('Width').head('폭', '').body(null, 'text-r') // +추가필요
            .item('Density').head('밀도', '').body(null, 'text-r')
            .item('IsAccident').head('사고지', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsAccident" :value="row.IsAccident" :checked="row.IsAccident" disabled/></div>')
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
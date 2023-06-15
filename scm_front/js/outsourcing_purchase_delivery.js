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
            DelvDate: new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
            CustSeq: '',
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

        updateDate: function(v = '', o = null) {
            this.queryForm.DelvDate = v;
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

                if (evtTarget.name == 'ProdQty') {
                    let queryIdx = this.rows.Query[idx];

                    if (parseFloat(queryIdx.OSPPrice) > 0) {
                        // 생산수량
                        let rowProdQty = queryIdx.ProdQty;
                        // 부가세 여부에 따라 변경 값
                        let mulVal = [];
                        if (queryIdx.IsVAT == '0') mulVal = [1.0, 0.1, 1.1]; // 부가세 별도
                        else mulVal = [0.9, 0.1, 1.0]; // 부가세 포함

                        /**해당 행 금액들 수정 */
                        // 금액 = 생산수량 * 단가 * 환율
                        queryIdx.OSPCurAmt = (parseFloat(rowProdQty) * parseFloat(queryIdx.OSPPrice.replace(/\,/g, '')) * parseFloat(queryIdx.ExRate) * parseFloat(mulVal[0])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                        // 부가세 = 생산수량 * 단가 * 환율 * 0.1
                        queryIdx.OSPCurVAT = (parseFloat(rowProdQty) * parseFloat(queryIdx.OSPPrice.replace(/\,/g, '')) * parseFloat(queryIdx.ExRate) * parseFloat(mulVal[1])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                        // 금액계 = 생산수량 * 단가 * 환율 * 1.1
                        queryIdx.OSPTotCurAmt = (parseFloat(rowProdQty) * parseFloat(queryIdx.OSPPrice.replace(/\,/g, '')) * parseFloat(queryIdx.ExRate) * parseFloat(mulVal[2])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                        // 통화가 KRW인 경우
                        // 원화금액 = 생산수량 * 원화단가
                        queryIdx.OSPDomAmt = (parseFloat(rowProdQty) * parseFloat(queryIdx.OSPDomPrice.replace(/\,/g, '')) * parseFloat(mulVal[0])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                        // 원화부가세 = 생산수량 * 원화단가 * 0.1
                        queryIdx.OSPDomVAT = (parseFloat(rowProdQty) * parseFloat(queryIdx.OSPDomPrice.replace(/\,/g, '')) * parseFloat(mulVal[1])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                        // 원화금액계 = 생산수량 * 원화단가 * 1.1
                        queryIdx.OSPTotDomAmt = (parseFloat(rowProdQty) * parseFloat(queryIdx.OSPDomPrice.replace(/\,/g, '')) * parseFloat(mulVal[2])).toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
                    }
                    // 합계 수정
                    for (let i in this.rows.Query) {
                        if (this.rows.Query.hasOwnProperty(i)) {
                            if (i == 0) Object.keys(this.summaryArea).map(k => this.summaryArea[k] = 0);
                            this.summaryArea.SumOSPCurAmt = parseFloat(this.summaryArea.SumOSPCurAmt.toString().replace(/\,/g, '')) + parseFloat(this.rows.Query[i].OSPCurAmt.toString().replace(/\,/g, ''));
                            this.summaryArea.SumOSPCurVAT = parseFloat(this.summaryArea.SumOSPCurVAT.toString().replace(/\,/g, '')) + parseFloat(this.rows.Query[i].OSPCurVAT.toString().replace(/\,/g, ''));
                            this.summaryArea.SumOSPTotCurAmt = parseFloat(this.summaryArea.SumOSPTotCurAmt.toString().replace(/\,/g, '')) + parseFloat(this.rows.Query[i].OSPTotCurAmt.toString().replace(/\,/g, ''));
                            if (i == this.rows.Query.length - 1) Object.keys(this.summaryArea).map(k => this.summaryArea[k] = this.summaryArea[k].toFixed(0).toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,'));
                        }
                    }
                }
            }
        },
        
        updateRowRemark: function (idx = null) {
            let evtTarget = event.target;

            if (idx != null && evtTarget.name != null && evtTarget.name != undefined && evtTarget.name != '' && evtTarget.value != null && evtTarget.value != undefined && evtTarget.value != '') {
                this.rows.Query[idx][evtTarget.name] = evtTarget.value;
                this.rows.Query[idx].RowEdit = true;
                if (document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.contains('no-data')) {
                    document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.remove('possible-input-data');
                    document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data');
                } else {
                    document.getElementsByName(evtTarget.name)[idx].parentNode.parentNode.classList.add('no-data');
                }
            }
        },

        init: function(){
            let vThis = this;
            vThis.initSelected();
            vThis.rows.Query = [];
            vThis.rows.QuerySummary = {};
            vThis.queryForm.CompanySeq = GX.Cookie.get('CompanySeq');
            vThis.queryForm.DelvDate = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "-"), // datepicker 데이터 담기. 기본 오늘 날짜 세팅
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
        selectedAllIsEnd: function(){
            let checked = event.target.checked;
            let obj = document.querySelectorAll('[name="IsEnd"]');

            for(let i in obj){
                if(obj.hasOwnProperty(i)){
                    obj[i].checked = checked;
                    this.rows.Query[i].IsEnd = checked ? 1 : 0;
                }
            }
        },
        initSelected: function(){
            this.isCheckList = [];
            let setAllObj = document.querySelector('thead [type="checkbox"]');
            if(setAllObj != null){
                setAllObj.checked = true;
                setAllObj.click();
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
        selectedMarkIsEnd: function(index){
            if(event.target.checked){
                this.rows.Query[index].IsEnd = 1;
            }
            else {
                this.rows.Query[index].IsEnd = 0;
            }
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

            Object.keys(vThis.summaryArea).map(k => {
                vThis.summaryArea[k] = 0;
            });

            if(vThis.rows.Query.length > 0){
                let calList = GX.deepCopy(vThis.rows.Query);
                for(let i in calList){
                    if (calList.hasOwnProperty(i)) {
                        Object.keys(vThis.summaryArea).map(k => {
                            if (!isNaN(calList[i][k.replace('Sum', '')].replace(',',''))){
                                vThis.summaryArea[k] += parseFloat(calList[i][k.replace('Sum', '')].replace(',',''));
                            }
                        });
                    }
                }
            }

            for(let sumName in vThis.summaryArea){
                vThis.summaryArea[sumName] = vThis.summaryArea[sumName].toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
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

            let regex = new RegExp(/(\d)(?=(?:\d{3})+(?!\d))/g);

            vThis.rows.Query = [];

            GX._METHODS_
                .setMethodId(vThis.jumpSetMethodId)
                .ajax(paramsList, [function (data){
                    if (data.length == 0) {
                        alert('데이터가 없습니다.');
                        history.back(-1);
                    }
                    if(data[0].Status && data[0].Status != 0){
                        alert(data[0].Result);
                        history.back(-1);
                    } else if(data.length > 0) {
                        for (let i in data) {
                            if (data.hasOwnProperty(i)) {
                                data[i].ROWNUM = parseInt(i) + 1
                                data[i].RowEdit = true;
                                data[i].IsEnd = data[i].IsEnd == 1 ? data[i].IsEnd : null;
                                data[i].OrderQty = data[i].OrderQty.toString().replace(regex, '$1,');
                                data[i].ProgressQty = data[i].ProgressQty.toString().replace(regex, '$1,');
                                data[i].ProdQty = data[i].ProdQty != null ? data[i].ProdQty.toString().replace(regex, '$1,') : 0;
                                // data[i].OKQty = data[i].OKQty != null ? data[i].OKQty.toString().replace(regex, '$1,') : 0;
                                // data[i].BadQty = data[i].BadQty != null ? data[i].BadQty.toString().replace(regex, '$1,') : 0;
                                data[i].OSPPrice = data[i].OSPPrice != null ? data[i].OSPPrice.toString().replace(regex, '$1,') : 0;
                                data[i].OSPCurAmt = data[i].OSPCurAmt != null ? data[i].OSPCurAmt.toString().replace(regex, '$1,') : 0;
                                data[i].OSPCurVAT = data[i].OSPCurVAT != null ? data[i].OSPCurVAT.toString().replace(regex, '$1,') : 0;
                                data[i].OSPTotCurAmt = data[i].OSPTotCurAmt != null ? data[i].OSPTotCurAmt.toString().replace(regex, '$1,') : 0;
                                data[i].OSPDomPrice = data[i].OSPDomPrice != null ? data[i].OSPDomPrice.toString().replace(regex, '$1,') : 0;
                                data[i].OSPDomVAT = data[i].OSPDomVAT != null ? data[i].OSPDomVAT.toString().replace(regex, '$1,') : 0;
                                data[i].OSPDomAmt = data[i].OSPDomAmt != null ? data[i].OSPDomAmt.toString().replace(regex, '$1,') : 0;
                                data[i].OSPTotDomAmt = data[i].OSPTotDomAmt != null ? data[i].OSPTotDomAmt.toString().replace(regex, '$1,') : 0;

                                data[i].boolIsVAT = data[i].IsVAT != '0' ? true : false;
                            }
                        }
                        vThis.rows.Query = data;

                        let oneData = data[0];
                        Object.keys(vThis.queryForm).map(k => {
                            if (k != 'CompanySeq' || k != 'BizUnit' || k != 'BizUnitName' || k != 'CustSeq') {
                                Object.keys(oneData).map(j => {
                                    let t = '';
                                    if(!isNaN(GX._METHODS_.nvl(oneData[j])))
                                        t = GX._METHODS_.nvl(oneData[j]).toString();
                                    else
                                        t = GX._METHODS_.nvl(oneData[j]);

                                    if(k == j && t.length > 0){
                                        if(k === 'DelvDate')
                                            vThis.queryForm[k] = oneData[j].length == 8 ? oneData[j].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') : oneData[j];
                                        else
                                            vThis.queryForm[k] = oneData[j];
                                    }
                                });
                            }
                        });
                        // 외주납품현황 화면에서 입력화면으로 넘어오면 외주작업일(납품일)=this.queryForm.DelvDate 에 작업일자=WorkDate 넣기
                        if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') vThis.queryForm.DelvDate = oneData.WorkDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');

                        vThis.initSelected();
                        vThis.calSum();

                    } else{
                        alert('조회 결과가 없습니다.');
                        history.back(-1);
                    }
                    if(typeof callback === 'function') callback();
                }]);
        },

        save: function(){
            let vThis = this;
            let saveArrData = GX.deepCopy(vThis.rows.Query);

            for(let i = saveArrData.length - 1; i >= 0; i--){
                /*
                // 오늘 날짜
                let today = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "");
                // 수정, 삭제 시 (최초)입력일자가 존재하고 저장할 때와 일자가 다른 경우 저장하지 못하게함. from 박태근이사
                if (saveArrData[i]?.InsDate) {
                    if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery' && saveArrData[i].InsDate != today) {
                        alert('품번: ' + saveArrData[i].ItemNo + '\n사이즈: ' + saveArrData[i].SizeText + '\n일일 마감되었습니다. 고객사 담당자에게 문의바랍니다.');
                        return false;
                    }
                }
                */

                if(saveArrData[i].RowEdit){
                    // 입고창고가 없거나 이상하면 저장 막기. 화면에는 안보이지만 체크
                    if (!isNaN(saveArrData[i].InWHSeq) && saveArrData[i].InWHSeq != undefined) {
                        if (saveArrData[i].InWHSeq <= 0) {
                            alert((i + 1) + '행에 입고 창고 데이터가 이상하여 저장할 수 없습니다.');
                            return false;
                        }
                    } else {
                        alert((i + 1) + '행에 입고 창고 데이터가 없어 저장할 수 없습니다.');
                        return false;
                    }

                    saveArrData[i].IDX_NO = saveArrData[i].ROWNUM;
                    saveArrData[i].WorkDate = this.queryForm.DelvDate.indexOf('-') > -1 ? this.queryForm.DelvDate.replace(/\-/g, "") : this.queryForm.DelvDate;
                    saveArrData[i].OrderQty = parseFloat(saveArrData[i].OrderQty.toString().replace(/\,/g, ''));
                    saveArrData[i].ProgressQty = parseFloat(saveArrData[i].ProgressQty.toString().replace(/\,/g, ''));
                    saveArrData[i].ProdQty = parseFloat(saveArrData[i].ProdQty.toString().replace(/\,/g, ''));
                    // saveArrData[i].OKQty = parseFloat(saveArrData[i].OKQty.toString().replace(/\,/g, ''));
                    // saveArrData[i].BadQty = parseFloat(saveArrData[i].BadQty.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPPrice = parseFloat(saveArrData[i].OSPPrice.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPCurAmt = parseFloat(saveArrData[i].OSPCurAmt.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPCurVAT = parseFloat(saveArrData[i].OSPCurVAT.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPTotCurAmt = parseFloat(saveArrData[i].OSPTotCurAmt.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPDomPrice = parseFloat(saveArrData[i].OSPDomPrice.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPDomVAT = parseFloat(saveArrData[i].OSPDomVAT.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPDomAmt = parseFloat(saveArrData[i].OSPDomAmt.toString().replace(/\,/g, ''));
                    saveArrData[i].OSPTotDomAmt = parseFloat(saveArrData[i].OSPTotDomAmt.toString().replace(/\,/g, ''));

                    // 외주납품품목조회 Jump
                    if(vThis.jumpSetMethodId == 'PDWorkReportJumpQuery'){
                        saveArrData[i].WorkingTag = 'U';
                    }
                    // 외주발주품목조회 Jump
                    else if(vThis.jumpSetMethodId == 'OSPWorkOrderJump'){
                        saveArrData[i].WorkingTag = 'A';
                    }

                    saveArrData[i].DelvDate = this.queryForm.DelvDate.indexOf('-') > -1 ? this.queryForm.DelvDate.replace(/\-/g, "") : this.queryForm.DelvDate;
                } else{
                    saveArrData.splice(i, 1);
                }
            }

            if(saveArrData.length > 0){
                GX._METHODS_
                .setMethodId('PDWorkReportSave')    // 여기에 API 키 입력
                .ajax(saveArrData, [], [function (data) {
                    if(data[0].Status && data[0].Status != 0){
                        alert('저장 실패\n' + data[0].Result);

                    } else{
                        vThis.initSelected();
                        for(let i in vThis.rows.Query){
                            if(vThis.rows.Query.hasOwnProperty(i))
                                vThis.rows.Query[i].RowEdit = false;
                        }
                        alert('저장 성공');
                    }
                }]);

            } else{
                alert('저장할 데이터가 없습니다.');
            }
        },

        delRow: function(){
            let vThis = this;

            if(vThis.rows.Query.length < 1 || vThis.isCheckList.length == 0) {
                alert('삭제할 데이터가 없습니다. 삭제할 데이터를 선택 후 삭제해주세요.');

            } else if(vThis.rows.Query.length == vThis.isCheckList.length){
                // 전체 선택 시 전체 삭제
                if(confirm('모든 데이터를 삭제하시겠습니까?')){

                    // 외주발주품목조회에서 넘어온 데이터 전체 삭제 시 뒤로가기
                    if(vThis.jumpSetMethodId == 'OSPWorkOrderJump'){
                        history.back(-1);
                    }
                    // 외주납품품목조회에서 넘어온 데이터 전체 삭제 시
                    else if(vThis.jumpSetMethodId == 'PDWorkReportJumpQuery'){
                        let delArrData = GX.deepCopy(vThis.rows.Query);

                        for(let i in delArrData){
                            if(delArrData.hasOwnProperty(i)){
                                /*
                                // 오늘 날짜
                                let today = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "");
                                // 수정, 삭제 시 (최초)입력일자가 존재하고 저장할 때와 일자가 다른 경우 저장하지 못하게함. from 박태근이사
                                if (delArrData[i]?.InsDate) {
                                    if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery' && delArrData[i].InsDate != today) {
                                        alert('품번: ' + delArrData[i].ItemNo + '\n사이즈: ' + delArrData[i].SizeText + '\n일일 마감되었습니다. 고객사 담당자에게 문의바랍니다.');
                                        return false;
                                    }
                                }
                                */

                                delArrData[i].WorkingTag = 'D';
                            }
                        }

                        if(delArrData.length > 0){
                            GX._METHODS_
                            .setMethodId('PDWorkReportSave')    // 여기에 API 키 입력
                            .ajax(delArrData, [], [function (data){
                                if(data[0].Status && data[0].Status != 0){
                                    alert('삭제 실패\n' + data[0].Result);
                                } else{
                                    alert('삭제 성공');
                                    for(let i=vThis.rows.Query.length - 1; i >=0; i--){
                                        if(vThis.rows.Query.hasOwnProperty(i)){
                                            vThis.rows.Query.splice(i, 1);
                                        }
                                    }
                                    vThis.initSelected();
                                    vThis.calSum();
                                }
                            }]);
                        } else{
                            alert('삭제할 데이터가 없습니다.');
                        }
                    }
                }
            } else{
                // 행 삭제 (외주발주에서 넘어온 데이터인 경우)
                if(vThis.jumpSetMethodId == 'OSPWorkOrderJump'){
                    let temp = GX.deepCopy(vThis.rows.Query);
                    let tempChk = vThis.isCheckList.sort(function(a, b){
                        return b - a;
                    });

                    for(let i in tempChk){
                        if(tempChk.hasOwnProperty(i))
                            temp.splice(tempChk[i], 1);
                    }

                    for(let i in temp){
                        if(temp.hasOwnProperty(i))
                            temp[i].ROWNUM = parseInt(i) + 1;
                    }

                    vThis.rows.Query = temp;
                    vThis.initSelected();
                    vThis.calSum();

                }
                // 행 삭제 (외주납품에서 넘어온 데이터인 경우)
                else if(vThis.jumpSetMethodId == 'PDWorkReportJumpQuery'){
                    let delArrData = GX.deepCopy(vThis.rows.Query);

                    for(let i in delArrData){
                        if(delArrData.hasOwnProperty(i)){
                            /*
                            // 오늘 날짜
                            let today = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "");
                            // 수정, 삭제 시 (최초)입력일자가 존재하고 저장할 때와 일자가 다른 경우 저장하지 못하게함. from 박태근이사
                            if (delArrData[i]?.InsDate) {
                                if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery' && delArrData[i].InsDate != today) {
                                    alert('품번: ' + delArrData[i].ItemNo + '\n사이즈: ' + delArrData[i].SizeText + '\n일일 마감되었습니다. 고객사 담당자에게 문의바랍니다.');
                                    return false;
                                }
                            }
                            */

                            delArrData[i].WorkingTag = 'D';
                        }
                    }

                    GX._METHODS_
                    .setMethodId('PDWorkReportSave')    // 여기에 API 키 입력
                    .ajax([], delArrData, [function (data) {
                        if (data[0].Status && data[0].Status != 0) {
                            // 뭔가 문제가 발생했을 때 리턴
                            alert('삭제 실패\n' + data[0].Result);
                        } else {
                            alert('삭제 성공');
                            for(let i=vThis.rows.Query.length - 1; i >=0; i--){
                                if(vThis.rows.Query.hasOwnProperty(i)){
                                    vThis.rows.Query.splice(i, 1);
                                }
                            }
                            vThis.initSelected();
                            vThis.calSum();
                        }
                    }]);
                }
            }
        },

        del: function(){
            let vThis = this;

            if (confirm('모든 데이터를 삭제하시겠습니까?')) {

                // 삭제 (외주발주에서 넘어온 데이터인 경우)
                if (vThis.jumpSetMethodId == 'OSPWorkOrderJump') {
                    history.back(-1);
                }

                // 삭제 (외주납품에서 넘어온 데이터인 경우)
                else if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery') {
                    let delArrData = GX.deepCopy(vThis.rows.Query);

                    for (let i in delArrData) {
                        /*
                        // 오늘 날짜
                        let today = new Date().toLocaleDateString('ko-kr', {year: "numeric", month: "2-digit", day: "2-digit"}).replace(/\./g, "").replace(/\ /g, "");
                        // 수정, 삭제 시 (최초)입력일자가 존재하고 저장할 때와 일자가 다른 경우 저장하지 못하게함. from 박태근이사
                        if (delArrData[i]?.InsDate) {
                            if (vThis.jumpSetMethodId == 'PDWorkReportJumpQuery' && delArrData[i].InsDate != today) {
                                alert('품번: ' + delArrData[i].ItemNo + '\n사이즈: ' + delArrData[i].SizeText + '\n일일 마감되었습니다. 고객사 담당자에게 문의바랍니다.');
                                return false;
                            }
                        }
                        */

                        delArrData[i].WorkingTag = 'D';
                    }

                    GX._METHODS_
                    .setMethodId('PDWorkReportSave')
                    .ajax(delArrData, [function (data) {
                        if (data[0].Status && data[0].Status != 0) {
                            // 뭔가 문제가 발생했을 때 리턴
                            alert('삭제 실패\n' + data[0].Result);
                        } else {
                            alert('삭제 성공');
                            for(let i=vThis.rows.Query.length - 1; i >=0; i--){
                                vThis.rows.Query.splice(i, 1);
                            }
                            vThis.initSelected();
                            vThis.calSum();
                        }
                    }]);
                }
            }
        }
    },

    created(){
        let vThis = this;

        if(!GX._METHODS_.isLogin()) location.replace('login.html');
        else{
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_hourglass.gif" alt=""></div>', 'prepend');

            document.addEventListener('click', vThis.eventCheck, false);

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
            .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll()" /></div>', '')
                .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);" /></div>', '')
            .item('GoodItemNo').head('품번', '').body(null, 'text-l')
            .item('GoodItemName').head('품명', '').body(null, 'text-l')
            .item('BuyerNo').head('Buyer No', '').body(null, 'text-l')
            .item('DeptName').head('의뢰부서', '')
            // .item('GoodItemSpec').head('규격', '').body(null, 'text-l')
            // .item('ProcName').head('공정', '').body(null, 'text-l')
            .item('SizeName').head('사이즈', '')
            .item('ProdUnitName').head('단위', '')
            .item('OrderQty').head('작업지시수량', '').body(null, 'text-r')
            .item('ProgressQty').head('기생산수량', '').body(null, 'text-r')
            .item('ProdQty', { styleSyntax: 'style="width: 90px;"' }).head('생산수량', '')
                .body('<div style="width: 84px;"><input type="number" name="ProdQty" attr-condition="" :value="row.ProdQty" @input="updateRowData(index)" style="border: 0px solid; width: 100%; text-align: right; background: transparent;" /></div>', 'possible-input-data')
            // .item('OKQty', { styleSyntax: 'style="width: 90px;"' }).head('양품수량', '')
            //     .body('<div style="width: 84px;"><input type="number" name="OKQty" attr-condition="" :value="row.OKQty" @input="updateRowData(index)" style="border: 0px solid; width: 100%; text-align: right; background: transparent;" /></div>')
            // .item('BadQty', { styleSyntax: 'style="width: 90px;"' }).head('불량수량', '')
            //     .body('<div style="width: 84px;"><input type="number" name="BadQty" attr-condition="" :value="row.BadQty" @input="updateRowData(index)" style="border: 0px solid; width: 100%; text-align: right; background: transparent;" /></div>')
            // .item('InWHName').head('입고창고', '')
            .item('Remark').head('특이사항', '')
                .body('<div><input type="text" name="Remark" attr-condition="" :value="row.Remark" @input="updateRowRemark(index)" style="border: 0px solid; text-align: left; background: transparent;" /></div>', 'possible-input-data')
            .item('IsEnd').head('완료여부<div class="chkBox"><input type="checkbox" name="IsEndAll" @click="selectedAllIsEnd();" /></div>', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsEnd" attr-condition="" :value="row.IsEnd" :checked="row.IsEnd" @input="selectedMarkIsEnd(index);" /></div>', '')
            .item('OSPPrice').head('단가', '').body(null, 'text-r')
            .item('IsVAT').head('부가세포함', '')
                .body('<div class="chkBox"><input type="checkbox" name="IsVAT" :value="row.IsVAT" v-model="row.boolIsVAT" disabled="true" /></div>')
            .item('OSPCurAmt').head('금액', '').body(null, 'text-r')
            .item('OSPCurVAT').head('부가세', '').body(null, 'text-r')
            .item('OSPTotCurAmt').head('금액계', '').body(null, 'text-r')
            .item('CurrName').head('통화', '')
            .item('ExRate').head('환율', '')
            .item('OSPDomPrice').head('원화단가', '').body(null, 'text-r')
            .item('OSPDomVAT').head('원화부가세', '').body(null, 'text-r')
            .item('OSPDomAmt').head('원화금액', '').body(null, 'text-r')
            .item('OSPTotDomAmt').head('원화금액계', '').body(null, 'text-r')
            // .item('AssyItemNo').head('공정품번호', '').body(null, 'text-l')
            // .item('AssyItemName').head('공정품명', '').body(null, 'text-l')
            // .item('AssyItemSpec').head('공정품규격', '').body(null, 'text-l')
            // .item('ProdPlanNo').head('생산계획번호', '').body(null, 'text-l')
            .item('WorkOrderNo').head('작업지시번호', '').body(null, 'text-l')
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
                    if (document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.contains('possible-input-data')) {
                        document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.remove('possible-input-data');
                        document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.add('no-data');
                    } else {
                        document.getElementsByName(GX.Calendar.openerName)[attribute].parentNode.parentNode.classList.add('no-data');
                    }
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

            vThis.search();
        } else{
            alert("선택한 행의 데이터가 이상합니다. 다시 시도해주세요.");
            history.back(-1);
        }
    }
})
let app = new Vue({
    el: '#app',
    data:{
        leftMenu: GX._METHODS_.createLeftMenu(),
        deptName: GX.Cookie.get('DeptName'),
        userName: GX.Cookie.get('UserName'),
        params: GX.getParameters(),

        rows: {
            Query: [],
        },

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
        },

        isCheckList: []
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
                /*
                if(e.target.getAttribute('id') == 'btn-query'){
                    vThis.search();
                }
                if(e.target.getAttribute('id') == 'btn-save'){
                    vThis.save();
                }
                if(e.target.getAttribute('id') == 'btn-jump_out_po_delv'){
                    vThis.jumpOutPoDelv();
                }
                */
            }

            // Key Event
            if(e.type === 'keyup'){
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

        // 콤보박스
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

        // 전체 선택
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

        // 조회
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
                .setMethodId('OSPWorkOrderQuery')    // 여기에 호출ID를 입력해주세요.
                .ajax([params], [function (data){
                    if(data.length > 0){
                        for(let i in data){
                            if(data.hasOwnProperty(i))
                                data[i].ROWNUM = parseInt(i) + 1;
                        }
                        console.log(data);
                        vThis.rows.Query = data;

                    } else{
                        alert('조회 결과가 없습니다.');
                    }
                }])
        },

        // 저장
        save: function(){
            console.log("저장 실행");
        },

        // 납품등록 점프
        jumpOutPoDelv: function(){
            console.log("납품등록 점프 실행");
        }
    },

    created(){
        let vThis = this;

        if(!GX._METHODS_.isLogin()) location.replace('login');
        else{
            GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="loading-container"><img src="img/loading_finger.gif" alt=""></div>', 'prepend');

            document.addEventListener('click', vThis.eventCheck, false);
            document.addEventListener('keydown', vThis.eventCheck, false);
            document.addEventListener('keyup', vThis.eventCheck, false);


            GX.VueGrid
                .bodyRow(':class="{\'check\':isChecked(index)}"')
                .item('ROWNUM').head('No.', '')
                .item('RowCheck').head('<div class="chkBox"><input type="checkbox" @click="selectAll();" /></div>', '')
                    .body('<div class="chkBox"><input type="checkbox" name="RowCheck" :value="row.RowCheck" @click="selectedMark(index);"/></div>', '')
                .item('WorkOrderDate').head('작업지시일', '')
                .item('WorkDate').head('작업예정일', '')
                .item('WorkPlanDate').head('납품예정일', '')
                .item('WorkOrderNo').head('작업지시번호', '')
                .item('ProgStatusName').head('진행상태', '')
                .item('ProcName').head('공정', '')
                .item('GoodItemName').head('제품명', '')
                .item('GoodItemNo').head('제품번호', '')
                .item('GoodItemSpec').head('제품규격', '')
                .item('SizeName').head('사이즈', '')
                .item('OrderQty').head('지시수량', '')
                .item('ProgressQty').head('실적진행수량', '')
                .item('NonProgressQty').head('미진행수량', '')
                .item('ProdQty').head('생산수량', '')
                .item('OKQty').head('양품수량', '')
                .item('BadQty').head('불량수량', '')
                .item('Remark').head('특이사항', '')
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
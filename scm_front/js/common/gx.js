if (!String.prototype.trim) {
	String.prototype.trim = function () {
		return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
	};
}

if (!String.prototype.capitalizeFirstLetter) {
	String.prototype.capitalizeFirstLetter = function (caseType) {
		var firstLetter = (caseType != null && caseType == 'L') ? this.charAt(0).toLowerCase() : this.charAt(0).toUpperCase();
		return firstLetter + this.slice(1);
	};
}

if (!Array.isArray) {
	Array.isArray = function (arg) {
		return Object.prototype.toString.call(arg) === '[object Array]';
	};
}

var os = navigator.userAgent.toLowerCase();

window.GX = window.GX || {};
GX = {
	_DATAS_: {},
	_METHODS_: {},
	_MATCHES_: null,
	_BOARD_ID_: null,
	_SITE_ID_: null,
	_IS_SPINNER_: false,
	getCssPropertyValue: function (selector) {
		if (selector != null) {
			let obj;
			if (typeof selector == 'string') obj = document.querySelectorAll(selector)[0];
			else if (typeof selector == 'object') {
				if (typeof selector.length == 'undefined') obj = selector;
				else obj = selector[0];
			}
			
			if (obj != null) {
				if (obj.style.display != '') return obj.style.display;
				else return document.defaultView.getComputedStyle(obj).getPropertyValue('display');
			}
		}
		
		return '';
	},
	elementSiblingIndex: function (selector) {
		let child = document.querySelector(selector);
		let parent = child.parentNode;
		let index = Array.prototype.indexOf.call(parent.children, child);
		// ES6:
		// let index = Array.from(element.parentNode.children).indexOf(element)
		return index;
	},
	isShowElement: function (selector) {
		return (this.getCssPropertyValue(selector) != 'none')
	},
	eventTrigger: function (obj, eventName) {
		if (obj != null) {
			let objs;
			
			if (typeof obj == 'string') objs = document.querySelectorAll(obj);
			else if (typeof obj == 'object') {
				if (typeof obj.length == 'undefined') objs.push(obj);
				else objs = obj;
			}
			
			let e = new Event(eventName);
			
			for (let i in objs) {
				if (objs.hasOwnProperty(i)) objs[i].dispatchEvent(e);
			}
		}
	},
	beepSound: function () {
		//let data = 'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=';
		let data = 'data:audio/mpeg;base64,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';
		this.MediaPlayer.add('beep', 'audio', data);
		this.MediaPlayer.set('beep').play();
	},
	NumberType: {
		rules: {
			time: { type: 'round', to: 1 },
			quantity: { type: 'round', to: 0 }
		},
		time: function (data) {
			return this.convert(data, 'time');
		},
		quantity: function (data) {
			return this.convert(data, 'quantity');
		},
		convert: function (data, ruleKey) {
			let result = Number(data);
			let rule = this.rules[ruleKey];
			if (rule != null) {
				if (rule.type == 'round') {
					let pow = Math.pow(10, rule.to);
					console.log(rule.to, result, pow, Math.round(result * pow), (Math.round(result * pow) / pow));
					return (Math.round(result * pow) / pow);
				}
			}
			return result;
		},
		init: function (rules) {
			if (rules != null) this.rules = rules;
			return this;
		}
	},
	InValidInputTimePrevention: {
		fire: function () {
			let isColon = (event.target.value.replace(/[^\d\:]/g, '').substr(2, 1) == ':');
			let time = event.target.value.replace(/[^\d]/g, '').substr(0, 4);

			if (isColon || time.length > 2) time = time.substr(0, 2) + ':' + time.substr(2, 2);

			if ((time.length >= 5) && time.match(/([0-1][0-9]|2[0-3]):[0-5][0-9]/i) == null) {
				alert('시간을 바르게 입력하세요');
				time = '';
			}

			event.target.value = time;
		},
		init: function () {
			let inputObj = document.querySelectorAll('[gx-time="Y"]');
			
			for (let i in inputObj) {
				if (inputObj.hasOwnProperty(i)) {
					inputObj[i].setAttribute('maxlength', '5');
					inputObj[i].setAttribute('placeholder', '00:00');
					inputObj[i].setAttribute('onkeyup', 'GX.InValidInputTimePrevention.fire();');
				}
			}
		}
	},
	SelectBoxEnterPrevention: {
		fire: function () {
			event.target.blur();
		},
		init: function () {
			// select box에 scannr enter evnet 막기 시작 /////////////
			let selectObj = document.querySelectorAll('select');
			
			for (let i in selectObj) {
				if (selectObj.hasOwnProperty(i)) selectObj[i].setAttribute('onkeydown', 'GX.SelectBoxEnterPrevention.fire();');
			}
		}
	},
	VirtualKeyboardPrevention: {
		scanBoxClick: function () {
			// 스캐너 입력박스 - 클릭시에 가상 가상 키보드 막기 해제(입력시작)
			event.target.setAttribute('inputmode', '');
		},
		scanBoxBlur: function () {
			// 스캐너 입력박스 - 포커스 아웃 일때 가상 가상 키보드 막기 설정(입력완료)
			event.target.setAttribute('inputmode', 'none');
		},
		init: function (selectorStr) {
			// 스캐너 입력박스 - 기본 모바일 가상 키보드 막기 시작 /////////////
			let scannerObj = document.querySelectorAll(selectorStr);
			for (let i in scannerObj) {
				if (scannerObj.hasOwnProperty(i)) {
					scannerObj[i].setAttribute('inputmode', 'none'); // 스캐너 입력박스 - 포커스 인 일때 모바일 가상 키보드 막기 기본 설정
					scannerObj[i].setAttribute('onclick', 'GX.VirtualKeyboardPrevention.scanBoxClick();'); // 스캐너 입력박스 - 클릭시에 가상 가상 키보드 막기 해제(입력시작)
					scannerObj[i].setAttribute('onblur', 'GX.VirtualKeyboardPrevention.scanBoxBlur();'); // 스캐너 입력박스 - 포커스 아웃 일때 가상 가상 키보드 막기 설정(입력완료)
				}
			}
		},
		/**
		 * 스캔하는 input element에 inputmode 수정
		 * setTimeout으로 딜레이는 주는 이유: 바로 inputmode가 수정되게 되면 가상키보드를 띄우게됨
		 */
		inputmodeText: function () {
			let eTarget = event.target;
			setTimeout(() => {
				eTarget.setAttribute('inputmode', 'text');
			}, 10)
		},
		inputmodeNone: function () {
			let eTarget = event.target;
			setTimeout(() => {
				eTarget.setAttribute('inputmode', 'none');
			}, 10)
		},
	},
	TabIndex: {
		tabSelectorStr: 'input:not([type="hidden"]):not([readonly="readonly"]),select,button',
		indexing: function () {
			const focusObj = document.querySelectorAll(this.tabSelectorStr);
			// 다음 입력창 이동을 위한 tab index 부여 시작 /////////////
			for (let i in focusObj) {
				if (focusObj.hasOwnProperty(i)) focusObj[i].setAttribute('tabindex', i);
			}
		},
		next: function (name) {
			const selectorStr = '[name="' + name + '"]';
			GX.eventTrigger(selectorStr, 'change');
			const targetObj = document.querySelector(selectorStr);
			const nextTabIdx = Number(targetObj.tabIndex) + 1;
			const focusObj = document.querySelectorAll(this.tabSelectorStr);
			if (focusObj.length > nextTabIdx) focusObj[nextTabIdx].focus();
			else targetObj.blur();
		},
		next2: function (name) {

		}
	},
	MediaPlayer: {
		object: null,
		playList: {},
		add: function (name, type, data) {
			this.playList[name] = { type: type, data: data };
		},
		set: function (name) {
			if (this.playList[name].type == 'audio') {
				this.object = new Audio(this.playList[name].data);
			}
			return this;
		},
		play: function () {
			this.object.play();
		},
		stop: function () {
			this.object.stop();
		}
	},
	DelayRunManager: {
		isLockeds: {},
		ques: {},
		add: function (workName, workFunction, delayMillisecond) {
			this.ques[workName] = setTimeout(workFunction, delayMillisecond);
			this.isLockeds[workName] = true;
		},
		remove: function (workName) {
			if (this.ques.hasOwnProperty(workName)) clearTimeout(this.ques[workName]);
			this.isLockeds[workName] = false;
		}
	},
	/**
	 * @description 깊은 복사. 메모리 연결 끊어냄.
	 */
	deepCopy: function (objectOrArray) {
		//var dataBlock = Object.assign({}, inputData.ROOT.DataBlock1[0]); //얕은 복사 (Shallow Copy)
		//inputData.ROOT.DataBlock1[0] = Object.assign(dataBlock, inputParam);
		return JSON.parse(JSON.stringify(objectOrArray)); //참조없는 복사
	},
	getSiteId: function () {
		if (this._SITE_ID_ == null) {
			//var matches = location.pathname.match(/^\/([^\/]+)\/.+$/i);
			var matches = location.pathname.match(/^\/([^\/]+).*$/i);
			this._SITE_ID_ = (matches != null && matches.length == 2) ? matches[1] : '';
		}
		return this._SITE_ID_;
	},
	getBoardId: function () {
		if (this._BOARD_ID_ == null) {
			var matches = location.pathname.match(/\/([\da-z]+)$/i);
			this._BOARD_ID_ = (matches != null && matches.length == 2) ? matches[1] : 0;
		}
		return this._BOARD_ID_;
	},
	getParameters: function () {
		if (this._PARAMETERS_ == null) {
			this._PARAMETERS_ = {};
			for (var i in matches) {
				var matches = location.search.split(/[\?\&]?([^\?\&\=]+)\=([^\?\&\=]+)/i)
				if (matches.hasOwnProperty(i) && Number(i) % 3 == 1) this._PARAMETERS_[matches[i]] = matches[Number(i) + 1];
			}
		}
		return this._PARAMETERS_;
	},
	setParameters: function (addParams) {
		if (this._PARAMETERS_ != null) Object.assign(this._PARAMETERS_, addParams);
		return this._PARAMETERS_;
	},
	makeBaseUrl: function (moveHtmlPath) {
		return location.origin + location.pathname.replace(/^(.*)\/[^\/\.]+.html$/, '$1') + moveHtmlPath;
	},
	makeSearch: function () {
		return this.makeQueryString(this.getParameters());
	},
	makeQueryString: function (params) {
		let paramList = [];
		if (params != null) {
			for (let i in params) {
				if (params.hasOwnProperty(i)) {
					paramList.push(i + '=' + params[i]);
				}
			}
		}
		let queryString = (paramList.length > 0) ? '?' : '';
		return (queryString + paramList.join('&'));
	},
	initForm: function (initGroup, extra) {
		//<input type="text" name="ItemNo" value="" gx-pre-value="" add-form-default=""
		//GX.initForm('add-form-default');
		if (!Array.isArray(extra)) extra = [];
		let objs = document.querySelectorAll('[gx-init="' + initGroup + '"]');
		
		for (let i in objs) {
			if (objs.hasOwnProperty(i)) {
				objs[i].value = objs[i].getAttribute('gx-default');
				
				for (let eIdx in extra) {
					if (extra.hasOwnProperty(eIdx) && objs[i].hasAttribute(extra[eIdx])) {
						objs[i].setAttribute(extra[eIdx], objs[i].getAttribute('gx-default'));
					}
				}
			}
		}
	},
	getInitVueModelByFormDefault: function (data) {
		let listQueryForm = GX.deepCopy(data);
		for (let key in listQueryForm) {
			if (listQueryForm.hasOwnProperty(key)) {
				let obj = document.querySelector('[name="' + key + '"]');
				if (obj != null && obj.hasAttribute('gx-default')) listQueryForm[key] = obj.getAttribute('gx-default');
			}
		}
		return listQueryForm;
	},
	getInitVueModelNullOrEmptyByFormDefault: function (data, defaults) {
		let listQueryForm = GX.deepCopy(data);
		for (let key in listQueryForm) {
			if (listQueryForm.hasOwnProperty(key) && (listQueryForm[key] == null || listQueryForm[key].length == 0)) {
				if (defaults[key] != null) listQueryForm[key] = defaults[key];
			}
		}
		return listQueryForm;
	},
	reductionItemByRows: function (names, rows) {
		let i = 0, k = '';
		//console.log('reductionItemByRows', rows)
		for (i in rows) {
			if (rows.hasOwnProperty(i)) {
				for (k in rows[i]) {
					if (rows[i].hasOwnProperty(k)) {
						if (names.indexOf(k) == -1) delete rows[i][k];
					}
				}
			}
		}
		//console.log('reductionItemByRows', rows)
		return rows;
	},
	makeParamByForm: function (names) {
		let result = {};
		let nIdx = 0, oIdx = 0;
		let defaultValue = '';
		for (nIdx in names) {
			if (names.hasOwnProperty(nIdx)) {
				let objs = document.querySelectorAll('[name="' + names[nIdx] + '"]');
				if (objs != null) {
					for (oIdx in objs) {
						if (objs.hasOwnProperty(oIdx)) {
							if (objs.length > 1 && result[names[nIdx]] == null) result[names[nIdx]] = [];
							// console.log(objs[oIdx].tagName, objs[oIdx].checked, objs[oIdx].type);
							if (objs[oIdx].tagName.toLowerCase() == 'input' && ['radio', 'checkbox'].indexOf(objs[oIdx].type.toLowerCase()) != -1) {
								defaultValue = objs[oIdx].hasAttribute('gx-default') ? objs[oIdx].getAttribute('gx-default') : '';
								if (objs.length > 1) result[names[nIdx]].push(objs[oIdx].checked ? objs[oIdx].value : defaultValue);
								else result[names[nIdx]] = objs[oIdx].checked ? objs[oIdx].value : defaultValue;
							}
							else {
								if (objs.length > 1) result[names[nIdx]].push(objs[oIdx].value);
								else result[names[nIdx]] = objs[oIdx].value;
							}
						}
					}
				}
			}
		}
		return result;
	},
	Cookie: {
		set: function (name, value, days) {
			let exdate = new Date();
			exdate.setDate(exdate.getDate() + days);
			//exdate.setTime(exdate.getTime() + (days*24*60*60*1000));
			// 설정 일수만큼 현재시간에 만료값으로 지정
			document.cookie = name + '=' + escape(value) + ((days == null) ? '' : '; expires=' + exdate.toUTCString());
		},
		get: function (name) {
			let parseData = document.cookie.split(/[\=\s\;]/i);
			let data = {};
			for (let i in parseData) {
				if (parseData.hasOwnProperty(i) && (Number(i) % 3) == 0) data[parseData[i]] = unescape(parseData[Number(i) + 1]);
			}
			
			let result = (name != null && data[name] != null) ? data[name] : '';
			return (name != null) ? result : data;
		}
	},
	Storage: {
		data: localStorage,
		set: function (name, value) {
			localStorage.setItem(name, value);
		},
		get: function (name) {
			return localStorage.getItem(name);
		},
		remove: function (name) {
			localStorage.removeItem(name);
		},
		clear: function () {
			localStorage.clear();
		},
		count: function () {
			return localStorage.length;
		},
		key: function (idx) {
			return localStorage.key(idx);
		}
	},
	SessionStorage: {
		data: sessionStorage,
		set: function (name, value) {
			sessionStorage.setItem(name, value);
		},
		get: function (name) {
			return sessionStorage.getItem(name);
		},
		remove: function (name) {
			sessionStorage.removeItem(name);
		},
		clear: function () {
			sessionStorage.clear();
		},
		count: function () {
			return sessionStorage.length;
		},
		key: function (idx) {
			return sessionStorage.key(idx);
		}
	},
	VueGrid: {
		pushDatas: {},
		headTemplates: [],
		bodyTemplates: [],
		key: '',
		options: {},
		newLines: [],
		types: ['head', 'body'],
		rowProperties: { head: '', body: '' },
		init: function () {
			this.pushDatas = {};
			this.headTemplates = [];
			this.bodyTemplates = [];
			this.key = '';
			this.options = {};
			this.newLines = [];
			this.types = ['head', 'body'];
			this.rowProperties = { head: '', body: '' };
			return this;
		},
		headRow: function (propertiesSyntax) {
			this.rowProperties.head = ' ' + propertiesSyntax;
			return this;
		},
		bodyRow: function (propertiesSyntax) {
			this.rowProperties.body = ' ' + propertiesSyntax;
			return this;
		},
		item: function (key, options) {
			this.key = key;
			this.options = (options != null) ? options : {};
			return this;
		},
		push: function (type, key, value, className, options) {
			if (key != null && key.length > 0) {
				let bindClass = (className != null && className.length > 0) ? ' class="' + className + '"' : '';
				let bindValue = (value != null) ? value : '{{row.' + key + '}}';
				//console.log('options', options, key,value)
				let bindColspan = (options['colspan'] != null) ? ' colspan="' + options['colspan'] + '"' : '';
				let bindRowspan = (options['rowspan'] != null) ? ' rowspan="' + options['rowspan'] + '"' : '';
				let bindEvent = (options['eventSyntax'] != null) ? ' ' + options['eventSyntax'] : '';
				let bindStyle = (options['styleSyntax'] != null) ? ' ' + options['styleSyntax'] : '';
				
				this[type + 'Templates'].push('<td' + bindEvent + bindClass + bindColspan + bindRowspan + bindStyle + '>' + bindValue + '</td>');

				if (this.newLines.indexOf(key) != -1) {
					this[type + 'Templates'].push('</tr><tr' + this.rowProperties[type] + '>');
				}
			}
			return this;
		},
		setPushData: function (type, value, className) {
			if (this.pushDatas[this.key] == null) this.pushDatas[this.key] = {};
			this.pushDatas[this.key][type] = [value, className, this.options];
			return this;
		},
		head: function (value, className) {
			this.setPushData('head', value, className);
			return this;
		},
		body: function (value, className) {
			this.setPushData('body', value, className);
			return this;
		},
		nl: function () {
			let cols = Object.keys(this.pushDatas);
			this.newLines.push(cols[cols.length - 1]);
			//console.log('this.pushDatas.length=', this.newLines);
			return this;
		},
		loadTemplate: function (selector, rowsName) {
			for (let key in this.pushDatas) {
				if (this.pushDatas.hasOwnProperty(key)) {
					for (let type in this.pushDatas[key]) {
						this.push(type, key, this.pushDatas[key][type][0], this.pushDatas[key][type][1], this.pushDatas[key][type][2]);
					}
					
					if (this.pushDatas[key]['body'] == null) {
						let className = (this.pushDatas[key]['head'] == null) ? {} : this.pushDatas[key]['head'][1];
						let options = (this.pushDatas[key]['head'] == null) ? {} : this.pushDatas[key]['head'][2];
						this.push('body', key, null, className, options);
					}
				}
			}
			
			let templates = [];
			let types = ['head', 'body'];
			let isExist = false;
			for (let i in types) {
				if (this[types[i] + 'Templates'].length > 0) {
					isExist = true;
					break;
				}
			}
			if (isExist) {
				templates.push('<table>');
				
				for (let i in types) {
					if (this[types[i] + 'Templates'].length > 0) {
						let bodyFor = (types[i] == 'body') ? ' v-for="(row, index) in ' + rowsName + '"' : '';
						
						templates.push('<t' + types[i] + '>');
						templates.push('<template' + bodyFor + '>');
						templates.push('<tr' + this.rowProperties[types[i]] + '>');
						templates.push(this[types[i] + 'Templates'].join(''));
						templates.push('</tr>');
						templates.push('</template>');
						
						templates.push('</t' + types[i] + '>');
					}
				}
				templates.push('</table>');
			}
			if (document.querySelector(selector) != null) document.querySelector(selector).innerHTML = templates.join('');
			else alert(selector + '로 지정한 그리드 영역이 없습니다.');
		}
	},
	FileManager: {
		byteCalculation: function (bytes) {
			var retFormat = "0";
			var size = bytes;
			
			var s = ["bytes", "KB", "MB", "GB", "TB", "PB"];
			
			if (bytes != "0") {
				var idx = Math.floor(Math.log(size) / Math.log(1024));
				var ret = ((size / Math.pow(1024, Math.floor(idx))));
				
				retFormat = (ret + '').replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " " + s[idx];
			} else {
				retFormat += " " + s[0];
			}
			
			return retFormat;
		}
	},
	SNS: {
		//(본문) SNS 공유
		//facebook
		facebook: function (title, sUrl, pic, desc) {
			var tg = 'https://www.facebook.com/sharer/sharer.php?sdk=joey&u=';
			title = encodeURIComponent($.trim(title));
			var url = tg + encodeURIComponent(sUrl) + '&t=' + title;
			var opt = 'left=0, top=0, width=553, height=400, scrollbars=0, resizable=1';
			//window.open("http://www.facebook.com/sharer/sharer.php?u=" + location.href);	
			this.newopen(url, opt);
		},
		//blog
		blog: function (title, sUrl, pic, desc) {
			var tg = 'http://blog.naver.com/openapi/share?url=';
			title = encodeURIComponent($.trim(title));
			var url = tg + sUrl + '&title=' + title;
			var opt = 'left=0, top=0, width=557, height=400, scrollbars=yes, resizable=no';
			
			this.newopen(url, opt);
		},
		//kakaotalk
		kakaotalk: function (title, sUrl, pic, desc) {
			
			title = $.trim(title);
			/*
			Kakao.Link.sendScrap({
				requestUrl : sUrl,
				success : function(){
					console.log('카카오톡 공유 성공');
				}
			});
			
			
			Kakao.Story.open({
				url: sUrl,
				text: title
			});
			*/
			Kakao.Link.sendDefault({
				objectType: 'text',
				text: title,
				link: {
					mobileWebUrl: sUrl,
					webUrl: sUrl
				}
			});

		},
		//urlCopy
		copyUrlToClipboard: function (sUrl, msg) {
			if (msg == null) msg = 'URL이 복사되었습니다.';
			/*
			var textarea = document.createElement("textarea");
			document.body.appendChild(textarea);
			url = window.document.location.href;
			textarea.value = sUrl;
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			alert("URL이 복사되었습니다.")
			*/
			
			var dummy = document.createElement("input");
			document.body.appendChild(dummy);
			dummy.value = sUrl;
			dummy.select();
			document.execCommand("copy");
			document.body.removeChild(dummy);
			alert(msg);
			
			return false;
		},
		//newopen
		newopen: function (url, opt) {
			//tooltip.close();
			if (opt == undefined || opt == '') window.open(url, 'blank');
			else window.open(url, 'share', opt);
			return false;
		}
	},
	/**
	 * Description: 로딩 엘리먼트 추가
	 * Added paramater: appendPosition -> 로딩 엘리먼트를 추가하는 위치 추가. append or prepend
	 */
	SpinnerBootstrap: {
		obj: {},
		init: function (containerId, containerClass, spinnerHtml, appendPosition = 'append') {
			//GX.SpinnerBootstrap.init('loading', 'loading-wrap', '<div class="container"><img src="img/loading.gif" alt=""><span>처리중입니다...</span></div>')
			if (spinnerHtml == null) {
				spinnerHtml = '<div>';
				spinnerHtml += '<span class="dot1"></span>';
				spinnerHtml += '<span class="dot2"></span>';
				spinnerHtml += '<span class="dot3"></span>';
				spinnerHtml += '<p>처리중..</p>';
				spinnerHtml += '</div>';
			}
			
			this.obj = document.createElement("div");
			this.obj.id = containerId || "loading";
			this.obj.style.display = "none";
			
			this.obj.className = containerClass || 'loading-spinner vertical-center';
			this.obj.innerHTML = spinnerHtml;
			
			if (appendPosition == 'append') {
				if (document.getElementsByTagName('main')[0] == null || document.getElementsByTagName('main')[0] == undefined) {
					document.body.append(this.obj);
				} else {
					document.getElementsByTagName('main')[0].append(this.obj);
				}
			} else if (appendPosition == 'prepend') {
				if (document.getElementsByTagName('main')[0] == null || document.getElementsByTagName('main')[0] == undefined) {
					document.body.prepend(this.obj);
				} else {
					document.getElementsByTagName('main')[0].prepend(this.obj);
				}
			}
		},
		show: function () {
			document.getElementById('loading').style.display = 'block';
			// this.obj.style.display = "block";
		},
		hide: function () {
			document.getElementById('loading').style.display = 'none';
			// this.obj.style.display = "none";
		}
	},
	zeroFill: function (num, len) {
		var str = '' + num;
		for (var i = 0; i < len; i++) {
			if (str.length == i + 1) str = '0' + str;
		}
		String(num).padStart(len, '0')
		return str;
		//return String(num).padStart(len, '0');
	},
	priceFormat: function (price) {
		var original = "" + price;
		var intStr = original.split(".");
		intStr[0] = intStr[0].replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
		var fomatting = intStr.join('.');
		return fomatting;
	},
	dateInfo: function (date) {
		let result = {};
		let dateStr = date.getFullYear();
		dateStr += '-' + GX.zeroFill(date.getMonth() + 1, 1);
		dateStr += '-' + GX.zeroFill(date.getDate(), 1);
		dateStr += ' ' + GX.zeroFill(date.getHours(), 1);
		result.date = dateStr;
		dateStr += ':' + GX.zeroFill(date.getMinutes(), 1);
		dateStr += ':' + GX.zeroFill(date.getSeconds(), 1);
		result.short = dateStr;
		dateStr += '.' + GX.zeroFill(date.getMilliseconds(), 2);
		result.full = dateStr;
		return result;
	},
	nowDate: function () {
		return this.dateInfo(new Date());
	},
	formatDate: function (curDate, format) {
		let today = new Date();
		let resultDate = new Date();
		if (typeof curDate == 'object') resultDate = curDate;
		else {
			let parseData = curDate.split(/[\-\s:\.]/);
			
			let year = (parseData[0] != null) ? Number(parseData[0]) : 1970;
			let month = (parseData[1] != null) ? Number(parseData[1]) : 1;
			let day = (parseData[2] != null) ? Number(parseData[2]) : 1;
			let hours = (parseData[3] != null) ? Number(parseData[3]) : 0;
			let minutes = (parseData[4] != null) ? Number(parseData[4]) : 0;
			let seconds = (parseData[5] != null) ? Number(parseData[5]) : 0;
			let milliseconds = (parseData[6] != null) ? Number(parseData[6]) : 0;
			
			resultDate = new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);//curDate
		}
		
		timegap = (today - resultDate) / (60 * 60 * 1000);
		
		let curYear = String(resultDate.getFullYear());
		let curMonth = String(resultDate.getMonth() + 1);
		let curDay = String(resultDate.getDate());
		let curHours = String(resultDate.getHours());
		let curMinutes = String(resultDate.getMinutes());
		let curSeconds = String(resultDate.getSeconds());
		let curMilliseconds = String(resultDate.getMilliseconds());
		let defines = {
			Y: curYear, y: curYear.substr(-2, 2), M: GX.zeroFill(curMonth, 1), m: curMonth, D: GX.zeroFill(curDay, 1), d: curDay,
			H: GX.zeroFill(curHours, 1), h: curHours, I: GX.zeroFill(curMinutes, 1), i: curMinutes, S: GX.zeroFill(curSeconds, 1), s: curSeconds,
			T: GX.zeroFill(curMilliseconds, 2), t: curMilliseconds
		};
		//format=Y/y,M/m,D/d,H/h,I/i,S/s,T/t
		if (format != null) {
			let parse = format.split('');
			for (let i in parse) {
				if (parse.hasOwnProperty(i) && defines.hasOwnProperty(parse[i])) parse[i] = defines[parse[i]];
			}
			resultDate = parse.join('');
		}
		else {
			// Time (minutes * seconds * millisecond)
			if (timegap <= 24) {
				if (Math.floor(timegap) == 0) {
					resultDate = Math.floor(timegap * 24) + ' 분 전';
				}
				else {
					resultDate = Math.floor(timegap) + ' 시간 전';
				}
			}
			else {

				resultDate = curYear + '-' + curMonth.padStart(2, '0') + '-' + curDay.padStart(2, '0');
			}
		}
		
		return resultDate;
	},
	doubleClickRun: function (obj, callback) {
		let currentDateTime = this.formatDate(this.nowDate().full, 'YMDHIS');
		let checkKey = 'check-double-click';
		//let obj = event.target;
		if (obj.hasAttribute(checkKey) && obj.getAttribute(checkKey) == currentDateTime) callback();
		obj.setAttribute(checkKey, currentDateTime);
	},
	inputTypeDateEventHandler: function () {
		this.openerName = event.target.name;
		//console.log(event.target.value.test(/^\d{1,4}[^\d]*\d{1,2}[^\d]*\d{1,2}[^\d]*/))
		let result = true;
		let word = '';
		
		let eventKey = (event.key == null || event.key == 'Unidentified') ? '' : event.key;
  
		if (['F1', 'F4', 'F5', 'Shift', 'Control', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(eventKey) != -1) result = false;
		else if (['Backspace', 'Home', 'End'].indexOf(eventKey) != -1) result = false;
		else if (eventKey == 'Process') event.target.setAttribute('readonly', 'readonly');
		else if (['Enter'].indexOf(eventKey) != -1){
			const info = GX.Calendar.dateFormatInfo(event.target);
			const delimiterPattern = (info.delimiter.length > 0) ? '\\' + info.delimiter : '';
			let tmpNowDate = GX.formatDate(GX.nowDate().full, 'Y-M-D').replace(/\-/g, '');
			let tmpInputDate = event.target.value.replace(/\-/g, '');
			let tmpResult = "";
			let pattern = new RegExp('^[1-9]\\d{0,3}' + delimiterPattern + '(0[1-9]|1[012])' + delimiterPattern + '(0[1-9]|[12][0-9]|3[01])$');

			let curIdx = tmpInputDate.length - tmpNowDate.length;
			for(let i=0; i < tmpNowDate.length; i++){
				if(i + curIdx >= 0){
					tmpResult = tmpResult.concat(tmpInputDate[i + curIdx]);
				}
				else{
					tmpResult = tmpResult.concat(tmpNowDate[i]);
				}
			}
			
			if(pattern.test(tmpResult.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))){
				// 입력한 날짜가 유효한 날짜이면 여기서 처리
				/*
				let temp;
				
				if (this.objOpenInRow && this.objOpenInRow.useYN)
				temp = document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx];
				else
				temp = document.querySelector('[name="' + this.openerName + '"]');
				
				const openerObj = temp;
				const info = GX.Calendar.dateFormatInfo(openerObj);
				openerObj.value = (tmpResult.length == 0) ? tmpResult : GX.formatDate(tmpResult, info.format);
				*/
			}
			result = false;
		}
		else {
			const info = GX.Calendar.dateFormatInfo(event.target);
			const delimiterPattern = (info.delimiter.length > 0) ? '\\' + info.delimiter : '';
			let patterns = {};
			patterns.char_0 = new RegExp('[\\d' + delimiterPattern + ']');//0
			patterns.char_1 = new RegExp('^[01]$');//8
			patterns.char_2 = new RegExp('^[0123]$');//8
			
			patterns.text_0 = new RegExp('^[1-9]\\d{0,3}$');
			patterns.text_1 = new RegExp('^[1-9]\\d{0,3}' + delimiterPattern + '$');
			patterns.text_2 = new RegExp('^[1-9]\\d{0,3}' + delimiterPattern + '[01]$');
			patterns.text_3 = new RegExp('^[1-9]\\d{0,3}' + delimiterPattern + '(0[1-9]|1[012])$');
			patterns.text_4 = new RegExp('^[1-9]\\d{0,3}' + delimiterPattern + '(0[1-9]|1[012])' + delimiterPattern + '$');
			patterns.text_5 = new RegExp('^[1-9]\\d{0,3}' + delimiterPattern + '(0[1-9]|1[012])' + delimiterPattern + '[0123]$');
			patterns.text_6 = new RegExp('^[1-9]\\d{0,3}' + delimiterPattern + '(0[1-9]|1[012])' + delimiterPattern + '(0[1-9]|[12][0-9]|3[01])$');
  
			word = eventKey;
			
			if (word.length > 0 && patterns.char_0.test(word)) {
				if (word.length == 0) result = false;
			  else {
				  word = event.target.value + word;
				  //console.log(info);
				  if (info.delimiter.length == 0) {
					  if (word.length <= 4) {
						  if (patterns.text_0.test(word)) result = false;
						}
					else if (word.length == 5) {
					   if (patterns.text_2.test(word)) result = false;
					}
					else if (word.length == 6) {
						if (patterns.text_3.test(word)) result = false;
					}
					else if (word.length == 7) {
					   if (patterns.text_5.test(word)) result = false;
					}
					else if (word.length == 8) {
						if (patterns.text_6.test(word)) {
							let matches = word.match(/^(\d{4})(\d{2})(\d{2})$/);
							let part = [];
							part[0] = matches[1];
							part[1] = GX.zeroFill(Number(matches[2]), 1);
							part[2] = GX.zeroFill(Number(matches[3]), 1);
							let checkDateStr = part.join('-');
							if (GX.formatDate(checkDateStr, 'Y-M-D') == checkDateStr) result = false;
						}
					}
					
				}
				 else if (info.delimiter.length == 1) {
					 if (word.length <= 4) {
						 if (patterns.text_0.test(word)) result = false;
						}
						else if (word.length == 5) {
							if (patterns.text_1.test(word)) result = false;
							else if (patterns.char_1.test(eventKey)) {
								result = false;
								event.target.value = event.target.value + info.delimiter;
							}
						}
						else if (word.length == 6) {
							if (patterns.text_2.test(word)) result = false;
						}
						else if (word.length == 7) {
							if (patterns.text_3.test(word)) result = false;
						}
						else if (word.length == 8) {
							if (patterns.text_4.test(word)) result = false;
					   else if (patterns.char_2.test(eventKey)) {
						   result = false;
						   event.target.value = event.target.value + info.delimiter;
						}
					}
					else if (word.length == 9) {
						if (patterns.text_5.test(word)) result = false;
					}
					else if (word.length == 10) {
						if (patterns.text_6.test(word)) {
							let part = word.split(info.delimiter);
							//part[0] = String(Number(part[0]));
							//if(part[0].length <= 2) part[0] = '19' + part[0];
							part[1] = GX.zeroFill(Number(part[1]), 1);
							part[2] = GX.zeroFill(Number(part[2]), 1);
							// console.log(GX.formatDate(word, info.format))
							if (GX.formatDate(word, info.format) == part.join(info.delimiter)) result = false;
						}
					}
					
					
				}
				
			}
			
		}
		
		/*
		if(word.length > 0 && /[\d\-]/.test(word)){
			
			if(word.length == 0) result = false;
			else {
				word = event.target.value + word;
				if(word.length <= 4){
					if(/^[1-9]\d{0,3}$/.test(word)) result = false;
				}
				else if(word.length == 5){
					if(/^[1-9]\d{0,3}\-$/.test(word)) result = false;
					else if(/[\d\-]/.test(event.key)){
						result = false;
						event.target.value = event.target.value + '-';
					}
				}
				else if(word.length == 6){
					if(/^[1-9]\d{0,3}\-[01]$/.test(word)) result = false;
				}
				else if(word.length == 7){
					if(/^[1-9]\d{0,3}\-(0[1-9]|1[012])$/.test(word)) result = false;
				}
				else if(word.length == 8){
					if(/^[1-9]\d{0,3}\-(0[1-9]|1[012])\-$/.test(word)) result = false;
					else if(/[\d\-]/.test(event.key)){
						result = false;
						event.target.value = event.target.value + '-';
					}
				}
				else if(word.length == 9){
					if(/^[1-9]\d{0,3}\-(0[1-9]|1[012])\-[0123]$/.test(word)) result = false;
				 }
				 else if(word.length == 10){
					 if(/^[1-9]\d{0,3}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/.test(word)){
						 let part = word.split('-');
						 //part[0] = String(Number(part[0]));
						 //if(part[0].length <= 2) part[0] = '19' + part[0];
						 part[1] = GX.zeroFill(Number(part[1]), 1);
					   part[2] = GX.zeroFill(Number(part[2]), 1);
					   console.log(GX.formatDate(word, 'Y-M-D'))
					   if(GX.formatDate(word, 'Y-M-D') == part.join('-')) result = false;
					}
				}
			}
		}*/
	}
	
	if (result) {
		// if(isPass){
			//    event.target.value = event.target.value + eventKey;
			//    event.target.setAttribute('readonly', 'readonly');
			// }
			// else event.preventDefault();
			
			event.preventDefault();
		}
		//alert(event.target.temp +'='+ event.target.value);
		
	},
	inputTypeDateEventAfterHandler: function () {
		//alert(event.type)
		//if(event.target.hasAttribute('readonly')) event.target.removeAttribute('readonly');
	},
	Calendar: {
		viewType: 'd',//y,m,d
		isInClick: false,
		yearRange: { begin: 0, end: 0 },
		calendarObj: null,
		openerName: '',
		objOpenInRow: { useYN: false, idx: 0 },
		config: {
			width: '340px',
			height: '390px',
			format: 'Y-M-D',
			monthSelectWidth: '100%',
			classes: {
				container: 'gx-datepicker',
				box: 'gx-datepicker',
				header: 'calendar-top',
				navigate: 'calendar-header',
				viewWrap: {
					d: 'gx-calendar-day-con',
					m: 'gx-calendar-month-wrap',
					y: 'gx-calendar-years-wrap'
				},
				view: {
					d: '',
					m: 'gx-calendar-month',
					y: 'gx-calendar-years'
				},
				
				control: 'gx-calendar-buttons',
				today: 'today',
				select: 'date-select'
			},
			callback: function (result) { },
			useInputTypeDate: true
		},
		weekendNames: [
			{ name: '일', color: '#FF0000' },
			{ name: '월', color: '#000000' },
			{ name: '화', color: '#000000' },
			{ name: '수', color: '#000000' },
			{ name: '목', color: '#000000' },
			{ name: '금', color: '#000000' },
			{ name: '토', color: '#0000FF' }
		],
		endDateOfMonth: {},
		thisDate: '',
		dateFormatInfo: function (obj) {
			let info = {};
			info.format = obj.hasAttribute(this.calendarObj.id + '-format') ? obj.getAttribute(this.calendarObj.id + '-format') : this.config.format;
			const matches = info.format.match(/[^YMD]/i);
			info.delimiter = (matches != null) ? matches[0] : '';
			return info;
		},
		parseNowDate: function (date) {
			if (date == null) date = this.thisDate;
			let result = {};
			let matches = date.match(/^(\d{4,})[^\d]*(\d{2,2})[^\d]*(\d{2,2})[^\d]*$/);
			if (matches != null) {
				result.y = Number(matches[1]);
				result.m = Number(matches[2]);
				result.d = Number(matches[3]);
			}
			
			return result;
		},
		createElement: function (tagName, content, attributes) {
			var newElement = document.createElement(tagName);
			for (var i in attributes) {
				if (attributes.hasOwnProperty(i)) {
					newElement[i] = attributes[i];
				}
			}
			var newText = document.createTextNode(content);
			newElement.appendChild(newText);
			return newElement;
		},
		bind: function (option, targetObj, newElement) {
			//option == 'after'
			//option == 'appendChild'
			targetObj[option](newElement);
		},
		inputLink: function (calendarId) {
			const calendarInputs = document.querySelectorAll('[' + calendarId + ']');
			for (let key in calendarInputs) {
				if (calendarInputs.hasOwnProperty(key)) {
					calendarInputs[key].setAttribute('inputmode', 'none');
					
					calendarInputs[key].addEventListener('click', function () {
						GX.Calendar.open(event.target.name);
					}, false); //inputDateCalendar
					calendarInputs[key].addEventListener('blur', function () {
						GX.Calendar.selectMode();
					}, false); //inputDateDirectPrevention
					
					if (this.config.useInputTypeDate) {
						calendarInputs[key].addEventListener('keydown', GX.inputTypeDateEventHandler, false);
						//calendarInputs[key].addEventListener('input', GX.inputTypeDateEventHandler, false);
						calendarInputs[key].addEventListener('keyup', GX.inputTypeDateEventAfterHandler, false);
						
					}
				}
			}
		},
		before: function () {
			let ly = 0;
			let lm = 0;
			
			if (this.viewType == 'd') {
				ly = this.endDateOfMonth.this.year;
				lm = this.endDateOfMonth.this.month - 1;
				
				if (this.endDateOfMonth.this.month == 1) {
					ly = this.endDateOfMonth.this.year - 1;
					lm = 12;
				}
			}
			else if (this.viewType == 'm') {
				ly = this.endDateOfMonth.this.year - 1;
				lm = 1;
			}
			else if (this.viewType == 'y') {
				ly = this.endDateOfMonth.this.year - 4;
				lm = 1;
			}
			this.set(ly, lm);
		},
		next: function () {
			let ny = 0;
			let nm = 0;
			
			if (this.viewType == 'd') {
				ny = this.endDateOfMonth.this.year;
				nm = this.endDateOfMonth.this.month + 1;
				
				if (this.endDateOfMonth.this.month == 12) {
					ny = this.endDateOfMonth.this.year + 1;
					nm = 1;
				}
			}
			else if (this.viewType == 'm') {
				ny = this.endDateOfMonth.this.year + 1;
				nm = 1;
			}
			else if (this.viewType == 'y') {
				ny = this.endDateOfMonth.this.year + 4;
				nm = 1;
			}
			this.set(ny, nm);
		},

		getDateOfMonth: function (year, month) {
			const dateOfMonth = new Date(year, month, 0);
			return {
				year: dateOfMonth.getFullYear(),
				month: dateOfMonth.getMonth() + 1,
				day: dateOfMonth.getDate(),
				weekday: dateOfMonth.getDay()
			};
		},
		insertView: function (viewName, html) {
			document.getElementById(this.calendarObj.id + '-' + viewName).innerHTML = html;
		},
		cell: function (date, day, color, backgroundColorClass) {
			let eventStr = (date != '') ? ' onclick="GX.Calendar.selectDay(\'' + date + '\');"' : '';
			//let styleStr = ' style="padding:12px 3px; width:13.7%; color:'+color+';"';
			let styleStr = ' style="color:' + color + ';"';
			let result = '<span class="' + backgroundColorClass + '"' + styleStr + eventStr + '>' + String(day) + '</span>';
			return result;
		},
		openDaySelect: function () {
			this.isInClick = true;
			
			let remained = this.endDateOfMonth.this.day % 7;
			let ld = this.endDateOfMonth.last.weekday;
			let nd = 7 - (this.endDateOfMonth.this.weekday + 1);
			let days = [];
			let d = 0;
			let dateStr = String(this.endDateOfMonth.last.year) + '-' + String(this.endDateOfMonth.last.month) + '-';
			if (ld < 6) {
				for (d = ld; d >= 0; d--) {
					days.push({ date: GX.formatDate(dateStr + String(this.endDateOfMonth.last.day - d), 'Y-M-D'), d: this.endDateOfMonth.last.day - d });
				}
			}
			
			dateStr = String(this.endDateOfMonth.this.year) + '-' + String(this.endDateOfMonth.this.month) + '-'
			for (d = 1; d <= this.endDateOfMonth.this.day; d++) {
				days.push({ date: GX.formatDate(dateStr + String(d), 'Y-M-D'), d: d });
			}

			dateStr = ((this.endDateOfMonth.this.month == 12) ? this.endDateOfMonth.this.year + 1 : this.endDateOfMonth.this.year);
			dateStr += '-' + ((this.endDateOfMonth.this.month == 12) ? 1 : this.endDateOfMonth.this.month + 1);
			dateStr += '-'
			for (d = 1; d <= nd; d++) {
				days.push({ date: GX.formatDate(dateStr + String(d), 'Y-M-D'), d: d });
			}
			
			let metrics = [];
			let isColorOpacity = true;
			let colorOpacity = '';
			let i = 0;
			for (i = 0; i < 7; i++) {
				metrics.push(this.cell('', this.weekendNames[i].name, this.weekendNames[i].color, ''));
			}
			
			let temp;
			if (this.objOpenInRow && this.objOpenInRow.useYN)
			temp = document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx];
			else
			temp = document.querySelector('[name="' + this.openerName + '"]');
			const openerObj = temp;
			let inputDate = (openerObj != null) ? openerObj.value : '';
			
			const parseDate = this.parseNowDate(inputDate);
			if (inputDate.length > 0 && parseDate.y != null) inputDate = GX.formatDate(new Date(parseDate.y, parseDate.m - 1, parseDate.d), 'Y-M-D');
			
			let todayClassName = '';
			for (i = 0; i < days.length; i++) {
				if (days[i].d == 1) isColorOpacity = !isColorOpacity;
				
				colorOpacity = isColorOpacity ? '55' : 'FF';
				
				todayClassName = (days[i].date == this.thisDate) ? this.config.classes.today : '';
				if (days[i].date == inputDate) todayClassName = this.config.classes.select;
				
				metrics.push(this.cell(days[i].date, String(days[i].d), this.weekendNames[i % 7].color + colorOpacity, todayClassName));
				
			}
			document.getElementById(this.calendarObj.id + '-view').className = this.config.classes.viewWrap.d;
			this.insertView('view', metrics.join(''));
			
			
		},
		openMonthSelect: function () {
			this.isInClick = true;
			let metrics = [];
			let now = this.parseNowDate();
			
			let year = 1;
			const viewTypeValue = document.getElementById(this.calendarObj.id + '-viewtype').innerHTML;
			
			matches = viewTypeValue.match(/^(\d{4,})[^\d]*/);
			year = Number(matches[1]);
			
			
			metrics.push('<div class="' + this.config.classes.view.m + '">');
			let todayMonthClassName = '';
			for (let i = 1; i <= 12; i++) {
				todayMonthClassName = (Number(now.m) == i && Number(now.y) == year) ? this.config.classes.today : '';
				//metrics.push('<span style="width:25%; padding:15% 3px;" class="'+todayMonthClassName+'" onclick="GX.Calendar.selectMonth('+i+');">'+i+'</span>');
				metrics.push('<span class="' + todayMonthClassName + '" onclick="GX.Calendar.selectMonth(' + i + ');">' + i + '</span>');
			}
			metrics.push('</div>');
			document.getElementById(this.calendarObj.id + '-view').className = this.config.classes.viewWrap.m;
			this.insertView('view', metrics.join(''));
		},
		openYearSelect: function (year) {
			this.isInClick = true;
			let begin = year - 4;
			let end = year + 11;
			let metrics = [];
			let now = this.parseNowDate();
			
			metrics.push('<div class="' + this.config.classes.view.y + '">');
			
			let todayYearClassName = '';
			for (let i = begin; i <= end; i++) {
				todayYearClassName = (Number(now.y) == i) ? this.config.classes.today : '';
				//metrics.push('<span class="'+todayYearClassName+'" style="width:25%;" onclick="GX.Calendar.selectYear('+i+');">'+i+'</span>');
				metrics.push('<span style="width:' + this.config.monthSelectWidth + '" class="' + todayYearClassName + '" onclick="GX.Calendar.selectYear(' + i + ');">' + i + '</span>');
			}
			
			metrics.push('</div>');
			document.getElementById(this.calendarObj.id + '-view').className = this.config.classes.viewWrap.y;
			this.insertView('view', metrics.join(''));
		},
		selectYear: function (year) {
			this.viewType = 'm';
			this.set(year, 1);
			this.offset();
		},
		selectMonth: function (month) {
			this.viewType = 'd';
			let matches = document.getElementById(this.calendarObj.id + '-viewtype').innerHTML.match(/^(\d{4,})[^\d]*$/);
			let year = Number(matches[1]);
			this.set(year, month);
			this.offset();
		},
		selectDay: function (date) {
			let temp;
			if (this.objOpenInRow && this.objOpenInRow.useYN)
				temp = document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx];
			else
			temp = document.querySelector('[name="' + this.openerName + '"]');
			const openerObj = temp;
			const info = GX.Calendar.dateFormatInfo(openerObj);
			openerObj.value = (date.length == 0) ? date : GX.formatDate(date, info.format);//date;
			
			this.config.callback(date, openerObj.getAttribute(this.calendarObj.id)); //app.listQueryForm[this.openerName] = date;
			//gx-calendar="listQueryForm.InOutDateFr
			this.offset();
			this.close();
		},
		
		setWeekendNames: function (weekendNames) {
			this.weekendNames = weekendNames;
		},
		
		box: function (calendarName) {
			let now = this.parseNowDate()
			let dateObj = new Date(now.y, now.m - 1, now.d);
			let template = '';
			//template += '<div class="'+this.config.classes.box+'">';
			//template += '<div class="'+this.config.classes.header+'">';
			//template += '<span>' + GX.formatDate(this.thisDate, 'M월 D일') + ' ' + this.weekendNames[dateObj.getDay()].name + '요일</span>';
			//template += '<button onclick="GX.Calendar.close();">닫기</button>';
			template += '</div>';
			template += '<div class="' + this.config.classes.navigate + '">';
			template += '<button onclick="GX.Calendar.before();">▼</button>';
			template += '<span id="' + calendarName + '-viewtype" class="now" onclick="GX.Calendar.changeViewType(false);"></span>';
			template += '<button onclick="GX.Calendar.next();">▲</button>';
			template += '</div>';
			template += '<div id="' + calendarName + '-view" class="' + this.config.classes.viewWrap[this.viewType] + '"></div>';
			template += '<div id="' + calendarName + '-control" style="display:none;">';
			template += '<div class="' + this.config.classes.control + '">';
			template += '<button onclick="GX.Calendar.selectDay(\'' + this.thisDate + '\');">오늘</button>';
			template += '<button onclick="GX.Calendar.directMode();">직접입력</button>';
			template += '<button onclick="GX.Calendar.selectDay(\'\');">삭제</button>';
			template += '</div>';
			//template += '</div>';
			//template += '</div>';
			return template;
		},
		set: function (year, month) {
			// 지난 달의 마지막날 날짜와 요일 구하기
			this.endDateOfMonth.last = this.getDateOfMonth(year, month - 1);
			
			// 이번 달의 마지막날 날짜와 요일 구하기
			this.endDateOfMonth.this = this.getDateOfMonth(year, month);
			
			let now = this.parseNowDate();
			this.yearRange.begin = Number(now.y - 100);
			this.yearRange.end = Number(now.y + 100);
			
			document.getElementById(this.calendarObj.id + '-control').style.display = 'none';
			
			let viewTypeValue = '';
			if (this.viewType == 'd') {
				viewTypeValue = String(year) + '년 &nbsp;' + GX.zeroFill(month, 1) + '월';
				this.openDaySelect();
				//this.calendarObj.style.height = '430px';
				document.getElementById(this.calendarObj.id + '-control').style.display = 'block';
			}
			else if (this.viewType == 'm') {
				viewTypeValue = String(year) + '년';
				this.openMonthSelect();
				//this.calendarObj.style.height = '430px';//'215px';
			}
			else if (this.viewType == 'y') {
				viewTypeValue = String(year - 4) + ' - ' + String(year + 11);
				this.openYearSelect(year);
				//this.calendarObj.style.height = '430px';//'255px';
			}
			
			document.getElementById(this.calendarObj.id + '-viewtype').innerHTML = viewTypeValue;
			
			
		},
		setConfig: function (configures) {
			for (let k in this.config) {
				if (this.config.hasOwnProperty(k) && configures[k] != null) {
					this.config[k] = configures[k];
				}
			}
		},
		datePicker: function (calendarId, configures) {
			if (configures != null) this.setConfig(configures);

			// 현재 날짜
			this.thisDate = GX.formatDate(GX.nowDate().full, 'Y-M-D');
			
			const calendarName = calendarId;
			this.inputLink(calendarName);
			
			this.calendarObj = this.createElement('div', '', { id: calendarName, className: this.config.classes.container });
			//this.calendarObj.className = this.config.classes.container;
			//this.calendarObj.style.width = '96%';
			this.calendarObj.style.height = this.config.height;
			
			this.hide();//this.calendarObj.style.display = 'none';
			
			this.calendarObj.innerHTML = this.box(calendarName);
			this.bind('appendChild', document.body, this.calendarObj);
			//document.querySelectorAll('[' + this.calendarObj.id + ']');
			//let now = this.parseNowDate();
			//this.set(now.y, now.m);
			let vThis = this;
			window.onclick = function () {
				//console.log('this.isInClick', vThis.isInClick, event.target.hasAttribute(calendarId))
				let temp;
				if (this.objOpenInRow && this.objOpenInRow.useYN)
				temp = document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx];
				else
				temp = document.querySelector('[name="' + this.openerName + '"]');
				const openerObj = temp;
				if (!event.target.hasAttribute(calendarId) && !vThis.isInClick && event.target != temp && event.target.closest('#' + calendarName) == null) {
					vThis.hide();
				}
				vThis.isInClick = false;
			};
			
			return this;
		},
		getLoadYearMonth: function () {
			let temp;
			if (this.objOpenInRow && this.objOpenInRow.useYN)
				temp = document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx];
			else
				temp = document.querySelector('[name="' + this.openerName + '"]');
			
			const openerObj = temp;
			const inputDate = (openerObj != null) ? openerObj.value : '';
			const matches = inputDate.match(/^(\d{4,})[^\d]*(\d{2,2})[^\d]*(\d{2,2})[^\d]*$/);
			let result = {};
			if (matches != null) {
				result.y = Number(matches[1]);
				result.m = Number(matches[2]);
				
			}
			else if (this.endDateOfMonth.this != null) {
				result.y = this.endDateOfMonth.this.year;
				result.m = this.endDateOfMonth.this.month;
			}
			else {
				// console.log(this.endDateOfMonth.this)
				let now = this.parseNowDate();
				result.y = now.y;
				result.m = now.m;
			}
			
			return result;
		},
		changeViewType: function (isInit) {
			if (this.viewType != 'y') {
				let y = 0;
				let m = 1;
				let matches = null;
				if (isInit) {
					this.viewType = 'd';
					let loadYearMonth = this.getLoadYearMonth();
					y = loadYearMonth.y;
					m = loadYearMonth.m;
				}
				else if (this.viewType != 'y') {
					const viewTypeValue = document.getElementById(this.calendarObj.id + '-viewtype').innerHTML;
					if (this.viewType == 'd') {
						this.viewType = 'm';
						matches = viewTypeValue.match(/^(\d{4,})[^\d]*(\d{2,2})[^\d]*$/);
						y = Number(matches[1]);
						m = Number(matches[2]);
					}
					else if (this.viewType == 'm') {
						this.viewType = 'y';
						matches = viewTypeValue.match(/^(\d{4,})[^\d]*$/);
						y = Number(matches[1]);
					}
					
				}
				
				if (y > 0) {
					GX.Calendar.set(y, m);
					this.offset();
				}
			}
		},
		offset: function () {
			if (parseFloat(document.body.offsetWidth) > 420) {
				if (this.objOpenInRow && this.objOpenInRow.useYN) {
					const openerObj = document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx];
					let temp = openerObj.getBoundingClientRect()
					this.calendarObj.style.top = String(temp.top + temp.height) + 'px';
					this.calendarObj.style.left = String(temp.left) + 'px';
				} else {
					const openerObj = document.querySelector('[name="' + this.openerName + '"]');
					let openerTop = parseFloat(openerObj.offsetTop);
					let openerLeft = parseFloat(openerObj.offsetLeft);
					let openerHeight = parseFloat(openerObj.offsetHeight);
					let calendarShadowWidth = 6.0;
					let calendarHeight = parseFloat((this.calendarObj.offsetHeight == 0) ? this.config.height : this.calendarObj.offsetHeight);
					let calendarWidth = parseFloat((this.calendarObj.offsetWidth == 0) ? this.config.width : this.calendarObj.offsetWidth) + calendarShadowWidth;
					let bodyHeight = parseFloat(document.body.offsetHeight);
					let bodyWidth = parseFloat(document.body.offsetWidth);
					
					let top = 0;

					if (openerTop - calendarHeight >= 0) top = openerTop - calendarHeight;
					else if ((openerTop + openerHeight) + calendarHeight >= bodyHeight) top = (openerTop + openerHeight);
					
					if (calendarHeight == 0) calendarHeight = parseFloat(this.config.height);
					
					let y = bodyHeight - calendarHeight;
					if (y > (openerTop + openerHeight)) y = (openerTop + openerHeight);
					else if ((openerTop - calendarHeight) >= 0) y = (openerTop - calendarHeight);
					this.calendarObj.style.top = String(y) + 'px';
					
					let x = bodyWidth - calendarWidth;
					if (x > openerLeft) x = openerLeft;
					
					this.calendarObj.style.left = String(x) + 'px';
				}
			}
		},
		
		setMode: function (mode) {
			if (this.objOpenInRow && this.objOpenInRow.useYN) {
				if (this.openerName != null && this.openerName.length > 0)
				document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx].setAttribute('inputmode', mode); // 스캐너 입력박스 - 포커스 인 일때 모바일 가상 키보드 막기 기본 설정
			} else {
				if (this.openerName != null && this.openerName.length > 0)
				document.querySelector('[name="' + this.openerName + '"]').setAttribute('inputmode', mode); // 스캐너 입력박스 - 포커스 인 일때 모바일 가상 키보드 막기 기본 설정
			}
		},
		selectMode: function () {
			this.setMode('none'); // 스캐너 입력박스 - 포커스 인 일때 모바일 가상 키보드 막기 기본 설정
		},
		directMode: function () {
			this.setMode(''); // 스캐너 입력박스 - 포커스 인 일때 모바일 가상 키보드 막기 기본 설정
			this.close();
			let temp;
			if (this.objOpenInRow && this.objOpenInRow.useYN)
			temp = document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx];
			else
				temp = document.querySelector('[name="' + this.openerName + '"]');
				const openerObj = temp;
				openerObj.focus();
			},
			open: function (name) {
				if (this.openerName != name || !this.isVisible()) {
					this.objOpenInRow = { useYN: false, idx: 0 };
					this.viewType = 'd';
					
					this.openerName = name;
					this.selectMode();
					
					let loadYearMonth = this.getLoadYearMonth();
					this.set(loadYearMonth.y, loadYearMonth.m);
					this.offset();
					this.show();
					document.querySelector('[name="' + this.openerName + '"]').blur();// 모바일 문제로 커서가 달력을 가리는 문제로 추가
				}
				else if (this.openerName == name) this.close();
		},
		openInRow: function (name, attrOpenInRow) {
			if (this.openerName != name || !this.isVisible()) {
				this.viewType = 'd';
				
				this.openerName = name;
				this.objOpenInRow = attrOpenInRow;
				this.selectMode();
				
				let loadYearMonth = this.getLoadYearMonth();
				this.set(loadYearMonth.y, loadYearMonth.m);
				this.offset();
				this.show();
				document.querySelectorAll('[name="' + this.openerName + '"]')[this.objOpenInRow.idx].blur();// 모바일 문제로 커서가 달력을 가리는 문제로 추가
			}
			else if (this.openerName == name) this.close();
		},
		close: function () {
			this.hide();
			this.viewType = 'd';
			this.changeViewType(true);
		},
		isVisible: function () {
			return GX.isShowElement(this.calendarObj);
		},
		display: function (value) {
			this.calendarObj.style.display = value;
		},
		show: function () {
			if (!this.isVisible()) {
				document.body.style.overflow = 'hidden';
				this.display('block');
				
				if (parseFloat(document.body.offsetWidth) > 420) {
					// 날짜 입력 창이 화면 밖으로 벗어날 경우 위치 조정
					if(window.outerHeight - window.pageYOffset < this.calendarObj.clientHeight + this.calendarObj.getBoundingClientRect().y){
						this.calendarObj.style.top = (this.calendarObj.getBoundingClientRect().y - (this.calendarObj.clientHeight + 36)) + 'px';
					} else{
						this.calendarObj.style.top = (this.calendarObj.getBoundingClientRect().y) + 'px';
					}
					
					if(window.outerWidth + window.pageXOffset < this.calendarObj.clientWidth + this.calendarObj.getBoundingClientRect().x){
						this.calendarObj.style.left = (this.calendarObj.getBoundingClientRect().x + window.pageXOffset - (this.calendarObj.clientWidth)) + 'px';
					} else{
						this.calendarObj.style.left = (this.calendarObj.getBoundingClientRect().x + window.pageXOffset) + 'px';
					}
				}
			}
		},
		hide: function () {
			if (this.isVisible()) {
				document.body.style.overflow = 'unset';
				this.display('none');
			}
		}
	},
	Base62: {
		charset: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
		encode: function (n) {
			if (n === 0) return '0';
			var s = '';
			while (n > 0) {
				s = this.charset[n % 62] + s;
				n = Math.floor(n / 62);
			}
			return s;
		},
		decode: function (s) {
			var n = 0;
			for (var i = 0; i < s.length; i++) {
				var p = this.charset.indexOf(s[i]);
				if (p < 0) return NaN;
				n += p * Math.pow(this.charset.length, s.length - i - 1);
			}
			return n;
		},
	},
	Pagination: function (page, perPage, totalCount, limit) {
		var result = {};
		var pageOffset = Math.ceil(page / perPage);
		result.pageEnd = pageOffset * perPage;
		result.pageTotal = Math.ceil(totalCount / limit);
		result.pageBegin = result.pageEnd - perPage + 1;
		
		if (result.pageEnd > result.pageTotal) result.pageEnd = result.pageTotal;
		
		result.pages = [];
		for (var i = result.pageBegin; i <= result.pageEnd; i++) {
			result.pages.push(i);
		}
		
		result.page = page;
		result.perPage = perPage;
		result.totalCount = totalCount;
		//console.log(result, totalCount, limit);
		return result;
	},
	Validation: {
		with: {},
		validateRequired: function (obj) {
			return (obj.value != null && obj.value.trim().length > 0) ? '' : '필수 입력입니다';
		},
		validateEmail: function (obj) {
			var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return (obj.value != null && re.test(obj.value)) ? '' : '이메일 주소를 바르게 입력하십시오';
		},
		validateNumber: function (obj) {
			var re = /^\d+$/;
			return (obj.value != null && re.test(obj.value)) ? '' : '숫자를 바르게 입력하십시오';
		},
		validatePhoneNumber: function (obj) {
			var re = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
			return (obj.value != null && re.test(obj.value)) ? '' : '휴대폰 번호를 바르게 입력하십시오(예시:000-0000-0000)';
		},
		validateDate: function (obj) {
			var re = /^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
			return (obj.value != null && re.test(obj.value)) ? '' : '날짜를 바르게 입력하십시오(예시:0000-00-00)';
		},
		validateNoneZero: function (obj) {
			var re = /^\d+$/;
			return (obj.value != null && re.test(obj.value) && Number(obj.value) > 0) ? '' : '숫자를 바르게 입력하십시오';
		},
		validateChecked: function (obj) {
			return obj.checked ? '' : '필수 체크 항목입니다';
		},
		capitalizeFirstLetter: function (string) {
			return string.charAt(0).toUpperCase() + string.slice(1);
		},
		run: function (formName, attrName) {
			if (formName != null && attrName != null && attrName.trim().length > 0) {
				var re = null;
				var matches = null;
				var validations = {};
				var methods = Object.keys(this);
				
				for (var i in methods) {
					if (methods.hasOwnProperty(i)) {
						re = new RegExp('^' + attrName + '(.+)$', 'i');
						matches = methods[i].match(re);
						if (matches != null) validations[matches[0]] = matches[1].toLowerCase();
						//console.log(attrName, methods[i],  matches)
					}
				}
				//console.log(validations)
				
				var objs = document.querySelectorAll(formName + ' [' + attrName + ']');
				for (var idx in objs) {
					if (objs.hasOwnProperty(idx)) {
						for (var i in validations) {
							if (validations.hasOwnProperty(i)) {
								re = new RegExp('\\b' + validations[i] + '\\b', 'i');
								//if(objs[idx].getAttribute(attrName).indexOf(validations[i]) == 0){
									if (re.test(objs[idx].getAttribute(attrName))) {
										re = new RegExp(',?' + validations[i] + '\@([^\:,]+)', 'i');
									matches = objs[idx].getAttribute(attrName).match(re);
									//if(matches != null && matches.length == 2) console.log(matches, this.with, GX.Validation.with);

									var isWith = (matches != null && matches.length == 2) ? this.with[matches[1]] : true;
									//console.log(i, objs[idx], this[i](objs[idx]), objs[idx].value);
									var msg = this[i](objs[idx]);// validation method 실행 결과
									
									if (msg.trim().length > 0 && isWith) {
										re = new RegExp(',?' + validations[i] + '\:([^,]+)', 'i');
										matches = objs[idx].getAttribute(attrName).match(re);
										if (matches != null && matches.length == 2) msg = matches[1];
										if (objs[idx].nextElementSibling != null && objs[idx].nextElementSibling.className == 'dp-none') {
											objs[idx].nextElementSibling.innerHTML = msg;
											objs[idx].nextElementSibling.style.display = 'block';
										}
										else alert(msg);
										objs[idx].focus();
										return false;
									}
									else if (objs[idx].nextElementSibling != null && objs[idx].nextElementSibling.className == 'dp-none') {
										objs[idx].nextElementSibling.style.display = 'none';
									}
								}
								else {
									if (objs[idx].nextElementSibling != null && objs[idx].nextElementSibling.className == 'dp-none') {
										objs[idx].nextElementSibling.style.display = 'none';
									}
								}
							}
						}
					}
				}
				
				return true;
			}
			else {
				alert('input parameter validation name!');
				return false;
			}
		}
	},
	Code: {
		getSelectList: function (obj, parentCode, isEmpt, setVal) {
			
		}
	},
};

function uuidv4() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function logoutFnc() {
	if (GAON.AppBridge.getAppInfo().GaonOS == "android" || GAON.AppBridge.getAppInfo().GaonOS == "ios") {
		location.href = '/logout/proc?mo=Y';
	} else {
		location.href = '/logout/proc';
	}
}
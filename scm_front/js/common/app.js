(function (u, p, l, m, v, n, b, o, c) {l = function (i) { return i.length }, location.pathname.indexOf('html') > -1 ? m = location.pathname.match(/\/([^\/\.]+\.)html$/i) : m = [location.pathname.concat('.html'), location.pathname.concat('.')]; if (m != null && m.length == 2) u.push(p + m[1] + 'js'); v = '?v=' + Date.now(), n = 'script', d = document, b = d.getElementsByTagName(n), o = b[l(b) - 1], c = function (e, s) { if (l(u) > 0) { s = d.createElement(n), s.src = u[0] + v, s.onload = c, s.defer = true, o.appendChild(s), o.parentNode.insertBefore(s, o) } u.shift() }; c(null)
})([
	'js/lib/vue.js',
	'js/lib/axios.min.js',
	'js/lib/jquery-3.6.0.js',
	'js/lib/chart.min-3.9.1.js',
	'js/common/gx.js',
	'js/common/common.js',
],'js/');
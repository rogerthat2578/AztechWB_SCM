$(function () {
    if (!GX._METHODS_.isLogin()) location.replace('login');
    else {

    }
});

//메뉴
function menu() {
	if(document.getElementsByClassName('left-menu')[0].style.display === 'block') {
		document.getElementsByClassName('left-menu')[0].style.display = 'none';
	} else {
		document.getElementsByClassName('left-menu')[0].style.display = 'block';
	}
}

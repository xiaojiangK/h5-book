const BASEURL = 'https://api.vodeshop.com'
const imgBaseUrl = 'https://image.v1.vodeshop.com/'
var date_end;
var date_start;
var loading_img_url = []
date_start = getNowFormatDate()

window.onload = function() {
	var u = navigator.userAgent;
	if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {} else if (u.indexOf('iPhone') > -1) {
		$(window).on('scroll.elasticity', function(e) {
			e.preventDefault();
		}).on('touchmove.elasticity', function(e) {
			e.preventDefault();
		});
	} else if (u.indexOf('Windows Phone') > -1) {}

	// 获取分类
	$.ajax({
		url: `${BASEURL}/api/v1/ebook-category`,
		dataType: 'json',
		success: function(res){
			let { code, msg, data } = res
			if (code == 0) {
				if (!data || !data.length) {
					$('.shade').hide()
					return
				}
				let category = ''
				for (let i of data) {
					category += `<div class="cu-item" data-id="${i.id}">
						<div class="content">
							<img src="${imgBaseUrl + i.image_url}" class="icon" alt=""/>
							<span class="title">${i.title}</span>
						</div>
						<img src="images/icon-next.png" class="next" alt=""/>
					</div>`
				}
				// 默认获取第一个分类
				getBooks(data[0].id)
				$('.drawer-window .cu-list').html(category)
			} else {
				alert(msg)
			}
		}
	})
	
	// 获取电子书
	function getBooks(ebook_category_id) {
		// Loading
		$('.shade').show()

		$.ajax({
			url: `${BASEURL}/api/v1/ebooks?ebook_category_id=${ebook_category_id}`,
			dataType: 'json',
			success: function(res){
				let { code, msg, data } = res
				if (code == 0) {
					if (!data || !data.length) {
						return
					}
					let loading_cover_url = ''
					for (let i of data) {
						loading_cover_url += '<div class="item"><img src="'+ imgBaseUrl + i.cover +'" /></div>'
					}
					// 渲染产品详情图
					loading_img_url = data[0].detail.map(item => imgBaseUrl + item)
					// 渲染产品封面图
					$('.thumb .container').html(loading_cover_url).find('.item').each(function (index){
						$(this).on('click', function (){
							loading_img_url = data[index].detail.map(item => imgBaseUrl + item)
							// 清空所有页面重新初始化
							$(".flipbook").turn("destroy")
							$('.shade').show()
							loading()
						})
					})
					if ($(".flipbook").turn) {
						// 清空所有页面重新初始化
						$(".flipbook").turn("destroy")
					}
					loading()
				} else {
					alert(msg)
				}
			}
		})
	}

	// 切换抽屉
	function toggleDrawer(open = false) {
		if (open) {
			$('.drawer-page').addClass('show')
			$('.drawer-close').addClass('show')
			$('.drawer-window').addClass('show')
		} else {
			$('.drawer-page').removeClass('show')
			$('.drawer-close').removeClass('show')
			$('.drawer-window').removeClass('show')
		}
	}

	$('.drawer-bar').on('click', function (){
		toggleDrawer(true)
	})

	$('.drawer-close').on('click', function (){
		toggleDrawer()
	})

	// 切换分类
	$('.drawer-window').on('click', '.cu-item', function (e){
		toggleDrawer()
		getBooks($(this).attr('data-id'))
	})

}

function loading() {
	var numbers = 0;
	var length = loading_img_url.length;
	for (var i = 0; i < length; i++) {
		var img = new Image();
		img.src = loading_img_url[i];
		img.onerror = function() {
			numbers += (1 / length) * 100;
		}
		img.onload = function() {
			numbers += (1 / length) * 100;
			$('.number').html(parseInt(numbers) + "%");
			if (Math.round(numbers) == 100) {
				date_end = getNowFormatDate();
				var loading_time = date_end - date_start;
				$(function progressbar() {
					var tagHtml = "";
					for (var i = 0; i < length; i++) {
						if (i == 0) {
							tagHtml += ' <div id="first"> <img src="'+ loading_img_url[i] +'" /> </div>';
						} else if (i == length - 1) {
							tagHtml += ' <div id="end"> <img src="'+ loading_img_url[i] +'" /> </div>';
						} else {
							tagHtml += ' <div> <img src="'+ loading_img_url[i] +'" /> </div>';
						}
					}
					$(".flipbook").html(tagHtml);
					var w = $(".graph").width();
					$(".flipbook-viewport").show();
					setTimeout(() => {
						$('.shade').hide();
					}, 200)
				});

				function loadApp() {
					var w = $(window).width();
					var h = $(window).height() - scale(200);
					$('.flipboox').width(w).height(h);
					$(window).resize(function() {
						w = $(window).width();
						h = $(window).height() - scale(200);
						$('.flipboox').width(w).height(h);
					});
					$('.flipbook').turn({
						width: w,
						height: h,
						elevation: 50,
						display: 'single',
						gradients: true,
						autoCenter: true
					})
				}
				yepnope({
					test: Modernizr.csstransforms,
					yep: [`js/turn.js?timestamp=${Date.now()}`],
					complete: loadApp
				});
			};
		}
	}
}

function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "";
	var seperator2 = "";
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
		"" + date.getHours() + seperator2 + date.getMinutes() +
		seperator2 + date.getSeconds();
	return currentdate;
}

function scale(number) {
	return number / 750 * $(window).width()
}
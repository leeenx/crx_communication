// 定时向 web 页面报时

setInterval(function(){
	typeof(sendPageRequest)=="function"&&sendPageRequest({time: new Date()});
},1000);

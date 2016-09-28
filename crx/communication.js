/*
	@author:leeenx
	@网页与content_scripts的通信
	@sendPageRequest向网页发送的消息，必须是json直接量，而不是能是变量，里面也不能带变量
	@sendPageRequest的使用方法：
	sendPageRequest(
		{name:'lee',sex:'male'},
		function(json){
			//网页返回的响应
		}
	);
	@onPageRequest监听网页发送过来的信息
	onPageRequest=function(json,sendResponse){
		//josn即页面发送过来的消息
		//sendResponse是一个方法，可以用sendResponse({key:value,key:value,....});向页面返回content_scripts的响应
	};

*******************************************************华丽的分割线***************************************************************

	@网页上调用chromeExtension.onRequest=function(json,sendResponse){json为请求数据，sendResponse(_json);向请求页响应结果};来接收contentscript发过来的消息
	@网页上调用chromeExtensiion.sendRequest({key:value,key:value....},function(json){回调处理});来向content_scripts发送信息

*/
var onPageRequest=function(data,sendResponse){
	chrome.extension.sendRequest({msg:data.msg},function(json){
		//不处理了
	});
	sendResponse({ret:0,msg:"onPageRequest"});
};//监听由网页传过来的消息
var sendPageRequest;//向页面发送响应
!function(){
	var json={},_this={};
	var pageReciver=document.createElement('textarea'),content_script_reciever=document.createElement('textarea'),recieveId=document.createElement('input');
	recieveId.style.cssText=content_script_reciever.style.cssText=pageReciver.style.cssText='width:0px; height:0px; overflow:hidden; left:-100%; top:-100%; visibility:hidden; position: absolute;',content_script_reciever.id="content_script_reciever",pageReciver.id="pageReciver",recieveId.id="recieveId";
	//recieveId即回调的ID是一个随机时间值，用于响应回调
	content_script_reciever.addEventListener('click',function(){
		eval('json='+this.value);
		var _recieveId=recieveId.value;
		if(_recieveId&&_this['cb_'+_recieveId]){
			_this['cb_'+_recieveId](json),recieveId.value='',delete _this['cb_'+_recieveId];//如果有recieveId表示是上一次的sendpageRequest的回调，通知回调，并从_this中删除这个项
		}else{//没有recieveId表示是来自普通页面的请求，通知onPageRequest事件
			onPageRequest(json,function(obj){
				//接收到page的请求后向page响应
				recieveId.value=_recieveId;
				sendPageRequest(obj);
			});//回调监听函数
		}
	});
	sendPageRequest=function(arg,cb){
		if(!arg)return ;
		var json=JSON.stringify(arg);//object 转 json 数据
		pageReciver.value=json;
		if(typeof(cb)=='function'){//有响应回调
			var _recieveId=new Date().getTime();
			_this['cb_'+_recieveId]=cb;
			recieveId.value=_recieveId;
		}
		pageReciver.click();//通知页面有新消息
	};
	document.body.appendChild(pageReciver),document.body.appendChild(content_script_reciever),document.body.appendChild(recieveId);
	//向网面注入代码，传其有方法与content_scripts通信
	var define=function(arg){
		if(arg){
			var _arg=arg.toString()+'';
			var script=document.createElement('script');
			script.type="text/javascript";
			script.innerHTML="!"+_arg+'();';
			document.getElementsByTagName('head')[0].appendChild(script);
		}
	};
	define(function(){
		var content_script_reciever=document.getElementById("content_script_reciever"),pageReciver=document.getElementById("pageReciver"),recieveId=document.getElementById("recieveId"),json={},_this={};
		window.chromeExtension={
			sendRequest:function(arg,cb){
				//发送通信
				if(!arg)return ;
				var json=JSON.stringify(arg);//object 转 json 数据
				content_script_reciever.value=json;
				if(typeof(cb)=='function'){//有响应回调
					var _recieveId=new Date().getTime();
					_this['cb_'+_recieveId]=cb;
					recieveId.value=_recieveId;
				}
				content_script_reciever.click();//通知content_scripts有新消息
			},
			onRequest:function(json){
				//接收通信 - 由前台改写
			}
		}
		pageReciver.addEventListener('click',function(){
			eval('json='+this.value);
			var _recieveId=recieveId.value;
			if(_recieveId&&_this['cb_'+_recieveId]){
				//如果有recieveId表示是上一次的sendRequest的回调，通知回调，并从_this中删除这个项
				_this['cb_'+_recieveId](json),recieveId.value='',delete _this['cb_'+_recieveId];
			}else{//如果没有recieveId表示这是来自content_scripts的请求，通知onRequest事件
				window.chromeExtension.onRequest(json,function(fn){
					//接收到content_scripts的请求后向content_scripts响应
					recieveId.value=_recieveId;
					sendRequest(fn);
				});
			}
		});
		// 创建事件 chromeExtensionComplete
		var ev=document.createEvent('MouseEvents');
		ev.initEvent('chromeExtensionComplete',true,true);
		document.dispatchEvent(ev);//触发事件
	});
}();
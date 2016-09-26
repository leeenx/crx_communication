# crx_communication 说明

目录 `crx` 为一个简单的chrome extension。核心文件是 communication.js ，它是一个 content_scripts ，作用是实现 web script 与 chrome extensiton 的直接通信。

页面 `demo.html` 是直接运行在chrome 的普通web 页面。

在chrome中安装本项目的 `crx`，再直接运行 demo 可以看到它的工作原理。

## 用法

在 `content_scripts` 中调用 sendPageRequest 方法可以直接与 web script 通信：

```javascript

setInterval(function(){
	typeof(sendPageRequest)=="function"&&sendPageRequest({time: new Date()});
},1000);

```

在 web scripts 中使用 `chromeExtension.sendRequest` 可以直接与 content_scripts 通信： 

```javascript

var lock=0;
fire.onclick=function(){
	lock=1;
	console.log("fire...");
	chromeExtension.sendRequest(
		{msg: content.value},
		function(json){
			console.log('回调成功');
		}
	);
}

```

在 web scripts 用 ` chromeExtensionComplete ` 事件来监听 chromeExtension 是否载入：

```javascript
//监听 chromeExtension 事件

document.addEventListener("chromeExtensionComplete",function(){
	chromeExtension.onRequest=function(json){
		console.log("来自 content_scripts 的报时：" + json.time);
	}
});
```


function show(msg) {
  var time = /(..)(:..)/.exec(new Date());     // The prettyprinted time.
  var hour = time[1] % 12 || 12;               // The prettyprinted hour.
  var period = time[1] < 12 ? 'a.m.' : 'p.m.'; // The period of the day.
  new Notification(hour + time[2] + ' ' + period, {
    icon: 'icon.png',
    body: msg||'Time to make the toast.'
  });
};

chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	if(request.msg){
		show(request.msg);
		sendResponse({ret: 'ok'});
	}
});


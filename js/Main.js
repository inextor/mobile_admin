var navigation = new Navigation();

Util.addOnLoad(()=>
{
	navigation.loadPages('html/pageMain.html').then(()=>
	{
		navigation.setInitPageId('pageMain');
	});
});

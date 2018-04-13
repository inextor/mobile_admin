
var navigation = new Navigation();

navigation.router.add('pageMain',( regex )=>
{
	console.log( window.location.href );
});

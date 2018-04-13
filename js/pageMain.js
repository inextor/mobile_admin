
navigation.router.add('pageMain',( regex )=>
{
	console.log( window.location.href );
	console.log('Making ajax');
	var currentDate = new Date();

	let daysOfWeek	= [ 'Sun','Mon','Tue','Wed','Thu','Fri','Sat' ];
	let dayValue = daysOfWeek[ currentDate.getDay() ]+' '+currentDate.getDate();
	console.log('Looking for '+dayValue);


	Util.getById('pageMainTodayInfo').innerHTML= currentDate.toString();


	let agentsValues	= {};

	pageMainFindAgentHours( schedule, agentsValues, dayValue );


	let s = '';

	for(let i in agentsValues)
	{
		s += `<div>
				<b>${Util.txt2html( agentsValues[i].name )}</b>
				<span>
					${Util.txt2html( agentsValues[i].ranges[0].start )}
					- ${Util.txt2html( agentsValues[i].ranges[0].end )}
				</span>
			</div>`;
	}

	Util.getById('pageMainAgentsData').innerHTML = s;

	Util.ajax
	({
		url			: config.url_online_agents
		,method		: 'GET'
		,dataType	: 'json'
	})
	.then((response)=>
	{
		if( !response.result )
		{
			Util.alert( response.msg );
			return;
		}

		let online	= response.data.filter( user => user.availability.available  );
		let offline	= response.data.filter( user => !user.availability.available  );

		//let s =

		Util.getById('pageMainOnlineUsers').innerHTML = online.reduce((p,user)=>
		{
			return p+`<a href="#" data-zendesk-user="${user.id}">${Util.txt2html(user.name)}</a>`;
		},'');

		Util.getById('pageMainOfflineUsers').innerHTML = offline.reduce((p,user)=>
		{
			return p+`<div>${Util.txt2html(user.name)}</div>`;
		},'');
	}).
	catch((e)=>
	{
		console.error( e );
	});
});

function pageMainFindAgentHours( schedule, agentsValues, dayValue )
{
	let rowIndex	= -1;
	let colIndex	= -1;

	for(let row=0;row<schedule.length;row++)
	{
		console.log(row+' Has '+schedule[row].length );

		if( colIndex !== -1 )
		{
			if( schedule[ row ][ 0 ].trim() === '' )
			{
				console.log('Breaking FUUUUUUU');
				break;
			}

			if( typeof agentsValues[ schedule[0] ]  === "undefined" )
			{
				agentsValues[schedule[row][0] ] = { name: schedule[row][ 0 ], ranges: [] };
			}

			agentsValues[ schedule[row][0] ].ranges.push({start: schedule[row][ colIndex ], end:schedule[row][ colIndex+1 ] });
		}


		for(let col=0;col<schedule[row].length;col++)
		{
			if( schedule[ row ][ col ] === dayValue )
			{
				colIndex	= col;
				console.log('Column foud '+col+' At row '+row );
			}
		}
	}
}

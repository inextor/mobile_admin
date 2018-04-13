
class Navigation
{
	constructor()
	{
		this.history					= [];
		this.history_begins_index		= window.history.length;
		this.handle_url_parameters		= true;
		this.router						= new Router();
	}

	setInitPageId( pageInitId )
	{
		console.log('PageInitId '+pageInitId);

		Util.delegateEvent('click',document.body,'a',(evt)=>
		{
			evt.preventDefault();
			evt.stopImmediatePropagation();
			
			console.log('HEEEl half Yeah!');
			var href = evt.target.getAttribute('href');

			if( ! href || href === '#') return;

			var hash = href.substring( href.indexOf('#')+1 );
			var obj	= Util.getById( hash );

			if( ! obj )
				return;

			if( obj.classList.contains('page') || obj.classList.contains('panel') )
			{
				this.click_anchorHash( href );
				Util.stopEvent( evt );
				return;
			}
		});

		window.addEventListener( 'popstate' , this.evt_popstate );

		var x		= Util.getAll('div.page');
		var last	= Util.getById( pageInitId );
		last.classList.add('start');
		this.click_anchorHash('#'+pageInitId);
		//last.classList.add('start','active');

		for(let i=0;i<x.length;i++)
		{
			let z = x[i];
			z.addEventListener('transitionend',(evt)=>
			{
				if( z.classList.contains('active') )
				{
					if( z != last )
					{
					 	this.router.run( window.location.href );
						last = z;
						this.log('PAGE_CALLED', z.getAttribute('id'), 'GREEN' );
					}
					this.removeNotPrevious();
				}
			});
		}
	}

	log()
	{
		console.log.call(console,arguments);
	}

	click_anchorHash( h, replace )
	{
		var clickedHashId	= h.substring( h.indexOf('#')+1 );
		var current			= Util.getFirst('.panel.open') || Util.getFirst('.page.active');

		if( current === null || ( current.getAttribute( 'id' ) == clickedHashId && !current.classList.contains('panel') ) )
		{
			if( this.handle_url_parameters )
			{
				history.pushState({},'','#'+clickedHashId );
				this.router.run( window.location.href );
			}
			return;
		}

		var target	= Util.getById( clickedHashId );

		if( !target )
		{
			this.log('No found id:'+clickedHashId );
			return;
		}

		// target is a panel
		if( target.classList.contains('panel') )
		{
			//if targe is a panel and is open just close it
			if( target.classList.contains('open') )
			{
				target.classList.remove('open');
				document.body.classList.remove('panel-open');
				history.replaceState( {},'', this.history.pop() );
				return;
			}

			if( current && current.classList.contains('panel') )
			{
				this.openPanelFromPanel( target, current);
				history.replaceState({},'',h );
				return;
			}
			//Target is a panel and there are not panels open
			target.classList.add('open');
			document.body.classList.add('panel-open');
			var page = Util.getFirst('.page.active');
			this.openPanelFromPage( target, page );
			this.history.push( window.location.href );
			history.pushState( {},'', h );
			return;
		}

		//Target is not a panel
		var isFromPanel = false;

		//If there is a panel open just close it and continue
		if( current && current.classList.contains( 'panel' ) )
		{
			isFromPanel	= current.getAttribute('id');
		}


		var prev		= false;
		var toRemove	= [];
		for( var i=this.history.length-1; i>=0; i-- )
		{
			toRemove.push( this.history[ i ] );

			//TODO BUG problems with diff hash with similar endings
			//are detected as equals example #pageRide and #pageRides
			var index	= this.history[ i ].indexOf( '#'+clickedHashId );
			var diff	= this.history[i].length-(clickedHashId.length+1);
			if( index !== -1	&& diff === index )
			{
				prev = i;
				break;
			}
		}

		if( prev === false )
		{
			//nuevo push
			if( isFromPanel )
			{
				history.replaceState({},'',h );
				prev	= this.history[ this.history.length -1 ];
				pushPageFromPanel( target, current );
				return;
			}

			if( replace )
			{
				history.replaceState({},'',h );
				this.makeTransitionPush( current, target );
				return;
			}

			this.history.push( location.href );
			history.pushState({},'',h );
			this.makeTransitionPush( current, target);
			return;
		}

		//Pop Events
		history.replaceState({},'', h );

		if( isFromPanel )
			this.popPageFromPanel( target, current);
		else
			this.popPageFromPage( current, target );

		//Removing the previous
		while( toRemove.length )
		{
			var url = toRemove.shift();
			let zz	= this.history.indexOf( id );
			this.history.splice( zz ,1 );
			var id = url.substring( url.indexOf('#')+1 );
			Util.getById( id ).classList.remove('previous');
		}
	}

	replace_root( h )
	{
		var toReplace	= Util.getFirst('.page.active');
		var replacement	= Util.getById( h.substring( h.indexOf('#')+1 ) );

		replacement.classList.add('noanimation');
		replacement.classList.remove('previous');
		replacement.classList.remove('noanimation');
		replacement.classList.add('active');
		toReplace.classList.remove('active');

		history.replaceState({},'',h);

		var x = Util.getAll('.page.previous');

		for(var i=0;i<x.length;i++)
		{
			x[ i ].classList.add('noanimation');
			x[ i ].classList.remove('previous');
			x[ i ].classList.remove('noanimation');
		}
	}

	push_state( state,title, h )
	{
		this.click_anchorHash( h, false );
	}

	replace_state( state,title, h )
	{
		this.click_anchorHash( h, true );
	}

	/*
	 	this is only for just for pop
	*/

	evt_popstate( evt )
	{
		if( !this.history.length )
		{
			if( navigator.app && navigator.app.exitApp )
			{
				navigator.app.exitApp();
				return;
			}

			history.go( -(history.length-1) );
			return;
		}

		var prevUrl		= this.history[ this.history.length-1 ];
		this.click_anchorHash( prevUrl, true );
	}

	/*

	* target is in History
		* Target is page
			* current is panel
			* current is page

	* target is not in History
		* Target is panel
			* Current is page
			* current is panel

		* Target is page
			* current is panel
			* current is page
	*/

	//Target is not in History
	openPanelFromPage( panel, page )
	{
		panel.classList.add('open');
		document.body.classList.add('panel_open');
	}

	openPanelFromPanel( nextPanel, currentPanel )
	{
		currentPanel.classList.remove('open');
		nextPanel.classList.add('open');
	}

	pushPageFromPanel( page, panel )
	{
		panel.classList.remove('open');
		document.body.classList.remove('panel_open');

		var currentPage = Util.getFirst('.page.active');

		if( currentPage !== page )
			this.makeTransitionPush( currentPage, page );
		else
			this.router.run( window.location.href );
	}

	pushPageFromPage( nextPage, currentPage )
	{
		this.makeTransitionPush( currentPage, nextPage );
	}

	// Target is in History
	popPageFromPanel( page, panel )
	{
		panel.classList.remove('open');
		document.body.classList.remove('panel_open');
		var currentPage = Util.getFirst('.page.active');
		if( currentPage === page )
			return;

		this.makeTransitionPop( page ,currentPage );
	}

	popPageFromPage( pageToPop, prevPage )
	{
		var pageToPopId = pageToPop.getAttribute('id');
		var ids			= {};

		this.makeTransitionPop( prevPage ,pageToPop );
	}

	makeTransitionPush( current ,next )
	{
		next.classList.add('noanimation');
		setTimeout(function()
							 {
			next.classList.remove('previous');
			next.classList.remove('noanimation');
			next.classList.add('active');

			current.classList.add('previous');
			current.classList.remove('active');
		},10 );
	}

	makeTransitionPop( previous ,current)
	{
		previous.classList.add('active');
		previous.classList.remove('previous');
		current.classList.remove('active');
		current.classList.remove('previous');
	}

	removeNotPrevious()
	{
		var z = Util.getAll('.page.previous');

		for(var i=0;i<z.length;i++)
		{
			var found	= false;

			for(var j=0;j<this.history.length;j++)
			{
				if( this.history[ j ].indexOf( z[i].getAttribute('id') ) !== -1 )
				{
					found = true;
					break;
				}
			}

			if( !found )
			{
				z[i].classList.add('noanimation');
				z[i].classList.remove('previous');

				var x = 0+i;

				setTimeout(()=> //jshint: ignore line
				{
					z[x].classList.remove('noanimation');
				},100);
			}
		}
	}
	
	loadPages()
	{
		let pages		 = Array.from(arguments);
		console.log( pages );

		let promises	= pages.map((i)=> Util.ajax({ url : i ,dataType : 'text',overrideMimeType: 'text/plain'}));
	
		return Promise.all( promises )
		.then((responses)=>
		{
			let d 			= document.createElement('div');
			d.innerHTML		= responses.reduce( (p,c)=> p+c, '' );
			let allChilds	= Array.from( d.children );

			allChilds.forEach( ac=>document.body.appendChild( ac ));

			console.log('It finish Load',responses.length, responses );

			return Promise.resolve( pages );
		});
	}
}

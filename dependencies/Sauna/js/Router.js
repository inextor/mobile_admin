class Router
{
	constructor()
	{
		this.funList	= {};
	}

	add( regex, func )
	{
		if( typeof name == 'function')
		{
			this.funList.ALL.push( name );
			return;
		}

		if( typeof name === 'string' && typeof func === 'function' )
		{
			if( typeof this.funList[ name ] === 'undefined' )
			{
				this.funList[ name ] = [];
			}

			this.funList[ name ].push( func );
		}
	}

	run( name )
	{
		var to_run  = this.funList.ALL;

		for (let i in this.funList)
		{
			let regParts = i.match(/^\/(.*?)\/([gim]*)$/);

			let regexp	= regParts ? new RegExp(regParts[1], regParts[2]) : new RegExp( i );

			if( regexp.test( name ) )
			{
				to_run = this.funList[ i ];

				for (var j=0; j< to_run.length; j++)
					to_run[ j ].call(this, name );	// you can pass in a "this" parameter here.
			}
		}
	}
}

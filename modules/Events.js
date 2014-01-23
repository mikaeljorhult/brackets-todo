define( function() {
	'use strict';

	return {
		cache: {},
		
		/**
		 * Publish a event.
		 */
		publish: function( topic, args, scope ) {
			if ( this.cache[ topic ] ) {
				var thisTopic = this.cache[ topic ],
					i = thisTopic.length - 1;
				
				for ( i; i >= 0 ; i -= 1 ) {
					thisTopic[ i ].apply( scope || this, args || [] );
				}
			}
		},
		
		/**
		 * Subscribe to a event.
		 */
		subscribe: function( topic, callback ) {
			if ( !this.cache[ topic ] ) {
				this.cache[ topic ] = [];
			}
			
			this.cache[ topic ].push( callback );
			
			return [ topic, callback ];
		},
		
		/**
		 * Unsubscribe from event.
		 */
		unsubscribe: function( handle, completly ) {
			var t = handle[ 0 ],
				i = this.cache[ t ].length - 1;

			if ( this.cache[ t ] ) {
				for ( i ; i >= 0 ; i -= 1 ) {
					if ( this.cache[ t ][ i ] === handle[ 1 ] ) {
						this.cache[ t ].splice( this.cache[ t ][ i ], 1 );
						
						if ( completly ) {
							delete this.cache[ t ];
						}
					}
				}
			}
		}
	};
} );
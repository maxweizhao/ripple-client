
// handle updates from the server

var server={};
server.socket=null;

// escape a string from the server so it is safe to stick in jquery's .html()
server.escape=function(str)
{
	if(str.replace)
		return(str.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;'));
	return(str);
}


server.handleMsg=function(msg)
{
	console.log(msg.data);  
	
	var str='';
	var obj=jQuery.parseJSON( msg.data );
	if(obj)
	{
		if(obj.type=="account")
		{
			history.addTransaction(obj.transaction,true);
		}else if(obj.type=="transaction")
		{
			var amount=ncc.displayAmount(server.escape(obj.transaction.inner.Amount));
			str='<div class="transFeedMsg">'+server.escape(obj.transaction.middle.SourceAccount)+' sent '+amount+'NC to '+server.escape(obj.transaction.inner.Destination)+'</div>';
		}else if(obj.type=="ledgerAccepted")
		{
			str='<div class="ledgerFeedMsg">Accepted Ledger <strong>'+server.escape(obj.seq)+'</strong> hash:'+server.escape(obj.hash)+'</div>';
		}else if(obj.type=="response")
		{
			if(obj.result=="error")
			{
				str='<div class="errorFeedMsg">Error Listening '+server.escape(obj.error)+'</div>';
			}else 
			{
				if(obj.id==1) str='<div class="stopFeedMsg">Stop Listening</div>';
				else str='<div class="startFeedMsg">Start Listening</div>';
			}
		}else
		{
			str='<div class="unknownFeedMsg">Unknown Msg: '+server.escape(msg.data)+'</div>';
		}
	}else 
	{
		str='<div class="errorFeedMsg">Error: '+server.escape(msg.data)+'</div>';
	}
	$('#FeedArea').prepend(str);
}


server.connect=function()
{
	if(!WS_SERVER) return;
	
	try{
		server.socket = new WebSocket("ws://"+WS_SERVER+"/");
		server.socket.onopen = function(){ ncc.status("Connected to websocket");  }  
	  
	    server.socket.onmessage = server.handleMsg;
	  
	    server.socket.onclose = function(){ ncc.error("Disconnected from websocket");  }
    } catch(exception){  
             ncc.error('Error: '+exception);  
    }      	
}

server.subscribe=function(streamName)
{
	
	server.socket.send('{ "command" : "'+streamName+'_subscribe" }');
}

server.unsubscribe=function(streamName)
{
	server.socket.send('{ "command" : "'+streamName+'_unsubscribe", "id" : 1 }');
}

server.accountSubscribe=function(accountID)
{
	if(accountID)
		server.socket.send('{ "command" :  "account_transaction_subscribe", "accounts" : ["'+accountID+'"] }');
}




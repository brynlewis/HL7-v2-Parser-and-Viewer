var hl7version='2.4';
var sD1;
var sD2;
var sD3;
var sD4;
var sD5;

function viewmsg(){
	var xfields;
	var xdt;
	m=$('#hl7msg').val()

	r=$('#result')
	var res=''
	var segments=m.split('\n')
	var msh=''
	msh=segments[0]
	sD1=msh.charAt(3)
	sD2=msh.charAt(4)
	sD3=msh.charAt(5)
	sD4=msh.charAt(6)
	sD5=msh.charAt(7)
	var mshar=msh.split(sD1)
	hl7version=mshar[11]
	$.each(segments, function(s){
		res=res+viewsegment(segments[s],s)
	});
	res='<p>HL7 Version: '+hl7version+' Segments: '+segments.length+'</p><p><span id="loading1">Loading</span> <span id="loading2">...</span>.</p> <p style="background-color:#ccc" id="currchunk">. </p>'+res
	r.html(res)
	$('div.segment div.field:first-child').css({'font-weight':'bold'})

	$('div.segment, div.chunk, div.field').click(function(event){
		$('#currchunk').text('Loading names ...')
		$(this).children('div.in').slideToggle(400,function(){
			if($(this).is(':hidden'))
				$(this).parent().children('p').css({'box-shadow':'none','background-image': 'url(Viewer/img/expand.png)'})
			else{
				$(this).parent().children('p').css({'box-shadow':'0px 0px 2px 2px #C5D6FA','background-image': 'url(Viewer/img/collapse.png)'})
				$(this).children('div.field').children('p.field').each(
					function () {				
						if($(this).attr('title')==undefined){
							//scode=$(this).parent().parent().parent().attr('data-segment')
							scode=$(this).closest('[data-segment]').attr('data-segment')
							n=$(this).find('span[class="l"]').text()
							fld=xfields.find( 'xsd\\:attributeGroup[name="'+scode+'.'+n+'.ATTRIBUTES"]')
							type=$(fld).find('xsd\\:attribute[name="Type"]').attr('fixed')
							fn=$(fld).find('xsd\\:attribute[name="LongName"]').attr('fixed')
							if(fn!=undefined){
								$(this).attr('title',fn)				
								$(this).parent().attr('data-type',type).find('div[class="msg"]').first().text(fn+ ' - '+type)
								//$(this).parent().attr('data-type',type)							
							}
							else
								$(this).find('span[class="msg"]').text('?')
						}
					}
				)
				//$('#currchunk').text('Loading names ...')
				$(this).children('div.chunk').children('p.chunk').each(
					function (idx) {				
						//type=$(this).parent().parent().parent().attr('data-type')
						type=$(this).parents('[data-type]').last().attr('data-type')
						if(type!=''){
							n=$(this).find('span[class="l"]').text()
							tn=xdt.find( 'xsd\\:complexType[name="'+type+'.'+n+'.CONTENT"] xsd\\:annotation xsd\\:documentation').text()
							if(tn!=undefined){
								$(this).attr('title',tn)
								$(this).parent().find('div[class="msg"]').text(tn)
								//$('#currchunk').text('Loading names ...'+idx)
								//alert(idx)
							}
						}
					}
				)
				$('#currchunk').text('.')

			}
			$('#title').masonry();
		})
		event.stopPropagation();
	})

	$('div:not(:has(>div))').css({'color':'#484848','cursor':'default'})

	datamsg=encodeURIComponent($('#hl7msg').val().substring(0,10000))
	
	$.ajax({
		type: 'GET',
		url: "Viewer/hl7/hl7v2xsd/"+hl7version+"/fields.xsd",
		dataType: "xml"		 
		}).done(function(data,d2,xmlfields){
			xfields=$(xmlfields.responseXML)
			sl=xfields.find( 'xsd\\:complexType[name="PID.15.CONTENT"] xsd\\:annotation xsd\\:documentation').text()
			$('#loading2').text('Loaded fields.')

		}).fail(function(jqXHR, status, errorThrown){
			alert('Sorry, an error was encountered (1): '+status)
		})	
	$('p.field').hover(
		function () {				
			if($(this).attr('title')==undefined){
				scode=$(this).parent().parent().parent().attr('data-segment')
				n=$(this).find('span[class="l"]').text()
				fld=xfields.find( 'xsd\\:attributeGroup[name="'+scode+'.'+n+'.ATTRIBUTES"]')
				type=$(fld).find('xsd\\:attribute[name="Type"]').attr('fixed')
				fn=$(fld).find('xsd\\:attribute[name="LongName"]').attr('fixed')
				if(fn!=undefined){
					$(this).parent().find('div[class="msg"]').first().text(fn+ ' - '+type)
					$('#currchunk').text(fn+ ' - '+type)
					$(this).parent().attr('data-type',type)
					$(this).attr('title',fn)				
				}
				else
					$(this).find('span[class="msg"]').text('?')
			}
		},
		function () {
		}
	)
	$('p.chunk').click(function(){
		if($(this).find('span.content').hasClass('highlight')){
			$('.highlight').removeClass('highlight')
		}
		else{
			$(this).parent().parent().prev().highlight($(this).find('span.content').text(),'highlight');
			$(this).find('span.content').addClass('highlight')
		}
	}).hover(
		function () {				
			type=$(this).parents('[data-type]').last().attr('data-type')
			if(type!=''){
				n=$(this).find('span[class="l"]').text()
				tn=xdt.find( 'xsd\\:complexType[name="'+type+'.'+n+'.CONTENT"] xsd\\:annotation xsd\\:documentation').text()
				if(tn!=undefined){
					$(this).attr('title',tn)
					$('#currchunk').text(tn+ ' - '+type)
					$(this).parent().find('div[class="msg"]').text(tn)
				}
			}			
		  },
		function () {
		  }
	)
			
	$.ajax({
		type: 'GET',
		url: "Viewer/hl7/hl7v2xsd/"+hl7version+"/datatypes.xsd",
		dataType: "xml"		 
		}).done(function(data,d2,xmldt){
			xdt=$(xmldt.responseXML)
			$('#loading1').text('Loaded datatypes.')
		}).fail(function(jqXHR, status, errorThrown){
			alert('Sorry, an error was encountered (2): '+status)
		})
}
function viewsegment(segment,i){
	var res1=''
	var c=''
	/*
	var flds=segment.split(sD1)
	if(flds.length>1){
		$.each(flds, function(f){
			res1=res1+viewrepeatfield(flds[f],f)
		});
		c='hover'
		res1='<div class="in">'+res1+'</div>'
	}
	*/
	var flds=segment.split(sD1)
	if(flds.length>1){
		$.each(flds, function(f){
			if(flds[f].indexOf('~')==-1)
				res1=res1+viewfield(flds[f],f)
			else
				res1=res1+viewrepeatfield(flds[f],f)
		});
		c='hover'
		res1='<div class="in">'+res1+'</div>'
	}
	segmentcode=flds[0]
	
	res1='<div class="segment" data-segment="'+segmentcode+'"><p class="segment '+c+'"><span class="l">'+(i+1)+'</span>'+segment+'</p>'+res1+'</div>';
	return res1
}
function viewfield(fld,i){
	var res2=''
	var c=''
	var comps=fld.split(sD2)
	if(comps.length>1){
		$.each(comps, function(c){
			res2=res2+viewchunk(comps[c],c,sD3)
		});
		res2='<div class="in">'+res2+'</div>'
		c='hover'
	}
	return '<div class="field"><div class="msg">.</div><p style="display:inline" class="field '+c+'"><span class="l">'+(i)+'</span><span class="content">'+fld+'</span></p>'+res2+'</div>';
}
function viewrepeatfield(fld,i){
	var res2=''
	var comps=fld.split(sD3)
	var c=''
	if(comps.length>1){
		res2=res2+'<div class="repeatfield">Repeat field ('+comps.length+')</div>'
		$.each(comps, function(c){
			res2=res2+viewfield(comps[c],c)
		});
		res2='<div class="in">'+res2+'</div>'
		c='hover'
	}
	return '<div class="field"><div class="msg">.</div><p style="display:inline" class="field '+c+'"><span class="l">'+(i)+'</span>'+fld+'</p>'+res2+'</div>';
}
function viewchunk(comp,i,delim){
	var res=''
	var subcs=comp.split(delim)
	var c=''
	if(subcs.length>1){
		$.each(subcs, function(c){
			if(subcs[c].indexOf(sD5)!=-1)
				res=res+viewchunk(subcs[c],c,sD5)
			//else if(subcs[c].indexOf(sD6)!=-1)
			//	res=res+viewchunk(subcs[c],c,sD6)
			else
				res=res+viewsubcomp(subcs[c],c)
		});
		c='hover'
		res='<div class="in">'+res+'</div>'
	}
	return '<div class="chunk"><div class="msg">.</div><p style="display:inline" class="chunk '+c+'"><span class="l">'+(i+1)+'</span><span class="content">'+comp+'</span></p>'+res+'</div>';
}
function viewsubcomp(subc,i){
	var res3=subc
	return '<div class="subcomp"><p class="chunk"><span class="l">'+(i+1)+'<span class="msg" /></span>'+res3+'</p></div>';
}
$.fn.highlight = function(what,spanClass) {
    return this.each(function(){
        var container = this,
            content = container.innerHTML,
            pattern = new RegExp('(>[^<.]*)(' + what + ')([^<.]*)','g'),
            replaceWith = '$1<span ' + ( spanClass ? 'class="' + spanClass + '"' : '' ) + '">$2</span>$3',
            highlighted = content.replace(pattern,replaceWith);
        container.innerHTML = highlighted;
    });
}
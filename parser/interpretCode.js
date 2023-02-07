var SplitScreenEditor = function(){
	let mySplitScreenEditor = {};
	mySplitScreenEditor.interpreter = new function(){
		let myInterpreter = {};
		//JS
		myInterpreter.JS_LANGUAGE_TYPE={_null: 1, _boolean: 2, _number: 3, _word: 4, _brackets: 5, _delimiters: 6, _strings: 7, _newline: 8, _whitespaces: 9, _logic: 10, _definers: 11, _operators: 12, _meta: 13, _misc:14};
		myInterpreter.JS_LANGUAGE=/(null|undefined)|(true|false)|(NaN|infinity|0b[01]+|0o[0-7]+|0x[\da-fA-F]+|(?:[\-]?\d+(?:\.\d+)?))|(\w+)|([\(\)\{\}\[\]])|([\,\;])|([\'\"])|(\r?\n)|([ \t\f]+)|(\<{1,3}|\>{1,3}|\<\=+|\>\=+|\?|\&+|\|+|(?:\!\=+)|\={2,})|([\:\=]|\=\>|\-\-|\+\+)|([\~\*\-\+\/\%\^\.])|(\\)|(.)/si;
		
		myInterpreter.JS_INCLUDE_BLOCK = /(?:\<script\s+src\=\"([^\"]*)\"\s*\>\s*(?:\<\/script\>))/si;
		//Add Comments into Regex
		myInterpreter.JS_BLOCK = /(?:\<script\>\s*(?:(?:\/\*(((?<=\/\*))([^\*](.*?))*(?!=\*\/))\*\/)|(?:(?:(?:(?:[^\(]*)\((?:[^\)]*)\))|(?:[\s\w]+))\s*\{(?:[^\}]*)\})|(?:(?:[^\;]*)\;))*\s*(?:\<\/script\>))/si;
		myInterpreter.JS_PART = /(?:(((?:([^\(]*)\(([^\)]*)\))|([\s\w]+))\s*\{([^\}]*)\})|((?:[^\;]*)\;))/gs;
		myInterpreter.JSDOC_PARAM=/(?:(\??)\[([^\]]+)\])?\s*([^\s]+)\s*(.*)/gs;
		myInterpreter.JSDOC_RETURN=/(?:\[([^\]]+)\])?\s*(.*)/g;
		myInterpreter.JS_LineDelimiters=[';','\r\n'];
		
		myInterpreter.JS_Block_Types=['function', 'if', 'else', 'for', 'while', 'do', 'switch', 'class', 'constructor', 'try', 'catch', 'finally'];
		myInterpreter.JS_Reserved_Words=['abstract', 'arguments','await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'];
		myInterpreter.JS_BuiltInPropObjMethods_Names=['Array','Date','eval','function','hasOwnProperty','Infinity','isFinite','isNaN','isPrototypeOf','length','Math','NaN','name','Number','Object','prototype','String','toString','undefined','valueOf'];
		myInterpreter.JS_Objects=['console'];
		myInterpreter.JS_HTMLWindow_Words=['alert','all','anchor','anchors','area','assign','blur','button','checkbox','clearInterval','clearTimeout','clientInformation','close','closed','confirm','constructor','crypto','decodeURI','decodeURIComponent','defaultStatus','document','element','elements','embed','embeds','encodeURI','encodeURIComponent','escape','event','fileUpload','focus','form','forms','frame','innerHeight','innerWidth','layer','layers','link','location','mimeTypes','navigate','navigator','frames','frameRate','hidden','history','image','images','offscreenBuffering','open','opener','option','outerHeight','outerWidth','packages','pageXOffset','pageYOffset','parent','parseFloat','parseInt','password','pkcs11','plugin','prompt','propertyIsEnum','radio','reset','screenX','screenY','scroll','secure','select','self','setInterval','setTimeout','status','submit','taint','text','textarea','top','unescape','untaint','window'];
		/**
		 *  Checks whether a given word is a special word
		 *  @param [string] word - the word to check
		 *  @return [number] 0: not special, 1: not so special / avoid, 2 & 3: very special / do not use
		 */
		myInterpreter.JS_isSpecialWord=function(word){
				if(myInterpreter.JS_Reserved_Words.indexOf(word)>=0){
					return 3;
				}else if(myInterpreter.JS_BuiltInPropObjMethods_Names.indexOf(word)>=0 || myInterpreter.JS_Objects.indexOf(word)>=0){
					return 2;
				}else if(myInterpreter.JS_HTMLWindow_Words.indexOf(word)>=0){
					return 1;
				}
			return 0;
		};
		/**
		 *  Creates a HTML-Attribute for Specialwords, using [JS_isSpecialWord()]
		 *  @param [string] word the word to check
		 *  @param [string] attributeType HTML-Attribute name ('class', 'data-type', ...)
		 *  @param [array[string]] nameList List of Values to insert
		 *  @return [string] the HTML-Attribute
		 */
		myInterpreter.JS_AddIfSpecialWord=function(word, attributeType='class', nameList){
			let wordType = myInterpreter.JS_isSpecialWord(word);
			return (attributeType.length==0 || wordType>=nameList.length || nameList[wordType]==undefined)?'':(attributeType+'="'+nameList[wordType]+'"');
		};
		//JS Classes
		/**
		 * JavaScript Element is a general JS-Code-Line
		 */
		myInterpreter.jsElement = class jsElement{
			/**
			 * Constructor of the class.
			 * this.name - [Various]
			 * this.type - Object Type
			 * this.hasError - Error State
			 * this.parts - [Various]
			 */
			constructor(){
				this.name=undefined;
				this.type='element';
				this.hasError=false;
				this.parts=[];
			}
			/**
			 * Returns a String representation of the Element
			 */
			toString(){
				if(this.parts!=undefined){
					return '{}';
				}
				let str='';
				this.parts.forEach(function(part){
					if(typeof part === 'function'){
						str+=(str.length==0?'':', ')+part.toString();
					}else if(Array.isArray(part)){
						str+=(str.length==0?'':', ')+part[1];
					}else{
						str+=(str.length==0?'':', ')+part;
					}
				});
				return str;
			}
			/**
			 * Returns the JS-Result Code
			 */
			js(){
				//Compute js Code
			}
			/**
			 * Returns a HTML representation of the Element
			 */
			html(generalDepth, spaceChar){
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				let str=[];
				this.parts.forEach(function(part){
					if(Array.isArray(part)){
						str.push(part[1]);
					}else if(typeof part === 'object'){
						str.push(part.html(generalDepth, spaceChar));
					}else {
						str.push(part);
					}
				});
				//return '<span class="js part element">'+str+'</span>';
				return str;
			}
		}
		/**
		 * JavaScript-Variable
		 */
		myInterpreter.jsVariable = class jsVariable extends myInterpreter.jsElement{
			//TODO: add static and const to variable definitions
			/**
			 * Adds dataType and dataValue Properties
			 * this.name - Variable Name
			 * this.type - Variable
			 * this.dataType - Variable Type (int, string, ...)
			 * this.dataValue - Variable Value (3, 'abc', ...)
			 */
			constructor(){
				super();
				this.type='variable';
				this.dataType=undefined;
				this.dataValue=undefined;
			}
			toString(){
				return this.name+(this.dataValue!=undefined?'['+this.dataType+'::'+this.dataValue+']':'');
			}
			html(generalDepth, spaceChar){
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				return ['<span class="js part variable_name" data-type="'+this.dataType+'" data-value="'+this.dataValue+'">'+this.name+'</span>'];
			}
		}
		/**
		 * JavaScript-Statement ("document.getElementById('abc').innerText = 'abc';")
		 */
		myInterpreter.jsStatement = class jsStatement extends myInterpreter.jsElement{
			/**
			 * Adds statement Property
			 * this.type - Statement
			 * this.statement - The Statement Contents
			 */
			constructor(){
				super();
				this.type='statement';
				this.statement=undefined;
			}
			toString(){
					if(this.parts==undefined){
						return '{}';
					}
				let str='';
				this.parts.forEach(function(part){
					if(Array.isArray(part)){
						str+=(str.length==0?'':' ')+part[1];
					}else if(typeof part === 'object'){
						str+=(str.length==0?'':' ')+part.toString();
					}else {
						str+=(str.length==0?'':' ')+part;
					}
				});
				return str;
			}
			html(generalDepth, spaceChar){
					if(this.parts==undefined){
						return '';
					}
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				let str=[];
				this.parts.forEach(function(part){
					if(Array.isArray(part)){
						str.push(part[1]);
					}else if(typeof part === 'object'){
							if(part.html==undefined){
								console.log('Undefined Object',part);
							}
						//str.push(part.html(generalDepth, spaceChar));
						str=str.concat(part.html(generalDepth, spaceChar));
					}else{
						str.push(part);
					}
				});
				//return '<span class="js part statement">'+str+'</span>';
				return str;
			}
		};
		/**
		 * JavaScript-Function ("function square(a){return a*a;}")
		 */
		myInterpreter.jsFunction = class jsFunction extends myInterpreter.jsElement{
			/**
			 * Adds documentation, param, statements, returnType Properties
			 * this.name - Function Name
			 * this.type - Function
			 * this.documentation - The Functions Documentation as jsFunctionDocumentation
			 * this.param - The Functions Parameters
			 * this.statements - The Functions Statements
			 * this.returnType - The Functions DataType
			 */
			constructor(){
				super();
				this.documentation=undefined;
				this.param=undefined;
				this.statements=undefined;
				this.returnType=undefined;
				this.type='function';
			}
			toString(){
				return 'function '+(this.name==undefined?'':this.name)+(this.param==undefined?'()':this.param.toString())+(false?'::'+this.returnType:'')+(this.statements==undefined?'{}':this.statements.toString());
			}
			html(generalDepth, spaceChar){
					if(this.parts==undefined){
						return '';
					}
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				//Concat Subdivisions
				return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part keyword">function</span> <span class="js part function_name"'+(this.documentation==undefined?'':' title="'+this.documentation.raw+'"')+'>'+(this.name==undefined?'':this.name)+'</span><span class="js part function_param opentag"></span>'+(this.param==undefined?'()':this.param.html(generalDepth, spaceChar))+'<span class="js part function_param closetag"></span><span class="js part function_dataType">'+(false?'::'+this.returnType:'')+'</span>', '<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part function_body opentag"></span>'+(this.statements==undefined?'{}':this.statements.html(generalDepth+1, spaceChar)+'<span class="js part function_body closetag"></span>')];
			}
		};
		/**
		 * JavaScript-Function Call ("square(2);")
		 */
		myInterpreter.jsFunctionCall = class jsFunctionCall extends myInterpreter.jsElement{
			/**
			 * Adds param Property
			 * this.name - Function Name
			 * this.type - Call
			 * this.param - The Parameters
			 */
			constructor(){
				super();
				this.param=undefined;
				this.type='call';
			}
			toString(){
				return this.name+(this.param==undefined?'()':this.param.toString());
			}
			html(generalDepth, spaceChar){
					if(this.parts==undefined){
						return '';
					}
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part function_call">'+this.name+'</span><span class="js part function_call_param">'+(this.param==undefined?'()':this.param.html(generalDepth,spaceChar))+'</span>'];
			}
		};
		/**
		 * JavaScript-Block ("if(i>5){alert('Too large');}")
		 */
		myInterpreter.jsBlock = class jsBlock extends myInterpreter.jsElement{
			/**
			 * Adds param, statements Properties
			 * this.name - Type of Block (if, do, while, for, ...)
			 * this.type - Variable
			 * this.param - The Parameters / Conditions
			 * this.statements - The Statements
			 */
			constructor(){
				super();
				this.param=undefined;
				this.statements=undefined;
				this.type='block';
			}
			toString(){
				return this.name+(this.param==undefined?'':this.param.toString())+(this.statements==undefined?'{}':this.statements.toString());
			}
			html(generalDepth, spaceChar){
					if(this.parts==undefined){
						return '';
					}
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part keyword">'+this.name+'</span><span class="js part block_param opentag"></span>'+(this.param==undefined?'':this.param.html(generalDepth+1, spaceChar))+'<span class="js part block_param closetag"></span><span class="js part block_body opentag"></span>'+(this.statements==undefined?'{}':this.statements.html(generalDepth+1, spaceChar))+'<span class="js part block_body closetag"></span>'];
			}
		};
		/**
		 * JavaScript-Definition ("let a.b[c] = d(e)")
		 *      definitionType: let
		 *      definer: a.b[c]
		 *      definition: d(e)
		 */
		myInterpreter.jsDefinition = class jsDefinition extends myInterpreter.jsElement{
			/**
			 * Adds definitionType, definer, definition Properties
			 * this.type - Definition
			 * this.definitionType - the Type of Definition (const, var, let, ...)
			 * this.isObjectDefinition - Specifies the use of ':', instead of '=' between definer and definition
			 * this.definer - Property / Object that is defined
			 * this.definition - the Definition
			 */
			constructor(defType, isObjDef=false){
				super();
				this.definitionType=defType;
				this.isObjectDefinition=isObjDef;
				this.type='definition';
			}
			toString(){
				return this.definitionType+' '+this.definer+' '+(this.isObjectDefinition?':':'=')+' '+this.definition;
			}
			html(generalDepth, spaceChar){
					if(this.parts==undefined){
						return '';
					}
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part keyword">'+this.definitionType+'</span><span class="js part definition_definer">'+this.definer.html(generalDepth, spaceChar)+'</span>'+(this.isObjectDefinition?':':'=')+'<span class="js part definition_definer">'+this.definition.html(generalDepth, spaceChar)+'</span>'];
			}
		};
		/**
		 * JavaScript-Bracket
		 */
		myInterpreter.jsBracket = class jsBracket extends myInterpreter.jsElement{
			static bracketCounter = 0;
			/**
			 * Adds bracket, endBracket, contents, delimiter, bracketID Properties
			 * this.type - Bracket
			 * this.bracketID - ID-Number for pairing
			 * this.bracket - Type of opening Bracket '(', '[', '{'
			 * this.endBracket - Type of closing Bracket ')', ']', '}'
			 * this.contents - Contents of Bracket
			 * this.delimiter - an optional Content Separator
			 */
			constructor(openBracket, contentsDelimiter=' '){
				super();
				this.type='bracket';
				this.bracket=openBracket;
				this.endBracket=(openBracket=='('?')':(openBracket=='['?']':'}'));
				this.contents=undefined;
				this.delimiter=contentsDelimiter;
				this.bracketID=jsBracket.bracketCounter++;
			}
			toString(){
				let str='';
					if(this.contents!=undefined){
						let contentsDelimiter=this.delimiter;
						this.contents.forEach(function(part){
							if(Array.isArray(part)){
								str+=(str.length==0?'':contentsDelimiter)+part[1];
							}else if(typeof part === 'object'){
								str+=(str.length==0?'':contentsDelimiter)+part.toString();
							}else {
								str+=(str.length==0?'':contentsDelimiter)+part;
							}
						});
					}
				let br = this.bracket=='{'?'\n':'';
				return this.bracket+br+str+br+this.endBracket;
			}
			html(generalDepth, spaceChar){
					if(this.parts==undefined){
						return '';
					}
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				let str='';
					if(this.contents!=undefined){
						let contentsDelimiter=this.delimiter;
						this.contents.forEach(function(part){
							if(Array.isArray(part)){
								str+=(str.length==0?'':contentsDelimiter)+part[1];
							}else if(typeof part === 'object'){
								str+=(str.length==0?'':contentsDelimiter)+part.html(generalDepth+1,spaceChar);
							}else {
								str+=(str.length==0?'':contentsDelimiter)+part;
							}
						});
					}
				//return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part bracket opentag">'+this.bracket+'</span>', '<span class="spaces">'+spaceChar.repeat(generalDepth+1)+'</span><span class="js part bracket_body">'+str+'</span>', '<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part bracket closetag">'+this.endBracket+'</span>'];
				return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part bracket opentag" bracket-id="'+this.bracketID+'">'+this.bracket+'</span><span class="spaces">'+spaceChar.repeat(generalDepth+1)+'</span><span class="js part bracket_body">'+str+'</span><span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="js part bracket closetag" bracket-id="'+this.bracketID+'">'+this.endBracket+'</span>'];
				//TODO: Add CSS Hover on One Bracket, to highlight the matching bracket -> Bracket-ID
			}
		};
		/**
		 * JavaScript-Function-Documentation ("/** Description @param ?[dataType] var1 - Description var1 @return [returnType] Description*\/")
		 * for param: [optional][type][varName][varDescription] -> '[int] x - a significant number', '?[number] width - optional width of Element', 'y - Y-Position'
		 */
		//TODO: Add further @rules {author, version, exception/throws, see, link, since, deprecated} -> https://www.oracle.com/technical-resources/articles/java/javadoc-tool.html#tag
		myInterpreter.jsFunctionDocumentation = class jsFunctionDocumentation extends myInterpreter.jsElement{
			constructor(name, documentation){
				super();
				this.type='documentation';
				this.name=name==undefined?'anonymous':name;
				this.description='&lt;none&gt;';
				//[optional, type, name, description] => {[false, '[int]', 'a', 'first number'],[true, '[int]', 'b', 'second number']}
				this.param=[];
				//[type, description] => {'int', 'something to do with numbers'}
				this.returnType=['','&lt;none&gt;'];
				this.raw=documentation.substring(documentation.startsWith('/**')?3:0, documentation.endsWith('*/')?documentation.length-2:documentation.length).trim();
				this.interpretDocumentation();
			}
			//Reads from this.raw
			interpretDocumentation(){
				let nextAt = this.raw.indexOf('@');
				let offset = this.raw.indexOf('/**');
					if(offset==-1){
						offset=0;
					}else{
						offset+=3;
					}
					if(nextAt==-1){
						nextAt=this.raw.indexOf('*/');
						nextAt=nextAt==-1?this.raw.length:nextAt;
					}
				this.description=this.cutExcessStarsAndSpaces(this.raw.substring(offset, nextAt));
					while(offset>=0){
						offset=this.raw.indexOf('@', offset+1);
							if(offset>=0){
								let nextWord = this.raw.indexOf(' ',offset), nextAt = this.raw.indexOf('@', offset+1);
								nextWord=this.raw.substring(offset+1, nextWord);
									if(nextAt==-1){
										nextAt=this.raw.indexOf('*/');
										nextAt=nextAt==-1?this.raw.length:nextAt;
									}
								let currentVal = this.raw.substring(offset+2+nextWord.length,nextAt);
									switch(nextWord){
										case 'param':
											currentVal=Array.from(currentVal.matchAll(myInterpreter.JSDOC_PARAM))[0];
											currentVal[4]=currentVal[4].trim();
												if(currentVal[4].startsWith('- ')){
													currentVal[4]=currentVal[4].substring(2);
												}
											//[optional, type, varName, varDescription]
											this.param.push({'optional':currentVal[1].length>0, 'type':currentVal[2]==undefined?'':currentVal[2], 'name':currentVal[3], 'description':this.cutExcessStarsAndSpaces(currentVal[4])});
											break;
										case 'return':
											currentVal=Array.from(currentVal.matchAll(myInterpreter.JSDOC_RETURN))[0];
											currentVal[2]=currentVal[2].trim();
												if(currentVal[2].startsWith('- ')){
													currentVal[2]=currentVal[2].substring(2);
												}
											this.returnType={'type':currentVal[1]==undefined?'':currentVal[1], 'description':this.cutExcessStarsAndSpaces(currentVal[2])};
											break;
									}
							}
					}
			}
			//Cut Excess * and spaces / newlines from the beginning and end
			cutExcessStarsAndSpaces(string){
				return string.replace(/^[\s\*]*/,'').replace(/[\s\*]*$/,'').trim();
			}
			toString(){
				return this.raw;
			}
			html(){
				let paramHTML=[], dummycodeParam=[];
					for(let i=0;i<this.param.length;i++){
						dummycodeParam.push((this.param[i][0]?'<i>[':'')+(this.param[i][1]==undefined?'':this.param[i][1]+' ')+this.param[i][2]+(this.param[i][0]?']</i>':''));
						paramHTML.push((this.param[i][0]?'<i>(Optional) ':'')+this.param[i][2]+(this.param[i][3]==undefined?'':' '+this.param[i][3])+(this.param[i][0]?'</i>':''));
					}
				return '<div class="js part function documentation"><span class="name">'+this.name+'-Function</span><div class="dummycode">'+this.returnType[0]+' '+this.name+'('+dummycodeParam.join(', ')+')</div><div class="description"><span class="heading">Description</span><span class="value">'+this.description+'</span></div>'+(this.param.length==0?'':'<div class="parameters"><span class="heading">Parameters</span><div class="value"><span>'+paramHTML.join('</span><span>')+'</span></div></div>')+(this.returnType[0]=='void'?'':'<div class="return"><span class="heading">Return</span><span class="value">'+this.returnType[1]+'</span></div>')+'</div>';
			}
		};

		//JS Classes
		//PHP
		myInterpreter.PHP_LANGUAGE_TYPE={_comment: 1, _null: 2, _boolean: 3, _number: 4, _word: 5, _brackets: 6, _delimiters: 7, _strings: 8, _newline:9, _whitespaces: 10, _documentation: 11, _logic: 12, _definers: 13, _operators: 14, _meta: 15, _misc:16};
		myInterpreter.PHP_LANGUAGE=/(\/\*|\*\/)|(null)|(true|false)|(NAN|(?:[\+\-]?\d+(?:\.\d+)?))|(\w+)|([\(\)\{\}\[\]])|([\,\;])|([\'\"])|(\r?\n)|([ \t\f]+)|(\/\*\*|\*\/)|(\<|\>|\<\=+|\>\=+|\?|\&+|\|+|(?:\!\=+)|\={2,})|([\:\=\$]|\-\-|\+\+)|([\*\-\+\/\%\^\.])|(\\)|(.)/si;
		myInterpreter.PHP_BLOCK = /(?:\<\?php\s*(?:(?:(?:(?:(?:[^\(]*)\(?:(?:[^\)]*)\))|(?:[\s\w]+))\s*\{(?:[^\}]*)\})|(?:(?:[^\;]*)\;))*\s*(?:\?\>))/si;
		myInterpreter.PHP_Block_Types=['function', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'class', 'constructor', 'try', 'catch', 'finally'];
		//CSS
		//TODO: Add Media Query into Regex
		//TODO: Add possibility for not ending a line with ; if newline or last rule
		myInterpreter.CSS_BLOCK = /(?:\<style\>\s*(?:(?:[^\{]+)\{(?:[^\}]*)\})*\s*(?:\<\/style\>))/si;
		myInterpreter.CSS_PART = /([^\{]+)\{([^\}]*)\}/gs;
		myInterpreter.CSS_RULE = /([^\:]+)\:([^\;]+)\;/gs;
		//Parsed CSS
		myInterpreter.pCSS_LANGUAGE_TYPE={_comment: 1, _null: 2, _boolean: 3, _number: 4, _word: 5, _brackets: 6, _delimiters: 7, _strings: 8,_newline: 9, _whitespaces: 10, _logic: 11, _definers: 12, _operators: 13, _meta: 14, _misc:15};
		myInterpreter.pCSS_LANGUAGE=/(\/\*|\*\/)|(null)|(true|false)|(NAN|(?:[\+\-]?\d+(?:\.\d+)?(?:%|\w*)?))|((?:@)|(?:\w+[\w\-]*)?[\w]+|(?:#\w+))|([\(\)\{\}\[\]])|([\,\;])|([\'\"])|(\r?\n)|([ \t\f]+)|(\<|\>|\<\=+|\>\=+|\?|\&+|\|+|(?:\!\=+)|\={2,})|([\:\=\$]|\-\-|\+\+)|([\*\-\+\/\%\^\.])|(\\)|(.)/si;
		myInterpreter.pCSS_BLOCK = /(?:\<style\>\s*(?:(?:(?:[^\{]+)\{\s*)?(?:[^\{]+)\{(?:[^\}]*)\}(?:\s*\})?)*\s*(?:\<\/style\>))/si;
		myInterpreter.pCSS_Block_Types=['@'];
		//Parsed HTML
		myInterpreter.HTML_LANGUAGE_TYPE={_comment: 1, _number: 2, _word: 3, _brackets: 4, _definers: 5, _strings: 6, _whitespaces: 7, _misc:8};
		myInterpreter.HTML_LANGUAGE=/(<\!\-\-|\-\->)|([\+\-]?\d+(?:\.\d+)?%?\w*)|((?:\w+[\w\-]*)?[\w]+|(?:#\w+))|(<\/|\/\s*>|[<>])|(=)|([\'\"])|(\s+)|(.)/si;
		//CSS-Classes
		/**
		 * JavaScript Element is a general JS-Code-Line
		 */
		myInterpreter.cssElement = class cssElement{
			/**
			 * Constructor of the class.
			 * this.name - [Various]
			 * this.type - Object Type
			 * this.hasError - Error State
			 * this.parts - [Various]
			 */
			constructor(){
				this.name=undefined;
				this.type='element';
				this.hasError=false;
				this.parts=[];
			}
			/**
			 * Returns a String representation of the Element
			 */
			toString(){
				if(this.parts!=undefined){
					return '{}';
				}
				let str='';
				this.parts.forEach(function(part){
					if(typeof part === 'function'){
						str+=(str.length==0?'':', ')+part.toString();
					}else if(Array.isArray(part)){
						str+=(str.length==0?'':', ')+part[1];
					}else{
						str+=(str.length==0?'':', ')+part;
					}
				});
				return str;
			}
			/**
			 * Returns a HTML representation of the Element
			 */
			html(generalDepth, spaceChar){
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				let str=[];
				this.parts.forEach(function(part){
					if(Array.isArray(part)){
						str.push(part[1]);
					}else if(typeof part === 'object'){
						str.push(part.html(generalDepth, spaceChar));
					}else {
						str.push(part);
					}
				});
				//return '<span class="js part element">'+str+'</span>';
				return str;
			}
		}
		/**
		 * CSS-AtPart ('@media', '@supports', ...)
		 */
		myInterpreter.cssAtPart = class cssAtPart extends myInterpreter.cssElement{
			/**
			 * this.name - Part Name
			 * this.type - AtPart
			 * this.conditions - optional Condition
			 * this.parts - Array of CSS-Parts
			 */
			constructor(){
				super();
				this.type='atPart';
				this.conditions=undefined;
				this.parts=undefined;
			}
			toString(){
				let myParts='';
					for(let i=0;i<this.parts.length;i++){
						myParts+=(myParts.length==0?'':' ')+this.parts[i].toString();
					}
				return this.name+(this.conditions==undefined?'':'('+this.conditions+')')+'{'+myParts+'}';
			}
			html(generalDepth, spaceChar){
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				let myParts='';
					for(let i=0;i<this.parts.length;i++){
						myParts+=this.parts[i].html(generalDepth+1);
					}
			return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="css part atpart">'+this.name+'</span>'+(this.conditions==undefined?'':'<span class="css part atpart condition">('+this.conditions+')</span>')+'<span class="css part bracket opentag">{</span>'+myParts+'<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="css part bracket closetag">}</span>'];
			}
		}
		/**
		 * CSS-Part
		 */
		myInterpreter.cssPart = class cssPart extends myInterpreter.cssElement{
			/**
			 * this.name - Part Name
			 * this.type - Part
			 * this.rules - Array of CSS-Rules
			 */
			constructor(){
				super();
				this.type='rule';
				this.rules=undefined;
			}
			toString(){
				let myRules='';
					for(let i=0;i<this.rules.length;i++){
						myRules+=(myRules.length==0?'':' ')+this.rules[i].toString();
					}
				return this.name+'{'+myRules+'}';
			}
			html(generalDepth, spaceChar){
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				let myRules='';
					for(let i=0;i<this.rules.length;i++){
						myRules+=this.rules[i].html(generalDepth+1);
					}
				return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="css part part">'+this.name+'</span><span class="css part bracket opentag">{</span>'+myRules+'<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="css part bracket opentag">}</span>'];
			}
		}
		/**
		 * CSS-Rule
		 */
		myInterpreter.cssRule = class cssRule extends myInterpreter.cssElement{
			/**
			 * this.name - Rule Name
			 * this.type - Rule
			 * this.data - Rule Value
			 */
			constructor(){
				super();
				this.type='rule';
				this.data=undefined;
			}
			toString(){
				return this.name+':'+this.data+';';
			}
			html(generalDepth, spaceChar){
				//Compute html Code
					if(generalDepth==undefined){
						generalDepth=0;
					}
					if(spaceChar==undefined){
						spaceChar=' ';
					}
				return ['<span class="spaces">'+spaceChar.repeat(generalDepth)+'</span><span class="css part rule_name">'+this.name+'</span><span class="css part rule_value">'+this.data+';</span>'];
			}
		}
		//CSS-Classes

		//HTML
		myInterpreter.HTML_tagRegex = /\<([\!\/])?\s*((?:[a-zA-Z_]\w*)(?:(?:\s*(?:[a-zA-Z_][\w\-]*)(?:\s*\=\s*(?:(?:"(?:[^"]*)")|(?:'(?:[^']*)')))?)*))\s*(\/)?\>/;
		myInterpreter.HTML_Definition_attributeValue = /\s*([a-zA-Z_][\w\-]*)(?:\s*=\s*((?:"(?:[^"]*)")|(?:'(?:[^']*)')))?/g;
		//COMMENT
		myInterpreter.Comments_SingleLine = /\/\/([^\n]*)/g;
		myInterpreter.Comments_MultiLine = /\/\*(((?<=\/\*))([^\*](.*?))*(?!=\*\/))\*\//gs; //explicitly no documentation comment => /** function and param */
		myInterpreter.Comments_HTML = /<\!\-\-(((?<=<\!\-\-))(.*?)(?!=\-\->))\-\->/gs;
		//Special Tags
		myInterpreter.HTML_Single_Elements=['br', '!doctype', '!--', 'meta', 'img', 'hr', 'input', 'link', 'param', 'source', 'track','wbr','area','base','col','embed','keygen'];

		/**
		 *  Returns the Attribute-List of a Tag
		 *  'src="abc" class="def"' => {src:'abc', class:'def'}
		 *  @param [string] attributeString String of the Tags Attribute-List
		 *  @return [object] Attribute-List Object
		 */
		myInterpreter.getTagAttributes=function(attributeString){
			attributeString=attributeString.trim();
			let attributes={}, pointer=0, pointer2;
			let attribute=undefined, attributeValue;
				while((pointer=attributeString.indexOf('='))>=0){
					pointer2=attributeString.indexOf(' ');
					attribute=attributeString.substring(pointer2>pointer?0:pointer2+1,pointer);
					stringType=attributeString[pointer+1]; //" or '
					pointer2=attributeString.indexOf(stringType, pointer+2);
					attributeValue=attributeString.substring(pointer+2, pointer2);
					attributes[attribute]=attributeValue;
					attributeString=attributeString.substring(pointer+1);
				}
			return attributes;
		}
		/**
		 * Returns the next Position of a Special Element/Block (HTML-Tag, PHP, JS, CSS, Comments)
		 * @param [string] code - Source Code
		 * @return [int[]] Pointer Array<br>1st Determines the type of Special Element [-1: Error/None, 0: HTML-Tag, 1:HTML-Comment, 2: PHP, 3: JS, 4: CSS]<br>2nd determines the Offset/position in the Source Code<br>if none is found it returns Type:-1 and Offset 0
		 */
		myInterpreter.getNextSpecialElement=function(code){
			code=code.toLowerCase();
			let specialIndex=[[2,code.indexOf('<?php')],[3,code.indexOf('<script')],[4,code.indexOf('<style')],[1, code.indexOf('<!--')],[0, code.indexOf('<')]];
			let nextElement=-1;
			specialIndex.forEach(function(item, index){
				if(item[1]!==-1){
					if(nextElement==-1 || item[1]<specialIndex[nextElement][1]){
						nextElement=index;
					}
				}
			});
			return nextElement==-1?[-1, 0]:specialIndex[nextElement];
		};
		/**
		 * Parses Code to a Tag Tree
		 * @param [string] code - Source Code
		 * @param [int] offset - Code Offset
		 * @return [array] - Tag Tree
		 */
		//TODO: Fix [loop] amount
		myInterpreter.parseCode=function(code, offset){
			//Types: Text || Tag [?Ending, Descriptor, ?{[Attribute, Value]}, ?SingleElement]
			//Blocks: HTML, Comment, Text, CSS, JS, PHP
				if(code==undefined || code==null || code.length==0){
					return [];
				}
			/*
				0. Complete Tag
				1. Is DocType | Comment
				2. Is EndTag
				3. Attribute List
				4. Attribute
				5. Value Definition with equals sign
				6. Value Definition with either single or double Quotes
				6.1. Value Definition with double Quotes
				6.2. Value in double Quotes
				6.3. Value Definition with single Quotes
				6.4. Value in single Quotes
				7. SingleElement
			*/
			let nextSpecialTag;
			let treeDepth=0, codeLen=0;
			let tagTree=[];
			offset=(offset==undefined)?0:offset;
			//code=code.replaceAll(myInterpreter.Comments_HTML, '').replaceAll(myInterpreter.Comments_MultiLine, '').replaceAll(myInterpreter.Comments_SingleLine, '');
			let loop=100000;
				while(code.length>0 && treeDepth>=0 && loop>0){
					nextSpecialTag = myInterpreter.getNextSpecialElement(code);
						if(nextSpecialTag[0]>=0 && nextSpecialTag[1]==0){
							//Tag Node
							//let firstTag = [...code.matchAll(myInterpreter.HTML_tagRegex)];
							if(nextSpecialTag[0]==0){
								let firstTag = code.match(myInterpreter.HTML_tagRegex);
								let aVList = [...firstTag[2].matchAll(myInterpreter.HTML_Definition_attributeValue)];
									if(aVList[0][0].toLowerCase()=='br' || aVList[0][0].toLowerCase()=='doctype'){
										firstTag[3]='/';
									}
								let simplifiedAVList=[];
									if(firstTag[1]=='/'){
										treeDepth--;
									}else{
										aVList.forEach(function(item, index){
											if(index==0){return;}
											if(item[2]!==undefined){
												//TODO: Add capability of interpreting inlince CSS
												/*if(item[1]=='style'){
													//interpret CSS
													let internalCSS = myInterpreter.parseCSS('<style>CSS{'+item[2]+'}</style>');
													console.log('CSS', internalCSS);
												}*/
												simplifiedAVList.push([item[1], item[2].substring(1,item[2].length-1)]);
											}else{
												simplifiedAVList.push([item[1]]);
											}
										});
									}
								//console.log((firstTag[1]=='?'?'Block':(firstTag[1]=='!'?'Special':(firstTag[1]=='/'?'End':'')))+'Tag '+(firstTag[3]=='/'?'(single Instance) ':'')+'found', aVList[0][0], simplifiedAVList);
								//console.log((offset+treeDepth)+'<'+(firstTag[1]=='/'?'/':'')+aVList[0][0]+'>');
								let innerElements=(firstTag[1]=='/' || firstTag[3]=='/')?undefined:myInterpreter.parseCode(code.substr(firstTag[0].length), offset+treeDepth+1);
								let innerLen=(innerElements==undefined?0:innerElements[innerElements.length-1]);
								tagTree.push({tag:aVList[0][0], specialType:firstTag[1], singleTag:firstTag[3], attributes:simplifiedAVList, inner:innerElements});
								code=code.substr(firstTag[0].length+innerLen);
								codeLen+=firstTag[0].length+innerLen;
							}else{
								//console.log('Parse', nextSpecialTag[0]);
									if(nextSpecialTag[0]==2){
										let phpBlock=myInterpreter.parsePHP(code);
										tagTree.push({tag:'php', specialType:'?', singleTag:'?', attributes:[], inner:undefined, php:phpBlock[0]});
										code=code.substr(phpBlock[1]);
										codeLen+=phpBlock[1];
									}else if(nextSpecialTag[0]==3){
										let jsBlock=myInterpreter.parseJS(code);
											if(jsBlock[0]==-1){
												tagTree.push({tag:'script', specialType:undefined, singleTag:undefined, attributes:jsBlock[2], inner:[{tag:'script', specialType:'/', singleTag:undefined, attributes:[], inner:undefined},9], js:undefined});
												code=code.substr(jsBlock[1]);
												codeLen+=jsBlock[1];
											}else{
												tagTree.push({tag:'script', specialType:undefined, singleTag:undefined, attributes:[], inner:[{tag:'script', specialType:'/', singleTag:undefined, attributes:[], inner:undefined},9], js:jsBlock[0]});
												code=code.substr(jsBlock[1]);
												codeLen+=jsBlock[1];
											}
									}else if(nextSpecialTag[0]==4){
										let cssBlock=myInterpreter.parseCSS(code);
										tagTree.push({tag:'style', specialType:undefined, singleTag:undefined, attributes:[], inner:[{tag:'style', specialType:'/', singleTag:undefined, attributes:[], inner:undefined},8], css:cssBlock[0]});
										code=code.substr(cssBlock[1]);
										codeLen+=cssBlock[1];
									}else{
										if(code.substr(0,4)=='<!--'){
											let endComment=code.indexOf('-->')+3;
											let comment=code.substr(0,(endComment==-1?code.length:endComment));
											tagTree.push({tag:'--', specialType:'!', singleTag:'--', attributes:[], inner:undefined, content:comment});
											console.log('Comment', comment);
											code=code.substr(comment.length);
											codeLen+=comment.length;
										}else{
											console.log('Unknown Script Block', code.substr(0,20));
											code=code.substr(1);
											codeLen++;
										}
									}
							}
						}else{
							//Text Node
							let myText;
								if(nextSpecialTag[1]<0){
									myText=code;
								}else{
									myText=code.substring(0, nextSpecialTag[1]);
								}
							//console.log('Text found', '{'+myText+'}', 'nextTag', nextSpecialTag[1]);
							//console.log((offset+treeDepth)+myText);
							tagTree.push(myText);
							code=code.substr(myText.length);
							codeLen+=myText.length;
						}
					loop--;
				}
				if(loop==0){
					console.warn('Loop Error', code.length,'"'+code+'"', nextSpecialTag);
				}
			tagTree.push(codeLen);
			return tagTree;
		};
		/**
		 * Parses CSS-Code to Tag Tree
		 * @param [string] code - Source Code
		 * @return [array] Tag Tree
		 */
		//TODO: Fix [code] having to be incased by '<style>'+code+'</style>'
		myInterpreter.parseCSS=function (code){
			//Add Media Query possibilities
			let startTagIndex=code.indexOf('>');
			let startTag=code.substring(1, startTagIndex+1);
			let endTagIndex = code.match(myInterpreter.CSS_BLOCK)[0].length-8;
			let css = code.substring(startTagIndex+1, endTagIndex).replaceAll(/[\t\r\n]*| {2,}/g,'');
			css=css.replaceAll(myInterpreter.Comments_HTML, '').replaceAll(myInterpreter.Comments_MultiLine, '').replaceAll(myInterpreter.Comments_SingleLine, '');
			let cssMatches = [...css.matchAll(myInterpreter.CSS_PART)];
			css=[];
			let cssRules, cssRule;
			cssMatches.forEach(function(item){
				cssRules=[...item[2].matchAll(myInterpreter.CSS_RULE)];
				cssRule=[];
				cssRules.forEach(function(aRule){
					cssRule.push([aRule[1], aRule[2]]);
				});
				css.push([item[1],cssRule]);
			});
			return [css, endTagIndex+startTag.length+2];
		};
		/**
		 * Parses CSS to Tag Tree using stitching
		 * @param [string] code - Source Code
		 * @return [array] Tag Tree
		 */
		myInterpreter.parseCSS_=function (code){
			//Add Function Structures
			let startTagIndex=code.indexOf('<style')+6;
			let startTag=code.substring(1, startTagIndex);
			let endTagIndex = code.match(myInterpreter.pCSS_BLOCK)[0].length-8;
			let css=code.substring(startTagIndex+1, endTagIndex).trim();
			//console.log('CSS:', css);
			css=myInterpreter.extractLanguage2Parts(css, myInterpreter.pCSS_LANGUAGE, myInterpreter.pCSS_LANGUAGE_TYPE, myInterpreter.pCSS_Block_Types);
			//console.log('LanguageParts:',css);
			css=myInterpreter.stitchCSS(css);
			//console.log('Stitched:', css);
			return [css, endTagIndex+startTag.length+2];
		};

		/**
		 * Stitches the separate parts of language Fragments (from extractLanguage2Parts()) to CSElements
		 * @param [array] languageExtractedParts - language Fragments (extractLanguage2Parts)
		 * @param ?[int] pointer - [internal] starting point in languageExtractedParts
		 * @param ?[int] bracketing - [internal] bracket Counter
		 * @return [int, array] Returns a the current pointer position and a Tag-Tree
		 */
		myInterpreter.stitchCSS=function (languageExtractedParts, pointer, bracketing){
			pointer=pointer || 0;
			let stitched=[], ret=undefined, currentStatement=[];
			let statementCollection = [];
			let myAtPart;
			let myPart;
			let myRule;
				if(bracketing==undefined){
					bracketing=1;
				}
				while(pointer<languageExtractedParts.length && bracketing>0){
	//console.log(languageExtractedParts[pointer]);
						if(languageExtractedParts[pointer][0]=='block'){
							if(languageExtractedParts[pointer][1]=='@'){
								myAtPart=new myInterpreter.cssAtPart();
								myAtPart.name=languageExtractedParts[pointer+1][0]=='word'?languageExtractedParts[pointer+1][1]:undefined;
								console.log('At-Rule Found:', myAtPart);
								ret=myInterpreter.stitchCSS(languageExtractedParts, pointer+(myAtPart.name==undefined?1:2), bracketing+1);
								myAtPart.condition=ret[1][0];
								pointer=ret[0];
								stitched.push(myAtPart);
							}else{
								console.warn('Found unknown Block:', languageExtractedParts[pointer][1]);
							}
						}else if(languageExtractedParts[pointer][0]=='comment'){
							if(languageExtractedParts[pointer][1]=='/*'){
								ret=myInterpreter.stitchCSS(languageExtractedParts, pointer+1, bracketing+1);
								stitched.push({type:'comment', comment:ret[1][0].join(' ')});
								console.log('Found Comment:',ret[1][0].join(' '));
								pointer=ret[0];
							}else{
								bracketing=0;
								pointer--;
							}
						}else if(languageExtractedParts[pointer][0]=='bracket'){
							if(['(', '[', '{'].indexOf(languageExtractedParts[pointer][1])!==-1){
								console.log('Found opening Bracket:', languageExtractedParts[pointer][1]);
								ret=myInterpreter.stitchCSS(languageExtractedParts, pointer+1, bracketing+1);
								stitched.push(ret[1]);
								pointer=ret[0];
								console.log('Bracket contents:', ret[1]);
								console.log('Now @', languageExtractedParts[pointer]);
									if(bracketing>1){
										bracketing=0;
										pointer--;
									}
							}else if(bracketing>1){
								console.log('Found closing Bracket:', languageExtractedParts[pointer][1]);
								bracketing=0;
							}else{
								console.log('Found other Bracket, pushing Content:', languageExtractedParts[pointer][1]);
								statementCollection.push(languageExtractedParts[pointer][1]);
							}
						}else if(languageExtractedParts[pointer][0]=='delimiter'){
							console.log('Found delimiter, pushing Content:', statementCollection);
							stitched.push(statementCollection);
							statementCollection=[];
						}else{
							if(pointer+1<languageExtractedParts.length && languageExtractedParts[pointer+1][1]=='{'){
								//Part
								console.log('Found Part:', languageExtractedParts[pointer][1]);
								myPart=new myInterpreter.cssPart();
								console.log('Adding possible prefixes:', statementCollection);
								statementCollection.push(languageExtractedParts[pointer][1]);
								myPart.name=statementCollection.join(' ');
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
								myPart.rules=ret[1][0];
								pointer=ret[0]-1;
								console.log('Part Content:', ret[1][0]);
								//currentStatement.push(myFunctionCall);
								stitched.push(myPart);
							}else{
								console.log('Found something else:', languageExtractedParts[pointer]);
								statementCollection.push(languageExtractedParts[pointer][1]);
							}
						}
					pointer++;
				}
				if(statementCollection.length>0){
					stitched.push(statementCollection);
				}
			return [pointer, stitched];
		};











		/**
		 * Parses JavaScript to Tag Tree
		 * @param [string] code - Source Code
		 * @return [array] Tag Tree
		 * @deprecated use .parseJS2()
		 */
		//TODO: Fix [code] having to be incased by '<script>'+code+'</script>'
		myInterpreter.parseJS=function (code){
			//TODO: Add generators and classes*
			//Add Function | Class Structures
			let startTagIndex=code.indexOf('>');
			let startTag=code.substring(1, startTagIndex+1);
			let includedScript=code.match(myInterpreter.JS_INCLUDE_BLOCK);
				if(includedScript!=null && includedScript.index==0){
					//External Script
					//TODO: Read External JS-Scripts
					//asynch function bla(){
					//await fetch($path)
					//}
					console.log('Todo: Read External Scripts');
					return [-1, includedScript[0].length, [['src',includedScript[1]]]];
				}else{
					//Inline Script
						if(code.match(myInterpreter.JS_BLOCK)==null){
							console.warn('REGEX', code);
						}
					let endTagIndex = code.match(myInterpreter.JS_BLOCK)[0].length-9;
					let js=code.substring(startTagIndex+1, endTagIndex).trim();
					js=js.replaceAll(myInterpreter.Comments_HTML, '').replaceAll(myInterpreter.Comments_MultiLine, '').replaceAll(myInterpreter.Comments_SingleLine, '');
					js=myInterpreter.extractLanguage2Parts(js, myInterpreter.JS_LANGUAGE, myInterpreter.JS_LANGUAGE_TYPE, myInterpreter.JS_Block_Types);
					js=myInterpreter.stitchJS(js)[1];
					//code='/** Documentation for the function abc */ function abc ( param1 , param2 ) { let i = 0; if (i != -1) { i = 3; } else if(i<0) { i = -2; } else { i = 2; } return param1 + param2; } for(let j=0;j<5;j++){i++;}';
					//code='function abc(param1){let i=0;while(i<10){something;i++;}do{somethingElse;i++;}while(i<20)}';
					//code='try{something}catch{error}finally{ending}';
			/*console.log('Code', code);
			code=myInterpreter.extractLanguage2Parts(code, myInterpreter.JS_LANGUAGE, myInterpreter.JS_LANGUAGE_TYPE, myInterpreter.JS_Block_Types);
			console.log('Xtract', code);
			console.log('Stitched', myInterpreter.stitchJS(code)[1]);*/
			//console.log('Stitched', myInterpreter.interpretStitchedJS(myInterpreter.stitchJS(myInterpreter.extractLanguage2Parts(code, myInterpreter.JS_LANGUAGE, myInterpreter.JS_LANGUAGE_TYPE, myInterpreter.JS_Block_Types))[1]));
					//js=myInterpreter.interpretStitchedJS(js);
					return [js, endTagIndex+startTag.length+2];	
				}
		};





		/**
		 * Goes through code properly and returns the stitched parts
		 * @param [string] code - JavaScript-Source Code, without '<script></script>'
		 * @return [array] code elements
		 */
		myInterpreter.parseJS2=function(code, returnLength=false){
			let myActualLength=-1;
			//Code to basic components
			let jsParts = myInterpreter.extractLanguage2Parts(code, myInterpreter.JS_LANGUAGE, myInterpreter.JS_LANGUAGE_TYPE, myInterpreter.JS_Block_Types, true);
			//Check for optional 'EndTag'
			let prematureEnd = myInterpreter.JS_checkEndIsActualEnd(jsParts, ['<', '/','script','>']);
			//console.log('PreMature End:', prematureEnd===true);
				if(prematureEnd!==true){
						if(prematureEnd==-1){
							return [];
						}
					//console.log('Cutting down to size:', prematureEnd);
					jsParts.length=prematureEnd;
					myActualLength=9;
					let codeRestLength=jsParts.length;
						for(let i=0;i<codeRestLength;i++){
							myActualLength+=jsParts[i][1].length;
						}
				}
			//Recognise Regex/Comments & stitches them
			jsParts = myInterpreter.stitchRegexAndComments(jsParts);
			//basic components to basic components summarised by brackets
			jsParts = myInterpreter.summariseBrackets(jsParts);
				if(jsParts.length==3){
					console.warn('parseJS2(): Ended too soon');
				}
			jsParts = jsParts[0];
			//basic summarised components to lines
			jsParts = myInterpreter.separateLines(jsParts, true);
			
			console.log('JS-Parts');
			console.log(jsParts);
			
			//lines to plainText lines
			let plainTextJS = myInterpreter.simpleLinesJS2(jsParts)[0];
			//let plainTextJS=jsParts;
			
			//lines to classes
			jsParts = myInterpreter.toObjectJS_Part1(jsParts);
			console.log('toObjectJS_Part1()');
			console.log(jsParts);
			jsParts = myInterpreter.toObjectJS_Part2(jsParts);
			console.log('toObjectJS_Part2()');
			console.log(jsParts);
			jsParts = myInterpreter.toObjectJS_Part3(jsParts);
			console.log('toObjectJS_Part3()');
			console.log(jsParts);
				if(returnLength){
					return [plainTextJS, myActualLength];
				}else{
					return plainTextJS;
				}
		};
		/**
		 *  Checks whether or not the Endtag </ script> is at the end of the code
		 *  
		 *  @param [array] codeParts - code Parts from [extractLanguage2Parts]
		 *  @param [array] endTagParts String array e.g. ['<', '/','script','>']
		 *  @return true, if tag is at the end; [int] of position, if found before end
		*/
		myInterpreter.JS_checkEndIsActualEnd=function(codeParts, endTagParts){
			let pointer=0, codeLen=codeParts.length, found, inComment=0;
				while(pointer<codeLen){
						if(inComment==1 && codeParts[pointer][0]=='newline'){
							inComment=0;
						}else if(inComment==2 && codeParts[pointer-1][1]=='*' && codeParts[pointer][1]=='/'){
							inComment=0;
						}else{
							if(inComment==0 && codeParts[pointer][1]=='/'){
								if(codeParts[pointer+1][1]=='/'){
									//SingleLine
									inComment=1;
								}else if(codeParts[pointer+1][1]=='*'){
									//MultiLine-Comment / Documentation
									inComment=2;
								}
							}
							if(inComment==0 && codeParts[pointer][1]==endTagParts[0]){
								let i=1;
								found=true;
									while(found && i<endTagParts.length){
											if(pointer+i<codeLen && codeParts[pointer+i][1]==endTagParts[i]){
												found=true;
											}else{
												found=false;
											}
										i++;
									}
									if(found){
										//PreMature End
										return pointer-1;
									}
							}
						}
					pointer++;
				}
			return true;
		};
		/**
		 *  Summarises Regex Content, Comments and Strings
		 *  @param [array] codeParts - code Parts from [extractLanguage2Parts]
		 *  @param ?[boolean] processComments - Specifies whether comments are stitched
		 *  @param ?[boolean] processRegex - Specifies whether regex are stitched
		 *  @param ?[boolean] processStrings - Specifies whether strings are stitched
		 *  @return [array] code parts with combined Regex content, Comment and Strings
		 */
		myInterpreter.stitchRegexAndComments=function(codeParts, processSingleLineComments=true, processMultiLineComments=true, processDocumentationComments=true, processRegex=true, processStrings=true){
			let pointer=0, pointer2, inRegex, inComment, commentType, inString, lastNonWhiteSpaceChar=undefined;
				while(pointer<codeParts.length){
					// /abc/g
						if(codeParts[pointer][1]=='/'){
							if((processSingleLineComments || processMultiLineComments || processDocumentationComments) && codeParts[pointer+1]!=undefined && ['/','*'].indexOf(codeParts[pointer+1][1])>=0){ // /**/
								let comment;
								commentType=-1;
									if(codeParts.length>pointer+1){
										if(processSingleLineComments && codeParts[pointer+1][1]=='/'){
											//Single Line Comment - Search for next newLine
											commentType=0;
											comment='//';
										}else{
											if((processDocumentationComments || processMultiLineComments) && codeParts[pointer+1][1]=='*'){
												if(processDocumentationComments && codeParts.length>pointer+2 && codeParts[pointer+2][1]=='*'){
													//documentation Comment - Search for next */
													commentType=2;
													comment='/**';
												}else if(processMultiLineComments){
													//multiline Comment - Search for next */
													commentType=1;
													comment='/*';
												}
											}
										}
									}
									if(commentType>=0){
										pointer2=pointer+2;
										inComment=true;
											while(pointer2<codeParts.length && inComment){
												if((commentType==0 && codeParts[pointer2][0]=='newline') || (commentType>0 && codeParts[pointer2-1][1]=='*' && codeParts[pointer2][1]=='/')){
													inComment=false;
														if(commentType>0){
															comment=comment.substr(0,comment.length-1)+'*/';
														}
												}else{
													comment+=codeParts[pointer2][1];
													pointer2++;
												}
											}
										//console.log('Found '+['SingleLine-Comment','MultiLine-Comment','Documentation'][commentType]+' @', pointer, 'to:', pointer2, 'com:', comment);
										codeParts.splice(pointer,pointer2-pointer+(commentType==0?0:1), commentType==2?['documentation', comment]:['comment', comment, commentType]);
									}
							}else if(processRegex && (pointer==0 || ['number', 'word', 'string', 'meta'].indexOf(lastNonWhiteSpaceChar[0])==-1 && [')',']'].indexOf(lastNonWhiteSpaceChar[1])==-1)){
								//Regex
								let regex='';
								pointer2=pointer+1;
								inRegex=true;
									while(pointer2<codeParts.length && inRegex){
										if(codeParts[pointer2][1]=='/' && ['meta'].indexOf(codeParts[pointer2-1][0])==-1){
											inRegex=false;
										}else{
											regex+=codeParts[pointer2][1];
											pointer2++;
										}
									}
								regex='/'+regex+'/';
								pointer2++;
								inRegex=true;
									while(pointer2<codeParts.length && inRegex){
										if(codeParts[pointer2]!=undefined && ['word', 'string'].indexOf(codeParts[pointer2][0])>=0){
											regex+=codeParts[pointer2][1];
											pointer2++;
										}else{
											inRegex=false;
										}
									}
								//console.log('Found RegEx @', pointer, 'to:', pointer2, 'reg:', regex);
								codeParts.splice(pointer,pointer2-pointer, ['regex', regex]);
							}
						}else if(processStrings && codeParts[pointer][0]=='string'){
							//String
							let string='';
							pointer2=pointer+1;
							inString=codeParts[pointer][1];
								while(pointer2<codeParts.length && inString!=undefined){
									if(codeParts[pointer2][1]==inString && ['meta'].indexOf(codeParts[pointer2-1][0])==-1){
										string=inString+string+inString;
										inString=undefined;
										pointer2++;
									}else{
										string+=codeParts[pointer2][1];
										pointer2++;
									}
								}
							//console.log('Found String @', pointer, 'to:', pointer2, 'string:', string);
							codeParts.splice(pointer,pointer2-pointer, ['string', string]);
						}
						if(codeParts[pointer][0]!=='white space'){
							lastNonWhiteSpaceChar=codeParts[pointer];
						}
					pointer++;
				}
			return codeParts;
		};
		/**
		 *  Summarises Bracket Contents appropriately
		 *  @param [array] codeParts - code Parts from [extractLanguage2Parts]
		 *  @param ?[boolean] pointer - code Pointer offset, defaults to zero
		 *  @return [array] code parts with combined bracket content
		 */
		myInterpreter.summariseBrackets=function(codeParts, pointer=0){
			let ret = [];
				while(pointer<codeParts.length){
						if(codeParts[pointer][0]=='bracket'){
							if(['(', '[', '{'].indexOf(codeParts[pointer][1])>=0){
								//Opening Bracket - Start Reading
								let summarisedBracket = myInterpreter.summariseBrackets(codeParts, pointer+1);
								ret.push(codeParts[pointer].concat([summarisedBracket[0]]));
								pointer=summarisedBracket[1];
							}else{
								//Closing Bracket - Stop Reading
								return [ret, pointer, 'BracketEnded'];
							}
						}else{
							ret.push(codeParts[pointer]);
						}
					pointer++;
				}
			return [ret, pointer];
		};
		/**
		 *  Separates codeParts into Lines [delimiters or newline]
		 *  @param [array] codeParts - code Parts from [extractLanguage2Parts] or [summariseBrackets]
		 *  @param [boolean] useNewline - Specifies whether or not to include newlines as separators
		 *  @return [array] code parts separated by lines
		 */
		myInterpreter.separateLines=function(codeParts, useNewline){
			let lines = [[/*'line'*/]], numOfParts=codeParts.length;
				for(let i=0;i<numOfParts;i++){
					if((codeParts[i][0]=='delimiter' && myInterpreter.JS_LineDelimiters.indexOf(codeParts[i][1])>=0) || (useNewline?codeParts[i][0]=='newline':false)){
							if(codeParts[i][0]=='delimiter'){
								lines[lines.length-1].push(codeParts[i]);
							}
						lines.push([/*'line'*/]);
					}else{
							if(codeParts[i][0]=='bracket'){
								//Read Bracket contents
								codeParts[i][2] = myInterpreter.separateLines(codeParts[i][2], useNewline);
							}
						lines[lines.length-1].push(codeParts[i]);
					}
				}
			return lines;
		};
		/**
		 * Returns the plainText lines of code Parts
		 * @param [string] code - code Parts from [extractLanguage2Parts] or [summariseBrackets]
		 * @param [number] bracketID - start value for incrementing ID of Brackets
		 * @return [array[string]] plainText code
		 */
		myInterpreter.simpleLinesJS2=function(codeParts, bracketID=0){
			let lines = [''], numOfParts=codeParts.length;
				for(let i=0;i<numOfParts;i++){
					let numOfElements=codeParts[i].length;
					let lineOffset=undefined;
						for(let j=0;j<numOfElements;j++){
								if(lineOffset==undefined && codeParts[i][j][0]=='white space'){
									lineOffset=codeParts[i][j][1];
								}
								if(codeParts[i][j][0]=='bracket'){
									let brContent=myInterpreter.simpleLinesJS2(codeParts[i][j][2], bracketID);
									bracketID=brContent[1];
									brContent=brContent[0];
									let newLine=brContent.trim().indexOf('<br>')>=0;
										if(!newLine){
											brContent=brContent.replace(/^(&nbsp;)+/,'');
										}
									lines[lines.length-1]+='<span class="bracket" data-id="'+bracketID+'">'+codeParts[i][j][1]+'</span>'+(codeParts[i][j][1]=='{' && newLine?'<br>':'')+brContent+(codeParts[i][j][1]=='{' && newLine?'<br>'+(lineOffset==undefined?'':lineOffset):'')+'<span class="bracket" data-id="'+bracketID+'">'+(codeParts[i][j][1]=='('?')':(codeParts[i][j][1]=='['?']':'}'))+'</span>';
									bracketID++;
								}else{
									if(codeParts[i][j][0]!='newline'){
										/*if(codeParts[i][j][0]=='documentation'){
											codeParts[i][j][1]=codeParts[i][j][1].replaceAll(/\r?\n/g,'<br>');
										}*/
										if(j==0 && codeParts[i][j][0]=='white space'){
											//lines[lines.length-1]+='<span class="line_start_tabs">'+codeParts[i][j][1].replaceAll(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')+'</span>';
											lines[lines.length-1]+=codeParts[i][j][1];
										}else if(codeParts[i][j][0]=='definition'){
											lines[lines.length-1]+='<span class="definition">'+codeParts[i][j][1]+'</span>';
										}else if(codeParts[i][j][0]=='delimiter'){
											lines[lines.length-1]+='<span class="delimiter">'+codeParts[i][j][1]+'</span>';
										}else if(codeParts[i][j][0]=='number'){
											lines[lines.length-1]+='<span class="number">'+codeParts[i][j][1]+'</span>';
										}else if(codeParts[i][j][0]=='logic'){
											lines[lines.length-1]+='<span class="logic">'+codeParts[i][j][1]+'</span>';
										}else if(codeParts[i][j][0]=='operator'){
											lines[lines.length-1]+='<span class="operator">'+codeParts[i][j][1]+'</span>';
										}else if(['regex','comment','documentation', 'string'].indexOf(codeParts[i][j][0])>=0){
											lines[lines.length-1]+='<span class="'+codeParts[i][j][0]+'">'+mySplitScreenEditor.pacifyHTML(codeParts[i][j][1]).replaceAll(/\r?\n/g, '<br>')+'</span>';
										}else{
											let special = SSE.interpreter.JS_AddIfSpecialWord(codeParts[i][j][1], 'class', [undefined, 'htmlword', 'keyword', 'reservedword']);
											lines[lines.length-1]+='<span '+special+'>'+mySplitScreenEditor.pacifyHTML(codeParts[i][j][1])+'</span>';
										}
									}
								}
						}
					if(lines[lines.length-1].trim().length>0){
						lines.push('');
					}else{
						lines[lines.length-1].length=0;
					}
				}
				if(lines[lines.length-1].trim().length==0){
					lines.length=lines.length-1;
				}
			return [lines.join('<br>').replaceAll(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;'), bracketID];
		};
		/**
		 * Returns the class Objects of code Parts
		 * @param [array] codeLineParts - code Parts from [extractLanguage2Parts] or [summariseBrackets] as Lines
		 * @param ?[bool] evaluateTrailingData - parameter used internally; Decides whether more than one finding should be evaluated
		 * @param ?[bool] returnPointer - parameter used internally; if true, the pointer is returned
		 * @return [array] class Objects
		 */
		myInterpreter.toObjectJS_Part1=function(codeLineParts, evaluateTrailingData=true, returnPointer=false){
				if(codeLineParts==undefined){return;}
			let elements=[];
			let numOfLines=codeLineParts.length, documentation, pointer;
				for(let line=0;line<numOfLines;line++){
						if(codeLineParts[line].length==0){continue;}
					pointer=0;
					//skip leading whiteSpaces
						while(codeLineParts[line][pointer]!==undefined && codeLineParts[line][pointer][0]=='white space'){pointer++;}
						if(codeLineParts[line][pointer]==undefined){continue;}
						if(codeLineParts[line][pointer]!==undefined && codeLineParts[line][pointer][0]=='documentation'){
							//Documentation Found
							documentation=codeLineParts[line][pointer][1];
							elements.push({'type':'documentation', 'documentation':documentation});
							pointer++;
						}else{
							documentation=undefined;
						}
						if(codeLineParts[line][pointer]==undefined){continue;}
						if(codeLineParts[line][pointer][1]=='function' && codeLineParts[line][pointer][0]=='block'){ //function a(b){return 3;}
							//Function Found
							//Check for a name
							//TODO Add aync / static / etc.
							let i=pointer+1, name='';
								while(codeLineParts[line][i]!==undefined && codeLineParts[line][i][0]!=='bracket' && codeLineParts[line][i][1]!=='('){
									name+=codeLineParts[line][i][1];
									i++;
								}
							name=name.trim();
								if(name.length==0){
									name=undefined;
								}
							//Named Function
								if(documentation!==undefined){
									documentation=new myInterpreter.jsFunctionDocumentation(name, documentation);
								}
							let param = codeLineParts[line][i][2][0];
							let paramArr=[[]], paramLen=param.length, paramPointer=0;
								for(let i=0;i<paramLen;i++){
									if(param[i][0]=='delimiter'){
										paramArr[paramPointer]=myInterpreter.toObjectJS_Part1(paramArr[paramPointer]);
										paramPointer++;
										paramArr[paramPointer]=[];
									}else{
										paramArr[paramPointer].push([param[i]]);
									}
								}
							paramArr[paramPointer]=myInterpreter.toObjectJS_Part1(paramArr[paramPointer]);
							//Check for next bracket
							i++;
								while(codeLineParts[line][i]!==undefined && codeLineParts[line][i][0]!=='bracket' && codeLineParts[line][i][1]!=='{'){i++;}
							let content=[myInterpreter.toObjectJS_Part1(codeLineParts[line][i][2])];
							elements.push({'type':'function', 'name':name, 'parameter':paramArr, 'documentation':documentation, 'content':content});
							pointer=i+1;
						}else if(['let','var','const'].indexOf(codeLineParts[line][pointer][1])!==-1){ //let a = b;
							//Variable Definition Found
							let i=pointer+1, definer='';
								while(codeLineParts[line][i]!==undefined && codeLineParts[line][i][0]!=='definition'){
									definer+=codeLineParts[line][i][1];
									i++;
								}
							definer=definer.trim();
							let definition=codeLineParts[line].slice(i+1);
							definition=myInterpreter.toObjectJS_Part1([definition]);
							elements.push({'type':'variable', 'scope':codeLineParts[line][pointer][1], 'definer':definer, 'definition':definition});
							pointer=codeLineParts[line].length;
						}else if(codeLineParts[line][pointer][1]=='return'){ //return [a, b];
							//Return Value Found
							elements.push({'type':'return', 'value':myInterpreter.toObjectJS_Part1([codeLineParts[line].slice(pointer+1)])});
							pointer=codeLineParts[line].length;
						}else if(codeLineParts[line][pointer][1]=='class'){ //class;
							//Class Found
							let i=pointer+1, name='';
								while(codeLineParts[line][i]!==undefined && codeLineParts[line][i][0]!=='bracket' && codeLineParts[line][i][1]!=='{'){
									name+=codeLineParts[line][i][1];
									i++;
								}
							name=name.trim();
							let content = myInterpreter.toObjectJS_Part1(codeLineParts[line][i][2]);
							elements.push({'type':'class', 'name':name, 'content':content});
							pointer=i+1;
						}else if(['set', 'get'].indexOf(codeLineParts[line][pointer][1])!==-1){ //get val(){} set val(){}
							//Getter/Setter Found
							let myFunction = [['block', 'function']];
							elements.push(myInterpreter.toObjectJS_Part1([myFunction.concat(codeLineParts[line].slice(pointer+1,pointer+5))])[0]);
							elements[elements.length-1][codeLineParts[line][pointer][1]]=true;
							pointer+=6;
						}else if(codeLineParts[line][pointer][0]=='comment'){ // /*abc*/
							//Comment Found
							elements.push({'type':'comment', 'comment':codeLineParts[line][pointer][1]});
							pointer++;
						}else if(['operator','logic','definition'].indexOf(codeLineParts[line][pointer][0])!==-1){
							//Comment Found
							elements.push({'type':codeLineParts[line][pointer][0], 'value':codeLineParts[line][pointer][1]});
							pointer++;
						}else if(codeLineParts[line][pointer][0]=='block' && codeLineParts[line][pointer+1]!==undefined){ //if, while, for, ...
							//Block Found
//#####################################
//FIX: Doesn't include do{}while() Loop
//for await (){}
//#####################################
							let param;
								if(codeLineParts[line][pointer+1][1]=='('){
									param = myInterpreter.toObjectJS_Part1(codeLineParts[line][pointer+1][2]);
								}
							let content = myInterpreter.toObjectJS_Part1(codeLineParts[line][pointer+(param==undefined?0:1)+1][2]);
							elements.push({'type':'block', 'name':codeLineParts[line][pointer][1], 'parameter':param, 'content':content});
							pointer+=3;
						}else if(codeLineParts[line][pointer][0]=='word' && codeLineParts[line][pointer+1]!==undefined && codeLineParts[line][pointer+1][0]=='bracket' && codeLineParts[line][pointer+1][1]=='('){ //alert('Seven');
						//FIX: Check whether optional White Spaces are allowed between function name and parameter bracket
							let i=0;
								while(codeLineParts[line][pointer+i+2]!==undefined && ['white space','newline'].indexOf(codeLineParts[line][pointer+i+2][0])!==-1){
									i++;
								}
								if(codeLineParts[line][pointer+i+2]!==undefined && codeLineParts[line][pointer+i+2][0]=='bracket' && codeLineParts[line][pointer+i+2][1]=='{'){ //something(a){return a;};
									//Internal Function Definition
									let myFunction = [];
										if(documentation!==undefined){
											myFunction.push(['documentation', documentation]);
										}
									myFunction.push(['block', 'function']);
									elements.push(myInterpreter.toObjectJS_Part1([myFunction.concat(codeLineParts[line].slice(pointer,pointer+i+3))])[0]);
									pointer+=i+4;
								}else{ //alert('Seven');
									//Function Call Found
									let param = codeLineParts[line][pointer+1][2][0], paramArr=[[]];
										if(param!==undefined){
											let paramLen=param.length, paramPointer=0;
												for(let i=0;i<paramLen;i++){
													if(param[i][0]=='delimiter'){
														paramArr[paramPointer]=myInterpreter.toObjectJS_Part1([paramArr[paramPointer]]);
														paramPointer++;
														paramArr[paramPointer]=[];
													}else{
														paramArr[paramPointer].push(param[i]);
													}
												}
											paramArr[paramPointer]=myInterpreter.toObjectJS_Part1([paramArr[paramPointer]]);
										}
									elements.push({'type':'call', 'name':codeLineParts[line][pointer][1], 'parameter':paramArr});
									pointer+=2;
								}
						}else if(codeLineParts[line][pointer][0]=='word' && codeLineParts[line][pointer+1]!==undefined && codeLineParts[line][pointer+1][0]=='bracket' && codeLineParts[line][pointer+1][1]=='['){ //array[arrayIndex];
							//Array Call
							let param = codeLineParts[line][pointer+1][2][0], paramArr=[[]];
								if(param!==undefined){
									let paramLen=param.length, paramPointer=0;
										for(let i=0;i<paramLen;i++){
											if(param[i][0]=='delimiter'){
												paramArr[paramPointer]=myInterpreter.toObjectJS_Part1([paramArr[paramPointer]]);
												paramPointer++;
												paramArr[paramPointer]=[];
											}else{
												paramArr[paramPointer].push(param[i]);
											}
										}
									paramArr[paramPointer]=myInterpreter.toObjectJS_Part1([paramArr[paramPointer]]);
								}
							elements.push({'type':'array', 'name':codeLineParts[line][pointer][1], 'key':paramArr});
							
							pointer+=2;
						}else if(codeLineParts[line][pointer+1]!==undefined && codeLineParts[line][pointer+1][1]=='.'){
							//Object Call Found
							let myMethod = myInterpreter.toObjectJS_Part1([codeLineParts[line].slice(pointer+2)], false, true);
							elements.push({'type':'obj_call', 'object':codeLineParts[line][pointer], 'method':myMethod[0]});
							pointer=+3+myMethod[1];
/*

##########################################
# Add recognition of an array expression #
##########################################

a[0]
function(){return [0,2,4];}[1] // => 2
etc.

*/
						}else if(codeLineParts[line][pointer][0]=='bracket'){
							//Bracketed Content Found
							elements.push({'type':'bracket', 'bracket':codeLineParts[line][pointer][1], 'content':myInterpreter.toObjectJS_Part1(codeLineParts[line][pointer][2])});
							pointer++;
						}else{
							elements.push({'type':'essential', 'value':codeLineParts[line][pointer]});
							pointer++;
							//console.log('Line:',codeLineParts[line][pointer][0],codeLineParts[line].slice(pointer).flat());
							/*elements.push({'type':'line', 'content':codeLineParts[line]});
							pointer=codeLineParts[line].length;*/
						}
						//Continue Reading the line
						if(evaluateTrailingData && pointer<codeLineParts[line].length){
							let trailingData=codeLineParts[line].slice(pointer);
								if(trailingData.length==1 && trailingData[0][0]=='delimiter'){
									//EndOfLine -> Skip
									elements.push({'type':'delimiter','value':trailingData[0][1]});
								}else{
									//elements.push(myInterpreter.toObjectJS_Part1([trailingData]));
									trailingData=myInterpreter.toObjectJS_Part1([trailingData]);
										if(trailingData==undefined){
											return elements;
										}
									elements=elements.concat(trailingData.flat());
								}
						}
				}
				if(elements.length==0){
						if(returnPointer){return [undefined, 1];}
					return undefined;
				}
				if(returnPointer){return [elements, pointer];}
			return elements;
		};
		/**
		 * Returns stitched Objects
		 * @param [array] jsObjectsP1 - code Objects from [toObjectJS_Part1]
		 * @param ?[bool] useCommaAsDelimiter - Sets whether the Comma used as a delimiter in addition to the semi-colon
		 * @return [array] stitched Objects
		 */
		myInterpreter.toObjectJS_Part2=function(jsObjectsP1, useCommaAsDelimiter=false){
				if(jsObjectsP1==undefined){return;}
			let jsObjects=[[]];
			let numOfObjects=jsObjectsP1.length, documentation, pointer=0, line=0, addNewLine, addObject;
				while(pointer<numOfObjects){
					addNewLine=false;
					addObject=false;
						if((jsObjectsP1[pointer].type=='delimiter' && (useCommaAsDelimiter?true:(jsObjectsP1[pointer]['value']==';'))) || jsObjectsP1[pointer].type=='variable'){
							//Skip / End Current Line
								if(jsObjectsP1[pointer].type=='variable'){
									addObject=true;
								}
							addNewLine=true;
						}else if(pointer<numOfObjects-1 && ['function','block'].indexOf(jsObjectsP1[pointer].type)!==-1 && ['essential','bracket'].indexOf(jsObjectsP1[pointer+1].type)==-1){
							//Function Calls
							addObject=true;
							addNewLine=true;
							
							
							//Cancel out negative numbers obscuring a subtraction
/*						}else if(pointer>0 && jsObjectsP1[pointer].type=='number' && jsObjectsP1[pointer].value<0 && ['logic','definition','string'].indexOf(jsObjectsP1[pointer-1].type)==-1){
							//Subtraction hidden in negative number
							addObject=true;
							console.log('Found a weird Number Thing');
							console.log(jsObjectsP1[pointer-1], jsObjectsP1[pointer]);
*/





						}else if(jsObjectsP1[pointer].type=='number'){
							//Subtraction hidden in negative number
							addObject=true;
							console.log('Found a Number');
							console.log(jsObjectsP1[pointer]);

						}else if(jsObjectsP1[pointer].type=='bracket' && jsObjectsP1[pointer].bracket=='{'){
							//Check for Object Notation
							let isObjNotation=true, i=0, j, numOfProperties=jsObjectsP1[pointer].content.length;
							let definer, definerTag, propName, delimiter;
							let properties={};
								while(isObjNotation && i<numOfProperties){
									definer=(jsObjectsP1[pointer].content[i]!==undefined && jsObjectsP1[pointer].content[i].type=='essential' && ['string', 'word'].indexOf(jsObjectsP1[pointer].content[i]['value'][0])!==-1);
									definerTag=(jsObjectsP1[pointer].content[i+1]!==undefined && jsObjectsP1[pointer].content[i+1].type=='definition' && jsObjectsP1[pointer].content[i+1]['value']==':');
										if(definer || definerTag == false){
											isObjNotation=false;
										}else{
											propName=jsObjectsP1[pointer].content[i]['value'][1].trim();
											properties[propName]=[];
											j=i+2;
												while(j<numOfProperties && (jsObjectsP1[pointer].content[j].type!=='delimiter' && jsObjectsP1[pointer].content[j]['value']!==',')){
													properties[propName].push(jsObjectsP1[pointer].content[j]);
													j++;
												}
											isObjNotation=definer && definerTag && j<numOfProperties;
										}
									i=j+1;
								}
								if(isObjNotation){
									//Found Object
									//Convert Bracket to Object
									jsObjects[line].push({'type':'object', 'properties':properties});
								}else{
									//No Object Found
									addObject=true;
								}
						}else{
							addObject=true;
						}
						if(addObject){
								switch(jsObjectsP1[pointer].type){
									//Scan internals
									case 'function':
									case 'block':
									case 'bracket':
									case 'class':
										jsObjectsP1[pointer].content=myInterpreter.toObjectJS_Part2(jsObjectsP1[pointer].content[0]);
										break;
									case 'variable':
									//Only uses one line => [0]
										jsObjectsP1[pointer].definition=jsObjectsP1[pointer].definition==undefined?undefined:myInterpreter.toObjectJS_Part2(jsObjectsP1[pointer].definition)[0];
										break;
									case 'call':
										jsObjectsP1[pointer].parameter=myInterpreter.toObjectJS_Part2(jsObjectsP1[pointer].parameter)[0];
										break;
									case 'return':
									//Only uses one line => [0]
										jsObjectsP1[pointer]['value']=myInterpreter.toObjectJS_Part2(jsObjectsP1[pointer]['value'])[0];
										break;
									default:
										//Do nothing
								}
							jsObjects[line].push(jsObjectsP1[pointer]);
							//console.table(jsObjectsP1[pointer]);
						}
						if(addNewLine){
							line++;
							jsObjects.push([]);
						}
					pointer++;
				}
				if(jsObjects[line].length==0){
					//jsObjects.pop();
				}
			return jsObjects;
		}
		/**
		 * Returns JS-Statements
		 * @param [array] jsObjectsP2 - stitched Objects from [toObjectJS_Part2]
		 * @return [array] JS-Statements
		 */
let looper=100000;
		myInterpreter.toObjectJS_Part3=function(jsObjectsP2){
looper--;
	if(looper<=0){
		return;
	}
				if(jsObjectsP2==undefined){return;}
			let jsStatements=[[]];
			let numOfLines=jsObjectsP2.length, line=0, numOfObjects, pointer, operatorList;
				while(line<numOfLines){
					//Walk through Objects and assert Operator Precedence & Associativity
					//@see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
					numOfObjects=jsObjectsP2[line].length;
					operatorList=[];
					pointer=0;
						while(pointer<numOfObjects){
								if(['operator','logic','definition'].indexOf(jsObjectsP2[line][pointer].type)!==-1){
									//[Index, Operator Type]
									operatorList.push([pointer, jsObjectsP2[line][pointer].value]);
								}
								switch(jsObjectsP2[line][pointer].type){
									//Scan internals
									case 'function':
									case 'block':
									case 'bracket':
									case 'class':
										jsObjectsP2[line][pointer].content=myInterpreter.toObjectJS_Part3(jsObjectsP2[line][pointer].content);
										break;
									case 'variable':
										jsObjectsP2[line][pointer].definition=myInterpreter.toObjectJS_Part3(jsObjectsP2[line][pointer].definition);
										break;
									case 'call':
										jsObjectsP2[line][pointer].parameter=myInterpreter.toObjectJS_Part3(jsObjectsP2[line][pointer].parameter);
										break;
									case 'return':
										jsObjectsP2[line][pointer]['value']=myInterpreter.toObjectJS_Part3(jsObjectsP2[line][pointer]['value']);
										break;
									default:
										//Do nothing
								}
							pointer++;
						}
						if(operatorList.length>0){
							console.log('Found Operators @', line, ':');
							console.table(operatorList);
						}
					line++;
				}
			return jsStatements;
		}




		/**
		 * Goes through code properly and returns the stitched parts
		 * @param [string] code - CSS Code, without '<style></style>'
		 * @return [array] code elements
		 */
		myInterpreter.parseCSS2=function(code){
			//Code to basic components
			let cssParts = myInterpreter.extractLanguage2Parts(code, myInterpreter.pCSS_LANGUAGE, myInterpreter.pCSS_LANGUAGE_TYPE, myInterpreter.pCSS_Block_Types, true);
			//Recognise Regex/Comments & stitches them
			cssParts = myInterpreter.stitchRegexAndComments(cssParts, false, true, false, false, true);
			//basic components to basic components summarised by brackets
			cssParts = myInterpreter.summariseBrackets(cssParts)[0];
			//basic summarised components to lines
			cssParts = myInterpreter.separateLines(cssParts, true);
			//lines to plainText lines
			let plainTextCSS = myInterpreter.simpleLinesCSS2(cssParts);
			//lines to classes
			//cssParts = myInterpreter.toObjectCSS(cssParts);
			console.log('CSS-Part');
			console.log(cssParts);

			return plainTextCSS;
		};
		/**
		 * Returns the plainText lines of code Parts
		 * @param [string] code - CSS, without '<style></style>'
		 * @return [array[string]] plainText code
		 */
		myInterpreter.simpleLinesCSS2=function(codeParts){
			let lines = [''], numOfParts=codeParts.length;
				for(let i=0;i<numOfParts;i++){
					let numOfElements=codeParts[i].length;
					let lineOffset=undefined;
						for(let j=0;j<numOfElements;j++){
								if(lineOffset==undefined && codeParts[i][j][0]=='white space'){
									lineOffset=codeParts[i][j][1];
								}
								if(codeParts[i][j][0]=='bracket'){
									let brContent=myInterpreter.simpleLinesCSS2(codeParts[i][j][2]);
									let newLine=true;//brContent.trim().indexOf('<br>')>=0;
										if(!newLine){
											brContent=brContent.replace(/^(&nbsp;)+/,'');
										}
									lines[lines.length-1]+='<span class="bracket">'+codeParts[i][j][1]+'</span>'+(codeParts[i][j][1]=='{' && newLine?'<br>':'')+brContent+(codeParts[i][j][1]=='{' && newLine?'<br>'+(lineOffset==undefined?'':lineOffset):'')+'<span class="bracket">'+(codeParts[i][j][1]=='('?')':(codeParts[i][j][1]=='['?']':'}'))+'</span>';
								}else{
									if(codeParts[i][j][0]!='newline'){
										if(j==0 && codeParts[i][j][0]=='white space'){
											lines[lines.length-1]+=codeParts[i][j][1];
										}else if(['comment','documentation', 'string'].indexOf(codeParts[i][j][0])>=0){
											lines[lines.length-1]+='<span class="'+codeParts[i][j][0]+'">'+mySplitScreenEditor.pacifyHTML(codeParts[i][j][1]).replaceAll(/\r?\n/g, '<br>')+'</span>';
										}else if(codeParts[i][j][0]=='number'){
											lines[lines.length-1]+='<span class="'+codeParts[i][j][0]+'">'+mySplitScreenEditor.pacifyHTML(codeParts[i][j][1])+'</span>';
										}else if(codeParts[i][j][0]=='word' && codeParts[i][j+1]!==undefined && codeParts[i][j+1][0]=='definition'){
											lines[lines.length-1]+='<span class="definer">'+mySplitScreenEditor.pacifyHTML(codeParts[i][j][1])+'</span>';
										}else{
											console.log('CSS-Word', codeParts[i][j].join(', '));
											//let special = SSE.interpreter.JS_AddIfSpecialWord(codeParts[i][j][1], 'class', [undefined, 'htmlword', 'keyword', 'reservedword']);
											let special='';
											lines[lines.length-1]+='<span '+special+'>'+mySplitScreenEditor.pacifyHTML(codeParts[i][j][1])+'</span>';
										}
									}
								}
						}
					if(lines[lines.length-1].trim().length>0){
						lines.push('');
					}else{
						lines[lines.length-1].length=0;
					}
				}
				if(lines[lines.length-1].trim().length==0){
					lines.length=lines.length-1;
				}
			return lines.join('<br>').replaceAll(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;');
		};




		/**
		 * Goes through code properly and returns the stitched parts
		 * @param [string] code - HTML / XML Code
		 * @return [array] code elements
		 */
		myInterpreter.parse_HTML_XML=function(code, pointer=0){
			let tagList = myInterpreter.extractLanguage2Parts(code, myInterpreter.HTML_LANGUAGE, myInterpreter.HTML_LANGUAGE_TYPE, [], true);
			tagList=myInterpreter.elementise_HTML_XML(tagList);
			let str='', tagListLen=tagList.length, lineOffset=0;
			tagList=myInterpreter.summariseElements_HTML_XML(tagList);
			tagList=myInterpreter.simpleLines_HTML_XML(tagList[0]);
			return tagList;
		};
		/**
		 * Summarises HTML/XML elements
		 * @param [string] codeParts - HTML / XML Code Parts
		 * @param ?[number] pointer - [internal] Code pointer
		 * @return [array] code elements
		 */
		myInterpreter.summariseElements_HTML_XML=function(codeObj, pointer=0, level=0){
			let elementList=[], codeLen=codeObj.length, pointer2;
				while(pointer<codeLen){
						switch(codeObj[pointer].type){
							case 'open':
							//Parent
								let subElements=myInterpreter.summariseElements_HTML_XML(codeObj, pointer+1, level+1);
									if(codeObj.inner==undefined){
										codeObj.inner=[];
									}
								codeObj[pointer].inner.push(subElements[0]);
								elementList.push(codeObj[pointer]);
								pointer=subElements[1];
								break;
							case 'close':
							//End Parent
								return [elementList, pointer];
							default:
								elementList.push(codeObj[pointer]);
						}
					pointer++;
				}
			return [elementList, pointer];
		};
		/**
		 * Creates HTML/XML elements from codeParts
		 * @param [string] codeParts - HTML / XML Code Parts
		 * @param ?[number] pointer - [internal] Code pointer
		 * @return [array] code elements
		 */
		myInterpreter.elementise_HTML_XML=function(codeParts, pointer=0){
			let tagList = [], codeLen=codeParts.length, pointer2;
			let text='', tagname, tagged, content;
			let inLoop, specialBlock, special_Blocks=['style','script'];
				while(pointer<codeLen){
						if(codeParts[pointer][0]=='bracket'){
							if(text.length>0){
								tagList[tagList.length-1].inner.push(text);
								//console.log('Adding Text:',text);
								text='';
							}
							if(codeParts[pointer][1]=='<'){
								//Opening Element
								pointer2=pointer+1;
								inLoop=true;
								tagname='';
								tagged=false;
								content='';
									while(pointer2<codeLen && inLoop){
										if(codeParts[pointer2][0]=='bracket' && codeParts[pointer2][1].substr(-1)=='>'){
											inLoop=false;
												if(tagname=='?php'){
													//console.log('Stopping PHP @', codeParts[pointer2][1], content);
												}
										}else{
												if(tagname=='?php'){
													//console.log('Reading PHP', codeParts[pointer2][1]);
												}
												if(!tagged){
													if(codeParts[pointer2][0]=='white space'){
														tagged=true;
													}else{
														tagname+=codeParts[pointer2][1].toLowerCase();
													}
												}else{
													//Optional Parsing for attributes
													content+=codeParts[pointer2][1];
												}
											pointer2++;
										}
									}
								specialBlock=special_Blocks.indexOf(tagname);
									if(!inLoop){
										tagList.push({type:'open', name:tagname, attributes:content, inner:[]});
										//console.log('Found Element:', tagList[tagList.length-1]);
											if(codeParts[pointer2][1].length==1 && myInterpreter.HTML_Single_Elements.indexOf(tagname)==-1){
												// <div id="">abc</div>
												//Contents coming up
												//console.log('Further content coming up');
													if(specialBlock==0){ //CSS
														//console.log('CSS-Block');
													}else if(specialBlock==1){ //JS
														let js='', codeRestLength=codeParts.length;
														let myAttributes = myInterpreter.getTagAttributes(content);
														let tagListID = tagList.length-1;
														pointer2++;
															for(let i=pointer2;i<codeRestLength;i++){
																js+=codeParts[i][1];
															}
														let scriptContent=myInterpreter.parseJS2(js, true);
														//console.log('JS-Block', scriptContent[0]);
														tagList[tagList.length-1].inner.push(scriptContent[0]);
															while(scriptContent[1]>0){
																scriptContent[1]-=codeParts[pointer2][1].length;
																pointer2++;
															}
														//console.log('Starting after JS @', pointer2, codeParts[pointer2], codeParts[pointer2+1]);
														//pointer2=scriptContent[1]-1;
															if(myAttributes['src']!==undefined){
																//Loading External Script
																tagList[tagListID].type='self-contained';
															}else{
																tagList.push({type:'close', name:tagname, attributes:'', inner:[]});
															}
													}
											}else{
													if(tagList[tagList.length-1].name=='!doctype'){
														tagList[tagList.length-1].name='!DOCTYPE';
													}
												tagList[tagList.length-1].type='self-contained';
												//<br>, <img src="" alt="" />, <br />
												//Self closing Element
											}
										//pointer2++;
									}else{
										console.warn('Parsing Error: Element not closed @', pointer);
									}
								pointer=pointer2;
							}else if(codeParts[pointer][1]=='</'){
							//}else{
								//Closing Bracket
								pointer2=pointer+1;
								inLoop=true;
								tagname='';
								tagged=false;
								content='';
									while(pointer2<codeLen && inLoop){
										if(codeParts[pointer2][0]=='bracket' && codeParts[pointer2][1].substr(-1)=='>'){
											inLoop=false;
										}else{
												if(!tagged){
													if(codeParts[pointer2][0]=='white space'){
														tagged=true;
													}else{
														tagname+=codeParts[pointer2][1].toLowerCase();
													}
												}else{
													//Optional Parsing for attributes
													content+=codeParts[pointer2][1];
												}
											pointer2++;
											
										}
									}
									if(!inLoop){
										tagList.push({type:'close', name:tagname, attributes:content, inner:[]});
										//console.log('Closing', tagname);
									}
									if(tagList[tagList.length-2].name=='style'){
										tagList[tagList.length-2].inner=[myInterpreter.parseCSS2(tagList[tagList.length-2].inner[0])];
									}
								pointer=pointer2;
							}
						}else if(codeParts[pointer][0]=='comment' && codeParts[pointer][1]=='<!--'){
							pointer2=pointer+1;
							inLoop=true;
							content='';
								while(pointer2<codeLen && inLoop){
									if(codeParts[pointer2][0]=='comment' && codeParts[pointer2][1]=='-->'){
										inLoop=false;
									}else{
										content+=codeParts[pointer2][1];
										pointer2++;
									}
								}
							tagList.push({type:'self-contained', name:'comment', attributes:content, inner:[]});
							pointer=pointer2;
						}else{
							text+=codeParts[pointer][1];
						}
					pointer++;
				}
				if(text.length>0){
					tagList[tagList.length-1].inner.push(text);
				}
			return tagList;
		};
		myInterpreter.simpleLines_HTML_XML=function(codeObj, depth=0){
			let codeLen=codeObj.length, str='', pointer=0;
				while(pointer<codeLen){
					if(Array.isArray(codeObj[pointer])){
						str+=myInterpreter.simpleLines_HTML_XML(codeObj[pointer],depth+1);
					}else if(codeObj[pointer]==undefined){
						//Skip
					}else{
							switch(codeObj[pointer].type){
								case 'self-contained':
										if(codeObj[pointer].name=='comment'){
											str+=('&nbsp;&nbsp;'.repeat(depth))+'<p class="comment">&lt;!--'+mySplitScreenEditor.pacifyHTML(codeObj[pointer].attributes)+'--&gt;</p>';
										}else{
											str+=('&nbsp;&nbsp;'.repeat(depth))+'<span class="keyword">&lt;'+codeObj[pointer].name+'</span>'+(codeObj[pointer].attributes.length==0?'':' '+codeObj[pointer].attributes)+'<span class="keyword">'+(['br','!DOCTYPE'].indexOf(codeObj[pointer].name)==-1?' /':'')+'&gt;</span>';
										}
									break;
								case 'open':
									str+=('&nbsp;&nbsp;'.repeat(depth))+'<span class="keyword">&lt;'+codeObj[pointer].name+'</span>'+(codeObj[pointer].attributes.length==0?'':' '+codeObj[pointer].attributes)+'<span class="keyword">&gt;</span>';
										if(Array.isArray(codeObj[pointer].inner)){
											let innerCode=myInterpreter.simpleLines_HTML_XML(codeObj[pointer].inner, depth+1);
												if(innerCode.length>0){
													str+='<br>'+innerCode;
												}
										}
									str+=('&nbsp;&nbsp;'.repeat(depth))+'<span class="keyword">&lt;/'+codeObj[pointer].name+'&gt;</span>';
									break;
								default: //Text
									let text = codeObj[pointer].trim();
										if(text.length>0){
											//text=text.replaceAll('<!--', '&lt;!--').replaceAll('-->', '--&gt;');
											str+=('&nbsp;&nbsp;'.repeat(depth))+'<span class="text">'+text+'</span>';
										}
							}
						str+='<br>';
					}
					pointer++;
				}
			return str;
		};











		myInterpreter.parsePHP2=function(){
			//Scan for php block
			//<?php ?>
			//Process PHP
			//Then scan as HTML
		};




		/**
		 * Interprets and merges a given Tag-Tree
		 * @param [tagTree] stitchedJS - a JS Tag-Tree
		 * @return [array] HTML Representation of the Tag Tree
		 */
		myInterpreter.interpretStitchedJS=function (stitchedJS){
			let js=[];
			stitchedJS.forEach(function(jsElem){
				if(Array.isArray(jsElem)){
					js.push(jsElem.join(', ')+';');
				}else{
					//js.push(['Object Found', jsElem.type, jsElem.name, jsElem]);
					js.push(jsElem.html(0,'&nbsp;')+';');
				}
			});
			return js;
		};
		/**
		 * Stitches the separate parts of language Fragments (from extractLanguage2Parts()) to JSElements
		 * @param [array] languageExtractedParts - language Fragments (extractLanguage2Parts)
		 * @param ?[int] pointer - [internal] starting point in languageExtractedParts
		 * @param ?[int] bracketing - [internal] bracket Counter
		 * @return [int, array] Returns a pointer and a Tag-Tree
		 */
		myInterpreter.stitchJS=function (languageExtractedParts, pointer=0, bracketing=1){
			let stitched=[], ret, currentStatement=[];
			let myStatement = new myInterpreter.jsStatement();
			let myFunction;
			let myFunctionCall;
			let myBlock;
			let myVar;
	//let randomID=Math.floor(Math.random()*500);
	//console.log('Running through @',pointer,randomID);
				while(pointer<languageExtractedParts.length && bracketing>0){
						if(languageExtractedParts[pointer][0]=='block'){
							if(languageExtractedParts[pointer][1]=='function'){
	//console.log('-'.repeat(bracketing-1)+'Found Function@',pointer,randomID);
								myFunction=new myInterpreter.jsFunction();
								myFunction.name=languageExtractedParts[pointer+1][0]=='word'?languageExtractedParts[pointer+1][1]:undefined;
									if(pointer-1>=0 && languageExtractedParts[pointer-1][0]=='documentation'){
										myFunction.documentation=new myInterpreter.jsFunctionDocumentation(myFunction.name, languageExtractedParts[pointer-1][1]);
									}
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+(myFunction.name==undefined?1:2), bracketing+1);
								myFunction.param=ret[1][0];
								//myFunction.param.delimiter=',';
								pointer=ret[0];
	//console.log('-'.repeat(bracketing-1)+'After Param @', pointer, languageExtractedParts[pointer],randomID);
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer, bracketing+1)
								myFunction.statements=ret[1][0];
								pointer=ret[0]-1;
	//console.log('-'.repeat(bracketing-1)+'After Statements @', pointer, languageExtractedParts[pointer],randomID);
									if(myStatement.parts.length>0){
										//currentStatement.push(myFunction);
										myStatement.parts.push(myFunction);
									}else{
										stitched.push(myFunction);
									}
							}else if(['if','else'].indexOf(languageExtractedParts[pointer][1])!==-1){
	//console.log('-'.repeat(bracketing-1)+'Found '+languageExtractedParts[pointer][1]+(languageExtractedParts[pointer+1][1]=='if'?'If':''));
								myBlock=new myInterpreter.jsBlock();
								myBlock.name=languageExtractedParts[pointer][1]+(languageExtractedParts[pointer][1]=='else' && languageExtractedParts[pointer+1][1]=='if'?'If':'');
								myBlock.type=myBlock.name;
								let dontSkipCondition=true;
									if(languageExtractedParts[pointer][1]=='else'){
											if(languageExtractedParts[pointer+1][1]=='{'){
												dontSkipCondition=false;
											}
										pointer++;
									}
									if(dontSkipCondition){
										ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
										myBlock.param=ret[1][0];
										pointer=ret[0];
	//console.log('-'.repeat(bracketing-1)+'After Condition @', pointer, languageExtractedParts[pointer]);
									}else{
										myBlock.param=undefined;
									}
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer, bracketing+1)
								myBlock.statements=ret[1][0];
								pointer=ret[0]-1;
	//console.log('-'.repeat(bracketing-1)+'After Statements @', pointer, languageExtractedParts[pointer]);
								stitched.push(myBlock);
							}else if(languageExtractedParts[pointer][1]=='for'){
	//console.log('-'.repeat(bracketing-1)+'Found For');
								myBlock=new myInterpreter.jsBlock();
								myBlock.name=languageExtractedParts[pointer][1];
								myBlock.type=myBlock.name;
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
								myBlock.param=ret[1][0];
								pointer=ret[0];
	//console.log('-'.repeat(bracketing-1)+'After Condition @', pointer, languageExtractedParts[pointer]);
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer, bracketing+1)
								myBlock.statements=ret[1][0];
								pointer=ret[0]-1;
	//console.log('-'.repeat(bracketing-1)+'After Statements @', pointer, languageExtractedParts[pointer]);
								stitched.push(myBlock);
							}else if(languageExtractedParts[pointer][1]=='switch'){
	//console.log('-'.repeat(bracketing-1)+'Found Switch');
								myBlock=new myInterpreter.jsBlock();
								myBlock.name=languageExtractedParts[pointer][1];
								myBlock.type=myBlock.name;
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
								myBlock.param=ret[1][0];
								pointer=ret[0];
	//console.log('-'.repeat(bracketing-1)+'After Condition @', pointer, languageExtractedParts[pointer]);
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer, bracketing+1)
								myBlock.statements=ret[1][0];
								pointer=ret[0]-1;
	//console.log('-'.repeat(bracketing-1)+'After Statements @', pointer, languageExtractedParts[pointer]);
								stitched.push(myBlock);
							}else if(languageExtractedParts[pointer][1]=='while'){
	//console.log('-'.repeat(bracketing-1)+'Found While');
								myBlock=new myInterpreter.jsBlock();
								myBlock.name=languageExtractedParts[pointer][1];
								myBlock.type=myBlock.name;
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
								myBlock.param=ret[1][0];
								pointer=ret[0];
	//console.log('-'.repeat(bracketing-1)+'After Condition @', pointer, languageExtractedParts[pointer]);
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer, bracketing+1)
								myBlock.statements=ret[1][0];
								pointer=ret[0]-1;
	//console.log('-'.repeat(bracketing-1)+'After Statements @', pointer, languageExtractedParts[pointer]);
								stitched.push(myBlock);
							}else if(languageExtractedParts[pointer][1]=='do'){
	//console.log('-'.repeat(bracketing-1)+'Found Do-While');
								myBlock=new myInterpreter.jsBlock();
								myBlock.name=languageExtractedParts[pointer][1];
								myBlock.type=myBlock.name;
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
								myBlock.statements=ret[1][0];
								pointer=ret[0];
	//console.log('-'.repeat(bracketing-1)+'After Statements @', pointer, languageExtractedParts[pointer]);
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1)
								myBlock.param=ret[1][0];
								pointer=ret[0]-1;
	//console.log('-'.repeat(bracketing-1)+'After Condition @', pointer, languageExtractedParts[pointer]);
								stitched.push(myBlock);
							}else{
	//console.log('-'.repeat(bracketing-1)+'checking for Block');
								myBlock=new myInterpreter.jsBlock();
								myBlock.name=languageExtractedParts[pointer][1];
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
								myBlock.statements=ret[1][0];
								pointer=ret[0];
								stitched.push(myBlock);
	//console.log('-'.repeat(bracketing-1)+'Found '+languageExtractedParts[pointer][1]+'-Block');
							}
						}else if(languageExtractedParts[pointer][0]=='bracket'){
							if(['(', '[', '{'].indexOf(languageExtractedParts[pointer][1])>=0){
	//console.log('-'.repeat(bracketing-1)+'checking for Bracket', languageExtractedParts[pointer][1],'@',pointer,randomID);
								ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
								//currentStatement.push({type:'bracket', bracket:languageExtractedParts[pointer][1], contents:ret[1]});
								myBracket=new myInterpreter.jsBracket(languageExtractedParts[pointer][1]);
								myBracket.contents=ret[1];
								myStatement.parts.push(myBracket);
								pointer=ret[0];
	//console.log('-'.repeat(bracketing-1)+'Found Bracket', languageExtractedParts[pointer-1][1],'@',pointer,randomID);
									if(bracketing>1){
										bracketing=0;
										pointer--;
									}
							}else if(bracketing>1){
								bracketing=0;
							}else{
								//currentStatement.push(languageExtractedParts[pointer][1]);
								myStatement.parts.push(languageExtractedParts[pointer][1]);
							}
						}else if(languageExtractedParts[pointer][0]=='delimiter' /*&& languageExtractedParts[pointer][1]==';'*/){
							stitched.push(myStatement);
							myStatement=new myInterpreter.jsStatement();
							//stitched.push(currentStatement);
							//currentStatement=[];
						}else if(languageExtractedParts[pointer][0]=='documentation'){
							//Do nothing
						}else{
							//stitched.push('Not Processed: '+ languageExtractedParts[pointer][0] + ' => ' + languageExtractedParts[pointer][1]);
								if(pointer+1<languageExtractedParts.length && languageExtractedParts[pointer+1][1]=='(' && languageExtractedParts[pointer][0]!='operator'){
									//Function Call
									myFunctionCall=new myInterpreter.jsFunctionCall();
									myFunctionCall.name=languageExtractedParts[pointer][1];
									ret=myInterpreter.stitchJS(languageExtractedParts, pointer+1, bracketing+1);
									myFunctionCall.param=ret[1][0];
									pointer=ret[0]-1;
									//currentStatement.push(myFunctionCall);
									myStatement.parts.push(myFunctionCall);
	//console.log('-'.repeat(bracketing-1)+'Function Call', languageExtractedParts[pointer][1]);
								}else if(myStatement.parts.length==1 && (languageExtractedParts[pointer-1][1]=='let' || languageExtractedParts[pointer-1][1]=='var' || languageExtractedParts[pointer-1][1]=='static' || languageExtractedParts[pointer-1][1]=='const')){
									//TODO: add private Fields: '#height = 0', 'this.#height = 1'
									//Variable declaration
									//currentStatement.push({type:'variable', name:languageExtractedParts[pointer][1]});
									
									myVar= new myInterpreter.jsVariable();
									myVar.name=languageExtractedParts[pointer][1];
									myStatement.parts.push(myVar);
									myStatement.type='definition';
									myStatement.name=myVar.name;
									
	//console.log('-'.repeat(bracketing-1)+'Found Variable', languageExtractedParts[pointer][1]);
								}else{
									
									//TODO: Check for '=' and ':'
									
									//currentStatement.push(languageExtractedParts[pointer][1]);
									myStatement.parts.push(languageExtractedParts[pointer]);
	//console.log('-'.repeat(bracketing-1)+'Misc',languageExtractedParts[pointer][0], languageExtractedParts[pointer][1]);
								}
						}
					pointer++;
				}
			//return languageExtractedParts;
				if(myStatement.parts.length>0){
					//stitched.push(currentStatement);
					stitched.push(myStatement);
	//console.log('-'.repeat(bracketing+1)+'Added Rest',currentStatement.join(' | '));
				}
			return [pointer, stitched];
		};
		/**
		 * Separates Language into it's Components
		 * @param [string] code - Source Code
		 * @param [REGEX] languagePartRegex - Regular Expression for each language Component, corresponding to the positions in [languageTypes]
		 * @param [Enum] languageTypes - Enumeration of language Components and specified numbers
		 * @param [array] language_Block_Types - Array that includes all elements that define code blocks (bracketed areas, loops, ...)
		 * @param ?[boolean] keepWhiteSpaces - Specifies whether or not white spaces (Space, Tab, ...) should be included
		 * @return [array] Returns an Array of [Description, Component]
		 * @throws Error Message in Console, when an Unknown Character is found, not matching [languagePartRegex]
		 */
		myInterpreter.extractLanguage2Parts=function (code, languagePartRegex, languageTypes, language_Block_Types, keepWhiteSpaces=false){
			//TODO: change the label from Strings to Numbers (Index of languagePartRegex), so you can use the one definition and don't have unneccessary spelling accidents
			let language=[], currentPart=[], languagePart;
			//code=code.replaceAll(/\s*\n\s*/g,'').trim();
			let recusionLen=code.length, recursion=false;
			let descriptor, isMeta=false, isLiteral, inString=undefined, inDocumentation=false;
				while(code.length>0 && !recursion){
					isLiteral=false;
					languagePart=code.match(languagePartRegex);
						if(languagePart==null){
							console.warn('Unknown Char: '+code[0]);
							code=code.substr(1);
							continue;
						}
						if(isMeta){
							descriptor='literal';
							isMeta=false;
							isLiteral=true;
						}else if(languagePart[languageTypes._null]!=undefined){
							descriptor='null';
						}else if(languagePart[languageTypes._boolean]!=undefined){
							descriptor='boolean';
						}else if(languagePart[languageTypes._number]!=undefined){
							descriptor='number';
						}else if(languagePart[languageTypes._word]!=undefined){
							descriptor='word';
								if(language_Block_Types.indexOf(languagePart[languageTypes._word].toLowerCase())!==-1){
									descriptor='block';
									languagePart[languageTypes._word]=languagePart[languageTypes._word].toLowerCase();
								}
						}else if(languagePart[languageTypes._brackets]!=undefined){
							descriptor='bracket';
						}else if(languagePart[languageTypes._delimiters]!=undefined){
							descriptor='delimiter';
						}else if(languagePart[languageTypes._strings]!=undefined){
							descriptor='string';
								/*if(inString==undefined){
									inString=languagePart[languageTypes._strings];
								}else{
									inString=undefined;
								}*/
						}else if(languagePart[languageTypes._whitespaces]!=undefined){
							descriptor='white space';
						/*}else if(languagePart[languageTypes._documentation]!=undefined){
							descriptor='documentation';
								if(languagePart[0]=='/**'){
									inDocumentation=true;
								}else{
									inDocumentation=false;
								}*/
						}else if(languagePart[languageTypes._logic]!=undefined){
							descriptor='logic';
						}else if(languagePart[languageTypes._definers]!=undefined){
							descriptor='definition';
						}else if(languagePart[languageTypes._operators]!=undefined){
							descriptor='operator';
						}else if(languagePart[languageTypes._meta]!=undefined){
							descriptor='meta';
							isMeta=true;
						}else if(languagePart[languageTypes._misc]!=undefined){
							descriptor='misc';
						}else if(languagePart[languageTypes._newline]!=undefined){
							descriptor='newline';
						}else if(languagePart[languageTypes._comment]!=undefined){
							descriptor='comment';
						}else{
							descriptor='';
							console.warn(languagePart[0], code.match(languagePartRegex));
						}
						/*if((languagePart[languageTypes._strings]!==undefined && inString==undefined) || (inString && ((languagePart[languageTypes._strings]==undefined) || isLiteral))){
							//If String, concatenate
							language[language.length-1][1]+=languagePart[0];*/
						/*}else if((languagePart[languageTypes._documentation]!==undefined && !inDocumentation) || (inDocumentation && languagePart[languageTypes._documentation]==undefined)){
							//If documentation, concatenate
							language[language.length-1][1]+=languagePart[0];
						}else*/ if(languagePart[languageTypes._whitespaces]==undefined || keepWhiteSpaces){
							//If not wanted whiteSpaces, add
							language.push([descriptor,languagePart[0]]);
						}
						if(languagePart[0].length==0){
							recusionLen=recusionLen-code.length
							recursion=true;
							console.warn('Recursion! @'+recusionLen);
						}
					code=code.substr(languagePart[0].length);
				}
			return language;
		};
		/**
		 * Parses PHP to Tag Tree
		 * @param [string] code - Source Code
		 * @return [array] Tag Tree
		 */
		//TODO: add stitchPHP and interpretStitchedPHP Functions
		myInterpreter.parsePHP=function (code){
			//Add Function Structures
			let startTagIndex=code.indexOf('<?php')+5;
			let startTag=code.substring(1, startTagIndex);
			let endTagIndex = code.match(myInterpreter.PHP_BLOCK)[0].length-2;
			let php=code.substring(startTagIndex+1, endTagIndex).trim();
			php=myInterpreter.extractLanguage2Parts(php, myInterpreter.PHP_LANGUAGE, myInterpreter.PHP_LANGUAGE_TYPE, myInterpreter.PHP_Block_Types);
			//return [php, endTagIndex+2];
	//console.log('Language Parts', js);
			php=myInterpreter.stitchJS(php)[1];
			//code='/** Documentation for the function abc */ function abc ( param1 , param2 ) { let i = 0; if (i != -1) { i = 3; } else if(i<0) { i = -2; } else { i = 2; } return param1 + param2; } for(let j=0;j<5;j++){i++;}';
			//code='function abc(param1){let i=0;while(i<10){something;i++;}do{somethingElse;i++;}while(i<20)}';
			//code='try{something}catch{error}finally{ending}';
	/*console.log('Code', code);
	code=myInterpreter.extractLanguage2Parts(code, myInterpreter.JS_LANGUAGE, myInterpreter.JS_LANGUAGE_TYPE, myInterpreter.JS_Block_Types);
	console.log('Xtract', code);
	console.log('Stitched', myInterpreter.stitchJS(code)[1]);*/
	//console.log('Stitched', myInterpreter.interpretStitchedJS(myInterpreter.stitchJS(myInterpreter.extractLanguage2Parts(code, myInterpreter.JS_LANGUAGE, myInterpreter.JS_LANGUAGE_TYPE, myInterpreter.JS_Block_Types))[1]));
			php=myInterpreter.interpretStitchedJS(php);
	//console.log('Stitched', js);
			return [php, endTagIndex+startTag.length+2];
		};
		/**
		 * Converts Tag-Trees to HTML Code
		 * @param [array] tagTree - a language Tag Tree [parseJS, parseCSS, parsePHP, ...]
		 * @param ?[array] depth - [internal] Current Tree Depth
		 * @return [string] Returns HTML-Code
		 */
		myInterpreter.tagTree2Nodes=function (tagTree, depth){
			let tabSpace=2;
				if(tagTree==undefined || tagTree.length==0){return '';}
			depth=(depth==undefined)?0:depth;
			let treeHTML='', itemHTML, attributeList;
			tagTree.forEach(function(item, index){
				if(index!==tagTree.length-1){
					if(typeof item === 'string'){
						itemHTML=item.trim();
							if(itemHTML.length>0){
								treeHTML+='<div class="line"><span class="spaces">'+' '.repeat(depth)+'</span><span class="text">'+mySplitScreenEditor.pacifyHTML(itemHTML)+"</span></div>";
							}
					}else{
						attributeList=item.attributes.length==0?'':' ';
						item.attributes.forEach(function(attributeVal){
							attributeList+='<span class="attributeName"> '+attributeVal[0]+(attributeVal.length==2?'=&quot;</span><span class="attributeVal">'+attributeVal[1]+'</span><span class="attributeName">&quot;</span>':'</span>');
						});
							if(item.php){
								let blockDepth=' '.repeat(depth+(item.specialType=='/' && depth>=tabSpace?-tabSpace:0));
								treeHTML+='<div class="line"><span class="spaces">'+blockDepth+'</span><span class="tag">&lt;?php </span></div>';
								item.php.forEach(function(phpPart){
									treeHTML+='<div class="line"><span class="spaces">'+' '.repeat(depth+tabSpace)+'</span><span class="php part">'+phpPart+'</span></div>';
								});
								treeHTML+='<div class="line"><span class="spaces">'+blockDepth+'</span><span class="tag">?&gt;</span></div>';
							}else{
								treeHTML+='<div class="line"><span class="spaces">'+' '.repeat(depth+(item.specialType=='/' && depth>=tabSpace?-tabSpace:0))+'</span><span class="tag">&lt;'+(item.specialType==undefined?'':item.specialType)+item.tag+'</span>'+attributeList+'<span class="tag">'+(item.singleTag==undefined?'':' '+item.singleTag)+'&gt;</span>'+"</div>";
							}
							if(item.css){
								let css='';
								item.css.forEach(function(cssPart){
									treeHTML+='<div class="line"><span class="spaces">'+' '.repeat(depth+tabSpace)+'</span><span class="css part">'+cssPart[0]+'{</span></div>';
									cssPart[1].forEach(function(cssRule){
										treeHTML+='<div class="line"><span class="spaces">'+' '.repeat(depth+tabSpace*2)+'</span><span class="css rule key">'+cssRule[0]+':&nbsp;</span><span class="css rule value">'+cssRule[1]+';</span>'+(cssRule[0]=='color' || cssRule[0]=='background-color'?'<span class="css rule colourfield" style="background-color:'+mySplitScreenEditor.pacifyHTML(cssRule[1])+';"></span>':(cssRule[0]=='background'?'<div class="css rule colourfield" style="background:'+mySplitScreenEditor.pacifyHTML(cssRule[1]).replaceAll('&nbsp;', ' ')+';"></div>':''))+'</div>';
									});
									treeHTML+='<div class="line"><span class="spaces">'+' '.repeat(depth+tabSpace)+'</span><span class="css part">}</span></div>';
								});
							}else if(item.js){
								item.js.forEach(function(jsPart){
									let jsLines=jsPart.html(0,'&nbsp;');
									//console.log('jsPart2HTML',jsLines);
									jsLines.forEach(function(jsLine){
//console.log(jsLine);
										treeHTML+='<div class="line"><span class="spaces">'+' '.repeat(depth+tabSpace)+'</span><span class="js part">'+jsLine+'</span></div>';
									});
								});
							}
						treeHTML+=myInterpreter.tagTree2Nodes(item.inner, depth+tabSpace);
					}
				}
			});
			return treeHTML;
		};

		return myInterpreter;
	}();
	/**
	 * Santitises HTML-Code
	 * @param [string] htmlCode - HTML-Code
	 * @return [string] clean HTML
	 */
	mySplitScreenEditor.pacifyHTML=function(htmlCode, spacesPerTab=4){
		return htmlCode.replaceAll(/&/g, '&amp;').replaceAll(/\</g, '&lt;').replaceAll(/\>/g, '&gt;').replaceAll(/\"/g, '&quot;').replaceAll(/'/g, '&apos;').replaceAll(/\t/g, '&nbsp;'.repeat(spacesPerTab)).replaceAll(/ /g, '&nbsp;');
	};
	return mySplitScreenEditor;
};


//TODO: minimise Code and Obfuscate it
//TODO: Single Funktion view option for quick reference ('See code'-Style)
//TODO: Scan for '//TODO:' and '//FIX:' Comments
//TODO: Add generator Functions: function*
//TODO: Add Method-Inheritance: Classes that extend others should have the inherited methods shown as well, but also marked as inherited
//TODO: Add Inheritance Diagrams

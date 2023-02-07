var SplitScreenEditor = function(){
	let mySplitScreenEditor = {};
	mySplitScreenEditor.interpreter = new function(){
		let myInterpreter = {};
		//JS
		myInterpreter.JS_LANGUAGE_TYPE={_null: 1, _boolean: 2, _number: 3, _word: 4, _brackets: 5, _delimiters: 6, _strings: 7, _newline: 8, _whitespaces: 9, _logic: 10, _definers: 11, _operators: 12, _meta: 13, _misc:14};
		myInterpreter.JS_LANGUAGE=/(null|undefined)|(true|false)|(NaN|infinity|(?:[\+\-]?\d+(?:\.\d+)?))|(\w+)|([\(\)\{\}\[\]])|([\,\;])|([\'\"])|(\r?\n)|([ \t\f]+)|(\<|\>|\<\=+|\>\=+|\?|\&+|\|+|(?:\!\=+)|\={2,})|([\:\=]|\=\>|\-\-|\+\+)|([\*\-\+\/\%\^\.])|(\\)|(.)/si;
		
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
				//[optional, type, varName, varDescription] => [[false, '[int]', 'a', 'first number'],[true, '[int]', 'b', 'second number']]
				this.param=[];
				//[type, description] => ['int', 'something to do with numbers']
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
											this.param.push([currentVal[1].length>0, currentVal[2]==undefined?'':currentVal[2], currentVal[3], this.cutExcessStarsAndSpaces(currentVal[4])]);
											break;
										case 'return':
											currentVal=Array.from(currentVal.matchAll(myInterpreter.JSDOC_RETURN))[0];
											currentVal[2]=currentVal[2].trim();
												if(currentVal[2].startsWith('- ')){
													currentVal[2]=currentVal[2].substring(2);
												}
											this.returnType=[currentVal[1]==undefined?'':currentVal[1], this.cutExcessStarsAndSpaces(currentVal[2])];
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
		myInterpreter.pCSS_LANGUAGE_TYPE={_comment: 1, _null: 2, _boolean: 3, _number: 4, _word: 5, _brackets: 6, _delimiters: 7, _strings: 8,_newline: 9, _whitespaces: 10, _documentation: 11, _logic: 12, _definers: 13, _operators: 14, _meta: 15, _misc:16};
		myInterpreter.pCSS_LANGUAGE=/(\/\*|\*\/)|(null)|(true|false)|(NAN|(?:[\+\-]?\d+(?:\.\d+)?%?\w*))|((?:@)|(?:\w+[\w\-]*)?[\w]+|(?:#\w+))|([\(\)\{\}\[\]])|([\,\;])|([\'\"])|(\r?\n)|([ \t\f]+)|(\/\*\*|\*\/)|(\<|\>|\<\=+|\>\=+|\?|\&+|\|+|(?:\!\=+)|\={2,})|([\:\=\$]|\-\-|\+\+)|([\*\-\+\/\%\^\.])|(\\)|(.)/si;
		myInterpreter.pCSS_BLOCK = /(?:\<style\>\s*(?:(?:(?:[^\{]+)\{\s*)?(?:[^\{]+)\{(?:[^\}]*)\}(?:\s*\})?)*\s*(?:\<\/style\>))/si;
		myInterpreter.pCSS_Block_Types=['@'];
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
		myInterpreter.HTML_Single_Elements=['br', 'doctype', 'meta', 'img', 'hr', 'input', 'link', 'param', 'source', 'track','wbr','area','base','col','embed','keygen'];


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
			let loop=10000;
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
		//TODO: Fix [code] having to be encased by '<style>'+code+'</style>'
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
		 * Goes through code properly and returns the stichted parts
		 * @param [string] code - JavaScript-Source Code, without '<script></script>'
		 * @param [boolean] removeComments - Specifies whether or not (non-documentation) comments should be removed
		 * @return [array] code elements
		 */
		myInterpreter.parseJS2=function(code, removeComments=true){
			//let js=removeComments?(code.replaceAll(myInterpreter.Comments_HTML, '').replaceAll(myInterpreter.Comments_MultiLine, '').replaceAll(myInterpreter.Comments_SingleLine, '')):code;

			//Code to basic components
			let jsParts = myInterpreter.extractLanguage2Parts(code, myInterpreter.JS_LANGUAGE, myInterpreter.JS_LANGUAGE_TYPE, myInterpreter.JS_Block_Types, true);
			//Recognise Regex/Comments & stitches them
			jsParts = myInterpreter.stitchRegexAndComments(jsParts);
			//basic components to basic components summarised by brackets
			jsParts = myInterpreter.summariseBrackets(jsParts)[0];
			//basic summarised components to lines
			jsParts = myInterpreter.separateLines(jsParts, true);
			//lines to plainText lines
			let plainTextJS = myInterpreter.simpleLinesJS2(jsParts);
			//lines to classes
			//jsParts = myInterpreter.toObjectJS(jsParts);
			//console.log(jsParts);

			return plainTextJS;
		};
		/**
		 *  Summarises Regex Content and Comments
		 *  @param [array] codeParts - code Parts from [extractLanguage2Parts]
		 *  @return [array] code parts with combined Regex content and Comment
		 */
		myInterpreter.stitchRegexAndComments=function(codeParts){
			let pointer=0, pointer2, inRegex, inComment, commentType;;
				while(pointer<codeParts.length){
					// /abc/g
						if(codeParts[pointer][1]=='/'){
							if(codeParts[pointer+1]!=undefined && ['/','*'].indexOf(codeParts[pointer+1][1])>=0){ // /**/
								let comment;
								commentType=-1;
									if(codeParts.length>pointer+1){
										if(codeParts[pointer+1][1]=='/'){
											//Single Line Comment - Search for next newLine
											commentType=0;
											comment='//';
										}else{
											if(codeParts[pointer+1][1]=='*'){
												if(codeParts.length>pointer+2 && codeParts[pointer+2][2]=='*'){
													//documentation Comment - Search for next */
													commentType=2;
													comment='/**';
												}else{
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
										//console.log('Found Comment @', pointer, 'to:', pointer2, 'com:', comment);
										codeParts.splice(pointer,pointer2-pointer+(commentType==0?0:1), commentType==2?['documentation', comment]:['comment', comment, commentType]);
									}
							}else if(pointer==0 || ['number', 'word', 'string', 'meta'].indexOf(codeParts[pointer-1][0])==-1){
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
								return [ret, pointer];
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
			//TODO: change [codeParts[i][1]==';'] to myInterpreter.JS_LineDelimiters
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
		 * @param [string] code - JavaScript-Source Code, without '<script></script>'
		 * @return [array[string]] plainText code
		 */
		myInterpreter.simpleLinesJS2=function(codeParts){
			let lines = [''], numOfParts=codeParts.length;
				for(let i=0;i<numOfParts;i++){
					let numOfElements=codeParts[i].length;
					let lineOffset=undefined;
						for(let j=0;j<numOfElements;j++){
								if(lineOffset==undefined && codeParts[i][j][0]=='white space'){
									lineOffset=codeParts[i][j][1];
								}
								if(codeParts[i][j][0]=='bracket'){
									lines[lines.length-1]+=codeParts[i][j][1]+(codeParts[i][j][1]=='{'?'<br>':'')+myInterpreter.simpleLinesJS2(codeParts[i][j][2])+(codeParts[i][j][1]=='{'?'<br>'+(lineOffset==undefined?'':lineOffset):'')+(codeParts[i][j][1]=='('?')':(codeParts[i][j][1]=='['?']':'}'));
								}else{
									if(codeParts[i][j][0]!='newline'){
										if(codeParts[i][j][0]=='documentation'){
											codeParts[i][j][1]=codeParts[i][j][1].replaceAll(/\r?\n/g,'<br>');
										}
										if(j==0 && codeParts[i][j][0]=='white space'){
											//lines[lines.length-1]+='<span class="line_start_tabs">'+codeParts[i][j][1].replaceAll(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')+'</span>';
											lines[lines.length-1]+=codeParts[i][j][1];
										}else if(codeParts[i][j][0]=='regex'){
											lines[lines.length-1]+='<span class="regex">'+codeParts[i][j][1].replaceAll('<', '&lt;').replaceAll('>', '&gt;')+'</span>';
										}else if(codeParts[i][j][0]=='comment'){
											lines[lines.length-1]+='<span class="comment">'+codeParts[i][j][1].replaceAll('<', '&lt;').replaceAll('>', '&gt;')+'</span>';
										}else if(codeParts[i][j][0]=='documentation'){
											lines[lines.length-1]+='<span class="documentation">'+codeParts[i][j][1].replaceAll('<', '&lt;').replaceAll('>', '&gt;')+'</span>';
										}else{
											let special = SSE.interpreter.JS_AddIfSpecialWord(codeParts[i][j][1], 'class', [undefined, 'htmlword', 'keyword', 'reservedword']);
											lines[lines.length-1]+='<span '+(codeParts[i][j][0]=='documentation'?'class="comment"':special)+'>'+codeParts[i][j][1].replaceAll('<', '&lt;').replaceAll('>', '&gt;')+'</span>';
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
		 * Returns the class Objects of code Parts
		 * @param [string] code - JavaScript-Source Code, without '<script></script>'
		 * @return [array] class Objects
		 */
		myInterpreter.toObjectJS=function(codeParts){
			//console.log(codeParts);
			let elements;
			return elements;
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
		 * Separates Language into it's Components<br>
		 * languageTypes:
		 *		1. NullObject / Comments
		 *		2. boolean
		 *		3. number
		 *		4. word (a-zA-Z0-9_)
		 *		5. brackets
		 *		6. delimiters
		 *		7. strings
		 *		8. new lines
		 *		9. white spaces
		 *		10. documentation
		 *		12. logic
		 *		13. definers
		 *		14. operators
		 *		15. meta
		 *		16. misc
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
							console.log('Unknown Char: '+code[0]);
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
								if(inString==undefined){
									inString=languagePart[languageTypes._strings];
								}else{
									inString=undefined;
								}
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
						if((languagePart[languageTypes._strings]!==undefined && inString==undefined) || (inString && ((languagePart[languageTypes._strings]==undefined) || isLiteral))){
							//If String, concatenate
							language[language.length-1][1]+=languagePart[0];
						/*}else if((languagePart[languageTypes._documentation]!==undefined && !inDocumentation) || (inDocumentation && languagePart[languageTypes._documentation]==undefined)){
							//If documentation, concatenate
							language[language.length-1][1]+=languagePart[0];*/
						}else if(languagePart[languageTypes._whitespaces]==undefined || keepWhiteSpaces){
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
	mySplitScreenEditor.pacifyHTML=function(htmlCode){
		return htmlCode.replaceAll(/&/g, '&amp;').replaceAll(/\</g, '&lt;').replaceAll(/\>/g, '&gt;').replaceAll(/\"/g, '&quot;').replaceAll(/'/g, '&apos;').replaceAll(/\t/g, '&nbsp;&nbsp;').replaceAll(/ /g, '&nbsp;');
	};
	return mySplitScreenEditor;
};


//TODO: minimise Code and Obfuscate it
//TODO: Single Funktion view option for quick reference ('See code'-Style)

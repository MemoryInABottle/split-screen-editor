//TODO: minimise Code and Obfuscate it
//TODO: Single Funktion view option for quick reference ('See code'-Style)
//TODO: Scan for '//TODO:' and '//FIX:' Comments
//TODO: Add generator Functions: function*
//TODO: Add Method-Inheritance: Classes that extend others should have the inherited methods shown as well, but also marked as inherited
//TODO: Add Inheritance Diagrams

class sse_abstractLanguage{
	languageTypes;
	languageTypes_Regex;
	language_BlockTypes;
	reservedWords;
	lineDelimiters;
	
	CodeParts = {
		is: function(codePart, type, val){
				if(codePart==undefined || codePart[0]==undefined || codePart[1]==undefined){
					return false;
				}
				if(codePart[0] == type && codePart[1] == val){
					return true;
				}
			return false;
		},
		type: function(codePart){
				if(codePart==undefined || codePart[0]==undefined){
					return undefined;
				}
			return codePart[0];
		},
		val: function(codePart){
				if(codePart==undefined || codePart[1]==undefined){
					return undefined;
				}
			return codePart[1];
		},
		isType: function(codePart, type){
				if(codePart==undefined || codePart[0]==undefined){
					return false;
				}
				if(codePart[0] == type){
					return true;
				}
			return false;
		},
		isValue: function(codePart, val){
				if(codePart==undefined || codePart[1]==undefined){
					return false;
				}
				if(codePart[1] == val){
					return true;
				}
			return false;
		},
		isDefinition: function(codePart, def){
				if(codePart==undefined || codePart[0]==undefined || codePart[1]==undefined){
					return false;
				}
				if(codePart[0] == 'definition' && codePart[1] == def){
					return true;
				}
			return false;
		},
		string: function(codePart){
				if(codePart==undefined || codePart[0]==undefined || codePart[0] !== 'string' || codePart[1]==undefined || codePart[1].length<2){
					return undefined;
				}
			return codePart[1].substring(1, codePart[1].length-1);	
		},
		stringType: function(codePart){
				if(codePart==undefined || codePart[0]==undefined || codePart[0] !== 'string' || codePart[1]==undefined || codePart[1].length<2){
					return undefined;
				}
			return codePart[1][0];
		},
		isString: function(codePart, str){
				if(codePart==undefined || codePart[0]==undefined || codePart[1]==undefined){
					return false;
				}
				if(codePart[0] == 'string' && codePart[1] == str){
					return true;
				}
			return false;
		},
		bracket: function(codePart){
				if(codePart==undefined || codePart[0]==undefined || codePart[0]!=='bracket' || codePart[1]==undefined){
					return undefined;
				}
			return codePart[2][0];
		},
		isSimpleBracket: function(codePart){
				if(codePart==undefined || codePart[0]==undefined || codePart[1]==undefined){
					return false;
				}
				if(codePart[0] == 'bracket' && codePart[1] == '('){
					return true;
				}
			return false;
		},
		isCurlyBracket: function(codePart){
				if(codePart==undefined || codePart[0]==undefined || codePart[1]==undefined){
					return false;
				}
				if(codePart[0] == 'bracket' && codePart[1] == '{'){
					return true;
				}
			return false;
		},
		isSquareBracket: function(codePart){
				if(codePart==undefined || codePart[0]==undefined || codePart[1]==undefined){
					return false;
				}
				if(codePart[0] == 'bracket' && codePart[1] == '['){
					return true;
				}
			return false;
		},
	};
	
	/**
	 * @param [Enum] languageTypes - Enumeration of language Components and specified numbers
	 * @param [REGEX] languageTypes_Regex - Regular Expression for each language Component, corresponding to the positions in [languageTypes]
	 * @param [array] language_Block_Types - Array that includes all elements that define code blocks (bracketed areas, loops, ...)
	 */
	constructor(languageTypes, languageTypes_Regex, language_BlockTypes, lineDelimiters, reservedWords){
		this.languageTypes = languageTypes;
		this.languageTypes_Regex = languageTypes_Regex;
		this.language_BlockTypes = language_BlockTypes;
		this.lineDelimiters = lineDelimiters;
		this.reservedWords = reservedWords;
	}
	
	
	/**
	 *  Summarises Bracket Contents appropriately
	 *  @param [array] codeParts - code Parts from [extractLanguage2Parts]
	 *  @param ?[boolean] pointer - code Pointer offset, defaults to zero
	 *  @return [array] code parts with combined bracket content
	 */
	summariseBrackets=function(codeParts, pointer=0){
		let ret = [];
			while(pointer<codeParts.length){
					if(codeParts[pointer][0]=='bracket'){
						if(['(', '[', '{'].indexOf(codeParts[pointer][1])>=0){
							//Opening Bracket - Start Reading
							let summarisedBracket = this.summariseBrackets(codeParts, pointer+1);
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
	 *  @param [boolean] keepDelimiters - Specifies whether or not to include the delimiters as codeParts
	 *  @return [array] code parts separated by lines
	 */
	separateLines=function(codeParts, useNewline, keepDelimiters=true){
		let lines = [[/*'line'*/]], numOfParts=codeParts.length;
			for(let i=0;i<numOfParts;i++){
				if((codeParts[i][0]=='delimiter' && this.lineDelimiters.indexOf(codeParts[i][1])>=0) || (useNewline?codeParts[i][0]=='newline':false)){
						if(codeParts[i][0]=='delimiter' && keepDelimiters){
							lines[lines.length-1].push(codeParts[i]);
						}
						if(lines[lines.length-1].length>0){
							lines.push([/*'line'*/]);
						}
				}else{
						if(codeParts[i][0]=='bracket'){
							//Read Bracket contents
							codeParts[i][2] = this.separateLines(codeParts[i][2], useNewline);
						}
					lines[lines.length-1].push(codeParts[i]);
				}
			}
		let finalLen = lines.length;
			if(finalLen!==0 && lines[finalLen-1].length==0){
				lines.length=finalLen-1;
			}
		return lines;
	};
	/**
	 * Separates Language into it's Components
	 * @param [string] code - Source Code
	 * @param ?[boolean] keepWhiteSpaces - Specifies whether or not white spaces (Space, Tab, ...) should be included
	 * @return [array] Returns an Array of [Description, Component]
	 * @throws Error Message in Console, when an Unknown Character is found, not matching [this.languageTypes_Regex]
	 */
	extractLanguage2Parts=function (code, keepWhiteSpaces=false){
		//TODO: change the label from Strings to Numbers (Index of this.languageTypes_Regex), so you can use the one definition and don't have unneccessary spelling accidents
		let language=[], currentPart=[], languagePart;
		//code=code.replaceAll(/\s*\n\s*/g,'').trim();
		let recusionLen=code.length, recursion=false;
		let descriptor, isMeta=false, isLiteral, inString=undefined, inDocumentation=false;
			while(code.length>0 && !recursion){
				isLiteral=false;
				languagePart=code.match(this.languageTypes_Regex);
					if(languagePart==null){
						console.warn('Unknown Char: '+code[0]);
						code=code.substr(1);
						continue;
					}
					if(isMeta){
						descriptor='literal';
						isMeta=false;
						isLiteral=true;
					}else if(languagePart[this.languageTypes._null]!=undefined){
						descriptor='null';
					}else if(languagePart[this.languageTypes._boolean]!=undefined){
						descriptor='boolean';
					}else if(languagePart[this.languageTypes._number]!=undefined){
						descriptor='number';
					}else if(languagePart[this.languageTypes._word]!=undefined){
						descriptor='word';
							if(this.language_BlockTypes.indexOf(languagePart[this.languageTypes._word].toLowerCase())!==-1){
								descriptor='block';
								languagePart[this.languageTypes._word]=languagePart[this.languageTypes._word].toLowerCase();
							}
					}else if(languagePart[this.languageTypes._brackets]!=undefined){
						descriptor='bracket';
					}else if(languagePart[this.languageTypes._delimiters]!=undefined){
						descriptor='delimiter';
					}else if(languagePart[this.languageTypes._strings]!=undefined){
						descriptor='string';
							/*if(inString==undefined){
								inString=languagePart[this.languageTypes._strings];
							}else{
								inString=undefined;
							}*/
					}else if(languagePart[this.languageTypes._whitespaces]!=undefined){
						descriptor='white space';
					/*}else if(languagePart[this.languageTypes._documentation]!=undefined){
						descriptor='documentation';
							if(languagePart[0]=='/**'){
								inDocumentation=true;
							}else{
								inDocumentation=false;
							}*/
					}else if(languagePart[this.languageTypes._logic]!=undefined){
						descriptor='logic';
					}else if(languagePart[this.languageTypes._definers]!=undefined){
						descriptor='definition';
					}else if(languagePart[this.languageTypes._operators]!=undefined){
						descriptor='operator';
					}else if(languagePart[this.languageTypes._meta]!=undefined){
						descriptor='meta';
						isMeta=true;
					}else if(languagePart[this.languageTypes._misc]!=undefined){
						descriptor='misc';
					}else if(languagePart[this.languageTypes._newline]!=undefined){
						descriptor='newline';
					}else if(languagePart[this.languageTypes._comment]!=undefined){
						descriptor='comment';
					}else{
						descriptor='';
						console.warn(languagePart[0], code.match(this.languageTypes_Regex));
					}
					/*if((languagePart[this.languageTypes._strings]!==undefined && inString==undefined) || (inString && ((languagePart[this.languageTypes._strings]==undefined) || isLiteral))){
						//If String, concatenate
						language[language.length-1][1]+=languagePart[0];*/
					/*}else if((languagePart[this.languageTypes._documentation]!==undefined && !inDocumentation) || (inDocumentation && languagePart[this.languageTypes._documentation]==undefined)){
						//If documentation, concatenate
						language[language.length-1][1]+=languagePart[0];
					}else*/ if(languagePart[this.languageTypes._whitespaces]==undefined || keepWhiteSpaces){
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
}

class sse_abstractJS extends sse_abstractLanguage{
	/*
		//JS
		myInterpreter.JS_INCLUDE_BLOCK = /(?:\<script\s+src\=\"([^\"]*)\"\s*\>\s*(?:\<\/script\>))/si;
		//Add Comments into Regex
		myInterpreter.JS_BLOCK = /(?:\<script\>\s*(?:(?:\/\*(((?<=\/\*))([^\*](.*?))*(?!=\*\/))\*\/)|(?:(?:(?:(?:[^\(]*)\((?:[^\)]*)\))|(?:[\s\w]+))\s*\{(?:[^\}]*)\})|(?:(?:[^\;]*)\;))*\s*(?:\<\/script\>))/si;
		myInterpreter.JS_PART = /(?:(((?:([^\(]*)\(([^\)]*)\))|([\s\w]+))\s*\{([^\}]*)\})|((?:[^\;]*)\;))/gs;
		myInterpreter.JSDOC_PARAM=/(?:(\??)\[([^\]]+)\])?\s*([^\s]+)\s*(.*)/gs;
		myInterpreter.JSDOC_RETURN=/(?:\[([^\]]+)\])?\s*(.*)/g;
		myInterpreter.JS_BuiltInPropObjMethods_Names=['Array','Date','eval','function','hasOwnProperty','Infinity','isFinite','isNaN','isPrototypeOf','length','Math','NaN','name','Number','Object','prototype','String','toString','undefined','valueOf'];
		myInterpreter.JS_Objects=['console'];
		myInterpreter.JS_HTMLWindow_Words=['alert','all','anchor','anchors','area','assign','blur','button','checkbox','clearInterval','clearTimeout','clientInformation','close','closed','confirm','constructor','crypto','decodeURI','decodeURIComponent','defaultStatus','document','element','elements','embed','embeds','encodeURI','encodeURIComponent','escape','event','fileUpload','focus','form','forms','frame','innerHeight','innerWidth','layer','layers','link','location','mimeTypes','navigate','navigator','frames','frameRate','hidden','history','image','images','offscreenBuffering','open','opener','option','outerHeight','outerWidth','packages','pageXOffset','pageYOffset','parent','parseFloat','parseInt','password','pkcs11','plugin','prompt','propertyIsEnum','radio','reset','screenX','screenY','scroll','secure','select','self','setInterval','setTimeout','status','submit','taint','text','textarea','top','unescape','untaint','window'];
	*/
	IsValidRegex = {
		//identifier: /^((?:[\$\_a-zA-Z])|(?:\\u[\da-f]{4})|(?:\\u\{[\da-f]{1,6}\})|(?:\\x[\da-f]{2}))$/;
	};
	
	constructor(){
		super(
			//Language-Types
			{_null: 1, _boolean: 2, _number: 3, _word: 4, _brackets: 5, _delimiters: 6, _strings: 7, _newline: 8, _whitespaces: 9, _logic: 10, _definers: 11, _operators: 12, _meta: 13, _misc:14},
			//Language-Types-Regex
			/(null|undefined)|(true|false)|(NaN|infinity|0b[01]+|0o[0-7]+|0x[\da-fA-F]+|(?:[\-]?\d+(?:\.\d+)?))|((?:\w|(?:\\u[\da-f]{4})|(?:\\u\{[\da-f]{1,6}\})|(?:\\x[\da-f]{2}))+)|([\(\)\{\}\[\]])|([\,\;])|([\'\"\`])|(\r?\n)|([ \t\f]+)|(\<{1,3}|\>{1,3}|\<\=+|\>\=+|\?|\&+|\|+|(?:\!\=+)|\={2,})|([\:\=]|\=\>|\-\-|\+\+)|([\~\*\-\+\/\%\^\.])|(\\)|(.)/si,
			//Language-Block-Types
			['function', 'if', 'else', 'for', 'while', 'do', 'switch', 'class', 'constructor', 'try', 'catch', 'finally'],
			//Line Delimiter
			[';','\r\n'],
			//Reserved Words
			['abstract', 'arguments','await', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'double', 'else', 'enum', 'eval', 'export', 'extends', 'false', 'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import', 'in', 'instanceof', 'int', 'interface', 'let', 'long', 'native', 'new', 'null', 'package', 'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void', 'volatile', 'while', 'with', 'yield'],
		);
		
		this.precedence = {
			'bracket':18,
			'.':17, //Left-to-Right
			'array':17,
			'new':17, //with brackets
			'call':17,
			'?.':17, //Optional Chaining, Left-to-Right
			'new_wo':16, //without brackets
			'n++':15,
			'n--':15,
			'!':14, //Logical NOT
			'~':14, //Bitwise NOT
			'+num':14, //Signed
			'-num':14, //Signed
			'++n':14,
			'--n':14,
			'typeof':14,
			'void':14,
			'delete':14,
			'await':14,
			'**':13, //Exponentiation, Right-to-Left
			'*':12, //Left-to-Right
			'/':12, //Left-to-Right
			'%':12, //Left-to-Right
			'+':11, //Left-to-Right
			'-':11, //Left-to-Right
			'>>':10, //Left-to-Right
			'<<':10, //Left-to-Right
			'>>>':10, //Unsigned, Left-to-Right
			'<':9, //Left-to-Right
			'<=':9, //Left-to-Right
			'>':9, //Left-to-Right
			'>=':9, //Left-to-Right
			'in':9, //Left-to-Right
			'instanceof':9, //Left-to-Right
			'==':8, //Left-to-Right
			'!=':8, //Left-to-Right
			'===':8, //Left-to-Right
			'!==':8, //Left-to-Right
			'&':7, //Left-to-Right
			'^':6, //Left-to-Right
			'|':5, //Left-to-Right
			'&&':4, //Left-to-Right
			'||':3, //Left-to-Right
			'??':3, //Left-to-Right
			'+=':2, //Right-to-Left
			'-=':2, //Right-to-Left
			'**=':2, //Right-to-Left
			'*=':2, //Right-to-Left
			'/=':2, //Right-to-Left
			'%=':2, //Right-to-Left
			'<<=':2, //Right-to-Left
			'>>=':2, //Right-to-Left
			'>>>=':2, //Right-to-Left
			'&=':2, //Right-to-Left
			'^=':2, //Right-to-Left
			'|=':2, //Right-to-Left
			'&&=':2, //Right-to-Left
			'||=':2, //Right-to-Left
			'??=':2, //Right-to-Left
			'?:':2, //Conditional Operator, Right-to-Left
			'=>':2,
			'yield':2,
			'yield*':2,
			'...':2,
			',':1, //Left-to-Right
		};
	}
	
	/**
	 * Goes through code properly and returns the stitched parts
	 * @param [string] code - JavaScript-Source Code, without '<script></script>'
	 * @return [array] code elements
	 */
	parse=function(code, returnLength=false){
		let myActualLength=-1;
		//Code to basic components & cut white spaces
		let jsParts = this.extractLanguage2Parts(code, false);
		//Check for optional 'EndTag'
		let prematureEnd = this.checkEndIsActualEnd(jsParts, ['<', '/','script','>']);
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
		jsParts = this.stitchRegexAndComments(jsParts);
		//basic components to basic components summarised by brackets
		jsParts = this.summariseBrackets(jsParts);
			if(jsParts.length==3){
				console.warn('parseJS2(): Ended too soon');
			}
		jsParts = jsParts[0];
		//basic summarised components to lines
		jsParts = this.separateLines(jsParts, true, false);
		
		console.log('JS-Parts');
		console.log(jsParts);
		
		let jsStatements = this.toStatements(jsParts);
		console.log(jsStatements);
		
		return jsStatements;
	};
	/**
	 *  Checks whether or not the Endtag </ script> is at the end of the code
	 *  
	 *  @param [array] codeParts - code Parts from [extractLanguage2Parts]
	 *  @param [array] endTagParts String array e.g. ['<', '/','script','>']
	 *  @return true, if tag is at the end; [int] of position, if found before end
	*/
	checkEndIsActualEnd=function(codeParts, endTagParts){
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
	stitchRegexAndComments=function(codeParts, processSingleLineComments=true, processMultiLineComments=true, processDocumentationComments=true, processRegex=true, processStrings=true){
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
	 *  Converts JS Code-Parts into JS-Statements
	 *  @param [array] jsParts - JS code Parts from [extractLanguage2Parts or toStatement]
	 *  @return [array] JS-Statements
	 */
	toStatements(jsParts){
		let statLines = [], statements, statement, statLineCount=0;
		let numOfLines = jsParts.length, pointer, lineLen;
			for(let lineNumber=0;lineNumber<numOfLines;lineNumber++){
					if(statLines[statLineCount]!==undefined && statLines[statLineCount].length>0){
						statLineCount++;
						statLines[statLineCount] = [];
					}
				statements=[];
				lineLen = jsParts[lineNumber].length;
					if(lineLen==0){continue;}
				pointer=0;
					while(pointer<lineLen){
						statement = this.toStatement(jsParts[lineNumber], pointer);
							if(statement[1]==0){
								console.warn('Parse-Error on line', lineNumber, '@', pointer);
								console.warn('Line:',jsParts[lineNumber]);
								pointer=lineLen;
							}else{
								statements.push(statement[0]);
								pointer=statement[1];
							}
					}
				statLines.push(statements);
			}
		return statLines;
	}
	toStatement(jsParts_Line, partPointer=0){
			if(jsParts_Line==undefined || jsParts_Line[partPointer]==undefined){return undefined;}
		let statement = {};
			switch(this.CodeParts.type(jsParts_Line[partPointer])){
				case 'block':
						if(this.CodeParts.isValue(jsParts_Line[partPointer], 'function') && this.CodeParts.isSimpleBracket(jsParts_Line[partPointer+1]) && this.CodeParts.isCurlyBracket(jsParts_Line[partPointer+2])){
							//function (parameter) {functionBody}
							statement.type = 'function';
							statement.name = null;
							statement.parameter = this.toStatements(jsParts_Line[partPointer+1][2]);
							statement.body = this.toStatements(jsParts_Line[partPointer+2][2]);
							partPointer+=3;
						}else if(this.CodeParts.isValue(jsParts_Line[partPointer], 'function') && this.CodeParts.isType(jsParts_Line[partPointer+1], 'word') && this.CodeParts.isSimpleBracket(jsParts_Line[partPointer+2]) && this.CodeParts.isCurlyBracket(jsParts_Line[partPointer+3])){
							//function functionName (parameter) {functionBody}
							statement.type = 'function';
							statement.name = jsParts_Line[partPointer+1][1];
							statement.parameter = this.toStatements(jsParts_Line[partPointer+2][2]);
							statement.body = this.toStatements(jsParts_Line[partPointer+3][2]);
							partPointer+=4;
						}else{
							statement.type = 'block';
							statement.name = this.CodeParts.val(jsParts_Line[partPointer]);
						}
					break;
				case 'definition':
					statement.type = 'assignment';
					statement.resolved = false;
					partPointer++;
					break;
				case 'word':
						switch(this.CodeParts.val(jsParts_Line[partPointer])){
							//Definition
							case 'let':
							case 'var':
							case 'const':
									if(this.CodeParts.isType(jsParts_Line[partPointer+1], 'word')){
										statement.type = 'definition';
										statement.definer = this.CodeParts.val(jsParts_Line[partPointer]);
										statement.name = this.CodeParts.val(jsParts_Line[partPointer+1]);
											if(this.CodeParts.isDefinition(jsParts_Line[partPointer+2], '=')){
												//Read the rest of the line
												statement.definition = [];
												partPointer+=3;
												
												let buffer, breakOut=false;
												while(!breakOut && (buffer = this.toStatement(jsParts_Line, partPointer))!==undefined){
													statement.definition.push(buffer[0]);
														if(partPointer==buffer[1]){
															breakOut=true;
														}else{
															partPointer = buffer[1];
														}
												}
											}else{
												statement.definition = undefined;
												partPointer+=3;
											}
									}
								break;
							//Adding Properties to objects
							case 'await':
							case 'sync':
							case 'static':
								statement = this.toStatement(jsParts_Line, partPointer+1);
								partPointer = statement[1];
								statement = statement[0];
								statement[this.CodeParts.val(jsParts_Line[partPointer])] = true;
								break;
							default:
								//Check for Array/Call/ObjectProperty
									if(false && this.CodeParts.isSquareBracket(jsParts_Line[partPointer+1])){
										console.log(jsParts_Line[partPointer+1]);
										statement.type = 'array';
										statement.name = this.CodeParts.val(jsParts_Line[partPointer]);
										statement.val = this.toStatement(jsParts_Line[partPointer+1]).bracket;
										partPointer+=2;
									}else{
										statement.type = 'word';
										statement.val = this.CodeParts.val(jsParts_Line[partPointer]);
										partPointer++;
									}
						}
					break;
				case 'string':
							if(jsParts_Line.length==1 && this.CodeParts.isString(jsParts_Line[partPointer], 'strict mode')){
								statement.type = 'mode';
								statement.val = 'strict';
							}else{
								statement.type = 'string';
								statement.stringType = this.CodeParts.stringType(jsParts_Line[partPointer]);
								statement.val = this.CodeParts.string(jsParts_Line[partPointer]);
							}
						partPointer++;
					break;
				case 'delimiter':
						if(partPointer==jsParts_Line.length-1){ //End of Line
							//ignore
						}
					statement.type='delimiter';
					statement.val = this.CodeParts.val(jsParts_Line[partPointer]);
					partPointer++;
					break;
				case 'bracket':
					statement.type = 'bracket';
					statement.bracket = this.CodeParts.val(jsParts_Line[partPointer]);
					statement.val = this.CodeParts.bracket(jsParts_Line[partPointer]);
					partPointer++;
					break;
				case 'number':
				case 'boolean':
				case 'operator':
					statement.type = this.CodeParts.type(jsParts_Line[partPointer]);
					statement.val = this.CodeParts.val(jsParts_Line[partPointer]);
					partPointer++;
					break;
				default:
					statement.type = 'unknown';
					statement.val = this.CodeParts.val(jsParts_Line[partPointer]);
					console.warn('Unknown Part-Type', this.CodeParts.type(jsParts_Line[partPointer]));
					partPointer++;
			}
		this.addToString(statement);
		return [statement, partPointer];
	}
	addToString(obj){
		switch(obj.type){
			case 'function': obj.toString = () => {return (obj['static']?'static':'')+(obj['snyc']?'snyc':'')+obj.type+(obj.name==undefined?'':' '+obj.name)+'('+(obj.parameter.length==0?'':obj.parameter.join(', '))+'){'+obj.body.join('<br>')+'}';}; break;
			case 'block': obj.toString = () => {return obj.val;}; break;
			case 'definition': obj.toString = () => {return obj.definer+' '+obj.name+(obj.definition==undefined?'':' = '+obj.definition);}; break;
			case 'array': obj.toString = () => {return obj.name+'['+obj.val+']';}; break;
			case 'string': obj.toString = () => {return obj.stringType+obj.val+obj.stringType;}; break;
			case 'delimiter': obj.toString = () => {return '';}; break;
			case 'bracket': obj.toString = () => {return obj.bracket+obj.val+(obj.bracket=='('?')':(obj.bracket=='['?']':'}'));}; break;
			case 'number':
			case 'boolean':
			case 'operator':
			case 'word':
			case 'unknown': obj.toString = () => {return obj.val;}; break;
			case 'assignment': obj.toString = () => {return '=';}; break;
			default:
				console.log('Unknown Type', obj.type, obj);
				obj.toString = () => {return obj.type+': '+obj.val;};
		}
	}
	operatorPrecedence_statements(statementLines){
		let statLines = [], statements, statement, statLineCount=0;
		let numOfLines = statementLines.length, pointer, lineLen;
			for(let lineNumber=0;lineNumber<numOfLines;lineNumber++){
				
			}
	}
}

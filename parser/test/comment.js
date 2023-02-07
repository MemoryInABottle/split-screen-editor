
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

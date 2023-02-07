//HTML
myInterpreter.HTML_tagRegex = /\<([\!\/])?\s*((?:[a-zA-Z_]\w*)(?:(?:\s*(?:[a-zA-Z_][\w\-]*)(?:\s*\=\s*(?:(?:"(?:[^"]*)")|(?:'(?:[^']*)')))?)*))\s*(\/)?\>/;
myInterpreter.HTML_Definition_attributeValue = /\s*([a-zA-Z_][\w\-]*)(?:\s*=\s*((?:"(?:[^"]*)")|(?:'(?:[^']*)')))?/g;
//COMMENT
myInterpreter.Comments_SingleLine = /\/\/([^\n]*)/g;
/*A
multiline
Comment*/
myInterpreter.Comments_MultiLine = /\/\*(((?<=\/\*))([^\*](.*?))*(?!=\*\/))\*\//gs; //explicitly no documentation comment => /** function and param */
myInterpreter.Comments_HTML = /<\!\-\-(((?<=<\!\-\-))(.*?)(?!=\-\->))\-\->/gs;
//Special Tags
myInterpreter.HTML_Single_Elements=['br', 'doctype', 'meta', 'img', 'hr', 'input', 'link', 'param', 'source', 'track','wbr','area','base','col','embed','keygen'];

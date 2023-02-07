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
class duration{
	constructor(){
		this.myLength = undefined; //Convert to Decimal
		this.myDotted = undefined;
		this.myTuplet = undefined;
	}
	set val(aValue){
		
	}
	get val(){
		return this.myLength*(this.myDotted?1.5:1);
	}
	get name(){
		//return awesomechords.midi.
	}
	realTimeAt(BPM) {
		
	}
}

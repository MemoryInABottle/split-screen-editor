var a={
	regex:/abd/g,
	b:3,
	c:function(e, f=4){
		return this.b+e*f;
	},
	d:'789',
	g:function(){
		return this.c(parseInt(d,10));
	},
}

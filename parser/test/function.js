/** Returns the Index of a given Key
 * @param [string] key - the Array Key
 * @param [anything] a - a Test Parameter
 Test 2 Parameter
 * @return [int] the Index of the Key
 */
function keyIndex(key, a) {
    return this.keys.indexOf(key);
}
function frequency(note, A4) {
	//Returns the frequency of a note, A4 can be altered from 440 Hertz
	//C4 = 261.63; A4 = 440
		if(note===undefined || note===''){
			return undefined;
		}
	A4 = A4 || 440.0;
	return A4 * Math.pow(2, (this.index(note) - 57) / 12.0);
}
/**
 *  Returns the naturally occuring number of accidentals of a tone for a given key
 *  @param [Char] tone - One of the seven tones [C, D, E, F, G, A, B]
 *  @param [int] keyAccidentals - Number of Accidentals the key has
 *  @return [int] Number of Accidentals the tone gets
 */
function naturalToneColouring(tone, keyAccidentals){
	/*(' A ', -4) => A in the Key of Ab => -1 (Ab)
		//FIX: key.naturalToneColouring() Key above C# and below Cbb - G# and Fbb are repeats, so everything after them shifts one
		//4 = indexOf(' A ')
	*/
	let accidentals = awesomechords.tone.sorted_fifths.indexOf(tone[0].toUpperCase());
	/*-2 = -4 + -5 + 8 - 1*/
	let myKeyAccidentals = keyAccidentals+((accidentals+1)*-1)+8+(keyAccidentals<0?-1:0);
	/*-1 = trunc(-2/8) - 1 = trunc(-0.25) - 1*/
	console.log(tone, keyAccidentals, myKeyAccidentals, myKeyAccidentals/8);

	return Math.trunc(myKeyAccidentals/8)+(myKeyAccidentals<0?-1:0);
}
function test(kA, a){
	return kA+((a+1)*-1)+8+(kA<0?-1:0);
}
function* generator(){
	yield(Math.random());
}
/**
 *  An example for an anonymous Function
 *  @param [var] anon Parameter_Description 1
 *  @param [var] ymous Parameter_Description 2
 *  @param [var] func Parameter_Description 3
 *  @param [var] tion Parameter_Description 4
 *  @return [void]
 */
function(anon, ymous, func, tion){
	alert(5);
}

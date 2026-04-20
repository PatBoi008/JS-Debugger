
// TO DO LIST:
/*
 *  Add more instructions to make program more readable and easy to use
 */
 
// BUG FIX LIST:
/* 
 * 
 */ 

let testcaseIn = [];
let testcaseOut = [];
let testcaseInFormatted = [];
let programOut = [];
let testAmount = 0;
let names = [];
let isError = false;
let allErrors = [];
let canRun = true;

let type = [];
let oldType = [];
let changedType = false;

let totalVarCount = 1;

let loadingTestcase = false;

let correctCode = true;

let confirmedUpdate = true;

// Function updates variable parameters: 
// Items such as program var name, var amount, etc. will be changed
// as long as the user agrees that it might erase testing data.

function updateVars(){
	resetErrorField();
	
	let varCount = Number(document.getElementById("numParam").value);
	if(varCount > 4 || varCount <= 0){
		setNotification("Invalid variable count!");
		return;
	}
	totalVarCount = varCount;
	if(!checkVarNames()){
		setNotification("Duplicate variable name!");
		return;
	}else{
		canRun = true;
	}
	if(!confirmedUpdate && !loadingTestcase){
		if(testAmount > 0){
			askConfirmation();
			return;
		}
	}
	bufferNames();
	for(let i = 1; i <= varCount; i++){
		let curVar = "var" + i;
		document.getElementById(curVar).style.display = "inline";
		let inputVal = "input" + i;
		document.getElementById(inputVal).style.display = "inline";
		let toggleVal = "input" + i + "Toggle";
		document.getElementById(toggleVal).style.display = "inline";
	}
	
	for(let i = varCount + 1; i <= 4; i++){
		let curVar = "var" + i;
		document.getElementById(curVar).style.display = "none";
		let inputVal = "input" + i;
		document.getElementById(inputVal).style.display = "none";
		let toggleVal = "input" + i + "Toggle";
		document.getElementById(toggleVal).style.display = "none";
	}
	// do a check to see if we have to clear testcases: that is, we change 
	// num of variables
	// types of variables
	
	
	// Add in warning in general, we don't have to check all of this
	
	if(!loadingTestcase){
		clearTestcases();
	}
	copyType();
	updateHeaderName(true);
	return;
}

// Checks if the passed in array has the same datatypes
// as the current datatypes
function checkSameType(checkedType){
	for(let i = 0; i < totalVarCount; i++){
		if(checkedType[i] != type[i]){
			return false;
		}
	}
	return true;
}

// copies type onto oldType
function copyType(){
	for(let i = 0; i < totalVarCount; i++){
		oldType[i] = type[i];
	}
	return;
}

// Checks if the variable names does not have duplicates (if it does, then
// a condition for changing variables stops the program from setting
// invalid parameter names
function checkVarNames(){
	for(let i = 1; i <= totalVarCount; i++){
		for(let j = i+1; j <= totalVarCount; j++){
			if(document.getElementById("var" + i).value == document.getElementById("var" + j).value){
				canRun = false;
				return false;
			}
		}
	}
	return true;
}

// Updates the function header "fucntion proc(..." depending on parameters
function updateHeaderName(override){
	if(override){
		names = [];
		for(let i = 1; i <= totalVarCount; i++){
			let name = document.getElementById("var" + i).value;
			names.push(name);
		}
	}
	let result = "";
	for(let i = 0; i < totalVarCount; i++){
		result += names[i];
		if(i < totalVarCount - 1){
			result += ", ";
		}
	}
	document.getElementById("functionHeader").innerHTML = 
		"Paste your code here: <br>" + "function proc(" + result + "){";
	return;
}

// Checks the user code using the checkTestcase function to check the code 
// against each testcase. It stores the result in programOut, and errors in allErrors
// It also has safeguards again invalid input and programs without return statements

// Aysnc Idea from Google Gemini (To help the code detect infinite loop and not crash)
// Website link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function#:~:text=Use%20of%20async%20and%20await,you%20will%20get%20a%20SyntaxError%20.
async function checkCode() {
    if(!canRun){
		return;
	}

    let userCode = document.getElementById('codeBox').value;
    allErrors = []; 
    if(userCode.split(" ").join("").includes("return;")){
		setNotification("You need to return a value (You have 'return;')!");
		return;
	}
    if(!userCode.includes("return")){
		setNotification("No return statement!");
		return;
	}
    correctCode = true;
    for (let tscs = 1; tscs <= testAmount; tscs++) {
        programOut[tscs - 1] = "Running..."; 
        renderTestcases();

        // Await Sourced from Google Gemini, 
        // site link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
        const resultObj = await checkTestcase(testcaseIn[tscs - 1], userCode);

        if(resultObj.isError){
            allErrors.push(resultObj.value + " On testcase " + tscs);
            programOut[tscs - 1] = "Error: " + resultObj.value;
        }else{
            programOut[tscs - 1] = resultObj.value;
        }
        
        if(resultObj.value.toString() != testcaseOut[tscs-1].toString()){
			allErrors.push("Wrong answer on testcase " + tscs);
			correctCode = false;
		}else{
			programOut[tscs - 1] += " (Correct!)";
		}
        
        renderTestcases();
    }
}

// Spread syntax "...":
// Site Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

// Try-Catch and Error checking
// Site Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#:~:text=When%20an%20exception%20is%20thrown,);%20//%20%22oops%22%20%7D

// Code recieved from Gemini AI 
// Worker Blob sourced from Gemini AI
// Site Link: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers#:~:text=to%20see%20ads?-,Web%20Workers%20API,be%20accessed%20from%20multiple%20scripts.
// Promise Object (For async running)
// Site Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise
// Resolve (Part of Promise Obj)
// Site Link: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/Promise

// Runs and checked the testcase with a timeout of 2 seconds to
// ensure that there is no infinite loop that crashes the program.
function checkTestcase(input, code, timeoutMs = 2000) {
    return new Promise((resolve) => {
        const workerBlob = new Blob([`
            self.onmessage = function(e) {
                try {
                    const func = new Function(...e.data.names, e.data.code);
                    
                    const result = func(...e.data.input);
                    self.postMessage({ success: true, value: result });
                } catch (err) {
                    self.postMessage({ success: false, value: err.message });
                }
            };
        `], { type: 'application/javascript' });

        const worker = new Worker(URL.createObjectURL(workerBlob));
        
        const timer = setTimeout(() => {
            worker.terminate();
            resolve({ value: "Time Limit Exceeded", isError: true });
        }, timeoutMs);

        worker.onmessage = (e) => {
            clearTimeout(timer);
            worker.terminate();
            resolve({ value: e.data.value, isError: !e.data.success });
        };

        worker.postMessage({ names: names, input: input, code: code });
    });
}

// Clears all testing data
function clearTestcases(){
	testcaseIn = [];
	testcaseInFormatted = [];
	testcaseOut = [];
	programOut = [];
	testAmount = 0;
	resetErrorField();
	renderTestcases();
}

// Gets the datatype of the value passed in to the function
function getType(val){
    if(Array.isArray(val)){
		return "array";
	}
    return typeof val;
}

// Adds a testcase; first checks if the testcase is valid (empty fields, unmatching datatypes, etc.)
// After valid checking, the function then pushes the values into the testing data arrays

/* Removing all spaces with split and join
 * https://stackoverflow.com/questions/6623231/remove-all-white-spaces-from-text#:~:text=Split%20and%20Join%20Method:%20An%20alternative%20method,the%20array%20back%20into%20a%20string%20(%60join('')%60).
 */
function updateTestcaseAdd(){
	resetErrorField();
	let inputArray = [];
	let formattedInputArray = [];
	let currentType = [];
	
	for(let i = 1; i <= totalVarCount; i++){
		let curInput = document.getElementById("input" + i);
		if(curInput.value.trim() == ""){
			setNotification("Invalid testcase (Empty input field)!");
			return; // testcase is invalid
		}
		
		
		let userInput;
		try{
			userInput = JSON.parse(curInput.value);
		}catch{
			// treat as just a regular string if not parsed
			userInput = curInput.value;
		}
		currentType.push(getType(userInput));
		inputArray.push(userInput);
		if(currentType[currentType.length - 1] == "string"){
			formattedInputArray.push("'" + userInput + "'");
		}else{
			formattedInputArray.push(userInput);
		}
	}
	let curOutput = document.getElementById("output").value;
	curOutput.split(' ').join('');
	if(curOutput == ""){
		setNotification("Invalid testcase (Empty output field)!");
		return;
	}
	if(!checkSameType(currentType)){
		setNotification("Invalid testcase data vaue types " + 
			"(your input cannot be parsed into the datatype of the current testing data)! " + 
			" Make sure you enter variables correctly, or update your datatypes.");
		return;
	}
	confirmedUpdate = false;
	programOut.push("Awaiting Testing...");
	testcaseIn.push(inputArray);
	testcaseOut.push(curOutput);
	testcaseInFormatted.push(formattedInputArray);
	testAmount++;
	renderTestcases();
}

// Deletes a testcase at line delLine (if possible)
function updateTestcaseDelete(){
	let delLine = Number(document.getElementById("lineDelete").value);
	let tempTestIn = [];
	let tempTestOut = [];
	if(delLine > testAmount || delLine < 1){
		setNotification("Invalid testcase deletion line!");
		return;
	}
	
	for(let i = 0; i < testAmount; i++){
		if(i != delLine - 1){
			tempTestIn.push(testcaseIn[i]);
			tempTestOut.push(testcaseOut[i]);
		}
	}
	testAmount--;
	testcaseIn = tempTestIn;
	testcaseOut = tempTestOut;
	renderTestcases();
}

// Asks confirmation for Updating the parameters as a warning that
// testing data will be erased
function askConfirmation(){
	let buttons = document.getElementsByClassName("confirmUpdate");
	for(let btn of buttons){
		btn.style.display = "block";
	}
	setNotification("Updating may erase testing data. Make sure to save (if you want to)!");
}

// Confirming whether or not to load a dataset in (similar to above)
function askConfirmationLoad(){
	let buttons = document.getElementsByClassName("loadUpdate");
	for(let btn of buttons){
		btn.style.display = "block";
	}
	setNotification("Updating may erase testing data. Make sure to save (if you want to)!");
}

// Confirming whether or not to change datatypes (similar to above)
function askConfirmationDT(){
	let buttons = document.getElementsByClassName("DTUpdate");
	for(let btn of buttons){
		btn.style.display = "block";
	}
	setNotification("Updating may erase testing data. Make sure to save (if you want to)!");
}

// Confirms update 1: Parameter updates
function confirmUpdate(){
	confirmedUpdate = true;
	let buttons = document.getElementsByClassName("confirmUpdate");
	for(let btn of buttons){
		btn.style.display = "none";
	}
	updateVars();
}

// Confirms update 2: Load dataset update
function confirmUpdateLoad(){
	confirmedUpdate = true;
	let buttons = document.getElementsByClassName("loadUpdate");
	for(let btn of buttons){
		btn.style.display = "none";
	}
	loadDataset();
}

// Confirms update 3: Datatypes update
function confirmUpdateDT(){
	confirmedUpdate = true;
	let buttons = document.getElementsByClassName("DTUpdate");
	for(let btn of buttons){
		btn.style.display = "none";
	}
	updateDatatype();
}

// Renders the testing data and program outputs (if any)
// Notifies the user of which testcases they got wrong or 100% completion
function renderTestcases(){
	let result = "";
	for(let i = 0; i < testAmount; i++){
		let result2 = "";
		for(let j = 0; j < testcaseInFormatted[i].length; j++){
			result2 += parseTestdata(type[j], testcaseInFormatted[i][j]);
			if(j < testcaseInFormatted[i].length-1){
				result2 += ", ";
			}
		}
		result += "Testcase " + (i+1) + ": " + result2 + " => " + testcaseOut[i] + " Your Output: " + programOut[i].toString() + "<br>";
	}
	document.getElementById("testcaseContainer").innerHTML = 
		"Testcases: <br> Input => Expected output, Your output<br>" + result;
		
	let result3 = "";
	for(let i = 0; i < allErrors.length; i++){
		result3 += allErrors[i] + "<br>";
	}
	if(result3 == ""){
		result3 = "None";
	}
	if(correctCode){
		result3 = "100% Completion!";
	}
	setNotification(result3);
}

// Parses testing data (just for arrays)
function parseTestdata(typeIn, str){
	if(typeIn == "array"){
		return "[" + str + "]";
	}else{
		return str;
	}
}

// Updates the datatypes of the program input
function updateDatatype(){
	resetErrorField();
	for(let i = 1; i <= totalVarCount; i++){
		if(!checkDT5(document.getElementById("input" + i + "Toggle").value)){
			setNotification("Invalid data type input! Reminder, it is case sensitive. Check the list to see the 5 types that are allowed.");
			return;
		}
	}
	if(!confirmedUpdate){
		if(testAmount > 0){
			askConfirmationDT();
			return;
		}
	}
	clearTestcases();
	for(let i = 1; i <= totalVarCount; i++){
		type[i-1] = document.getElementById("input" + i + "Toggle").value;
	}
	setNotification("Datatypes are updated.");
	confirmedUpdate = false;
	return;
}

// Checks whether or not the datatype is one of the 5 supported
function checkDT5(str){
	if(str != "number" && str != "string" && str != "array" && str != "object" && str != "boolean"){
		return false;
	}
	return true;
}

// calls saveDataset with override false
function updateDatasetNormal(){
	saveDataset(false);
}

// calls daveDataset with override true
function updateDatasetOverride(){
	saveDataset(true);
}

// gets unique signature for a testcase input/output
function getSignature(input, output){
    return JSON.stringify(input) + "DIVIDER" + JSON.stringify(output);
}

// deduplicates all inputs and outputs using a Set and a signature
// if the signature is seen before, the element is not pushed to the
// final input/output object that is returned.

// Set and set methods sourced from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
function deduplicate(inputs, outputs){
    let seen = new Set();
    let newInputs = [];
    let newOutputs = [];

    for(let i = 0; i < inputs.length; i++){
        let sig = getSignature(inputs[i], outputs[i]);

        if(!seen.has(sig)){
            seen.add(sig);
            newInputs.push(inputs[i]);
            newOutputs.push(outputs[i]);
        }
    }

    return {inputs: newInputs, outputs: newOutputs};
}

// Saves the dataset with the choice to override or append
// If the dataset name has not occured in local storage before, 
// then it creates a new datatset
// If it occured before, overriding will delete previous data and
// then save current testing data.
// Appending will simply add current testcase elements to the already existing
// testing data (also deduplicating)

// JSON.parse sourced from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

// Local storage sourced from:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
function saveDataset(override){
	let datasetName = document.getElementById("datasetName").value;
	let allData = JSON.parse(localStorage.getItem("datasets")) || {};
	
	if(datasetName == ""){
		setNotification("Dataset name is blank!");
		return;
	}
	
	if(testAmount == 0){
		if(override){
			setNotification("Dataset deleted!");
		}else{
			setNotification("There is no dataset to save!");
			return;
		}
	}
	let appending = false;
	if(datasetName in allData){
		// duplicate name
		
		// double check: if the data are all matching (eg var amount, types, names) then we can update the ds
		if(checkSyncContent(allData[datasetName])){
			if(override){
				setNotification("Dataset overriden!");
			}else{
				setNotification("Dataset appended with your new inputs!");
			}
			appending = true;
		}else{
			setNotification("Sorry, dataset name already taken on this device! <br>" + 
				"If you wish to modify the dataset, you need to match amount of variables, variable names, and data types of input...");
			return;
		}
	}
	
	// concatination of arrays
	// site link: https://www.w3schools.com/jsref/jsref_concat_array.asp
	
	// duplicate testcase checking
	let cleaned = deduplicate(testcaseIn, testcaseOut);
	let curInputs = cleaned.inputs;
	let curOutputs = cleaned.outputs;
	
	if(appending && !override){
		let data = allData[datasetName];

		let existingInputs = data.inputs;
		let existingOutputs = data.outputs;

		let seen = new Set();

		// mark existing
		for(let i = 0; i < existingInputs.length; i++){
			seen.add(getSignature(existingInputs[i], existingOutputs[i]));
		}

		let newInputs = [...existingInputs];
		let newOutputs = [...existingOutputs];

		// add deduplicated current ones
		for(let i = 0; i < curInputs.length; i++){
			let sig = getSignature(curInputs[i], curOutputs[i]);

			if(!seen.has(sig)){
				seen.add(sig);
				newInputs.push(curInputs[i]);
				newOutputs.push(curOutputs[i]);
			}
		}

		let userCode = document.getElementById("codeBox").value;

		allData[datasetName] = {
			varNum: totalVarCount,
			inputs: newInputs,
			outputs: newOutputs,
			types: type,
			varNames: names,
			savedCode: userCode
		};
	}else{
		let userCode = document.getElementById("codeBox").value;

		allData[datasetName] = {
			varNum: totalVarCount,
			inputs: curInputs,
			outputs: curOutputs,
			types: type,
			varNames: names,
			savedCode: userCode
		};
	}
    localStorage.setItem("datasets", JSON.stringify(allData));
    
    showAvailableDS();
}

// Checks if the content is synced so we can actually save the data correctly
function checkSyncContent(data){
	if(totalVarCount == data.varNum){
		for(let i = 0; i < totalVarCount; i++){
			if(type[i] != data.types[i] || names[i] != data.varNames[i]){
				return false;
			}
		}
		return true;
	}
	return false;
}

// Loads a dataset in while asking for confirmation.
// It just copies the testcases over to the local running testcases
// and displays it.
function loadDataset(){
	
	if(!confirmedUpdate){
		if(testAmount > 0){
			askConfirmationLoad();
			return;
		}
	}
	
	let datasetName = document.getElementById("loadDatasetName").value;
    let allData = JSON.parse(localStorage.getItem("datasets")) || {};

    let data = allData[datasetName];
    if(!data){
		setNotification(" No such dataset exists! Check your typing.");
		return;
	}
	
	resetErrorField();
	
	
	clearTestcases();
	loadingTestcase = true;
	totalVarCount = data.varNum;
    testcaseIn = [...data.inputs];
    testcaseOut = [...data.outputs];
    type = [...data.types];
    names = [...data.varNames];
    testAmount = testcaseIn.length;
    let userCode = data.savedCode;
    
    testcaseInFormatted = [];

	for(let i = 0; i < testAmount; i++){
		let formatted = [];
		for(let j = 0; j < totalVarCount; j++){
			if(type[j] == "string"){
				formatted.push("'" + testcaseIn[i][j] + "'");
			}else{
				formatted.push(testcaseIn[i][j]);
			}
		}
		testcaseInFormatted.push(formatted);
	}
	
	document.getElementById("codeBox").value = userCode;
    
    copyType();
	bufferNames();
	setUserInputs();
	outputSet();
    renderTestcases();
    
    loadingTestcase = false;
    setNotification("Dataset successfully loaded!");
    confirmedUpdate = false;
    return;
}

// Deletes a dataset with a certain name

// JSON.stringify sourced from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
function deleteDataset(){
	resetErrorField();
	let datasetName = document.getElementById("loadDatasetName").value;
    let allData = JSON.parse(localStorage.getItem("datasets")) || {};

    let data = allData[datasetName];
    if(!data){
		setNotification("No such dataset exists! Check your typing.");
		return;
	}
	delete allData[datasetName];
	localStorage.setItem("datasets", JSON.stringify(allData));
	showAvailableDS();
}

// Refreshes the datasets seen on the right side whenever the user saves more datasets
// Displays important DS information.
function showAvailableDS(){
	let allData = JSON.parse(localStorage.getItem("datasets")) || {};
	let result = "";
	for(let key in allData){
		if(allData.hasOwnProperty(key)){
			let curData = allData[key];
			result += "Dataset name: " + key + "<br>";
			result += "\tAmount of vars: " + curData.varNum + "<br>";
			result += "\tVar types: ";
			for(let i = 0; i < curData.varNum - 1; i++){
				result += curData.types[i] + ", ";
			}
			result += curData.types[curData.varNum - 1] + "<br>";
			result += "\tVar names: " + curData.varNames + "<br><br>";
		}
	}
	document.getElementById("savedTestcases").innerHTML = "Saved test cases (Load to see content): <br>" + result;
	return;
}

// helper function to set programOut to default.
function outputSet(){
	for(let i = 0; i < testAmount; i++){
		programOut.push("Awaiting Testing...");
	}
	return;
}

// Helper function to set the user inputs to the loaded dataset inputs
function setUserInputs(){
	for(let i = 1; i <= 4; i++){
		document.getElementById("var" + i).value = names[i-1];
	}
	for(let i = 1; i <= totalVarCount; i++){
		document.getElementById("input" + i + "Toggle").value = type[i-1];
	}
	document.getElementById("numParam").value = totalVarCount;
	updateVars();
	return;
}

// Makes sure names are defined for all 4 positions.
function bufferNames(){
	for(let i = totalVarCount; i < 4; i++){
		// ASCII chart
		names[i] = String.fromCharCode(97 + i);
	}
	return;
}

// Resets the notification and the error check of "correctCode" which
// tells if the code can run
function resetErrorField(){
	correctCode = false;
	setNotification("None");
}

// sets the types to their defaults.
function setAll(){
	// true means string, false means numberical
	type[0] = "string";
	type[1] = "string";
	type[2] = "string";
	type[3] = "string";
	oldType[0] = "string";
	oldType[1] = "string";
	oldType[2] = "string";
	oldType[3] = "string";
}

// ACORN PARSER

// Acorn script and methods sourced from:
// https://github.com/acornjs/acorn

let currentLine = 0;
let currentTestcaseNum = -1;
let totalLines = 0;
let fullAcorn = [];
let acornLines = [];
let ACORN;
let memory;

// object: stores critical info to stop the program when output is reached
let runtime = {
	returned: false,
	returnValue: undefined
};

// starts the acorn parser and generates all the line by line data

// Template literals sourced from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
function startAcorn(){
	const tempTestNum = Number(document.getElementById("debugTestcase").value);

	if(currentLine !== tempTestNum && currentLine > 0){
		setNotification("Updated testcase to check!");
	}

	if(!Number.isInteger(tempTestNum) || tempTestNum > testAmount || tempTestNum <= 0){
		setNotification("Invalid test case to check!");
		return;
	}

	currentTestcaseNum = tempTestNum;

	const userCode = document.getElementById("codeBox").value;
	const wrappedCode = `
	function userFunc(${names.join(', ')}){
		${userCode}
	}
	`;

	try{
		ACORN = acorn.parse(wrappedCode, {ecmaVersion: 2020, locations: true});
		const funcNode = ACORN.body[0];
		acornLines = funcNode.body.body;
		totalLines = acornLines.length;
		currentLine = 0;

		setNotification("Line by line successfully loaded!");
	}catch(err){
		setNotification("Error in line by line: " + err + "!");
		return;
	}

	populateAcorn();
}

// This populates each line for the line by line using a while loop
// to run the function runNextLine()
function populateAcorn(){
	fullAcorn = [];
	memory = {};
	runtime = {
		returned: false,
		returnValue: undefined
	};

	for(let i = 0; i < totalVarCount; i++){
		memory[names[i]] = testcaseIn[currentTestcaseNum - 1][i];
	}

	fullAcorn.push(cloneMemory());

	while(runNextLine()){
		currentLine++;
	}
}

// The function simply executes the "node" of the Acorn;
// essentially, a node is a line such as declaration, if statements, loops, etc.
// "Node" contains info such as this and many additional information which helps
// us know what to do at this step. ACORN is an AST (Abstract syntax tree) 
// which stores all of these nodes, and the paths on the tree determine our
// progression.
function runNextLine(){
	if(currentLine >= totalLines || runtime.returned){
		return false;
	}

	const node = acornLines[currentLine];
	executeNode(node);
	return !runtime.returned && currentLine + 1 < totalLines;
}

// clones the memory to return (and save it later)
function cloneMemory(){
	const out = {};
	for(const key in memory){
		out[key] = deepCopyValue(memory[key]);
	}
	return out;
}

// makes a copy of memory and ensures that there are no references 
// that will bug the memory
function deepCopyValue(value){
	if(Array.isArray(value)){
		return value.map(deepCopyValue);
	}

	if(value && typeof value === "object"){
		const out = {};
		for(const key in value){
			out[key] = deepCopyValue(value[key]);
		}
		return out;
	}

	return value;
}

// Records the current step: at this step, we have different variable values
// which is stored in the object that cloneMemory has.
function recordSnapshot(){
	fullAcorn.push(cloneMemory());
}

// checks if this is a boolean
function isTruthy(value){
	return !!value;
}

// actual execution of the node:
// Checks all different node types from declaring, 
// expressions, if/else, loops, returns, breaks, continues, and block
// Each case has a different response.

// switch, Case inspired by ChatGPT (framework was given to me, but I filled out the 
// inner components)
// https://chat.openai.com
// switch(x)
// case y is just an if statement of if(x == y)
function executeNode(node){
	if(!node || runtime.returned){
		return {type:"normal"};
	}

	switch(node.type){
		case "EmptyStatement":
			return {type:"normal"};

		// essentially, we create a new id name for the declaraions
		// there could be multiple ex: let a=1, b=2, ...;
		// the Acorn Node dutifully stores all of it!
		// We then save the variable to the declared value (or undefined 
		// if the variable is not declared to be a value yet).
		// record the current snapshot of our variable at this step.
		// returns a return type which is monitored (seen in later cases)
		case "VariableDeclaration":
			for(const decl of node.declarations){
				let varName = decl.id.name;
				let value = decl.init ? evaluateExpression(decl.init) : undefined;
				memory[varName] = value;
			}
			recordSnapshot();
			return {type:"normal"};
	
		// expression statement (uses a seperate helper function for this)
		case "ExpressionStatement":
			evaluateExpression(node.expression);
			recordSnapshot();
			return {type:"normal"};

		// returns a value. here, we need to change our return object of type to "return"
		// to let the program know that we don't want to run the code anymore.
		case "ReturnStatement":
			runtime.returnValue = node.argument ? evaluateExpression(node.argument) : undefined;
			runtime.returned = true;
			memory.__return__ = runtime.returnValue;
			recordSnapshot();
			return {type:"return"};

		// evaluates the if statement using the evaluateExpression helper
		// node.consequent envelops the next state within the if statement.
		// running executeNode as a recursive function on the tree of nodes
		// goes deeper in the tree until we hit a more "basic" node such 
		// as the ones above
		// node.alternate (check for else if and else) runs the next executeNode 
		// similarly to above.
		case "IfStatement":
			if(isTruthy(evaluateExpression(node.test))){
				const flow = executeNode(node.consequent);
				if(flow.type !== "normal"){
					return flow;
				}
			}else if(node.alternate){
				const flow = executeNode(node.alternate);
				if(flow.type !== "normal"){
					return flow;
				}
			}
			return {type:"normal"};

		// While statement uses a internal while loop
		// Here, the return type becomes important. If the program returned
		// at some point in the middle of the while loop, 
		// we want to stop our execution.
		// We use the isTruthy on the evaluated expression of node.test
		// where node.test is the running condition for the while loop.
		// when setting flow = executeNode(node.body), the body of code
		// is decomposed with recursion down the line similar
		// to the if statement
		case "WhileStatement":
			while(isTruthy(evaluateExpression(node.test))){
				const flow = executeNode(node.body);

				if(flow.type === "return"){
					return flow;
				}
				if(flow.type === "break"){
					break;
				}
				if(flow.type === "continue"){
					continue;
				}
			}
			return {type:"normal"};

		// Similar to above, except the loop is changed to a dowhile
		case "DoWhileStatement":
			do{
				const flow = executeNode(node.body);

				if(flow.type === "return"){
					return flow;
				}
				if(flow.type === "break"){
					break;
				}
				if(flow.type === "continue"){
					continue;
				}
				
			}while(isTruthy(evaluateExpression(node.test)));

			return {type:"normal"};

		// a for loop needs a while loop because during runtime, we really don't know 
		// how many times the loop runs (could return in the middle)
		// We have to go through a variable declaration (if exists) and
		// record that snapshot. 
		// We create a while loop which checks the node.test condition
		// to continue. We use flow similarly as above but we have to record a snapshot
		// once we get to a node.update (which is usually something like i++)
		// This has to be handled seperately. 
		case "ForStatement":
			if(node.init){
				if(node.init.type === "VariableDeclaration"){
					const flow = executeNode(node.init);
					if(flow.type !== "normal"){
						return flow;
					}
				}else{
					evaluateExpression(node.init);
					recordSnapshot();
				}
			}

			while(node.test ? isTruthy(evaluateExpression(node.test)) : true){
				const flow = executeNode(node.body);

				if(flow.type === "return"){
					return flow;
				}
				if(flow.type === "break"){
					break;
				}

				if(flow.type === "continue"){
					if(node.update){
						evaluateExpression(node.update);
						recordSnapshot();
					}
					continue;
				}

				// normal update step
				if(node.update){
					evaluateExpression(node.update);
					recordSnapshot();
				}

				if(runtime.returned){
					return {type:"return"};
				}
			}
			return {type:"normal"};

		// just return the type, break statements really only matter for loops
		// and tell it when to break
		case "BreakStatement":
			return {type:"break"};

		// similar as above, tells the loop to continue
		case "ContinueStatement":
			return {type:"continue"};

		// treated differently because we have to recurse into the block 
		// like a loop
		case "BlockStatement":
			for(const stmt of node.body){
				const flow = executeNode(stmt);

				if(runtime.returned){
					return {type:"return"};
				}

				if(flow.type !== "normal"){
					return flow;
				}
			}
			return {type:"normal"};

		// unsupported statement (which is probably outside the scope of the
		// intended audience for the debugger)
		default:
			setNotification("Unsupported statement: " + node.type);
			return {type:"normal"};
	}
}

// assigns a value to a target variable (the calculations made is in a 
// later function). Valid checks and error throwing.
function assignToTarget(target, value){
	if(target.type === "Identifier"){
		memory[target.name] = value;
		return value;
	}

	if(target.type === "MemberExpression"){
		const objectValue = evaluateExpression(target.object);
		const propertyValue = target.computed ? evaluateExpression(target.property) : target.property.name;

		if(objectValue == null){
			throw new Error("Cannot assign into null/undefined.");
		}

		objectValue[propertyValue] = value;
		return value;
	}

	throw new Error("Unsupported assignment target: " + target.type);
}

// Evaluates the expression. It could be a condition that we are evaluating
// such as (cond1 && cond2) or an array, object, etc.
// This is also recursive: some expressions have arguments which contain 
// expressions; for example, cond1 && cond2 must be decomposed to
// evaluating cond1 and cond2 seperately, then returning the combined result
function evaluateExpression(expr){
	if(!expr){
		return undefined;
	}

	if(expr.type === "Literal"){
		return expr.value;
	}

	if(expr.type === "Identifier"){
		if(expr.type === "Identifier"){
		if(expr.name === "Math") return Math;
			return memory[expr.name];
		}
	}

	if(expr.type === "ArrayExpression"){
		return expr.elements.map(el => el ? evaluateExpression(el) : undefined);
	}

	if(expr.type === "ObjectExpression"){
		const obj = {};
		for(const prop of expr.properties){
			const key = prop.key.type === "Identifier" ? prop.key.name : prop.key.value;
			obj[key] = evaluateExpression(prop.value);
		}
		return obj;
	}

	if(expr.type === "MemberExpression"){
		const objectValue = evaluateExpression(expr.object);
		const propertyValue = expr.computed ? evaluateExpression(expr.property) : expr.property.name;

		if(objectValue == null){
			return undefined;
		}

		return objectValue[propertyValue];
	}

	if(expr.type === "BinaryExpression"){
		const left = evaluateExpression(expr.left);
		const right = evaluateExpression(expr.right);

		if(expr.operator === "+") return left + right;
		if(expr.operator === "-") return left - right;
		if(expr.operator === "*") return left * right;
		if(expr.operator === "/") return left / right;
		if(expr.operator === "%") return left % right;
		if(expr.operator === "**") return left ** right;

		if(expr.operator === "==") return left == right;
		if(expr.operator === "===") return left === right;
		if(expr.operator === "!=") return left != right;
		if(expr.operator === "!==") return left !== right;

		if(expr.operator === "<") return left < right;
		if(expr.operator === "<=") return left <= right;
		if(expr.operator === ">") return left > right;
		if(expr.operator === ">=") return left >= right;
	}

	if(expr.type === "LogicalExpression"){
		const left = evaluateExpression(expr.left);

		if(expr.operator === "&&"){
			return left && evaluateExpression(expr.right);
		}

		if(expr.operator === "||"){
			return left || evaluateExpression(expr.right);
		}

		if(expr.operator === "??"){
			return left ?? evaluateExpression(expr.right);
		}
	}

	if(expr.type === "UnaryExpression"){
		const val = evaluateExpression(expr.argument);

		if(expr.operator === "-") return -val;
		if(expr.operator === "+") return +val;
		if(expr.operator === "!") return !val;
		if(expr.operator === "typeof") return typeof val;
		if(expr.operator === "void") return void val;
	}

	if(expr.type === "ConditionalExpression"){
		return isTruthy(evaluateExpression(expr.test))
			? evaluateExpression(expr.consequent)
			: evaluateExpression(expr.alternate);
	}

	if(expr.type === "AssignmentExpression"){
		const right = evaluateExpression(expr.right);

		if(expr.operator === "="){
			return assignToTarget(expr.left, right);
		}

		const left = evaluateExpression(expr.left);
		let result;

		if(expr.operator === "+=") result = left + right;
		else if(expr.operator === "-=") result = left - right;
		else if(expr.operator === "*=") result = left * right;
		else if(expr.operator === "/=") result = left / right;
		else if(expr.operator === "%=") result = left % right;
		else if(expr.operator === "**=") result = left ** right;
		else if(expr.operator === "<<=") result = left << right;
		else if(expr.operator === ">>=") result = left >> right;
		else if(expr.operator === ">>>=") result = left >>> right;
		else if(expr.operator === "&=") result = left & right;
		else if(expr.operator === "^=") result = left ^ right;
		else if(expr.operator === "|=") result = left | right;
		else{
			setNotification("Unsupported assignment operator:", expr.operator);
			return undefined;
		}
		// example of assignToTarget in use: We get the new result, and
		// then have the variable be equal to this new result
		return assignToTarget(expr.left, result);
	}

	if(expr.type === "UpdateExpression"){
		const oldValue = evaluateExpression(expr.argument);
		const newValue = expr.operator === "++" ? oldValue + 1 : oldValue - 1;
		assignToTarget(expr.argument, newValue);
		return expr.prefix ? newValue : oldValue;
	}

	if(expr.type === "CallExpression"){
		const args = expr.arguments.map(arg => evaluateExpression(arg));

		if(expr.callee.type === "MemberExpression"){
			const objectValue = evaluateExpression(expr.callee.object);
			const propName = expr.callee.computed ? evaluateExpression(expr.callee.property) : expr.callee.property.name;

			if(objectValue === Math && typeof Math[propName] === "function"){
				return Math[propName](...args);
			}

			if(objectValue && typeof objectValue[propName] === "function"){
				return objectValue[propName](...args);
			}
		}

		if(expr.callee.type === "Identifier"){
			const fnName = expr.callee.name;

			if(fnName === "parseInt") return parseInt(args[0], args[1]);
			if(fnName === "parseFloat") return parseFloat(args[0]);
			if(fnName === "Number") return Number(args[0]);
			if(fnName === "String") return String(args[0]);
			if(fnName === "Boolean") return Boolean(args[0]);
		}

		setNotification("Function calls not supported yet:", expr.callee.type);
		return undefined;
	}

	setNotification("Unsupported expression:", expr.type);
	return undefined;
}

// Shows the debug display with the information at a specific
// step in the code.
function updateDebugDisplay(){
	currentLine	= Number(document.getElementById("debugLine").value);
	
	if(currentLine < 0){
		document.getElementById("debugLine").value = 0;
		document.getElementById("debugField").innerHTML = "Negative lines don't exist...";
		return;
	}
	document.getElementById("debugField").innerHTML = memoryToString(fullAcorn[currentLine]);
	return;
}

// helper function to format arrays and objects; all else will be returned
// as strings for visuals.
function formatValue(val){
	if(Array.isArray(val)){
		return "[" + val.map(formatValue).join(", ") + "]";
	}
	if(val && typeof val === "object"){
		return "{" + Object.entries(val).map(([k,v]) => `${k}: ${formatValue(v)}`).join(", ") + "}";
	}
	return String(val);
}

// converts a memory object to a string of numbers using formatValue 
// for each element and returns the string version to print.
function memoryToString(mem){
	return Object.entries(mem)
		.map(([key, value]) => `${key} = ${formatValue(value)}`)
		.join("<br>");
}

// helper function to set notifications to some value.
// helps with the entire code as notifications are potentially changed
// anywhere depending on the user action.
function setNotification(str){
	let elements = document.getElementsByClassName("notifContainer");
    for(let el of elements){
        el.innerHTML = "Notifications: <br>" + str;
    }
}

setAll();
updateVars();
showAvailableDS();
confirmedUpdate = false;

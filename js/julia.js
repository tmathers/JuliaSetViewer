/***********************************************************************
 * julia.js
 * Written by Tara Mathers, 2010 
 * ---------------------------------------------------------------------
 *  
 * *********************************************************************/     

 	
c_re = -0.70176;
c_im = -0.3842;

REFRESH_RATE = 10;
	
 /******************************************
 * initialize()
 * Initial function called on page load
 *****************************************/

function initialize() {

	// Global variables:
	
	// Create canvas and context objects
	canvas = document.getElementById('julia');	
	context = canvas.getContext('2d');

	CANVAS_WIDTH = canvas.width;
	CANVAS_HEIGHT = canvas.height;
	
	mCanvas = document.getElementById('mandelbrot');	
	mContext = mCanvas.getContext('2d');

	M_CANVAS_WIDTH = mCanvas.width;
	M_CANVAS_HEIGHT = mCanvas.height;
	
	

	

	MaxIterations = 256;
	
	colorStep = 15;
	
	colorCycle = false;		// if set to true color cycling is turned on
		
	colorCycleIn = true;	// direction of color-cycling
	
	
	//Mouse click position:
	mouseX = 0;
	mouseY = 0;
	

	
	
	image = context.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
	
	mImage = mContext.getImageData(0, 0, M_CANVAS_WIDTH, M_CANVAS_HEIGHT);
	
	
	
	//Add mouse click event listener
	canvas.addEventListener("click", zoom, false);
	
	mCanvas.addEventListener("mousemove", juliaLocation, false);

	
	drawMandelbrot();	

	drawJulia();

	
	// Call drawColorCycle() at each refresh interval
	setInterval(drawColorCycle, REFRESH_RATE);

}


/*******************************************************
 * click(e)
 * -----------------------------------------------------
 * Click event - re-draws the fractal, zoomed in at the 
 * specified point
 *******************************************************/
function zoom(e) { 
		
	//get canvas position and add it to current mouse position	
	
	var obj = document.getElementById('canvas');
	
	var left = 0;
	var top = 0;
	
	if (obj.offsetParent) {
		do {
			left += obj.offsetLeft;
			top += obj.offsetTop;
		} while (obj = obj.offsetParent);	
	}
  
	mouseX = e.clientX - canvas.offsetLeft;
	mouseY = e.clientY - canvas.offsetTop;
	
	
	// re-calculate the new max and min values for the real and imaginary axii
	
	var xZoom = mouseX / CANVAS_WIDTH;
	var yZoom = mouseY / CANVAS_HEIGHT;
	
	var rangeRe = MaxRe - MinRe;
	var centerRe = MinRe + rangeRe * xZoom;
	
	MinRe = centerRe - rangeRe/4;
	MaxRe = centerRe + rangeRe/4;
	
	var rangeIm = MaxIm + Math.abs(MinIm);
	var centerIm = MinIm +( (1.0 - yZoom)*rangeIm);
	
	MinIm = centerIm - rangeIm/4;
	MaxIm = MinIm+(MaxRe-MinRe)*CANVAS_HEIGHT/CANVAS_WIDTH;
	
	Re_factor = (MaxRe-MinRe)/(CANVAS_WIDTH-1);
	Im_factor = (MaxIm-MinIm)/(CANVAS_HEIGHT-1);
	
	drawJulia();		// re-draw the set
	
}


/**********************************************************************************
 * juliaLocation(e)
 * --------------------------------------------------------------------------------
 * Computes the value of c for the current mouse position over the Mandelbrot 
 * image, then calls the method to redraw the Julia set.
 **********************************************************************************/
function juliaLocation(e) { 
		
	//get canvas position and add it to current mouse position	
	
	var obj = document.getElementById('mandelbrot');
	
	var left = 0;
	var top = 0;
	
	if (obj.offsetParent) {
		do {
			left += obj.offsetLeft;
			top += obj.offsetTop;
		} while (obj = obj.offsetParent);	
	}
  
	var mouseX = (e.clientX - left) + window.pageXOffset
	var mouseY = (e.clientY - top) + window.pageYOffset
	
	//alert(e.clientY + ", " + mCanvas.offsetTop + ", "+top);
	
	var MinRe = -2.0;		// min real component
	var MaxRe = 1.0;		// max real component 
	var MinIm = -1.2;		// min imaginary component
	var MaxIm = MinIm+(MaxRe-MinRe)*M_CANVAS_HEIGHT/M_CANVAS_WIDTH;		// max imaginary component
	
	var Re_factor = (MaxRe-MinRe)/(M_CANVAS_WIDTH-1);		// conversion factor from pixels to real axis 
	var Im_factor = (MaxIm-MinIm)/(M_CANVAS_HEIGHT-1);	// conversion factor from pixels to imaginary axis 
	
	// re-calculate the new max and min values for the real and imaginary axii
	
	var x = mouseX / M_CANVAS_WIDTH;
	var y = mouseY / M_CANVAS_HEIGHT;
	
	var rangeRe = MaxRe - MinRe;
	c_re = MinRe + rangeRe * x;
	
	var rangeIm = MaxIm - MinIm;
	c_im = MinIm + ((1.0 - y) * rangeIm);	

	drawJulia();		// re-draw the set
	
	// Update c value display
	document.getElementById("c-val").innerHTML = getCReal() + " + " + getCImaginary() + "i";
	
}


/**********************************************************************************
 * drawJulia()
 * --------------------------------------------------------------------------------
 * Draws the first frame when the page is loaded and after sooming in
 * The function iterates through each pixel and first calculates whether it is 
 * inside the set and if so colors it black. If it not it colors the pixel 
 * according to the number of iterations needed to calculate it.
 *
 **********************************************************************************/
function drawJulia() {

	var MinRe = -1.75;		// min real number
	var MaxRe = 1.75;		// max real number 
	var MinIm = -1.35;		// min imaginary number
	var MaxIm = MinIm+(MaxRe-MinRe)*CANVAS_HEIGHT/CANVAS_WIDTH;		// max imaginary number
	
	var Re_factor = (MaxRe-MinRe)/(CANVAS_WIDTH-1);		// conversion factor from pixels to real axis 
	var Im_factor = (MaxIm-MinIm)/(CANVAS_HEIGHT-1);	// conversion factor from pixels to imaginary axis 

	
	var imageData = image.data; // detach the pixel array from DOM
	
	
	var Z_re = 0;
	var Z_im = 0;
	
	
	
	for (var row = 0; row < CANVAS_HEIGHT; row++) {
			
		
		
		for (var col = 0; col < CANVAS_WIDTH; col++) {
		
			Z_re = MinRe + col*Re_factor;
			Z_im = MaxIm - row*Im_factor;
			
        
			var isInside = 1;
			
			var green = 255;
			var blue = 255;
			var red = 0;
        
			var iterations = 0;
	
			
			for(var n = 0; n < MaxIterations; ++n)
			{
				var Z_re2 = Z_re * Z_re;
				var Z_im2 = Z_im * Z_im;
				
				if(Z_re2 + Z_im2 > 4) {
					isInside = 0;
					break;
				}
				
				// change the color of each pixel on each iteration
				if (isInside == 1) {
					Z_im = 2 * Z_re * Z_im + c_im;
					Z_re = Z_re2 - Z_im2 + c_re;
					
					// cyan to blue:
					if (red == 0 && green > 0 && blue == 255) {
						green -= colorStep;
						if (green < 0)
							green = 0;
					}
					
					// blue to magenta:
					else if (red < 255 && green == 0 && blue == 255) {
						red += colorStep;
						if (red > 255) 
							red = 255;
					}

					// magenta to red:
					else if (red == 255 && green == 0 && blue > 0) {
						blue -= colorStep;
						if (blue < 0) 
							blue = 0;
					}
					
					// red to yellow:
					else if (red == 255 && green < 255 && blue == 0) {
						green += colorStep;
						if (green > 255) 
							green = 255;
					}
					
					// yellow to green:
					else if (red > 0 && green == 255 && blue == 0) {
						red -= colorStep;
						if (red < 0) 
							red = 0;
					}
					
					// green to cyan:
					else if (red == 0 && green == 255 && blue < 255) {
						blue += colorStep;
						if (blue > 255) 
							blue = 255;
					}
					
				}
				
				iterations = n;
				
			}
			
     		if(isInside == 1) { 
				
				var i = row * CANVAS_WIDTH + col;
				imageData[4*i+0] = 0; // Red value
				imageData[4*i+1] = 0; // Green value
				imageData[4*i+2] = 0; // Blue value
				imageData[4*i+3] = 255; // Alpha value
			}
			
			else {
				
				var i = row * CANVAS_WIDTH + col;
				imageData[4*i+0] = red; // Red value
				imageData[4*i+1] = green; // Green value
				imageData[4*i+2] = blue; // Blue value
				imageData[4*i+3] = 255; // Alpha value
			}

			
		}
	}
		
	
	image.data = imageData; // attach image data object back to DOM 
	context.putImageData(image, 0, 0);
	
}

/**********************************************************************************
 * drawMandelbrot()
 * --------------------------------------------------------------------------------
 * Draws a static image of the Mandelbrot.
 *
 **********************************************************************************/
function drawMandelbrot() {

	var MinRe = -2.0;		// min real component
	var MaxRe = 1.0;		// max real component 
	var MinIm = -1.2;		// min imaginary component
	var MaxIm = MinIm+(MaxRe-MinRe)*M_CANVAS_HEIGHT/M_CANVAS_WIDTH;		// max imaginary component
	
	var Re_factor = (MaxRe-MinRe)/(M_CANVAS_WIDTH-1);		// conversion factor from pixels to real axis 
	var Im_factor = (MaxIm-MinIm)/(M_CANVAS_HEIGHT-1);	// conversion factor from pixels to imaginary axis 

	var imageData = mImage.data; // detach the pixel array from DOM
	
	for (var row = 0; row < M_CANVAS_HEIGHT; row++) {
			
		var c_im = MaxIm - row*Im_factor;
		
		for (var col = 0; col < M_CANVAS_WIDTH; col++) {
		
		
			var c_re = MinRe + col*Re_factor;
			
			var Z_re = c_re;
			var Z_im = c_im;
        
			var isInside = 1;
			
			var green = 255;
			var blue = 255;
			var red = 0;
        
			var iterations = 0;
	
			
			for(var n = 0; n < 256; ++n)
			{
				var Z_re2 = Z_re * Z_re;
				var Z_im2 = Z_im * Z_im;
				
				if(Z_re2 + Z_im2 > 4) {
					isInside = 0;
					break;
				}
				
				// change the color of each pixel on each iteration
				if (isInside == 1) {
					Z_im = 2 * Z_re * Z_im + c_im;
					Z_re = Z_re2 - Z_im2 + c_re;
					
					// cyan to blue:
					if (red == 0 && green > 0 && blue == 255) {
						green -= colorStep;
						if (green < 0)
							green = 0;
					}
					
					// blue to magenta:
					else if (red < 255 && green == 0 && blue == 255) {
						red += colorStep;
						if (red > 255) 
							red = 255;
					}

					// magenta to red:
					else if (red == 255 && green == 0 && blue > 0) {
						blue -= colorStep;
						if (blue < 0) 
							blue = 0;
					}
					
					// red to yellow:
					else if (red == 255 && green < 255 && blue == 0) {
						green += colorStep;
						if (green > 255) 
							green = 255;
					}
					
					// yellow to green:
					else if (red > 0 && green == 255 && blue == 0) {
						red -= colorStep;
						if (red < 0) 
							red = 0;
					}
					
					// green to cyan:
					else if (red == 0 && green == 255 && blue < 255) {
						blue += colorStep;
						if (blue > 255) 
							blue = 255;
					}
					
				}
				
				iterations = n;
				
			}
			
     		if(isInside == 1) { 
				
				var i = row * M_CANVAS_WIDTH + col;
				imageData[4*i+0] = 0; // Red value
				imageData[4*i+1] = 0; // Green value
				imageData[4*i+2] = 0; // Blue value
				imageData[4*i+3] = 255; // Alpha value
			}
			
			else {
				
				var i = row * M_CANVAS_WIDTH + col;
				imageData[4*i+0] = red; // Red value
				imageData[4*i+1] = green; // Green value
				imageData[4*i+2] = blue; // Blue value
				imageData[4*i+3] = 255; // Alpha value
			}

			
		}
	}
		
	
	mImage.data = imageData; // attach image data object back to DOM 
	mContext.putImageData(mImage, 0, 0);
	
}


/**********************************************************************************
 * drawColorCycle()
 * --------------------------------------------------------------------------------
 * Iterates through each pixel and shifts its color if it is outside of the M-set.
 *
 **********************************************************************************/
function drawColorCycle() {

	// Set color cycling on or off:
	if (document.form.cycle[0].checked) {
		colorCycle = true;
		document.form.direction[0].disabled = false;
		document.form.direction[1].disabled = false;	
	}
	else if (document.form.cycle[1].checked) {
		colorCycle = false;
		document.form.direction[0].disabled = true;
		document.form.direction[1].disabled = true;		
	}
	
	// Set color cycling in or out
	if (document.form.direction[0].checked) {
		colorCycleIn = true;
	}
	else if (document.form.direction[1].checked) {
		colorCycleIn = false;
	}
	
	if (colorCycle) {
	
		var imageData = image.data; // detach the pixel array from DOM

		// iterate trhough all pixels
		for (var x = 0; x < CANVAS_WIDTH; x++) {
			for (var y = 0; y < CANVAS_HEIGHT; y++) {
			
				var i = y * CANVAS_WIDTH + x;		// index of the pixel in imageData array


				// if the pixel is outside of the set, cycle its color by colorStep
				if ("rgb(" + imageData[4*i+0] + ", " + imageData[4*i+1] + ", " + imageData[4*i+2] + ")" != "rgb(0, 0, 0)") {
					
					if (colorCycleIn == false) { 
						
						// cyan to blue:
						if (imageData[4*i+0] == 0 && imageData[4*i+1] > 0 && imageData[4*i+2] == 255) {
							imageData[4*i+1] -= colorStep;
							if (imageData[4*i+1] < 0){
								alert("green is < 0");
								imageData[4*i+1] = 0;
							}
						}
						
						// blue to magenta:
						else if (imageData[4*i+0] < 255 && imageData[4*i+1] == 0 && imageData[4*i+2] == 255) {
							imageData[4*i+0] += colorStep;
							if (imageData[4*i+0] > 255) {
								imageData[4*i+0] = 255;
							}
						}

						// magenta to red:
						else if (imageData[4*i+0] == 255 && imageData[4*i+1] == 0 && imageData[4*i+2] > 0) {
							imageData[4*i+2] -= colorStep;
							if (imageData[4*i+2] < 0) 
								imageData[4*i+2] = 0;
						}
						
						// red to yellow:
						else if (imageData[4*i+0] == 255 && imageData[4*i+1] < 255 && imageData[4*i+2] == 0) {
							imageData[4*i+1] += colorStep;
							if (imageData[4*i+1] > 255) 
								imageData[4*i+1] = 255;
						}
						
						// yellow to green:
						else if (imageData[4*i+0] > 0 && imageData[4*i+1] == 255 && imageData[4*i+2] == 0) {
							imageData[4*i+0] -= colorStep;
							if (imageData[4*i+0] < 0) 
								imageData[4*i+0] = 0;
						}
						
						// green to cyan:
						else if (imageData[4*i+0] == 0 && imageData[4*i+1] == 255 && imageData[4*i+2] < 255) {
							imageData[4*i+2] += colorStep;
							if (imageData[4*i+2] > 255) 
								imageData[4*i+2] = 255;
						}
						
						imageData[4*i+3] = 255; // Alpha value
				
					}
			
					else { // color cycle in

						// cyan to green:
						if (imageData[i*4+0] == 0 && imageData[4*i+1] == 255 && imageData[i*4+2] > 0) {
							imageData[i*4+2] -= colorStep;
							if (imageData[i*4+2] < 0)
								imageData[i*4+2] = 0;
						}
						
						// green to yellow:
						else if (imageData[i*4+0] < 255 && imageData[4*i+1] == 255 && imageData[i*4+2] == 0) {
							imageData[i*4+0] += colorStep;
							if (imageData[i*4+0] > 255) 
								imageData[i*4+0] = 255;
						}

						// yellow to red:
						else if (imageData[i*4+0] == 255 && imageData[4*i+1] > 0 && imageData[i*4+2] == 0) {
							imageData[4*i+1] -= colorStep;
							if (imageData[4*i+1] < 0) 
								imageData[4*i+1] = 0;
						}
						
						// red to magenta:
						else if (imageData[i*4+0] == 255 && imageData[4*i+1] == 0 && imageData[i*4+2] < 255) {
							imageData[i*4+2] += colorStep;
							if (imageData[i*4+2] > 255) 
								imageData[i*4+2] = 255;
						}
						
						// magenta to blue:
						else if (imageData[i*4+0] > 0 && imageData[4*i+1] == 0 && imageData[i*4+2] == 255) {
							imageData[i*4+0] -= colorStep;
							if (imageData[i*4+0] < 0) 
								imageData[i*4+0] = 0;
						}
						
						// blue to cyan:
						else if (imageData[4*i+0] == 0 && imageData[4*i+1] < 255 && imageData[i*4+2] == 255) {
							imageData[4*i+1] += colorStep;
							if (imageData[4*i+1] > 255) 
								imageData[4*i+1] = 255;
						}
						
						imageData[4*i+3] = 255; // Alpha value
				
					}
				}
			}
		}
		
		image.data = imageData; // attach image data object back to DOM 
		context.putImageData(image, 0, 0);

	}
	
}


/**********************************************************************************
 * setIterations()
 * --------------------------------------------------------------------------------
 * Called when the user selects one of the radio buttons indicating the number
 * of iterations to use. The set is then re-drawn using that number of iterations.
 *
 **********************************************************************************/
function setIterations() {

	if (document.form.iterations[0].checked) {
		MaxIterations = 256;
		drawJulia();
	}
	else if (document.form.iterations[1].checked) {
		MaxIterations = 512;
		drawJulia();
	}
	else if (document.form.iterations[2].checked) {
		MaxIterations = 1024;
		drawJulia();
	}
	
}

function getCReal() {
	return c_re;
}

function getCImaginary() {
	return c_im;
}


/* Magic Mirror
 * Module: MMM-JEOPARDY-Enhanced
 *
 * Based on MMM-JEOPARDY by Mykle1
 *
 */
Module.register("MMM-JEOPARDY-Enhanced", {

    // Module config defaults.
    defaults: {
        rotateInterval: 30 * 1000,      // New Jeopardy clue rotation.
        useHeader: false,               // true if you want a header
        header: "THIS IS JEOPARDY!",    // Any text you want
        maxWidth: "250px",
		width: "100%",
        animationSpeed: 3000,           // Clue fade in and out speed
        initialLoadDelay: 4250,
        retryDelay: 2500,
        updateInterval: 60 * 60 * 1000, // 1 hour = 100 clues per call
		showHeading: false,

    },

    getStyles: function() {
        return ["MMM-JEOPARDY-Enhanced.css"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        // Set locale.
        this.url = "http://jservice.io/api/random?count=100";
        this.jeopardy = [];
        this.activeItem = 0;
        this.rotateInterval = null;
        this.scheduleUpdate();
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;
		//wrapper.style.width = this.config.width;

        if (!this.loaded) {
            wrapper.innerHTML = "THIS IS JEOPARDY!";
            wrapper.classList.add("xsmall", "bright", "light");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }


        var jeopardyKeys = Object.keys(this.jeopardy);
        if (jeopardyKeys.length > 0) {
            if (this.activeItem >= jeopardyKeys.length) {
                this.activeItem = 0;
            }
            var jeopardy = this.jeopardy[jeopardyKeys[this.activeItem]];


            var top = document.createElement("div");
            top.classList.add("list-row");

            //var pic = document.createElement("div");
            //var img = document.createElement("img");
			//img.classList.add("img");
            //img.src = "modules/MMM-JEOPARDY/pix/2.jpg";
           // pic.appendChild(img);
            //wrapper.appendChild(pic);
			
			var table = document.createElement("table");
			table.classList.add('small', 'table');
			table.setAttribute("width", "25%");
			
			// category
			var categoryRow = document.createElement("tr");
			
			if (this.config.showHeading != false){
			var categoryHeader = document.createElement("td");
			categoryHeader.classList.add("small", "bright", "vtop", "hleft");
			categoryHeader.innerHTML = "Category: &nbsp";
			categoryRow.appendChild(categoryHeader);
		    }
			
            var category = document.createElement("td");
			var str = jeopardy.category.title;
			var res = str.toUpperCase();
            category.classList.add("small", "vtop");
			if (this.config.showHeading != false)
				{
				category.classList.add("hleft");	
				}
				else{
					category.classList.add("hcen");	
				}
            category.innerHTML =  res;   // jeopardy.category.title;
            categoryRow.appendChild(category);
			table.appendChild(categoryRow);
			
			// value			
			var valueRow = document.createElement("tr");
			if (this.config.showHeading != false){
			var valueHeader = document.createElement("td");
			valueHeader.classList.add("small", "bright", "vtop", "hleft");
			valueHeader.innerHTML = "For: &nbsp";
			valueRow.appendChild(valueHeader);
			}
            var jeopardyValue = document.createElement("td");			
            jeopardyValue.classList.add("small", "vtop");
			if (this.config.showHeading != false)
				{
				jeopardyValue.classList.add("hleft");	
				}
				else{
					jeopardyValue.classList.add("hcen");	
				}
            jeopardyValue.innerHTML =  (jeopardy.value != null) ? "$" + jeopardy.value : "$200";
            valueRow.appendChild(jeopardyValue);
			table.appendChild(valueRow);
			
			// clue
			var clueRow = document.createElement("tr");
			if (this.config.showHeading != false){
			var clueHeader = document.createElement("td");
			clueHeader.classList.add("small", "bright", "vtop", "hleft");
			clueHeader.innerHTML = "Clue: &nbsp";
			clueRow.appendChild(clueHeader);
			}
            var jeopardyClue = document.createElement("td");			
            if (this.config.showHeading != false)
				{
				jeopardyClue.classList.add("small", "vtop", "hleft");
				}
				else{
			jeopardyClue.classList.add("colorClue");
				}
			jeopardyClue.innerHTML =  jeopardy.question;
            clueRow.appendChild(jeopardyClue);
			table.appendChild(clueRow);	

			// Answer
			var questionRow = document.createElement("tr");
			if (this.config.showHeading != false){
			var questionHeader = document.createElement("td");
			questionHeader.classList.add("small", "bright", "vtop", "hleft");
			//questionHeader.innerHTML = "What is &nbsp";
			questionRow.appendChild(questionHeader);
			}
            var jeopardyAnswer = document.createElement("td");			
            jeopardyAnswer.classList.add("question", "vtop");
			if (this.config.showHeading != false)
				{
				jeopardyAnswer.classList.add("hleft");	
				}
				else{
					jeopardyAnswer.classList.add("hcen");	
				}
            setTimeout(function() {
                jeopardyAnswer.innerHTML = "What is " + jeopardy.answer + "?"
            }, 20 * 1000);
            questionRow.appendChild(jeopardyAnswer);
			table.appendChild(questionRow);				
			
            wrapper.appendChild(table);
        }
        return wrapper;
    },


    processJEOPARDY: function(data) {
        this.today = data.Today;
        this.jeopardy = data;
    //  console.log(this.jeopardy); checking my data
        this.loaded = true;
    },

    scheduleCarousel: function() {
        console.log("Carousel fucktion!");
        this.rotateInterval = setInterval(() => {
            this.activeItem++;
            this.updateDom(this.config.animationSpeed);
        }, this.config.rotateInterval);
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getJEOPARDY();
        }, this.config.updateInterval);
        this.getJEOPARDY(this.config.initialLoadDelay);
        var self = this;
    },

    getJEOPARDY: function() {
        this.sendSocketNotification('GET_JEOPARDY', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "JEOPARDY_RESULT") {
            this.processJEOPARDY(payload);
            if (this.rotateInterval == null) {
                this.scheduleCarousel();
            }
            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
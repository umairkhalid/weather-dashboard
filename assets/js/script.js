//Set up the API key
var APIKey="446a5fb769fd459ccf85961185a9f9e7";

//Declare a variable to store the searched city
var city="";
// variable declaration
var searchCity = $("#search-city");
var searchButton = $("#search-button");
var clearButton = $(".clear");
var currentCity = $("#current-city");
var currentTemperature = $("#temperature");
var currentHumidty= $("#humidity");
var currentWSpeed=$("#wind-speed");
var currentUvindex= $("#uv-index");
var futureForecast = $("#future-weather");
var sCity=[];

// searches the city to see if it exists in the entries from the storage
function find(c){
    for (var i=0; i<sCity.length; i++){
        if(c.toUpperCase()===sCity[i]){
            return -1;
        }
    }
    return 1;
}

// Display the curent and future weather to the user after grabing the city form the input text box.
function displayWeather(event){
    event.preventDefault();
    if(searchCity.val().trim()!==""){
        city=searchCity.val().trim();
        currentWeather(city);
    }
}
// Here we create the AJAX call
function currentWeather(city){
    // Here we build the URL so we can get a data from server side.
    var queryURL= "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + APIKey;
    $.ajax({
        url:queryURL,
        method:"GET",
    }).then(function(response){

        $(clearButton).attr("style", "visibility: visible");

        // parse the response to display the current weather including the City name. the Date and the weather icon. 
        console.log(response);
        //Dta object from server side Api for icon property.
        var weathericon= response.weather[0].icon;
        var iconurl="https://openweathermap.org/img/wn/"+weathericon +"@2x.png";
        // The date format method is taken from the  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
        var date=new Date(response.dt*1000).toLocaleDateString();
        //parse the response for name of city and concanatig the date and icon.
        $(currentCity).html(response.name +"(" +date+ ")" + "<img src="+iconurl+">");
        // parse the response to display the current temperature.
        // Convert the temp to fahrenheit

        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperature).html((tempF).toFixed(2)+"&#8457");
        // Display the Humidity
        $(currentHumidty).html(response.main.humidity+"%");
        //Display Wind speed and convert to MPH
        var ws=response.wind.speed;
        var windsmph=(ws*2.237).toFixed(1);
        $(currentWSpeed).html(windsmph+"MPH");
        // Display UVIndex.
        //By Geographic coordinates method and using appid and coordinates as a parameter we are going build our uv query url inside the function below.
        UVIndex(response.coord.lon,response.coord.lat);
        forecast(response.id);
        if(response.cod==200){
            sCity=JSON.parse(localStorage.getItem("cityname"));
            console.log(sCity);
            if (sCity==null){
                sCity=[];
                sCity.push(city.toUpperCase());
                futureForecast.empty();
                localStorage.setItem("cityname",JSON.stringify(sCity));
                addToList(city);
            }
            else {
                if(find(city)>0){
                    futureForecast.empty();
                    sCity.push(city.toUpperCase());
                    localStorage.setItem("cityname",JSON.stringify(sCity));
                    addToList(city);
                }
            }
        }

    });
}

// This function returns the UVIindex response.
function UVIndex(ln,lt){
    //lets build the url for uvindex.
    var uvqURL="https://api.openweathermap.org/data/2.5/uvi?appid="+ APIKey+"&lat="+lt+"&lon="+ln;
    $.ajax({
            url:uvqURL,
            method:"GET"
            }).then(function(response){
                $(currentUvindex).html(response.value);

                //Color changes depending on UV index 
                if (response.value < 3){
                    $(currentUvindex).attr("class", "btn btn-success");
                }
                if (response.value > 3 & response.value < 6){
                    $(currentUvindex).attr("class", "btn btn-warning");
                }
                if (response.value > 6){
                    $(currentUvindex).attr("class", "btn btn-danger");
                }
            });
}
    
// Here we display the 5 days forecast for the current city.
function forecast(cityid){
    var dayover= false;
    var queryforcastURL="https://api.openweathermap.org/data/2.5/forecast?id="+cityid+"&appid="+APIKey;
    $.ajax({
        url:queryforcastURL,
        method:"GET"
    }).then(function(response){
        
        for (i=0;i<5;i++){

                var holderEl = $("<div>").attr("class", "border weather-card col-12 col-lg-8 m-3");
                var dateEl = $("<p>").attr("id", "#fDate"+i);
                var iconcodeEl = $("<p>").attr("id", "#fImg"+i);
                var tempEl = $("<p>").html("<span id=fTemp" + i +"></span>");
                var humidityEl = $("<p>").html("<span id=fHumidity" + i +"></span>");

                var date = new Date((response.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
                var iconcode = response.list[((i+1)*8)-1].weather[0].icon;
                var iconurl = "https://openweathermap.org/img/wn/"+iconcode+".png";
                var tempK = response.list[((i+1)*8)-1].main.temp;
                var tempF = (((tempK-273.5)*1.80)+32).toFixed(2);
                var humidity = response.list[((i+1)*8)-1].main.humidity;
            
                $(dateEl).html(date);
                $(iconcodeEl).html("<img src="+iconurl+">");

                $(tempEl).text("Temperature: " + tempF + " °F");
                $(humidityEl).text("Humidity: " + humidity + " %");

                holderEl.append(dateEl, iconcodeEl, tempEl, humidityEl);
                futureForecast.append(holderEl);
            }
        
    });
}

//Daynamically add the passed city on the search history
function addToList(c){
    var listEl= $("<li>");
    var buttonEl = $("<button>"+c.toUpperCase()+"</button>");
    $(buttonEl).attr("class","btn btn-outline-info pastCitySearch col-12");
    $(buttonEl).attr("data-value",c.toUpperCase());
    listEl.append(buttonEl);
    $(".list-group").append(listEl);
}
// display the past search again when the list group item is clicked in search history
function invokePastSearch(event){
    var liEl=event.target;
    if (event.target.matches("button")){
        futureForecast.empty();
        city=liEl.textContent.trim();
        currentWeather(city);
    }
}

// render function
function loadlastCity(){
    // $("ul").empty();
    // var sCity = JSON.parse(localStorage.getItem("cityname"));
    if(sCity!==null){
        sCity=JSON.parse(localStorage.getItem("cityname"));
        for(i=0; i<sCity.length;i++){
            addToList(sCity[i]);
        }
        city=sCity[i-1];
        currentWeather(city);
    }

}

//Clear the search history from the page
function clearHistory(event){
    event.preventDefault();
    sCity=[];
    localStorage.removeItem("cityname");
    document.location.reload();

}

//Event Handlers
$(searchButton).on("click",displayWeather);
$(document).on("click",invokePastSearch);
$(window).on("load",loadlastCity);
$(clearButton).on("click",clearHistory);
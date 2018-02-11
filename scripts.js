String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

let settings = {
    name: "",
    units: "imperial",
    timeformat: "h:mm",
    showDate: true,
    showWeather: true
};

chrome.storage.sync.get(function (data) {
    if (chrome.runtime.error) {
        console.log("Runtime error.");
    } else {

        if (data.settings) {
            settings = data.settings;
            $("#time").text(moment().format(settings.timeformat));

            if (settings.timeformat === "h:mm") {
                $("#am-pm").text(moment().format('A'));
            }

            if (settings.name != '') {
                $("#greeting").text("Good " + getGreetingTime(moment()) + ", " + settings.name + ".");
            } else {
                $("#greeting").text("Good " + getGreetingTime(moment()) + ".");
            }

            $("#nameSetting").val(settings.name);

            if (settings.units === 'imperial') {
                $('#fahrenheitSetting').addClass('enabled');
            } else {
                $('#celsiusSetting').addClass('enabled');
            }

            if (settings.timeformat === 'h:mm') {
                $('#12hrSetting').addClass('enabled');
            } else {
                $('#24hrSetting').addClass('enabled');
            }

            if (!settings.showDate) {
                $('#NoDateSetting').addClass('enabled');
                $('.date-content').hide();
            } else {
                $('#YesDateSetting').addClass('enabled');
                $("#date").text(moment().format("dddd, MMM Do"));
            }

            if (!settings.showWeather) {
                $('#NoWeatherSetting').addClass('enabled');
                $('.weather').hide();
            } else {
                $('#YesWeatherSetting').addClass('enabled');
            }
        } else {
            $('#12hrSetting').addClass('enabled');
            $('#YesDateSetting').addClass('enabled');
            $('#YesWeatherSetting').addClass('enabled');
            $('#fahrenheitSetting').addClass('enabled');
        }

    }
});

function getGreetingTime(m) {
    let g = null;

    if (!m || !m.isValid()) {
        return;
    }

    let split_afternoon = 12;
    let split_evening = 16;
    let currentHour = parseFloat(m.format("HH"));

    if (currentHour >= split_afternoon && currentHour <= split_evening) {
        g = "afternoon";
    } else if (currentHour >= split_evening) {
        g = "evening";
    } else {
        g = "morning";
    }

    return g;
}

function showWeatherAndLocation() {
    if (settings.showWeather) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                let latitude = (Math.round(position.coords.latitude * 100) / 100).toFixed(3);
                let longitude = (Math.round(position.coords.longitude * 100) / 100).toFixed(3);

                let url = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=9db6b2fe521e01cec0ac950bbda8645c&units=" + settings.units;
                $.get(url, function (data) {
                    let temperature = data.main.temp;
                    let city = data.name;
                    $("#temp").html(temperature + "&#176;");
                    $("#location").html(city);
                });

            });
        }
    }
}

$("#nameSetting").change(function () {
    settings.name = $(this).val();
    chrome.storage.sync.set({
        'settings': settings
    }, function () {
        if (chrome.runtime.error) {
            console.log("Runtime error.");
        }
    });
});

showWeatherAndLocation();

setInterval(function () {
    $("#time").text(moment().format(settings.timeformat));

    if (settings.showDate) {
        $("#date").text(moment().format("dddd, MMM Do"));
    }

    if (settings.timeformat === "h:mm") {
        $("#am-pm").text(moment().format('A'));
    } else {
        $("#am-pm").text('');
    }
    if (settings.name != '') {
        $("#greeting").text("Good " + getGreetingTime(moment()) + ", " + settings.name + ".");
    } else {
        $("#greeting").text("Good " + getGreetingTime(moment()) + ".");
    }

}, 1000);

setInterval(function () {
    showWeatherAndLocation();

}, 600000);



$(document).mouseup(function (e) {
    if (e.target.id === $('#search-btn').attr('id')) {
        $('#search-bar').toggle(500);
        $('#search-bar').focus();
    }

    if (e.target.id != $('#search-btn').attr('id') && e.target.id != $('#search-bar').attr('id')) {
        $('#search-bar').hide(500);
    }

    if (e.target.id === $('#settings-btn').attr('id')) {
        if ($('.settings-content').css('display') === 'none') {
            $('#settings-btn').css("transform", "rotate(60deg)");
            $('#settings-btn').css("font-size", "16pt");
        }
        if ($('.settings-content').css('display') === 'block') {
            $('#settings-btn').css("transform", "rotate(0deg)");
            $('#settings-btn').css("font-size", "14pt");
        }

        $('.settings-content').toggle(500);
    }
    if (e.target.id != $('#settings-btn').attr('id') && !$(e.target).hasClass('settings-content') && !$(e.target).parents(".settings-content").length) {
        $('.settings-content').hide(500);
    }
    if (e.target.id === $('#closeSettings').attr('id')) {
        $('.settings-content').hide(500);
    }
});

$('#search-bar').on('keypress', function (e) {
    if (e.which === 13) {

        let searchQuery = $(this).val().replaceAll('+', '%2B').replaceAll("&", '%26');
        window.location.href = "https://www.google.com/search?q=" + searchQuery;
        $(this).val('');
    }
});

$('#chrome-btn').click(function () {
    window.location.href = "https://www.google.com/_/chrome/newtab?ie=UTF-8";
});

$('.settingsOptions .settingsOption').click(function (e) {
    $(this).addClass('enabled');
    $(this).siblings().removeClass('enabled');

    if (e.target.id === $('#celsiusSetting').attr('id')) {
        settings.units = "metric";
        showWeatherAndLocation();
    }
    if (e.target.id === $('#fahrenheitSetting').attr('id')) {
        settings.units = "imperial";
        showWeatherAndLocation();
    }
    if (e.target.id === $('#24hrSetting').attr('id')) {
        settings.timeformat = "H:mm"
    }
    if (e.target.id === $('#12hrSetting').attr('id')) {
        settings.timeformat = "h:mm";
    }
    if (e.target.id === $('#NoWeatherSetting').attr('id')) {
        settings.showWeather = false;
        showWeatherAndLocation();
        $('.weather').fadeOut(500);
    }
    if (e.target.id === $('#YesWeatherSetting').attr('id')) {
        settings.showWeather = true;
        showWeatherAndLocation();
        $('.weather').fadeIn(500);
    }
    if (e.target.id === $('#NoDateSetting').attr('id')) {
        settings.showDate = false;
        $('.date-content').fadeOut(500);
    }
    if (e.target.id === $('#YesDateSetting').attr('id')) {
        settings.showDate = true;
        $('.date-content').fadeIn(500);
        $("#date").text(moment().format("dddd, MMM Do"));
    }

    chrome.storage.sync.set({
        'settings': settings
    }, function () {
        if (chrome.runtime.error) {
            console.log("Runtime error.");
        }
    });
});
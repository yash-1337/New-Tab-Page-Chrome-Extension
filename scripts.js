String.prototype.replaceAll = function (target, replacement) {
    return this.split(target).join(replacement);
};

let currentDate = moment().format('L');

let settings = {
    name: "",
    units: "imperial",
    timeformat: "h:mm",
    showAMPM: true,
    showDate: true,
    showWeather: true,
    goal: {}
};

let weatherIcons;

$.getJSON('weatherIcons.json', function (data) {
    weatherIcons = data;
});

chrome.storage.sync.get(function (data) {
    if (chrome.runtime.error) {
        console.log("Runtime error.");
    } else {

        if (data.settings) {
            settings = data.settings;
            $("#time").text(moment().format(settings.timeformat));

            if (!data.settings.goal || data.settings.goal.date != currentDate) {
                settings.goal = {};
                saveSettings();
            }

            if (settings.timeformat === "h:mm") {
                if (settings.showAMPM) {
                    $("#am-pm").text(moment().format('A'));
                    $('#YesAMPMSetting').addClass('enabled');
                } else {
                    $('#NoAMPMSetting').addClass('enabled');
                }
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

            if (settings.goal.title) {
                $('#goal-question').fadeOut(10);
                $('#goal-input').fadeOut(10, function () {
                    $('#goal-name').html(settings.goal.title);
                    $('.goal').fadeIn(10);
                });

                if (settings.goal.done) {
                    $('#goal-name').css('text-decoration', 'line-through');
                    $('#goal-name').css('opacity', '0.85');
                    $('#finish-goal').removeClass('far');
                    $('#finish-goal').removeClass('fa-square');
                    $('#finish-goal').addClass('fas');
                    $('#finish-goal').addClass('fa-check-square');
                }
            }

        } else {
            $('#12hrSetting').addClass('enabled');
            $('#YesAMPMSetting').addClass('enabled');
            $('#YesDateSetting').addClass('enabled');
            $('#YesWeatherSetting').addClass('enabled');
            $('#fahrenheitSetting').addClass('enabled');
        }

    }
});

function saveSettings() {
    chrome.storage.sync.set({
        'settings': settings
    }, function () {
        if (chrome.runtime.error) {
            console.log("Runtime error.");
        }
    });
}

function resetGoal() {
    settings.goal = {};
    $('.goal').fadeOut(100, function () {
        $('#finish-goal').addClass('far');
        $('#finish-goal').addClass('fa-square');
        $('#finish-goal').removeClass('fas');
        $('#finish-goal').removeClass('fa-check-square');
        $('#goal-name').css('text-decoration', 'none');
        $('#goal-name').html('');
        $('#goal-input').val('');
        $('#goal-question').fadeIn(100);
        $('#goal-input').fadeIn(100);
    });

    saveSettings();
}

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

function setWeatherIcon(code) {
    let icon = 'wi wi-' + weatherIcons[code].icon;
    $('#weather-icon').attr('class', icon);

}

function showWeatherAndLocation() {
    if (settings.showWeather) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {

                let latitude = (Math.round(position.coords.latitude * 100) / 100).toFixed(3);
                let longitude = (Math.round(position.coords.longitude * 100) / 100).toFixed(3);

                let url = "http://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=9db6b2fe521e01cec0ac950bbda8645c&units=" + settings.units;
                $.get(url, function (data) {
                    setWeatherIcon(data.weather[0].id);

                    let temperature = Math.round(data.main.temp);
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
    saveSettings();
});

showWeatherAndLocation();

setInterval(function () {
    currentDate = moment().format('L');
    $("#time").text(moment().format(settings.timeformat));

    if (settings.showDate) {
        $("#date").text(moment().format("dddd, MMM Do"));
    }

    if (settings.timeformat === "h:mm") {
        if (settings.showAMPM) {
            $("#am-pm").text(moment().format('A'));
        } else {
            $("#am-pm").text('');
        }
    } else {
        $("#am-pm").text('');
    }
    if (settings.name != '') {
        $("#greeting").text("Good " + getGreetingTime(moment()) + ", " + settings.name + ".");
    } else {
        $("#greeting").text("Good " + getGreetingTime(moment()) + ".");
    }

    if (settings.goal.title && settings.goal.date != currentDate) {
        resetGoal();
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

        if ($('.settings-content').css('display') === 'block') {
            $('#settings-btn').css("transform", "rotate(0deg)");
            $('#settings-btn').css("font-size", "14pt");
        }
        if ($('.settings-content').css('display') === 'none') {
            $('#settings-btn').css("transform", "rotate(60deg)");
            $('#settings-btn').css("font-size", "15pt");
        }

        $('.settings-content').toggle(500);
    }
    if (e.target.id != $('#settings-btn').attr('id') && !$(e.target).hasClass('settings-content') && !$(e.target).parents(".settings-content").length) {
        $('.settings-content').hide(500);
        $('#settings-btn').css("transform", "rotate(0deg)");
        $('#settings-btn').css("font-size", "14pt");
    }
    if (e.target.id === $('#closeSettings').attr('id')) {
        $('.settings-content').hide(500);
        $('#settings-btn').css("transform", "rotate(0deg)");
        $('#settings-btn').css("font-size", "14pt");
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
    if (e.target.id === $('#NoAMPMSetting').attr('id')) {
        settings.showAMPM = false;
    }
    if (e.target.id === $('#YesAMPMSetting').attr('id')) {
        settings.showAMPM = true;
    }
    saveSettings();
});

$('#goal-input').change(function () {
    settings.goal = {
        title: $(this).val(),
        done: false,
        date: moment().format('L')
    };
    $('#goal-question').fadeOut(100);
    $(this).fadeOut(100, function () {
        $('#goal-name').html(settings.goal.title);
        $('.goal').fadeIn(100);
    });

    saveSettings();

});

$('.goal-content').hover(function () {

    $('#finish-goal').fadeIn(200);
    $('#delete-goal').fadeIn(200);

}, function () {
    $('#finish-goal').fadeOut(200);
    $('#delete-goal').fadeOut(200);
});


$('body').on('click', '#finish-goal', function () {
    $(this).toggleClass('far');
    $(this).toggleClass('fa-square');
    $(this).toggleClass('fas');
    $(this).toggleClass('fa-check-square');

    if (!settings.goal.done) {
        let complimentOptions = ['Good Job!', 'Nice!', 'Great!', 'Awesome!', 'Wow!', 'Well Done!'];
        let emojiOptions = ['😃', '👍']
        settings.goal.done = true;
        $('#goal-name').css('text-decoration', 'line-through');
        $('#goal-name').css('opacity', '0.85');
        $('#goal-compliment').html(complimentOptions[Math.floor(Math.random() * complimentOptions.length)] + emojiOptions[Math.floor(Math.random() * emojiOptions.length)]);
        $('#goal-compliment').fadeIn(400);
        setTimeout(function () {
            $('#goal-compliment').fadeOut(400);
        }, 3000);

    } else {
        settings.goal.done = false;
        $('#goal-name').css('text-decoration', 'none');
        $('#goal-name').css('opacity', '1');
    }

    saveSettings();

});

$('body').on('click', '#delete-goal', function () {
    resetGoal();
});
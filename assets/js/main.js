
Datepicker.locales.de = {
	days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
	daysShort: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
	daysMin: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
	months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
	monthsShort: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"],
	today: "Heute",
	monthsTitle: "Monate",
	clear: "Löschen",
	weekStart: 1,
	format: "dd.mm.yyyy"
};

const calendarElement = document.getElementById('calendar');
const slotContainer = document.getElementById('slot-container');

const notYetBooked = document.getElementById('not-yet-booked');
const slotBooked = document.getElementById('slot-booked');
const bookedDate = document.getElementById('booked-date');

const nameInput = document.getElementById('name-input');
const mailInput = document.getElementById('mail-input');
const phoneInput  = document.getElementById('phone-input');

const freeSlots = [];
let picker;
let dateButtons = [];

window.onload = () => {
    var calendarid = 'k7okmc8lnqftjgmkthqg2lt8o4@group.calendar.google.com';
    var mykey = 'AIzaSyDMO1QbbTzJEkcfo3Ydvr9EOIjdTwTezgw';
    $.ajax({
        type: 'GET',
        url: encodeURI('https://www.googleapis.com/calendar/v3/calendars/' + calendarid + '/events?key=' + mykey),
        dataType: 'json',
        success: function (response) {
			response.items.forEach(item => {
				freeSlots.push(new Date(item.start.dateTime));
			}); 
			datepicker = new Datepicker(calendarElement, {
				language: 'de',
				beforeShowDay: function (date) {
				return !!freeSlots.find(s => s.toDateString() == date.toDateString()); }
			});
        },
        error: function (response) {
            console.log(response)
        }
    });
}

function formatDate(date) {
	return date.toLocaleDateString() + ", " + date.getHours() + ":" + date.getMinutes().toLocaleString('de-DE', {
		minimumIntegerDigits: 2,
		useGrouping: false
	  }) + " Uhr";
}

function validateInput() {
	dateButtons.forEach(b => b.disabled = nameInput.value.length == 0 || !mailInput.value.toLowerCase().match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
	)
}

nameInput.oninput = validateInput
mailInput.oninput = validateInput

function bookSlot(date) {
	const xhr = new XMLHttpRequest();
	xhr.open("POST", "https://h2790261.stratoserver.net:32565/appointment", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.onreadystatechange = function (oEvent) {
		if (xhr.readyState === 4) {
			if (xhr.status != 200) {
			   alert("Leider ist etwas schiefgelafuen. Kontaktiere mich bitte direkt: annika@gedankengang-hamburg.de");
			}
		}
	};
	xhr.onload = () => {
		bookedDate.textContent = formatDate(date)
		notYetBooked.hidden = true;
		slotBooked.hidden = false;
    };
	xhr.send(JSON.stringify({
		date: date.getTime(),
		name: nameInput.value,
		mail: mailInput.value,
		phone: phoneInput.value
	}));
}

calendarElement.addEventListener("changeDate", function (e) {
	const selectedDate = e.detail.date;
	const slotsOnDay = freeSlots.filter(s => s.toDateString() == selectedDate.toDateString());

	slotContainer.innerHTML = '';
	dateButtons = [];
	slotsOnDay.sort((a, b) => a - b).forEach(s => {
		const p = document.createElement("p");
		const dateButton = document.createElement("input");
		dateButton.type = 'button';
		const dateString = document.createElement("span");
		dateString.textContent = formatDate(s) + "\u00A0\u00A0";
		dateButton.value = "jetzt buchen"
		p.appendChild(dateString);
		p.appendChild(dateButton);
		slotContainer.appendChild(p);
		dateButton.onclick = () => bookSlot(s);
		dateButton.disabled = true;
		dateButtons.push(dateButton);
		validateInput();
	});
}, false);

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$header = $('#header'),
		$banner = $('#banner');

	// Breakpoints.
		breakpoints({
			wide:      [ '1281px',  '1680px' ],
			normal:    [ '981px',   '1280px' ],
			narrow:    [ '841px',   '980px'  ],
			narrower:  [ '737px',   '840px'  ],
			mobile:    [ null,      '736px'  ]
		});

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000,
			offset: function() { return $header.height() + 10; }
		});

	// Dropdowns.
		$('#nav > ul').dropotron({
			mode: 'fade',
			noOpenerFade: true,
			expandMode: (browser.mobile ? 'click' : 'hover')
		});

	// Nav Panel.

		// Button.
			$(
				'<div id="navButton">' +
					'<a href="#navPanel" class="toggle"></a>' +
				'</div>'
			)
				.appendTo($body);

		// Panel.
			$(
				'<div id="navPanel">' +
					'<nav>' +
						$('#nav').navList() +
					'</nav>' +
				'</div>'
			)
				.appendTo($body)
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'navPanel-visible'
				});

		// Fix: Remove navPanel transitions on WP<10 (poor/buggy performance).
			if (browser.os == 'wp' && browser.osVersion < 10)
				$('#navButton, #navPanel, #page-wrapper')
					.css('transition', 'none');

	// Header.
		if (!browser.mobile
		&&	$header.hasClass('alt')
		&&	$banner.length > 0) {

			$window.on('load', function() {

				$banner.scrollex({
					bottom:		$header.outerHeight(),
					terminate:	function() { $header.removeClass('alt'); },
					enter:		function() { $header.addClass('alt reveal'); },
					leave:		function() { $header.removeClass('alt'); }
				});

			});

		}

})(jQuery);
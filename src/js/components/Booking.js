import { templates, select, settings, classNames } from './../setting.js';
import utils from "./../utils.js";
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking {
    constructor(element) {

        const thisBooking = this;

        thisBooking.reservation = null;

        thisBooking.starters = [];

        thisBooking.render(element);

        thisBooking.initWidgets();

        thisBooking.getData();

    }

    getData() {
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,

            ],
            eventsRepeat: [
                settings.db.repeatParam,
                startDateParam,
            ],
        };

        //console.log('getData params', params);

        const urls = {
            booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat.join('&'),
        };

        //console.log('getData urls', urls);

        /* fetch(urls.booking)
             .then(function (bookingsResponse) {
                 return bookingsResponse.json();
             })
             .then(function (bookings) {
                 console.log(bookings);
             });*/

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function (allResponses) {
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function ([bookings, eventsCurrent, eventsRepeat]) {
                //console.log(bookings);
                //console.log(eventsCurrent);
                //console.log(eventsRepeat);
                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            });
    }

    parseData(bookings, eventsCurrent, eventsRepeat) {
        const thisBooking = this;

        thisBooking.booked = {};

        for (let item of eventsCurrent) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for (let item of bookings) {
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for (let item of eventsRepeat) {
            if (item.repeat == 'daily') {
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
            }
            thisBooking.updateDOM();
        }


        //console.log(thisBooking.booked)
    }

    makeBooked(date, hour, duration, table) {
        const thisBooking = this;

        if (typeof thisBooking.booked[date] == 'undefined') {
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {

            if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
                thisBooking.booked[date][hourBlock] = [];
            }

            thisBooking.booked[date][hourBlock].push(table);

            //console.log(hourBlock);
        }
    }

    updateDOM() {
        const thisBooking = this;

        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvailable = false;

        if (
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ) {
            allAvailable = true;
        }

        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }

            if (
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ) {
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    render(element) {

        const thisBooking = this;

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;

        const generatedHTML = templates.bookingWidget();

        const generatedDOM = utils.createDOMFromHTML(generatedHTML);

        thisBooking.dom.wrapper.appendChild(generatedDOM);

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);

        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);

        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

        thisBooking.dom.floor = thisBooking.dom.wrapper.querySelector(select.booking.floor);

        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);

        thisBooking.dom.date = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.input);

        thisBooking.dom.hour = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.output);

        thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(select.booking.duration)

        thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(select.booking.people)

        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);

        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);

        thisBooking.dom.starters = thisBooking.dom.wrapper.querySelector(select.booking.starters);

    }

    initWidgets() {
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

        thisBooking.dom.peopleAmount.addEventListener('updated', function () { });

        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.hoursAmount.addEventListener('updated', function () { });

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);

        thisBooking.dom.datePicker.addEventListener('updated', function () { thisBooking.resetTables() });

        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.hourPicker.addEventListener('updated', function () { thisBooking.resetTables() });

        thisBooking.dom.wrapper.addEventListener('updated', function () {

            thisBooking.updateDOM();

        });

        thisBooking.dom.floor.addEventListener('click', function (event) {
            event.preventDefault()
            thisBooking.selected = event.target;
            thisBooking.initTables();
        })

        thisBooking.dom.form.addEventListener('click', function (event) {
            event.preventDefault();
            thisBooking.sendBooking();
        })

        thisBooking.dom.starters.addEventListener('change', function (event) {

            if (event.target.tagName == 'INPUT' && event.target.type == 'checkbox' && event.target.name == 'starter') {

                if (event.target.checked == true) {
                    thisBooking.starters.push(event.target.value);
                } else {
                    const indexOfstarters = thisBooking.starters.indexOf(event.target.value);

                    thisBooking.starters.splice(indexOfstarters, 1);
                }
            }
        });
    }

    initTables() {
        const thisBooking = this;

        if (thisBooking.selected.classList.contains(classNames.booking.table)) {

            let id = thisBooking.selected.getAttribute('data-table');

            id = parseInt(id);

            if (thisBooking.selected.classList.contains(classNames.booking.tableBooked)) {
                alert('This table is already taken. Select another one.');
            } else {
                if (thisBooking.selected.classList.contains(classNames.booking.selected)) {

                    thisBooking.selected.classList.remove(classNames.booking.selected);

                    thisBooking.reservation = null;
                }
                else {
                    thisBooking.resetTables();

                    thisBooking.selected.classList.add(classNames.booking.selected);

                    thisBooking.reservation = id;
                }
            }
        } else
            thisBooking.resetTables();
    }

    resetTables() {
        const thisBooking = this;
        for (let item of thisBooking.dom.tables) {

            item.classList.remove(classNames.booking.selected);
        }
        thisBooking.reservation = null;
        //console.log(thisBooking.reservation);
    }

    initStarters() {
        const thisBooking = this
        thisBooking.water = thisBooking.dom.water
    }

    sendBooking() {
        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.booking;

        let duration = thisBooking.dom.duration.value
        duration = parseInt(duration);

        let people = thisBooking.dom.people.value;
        people = parseInt(people);

        const payload = {
            date: thisBooking.dom.date.value,
            hour: thisBooking.dom.hour.innerHTML,
            table: thisBooking.reservation,
            duration: duration,
            ppl: people,
            starters: thisBooking.starters,
            phone: thisBooking.dom.phone.value,
            address: thisBooking.dom.address.value,
        }
        //console.log(payload)

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
          .then(function (response) {
            return response.json();
        })
            .then(function (parsedResponse) {
                thisBooking.makeBooked(parsedResponse.date, parsedResponse.hour, parsedResponse.duration, parsedResponse.table);
                thisBooking.updateDOM();
            })

        //console.log(thisBooking.booked)
    }
}
export default Booking;
import { templates, select, } from './../setting.js';
import utils from "./../utils.js";
import AmountWidget from './AmountWidget.js';
import HourPicker from './HourPicker.js';
import DatePicker from './DatePicker.js';

class Booking {
    constructor(element) {

        const thisBooking = this;

        thisBooking.render(element);

        thisBooking.initWidgets();
    }
    
    render(element) {

        const thisBooking = this;

        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
    
        const generatedHTML = templates.bookingWidget();

        const generatedDOM  = utils.createDOMFromHTML(generatedHTML);

        thisBooking.dom.wrapper.appendChild(generatedDOM);

        thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
        
        thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

        thisBooking.dom.date = document.querySelector(select.widgets.datePicker.wrapper);
        
        thisBooking.dom.hour = document.querySelector(select.widgets.hourPicker.wrapper)
        
    }

    initWidgets (){
        const thisBooking = this;

        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        
        thisBooking.dom.peopleAmount.addEventListener('update', function(){});
        
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.hoursAmount.addEventListener('update', function(){});

        thisBooking.date = new DatePicker (thisBooking.dom.date);
        
        //thisBooking.dom.date.addEventListener('update', function(){});

        thisBooking.date = new HourPicker (thisBooking.dom.hour);
        
        //thisBooking.dom.hour.addEventListener('change', function(){});
    }
}

export default Booking;
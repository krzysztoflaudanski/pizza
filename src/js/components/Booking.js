import { templates } from './../setting.js';
import utils from "../utils.js";


class Booking {
    constructor(element) {

        const thisBooking = this;

        thisBooking.render(element);

        //thisBooking.initWidgets();
    }

   

    render(element) {

        const thisBooking = this;

        thisBooking.dom = {}

        thisBooking.dom.wrapper = element;
        
        const generatedHTML = templates.bookingWidget();

        const generatedDOM  = utils.createDOMFromHTML(generatedHTML);

        thisBooking.dom.wrapper.appendChild(generatedDOM);
    }
}

export default Booking;
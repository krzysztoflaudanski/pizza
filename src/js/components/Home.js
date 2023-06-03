import {templates} from './../setting.js';
import utils from './../utils.js';

class Home {
    constructor(element) {
        const thisHome = this;

        thisHome.render(element);
       // const navLink = document.querySelector('.home-nav');
       // console.log(navLink);
    }

render(element) {
    const thisHome = this;

     thisHome.dom = {};

     thisHome.dom.wrapper = element;

    const generatedHTML = templates.home();

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisHome.dom.wrapper.appendChild(generatedDOM);
}




}

export default Home; 
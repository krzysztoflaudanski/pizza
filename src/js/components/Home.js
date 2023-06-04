import { templates, settings } from './../setting.js';
import utils from './../utils.js';

class Home {
    constructor(element) {
        const thisHome = this;
        
        thisHome.initData()

        thisHome.render(element)
           
    }
    
    initData() {
        const thisHome = this;

        thisHome.data = {};

        const url = settings.db.url + '/' + settings.db.home;

        fetch(url)
            .then(function (rawResponse) {
                return rawResponse.json();
            })
            .then(function (parsedResponse) {

                thisHome.data = parsedResponse
                //console.log(thisHome.data)
                thisHome.initGallery()
         })  
    }

    render(element) {

        const thisHome = this;

        thisHome.dom = {};

        thisHome.dom.wrapper = element;

        const generatedHTML = templates.home();

        const generatedDOM = utils.createDOMFromHTML(generatedHTML);

        thisHome.dom.wrapper.appendChild(generatedDOM);
    }

    initGallery() {
        const thisHome = this;
        
        console.log(thisHome.data)
        
        thisHome.data.gallery = thisHome.data[0];

        console.log(thisHome.data.gallery)
 
    }

}



export default Home; 
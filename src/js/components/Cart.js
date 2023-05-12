import {select, classNames, templates, settings} from './../setting.js';
import CartProduct from './CartProduct.js';
import utils from './../utils.js';

class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      //thisCart.update();
      thisCart.sendOrder();
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    }

    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });
      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      })
      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      })
    }

    remove(cartProduct) {
      const thisCart = this;

      cartProduct.dom.wrapper.remove();

      const productList = thisCart.products.indexOf(cartProduct);

      thisCart.products.splice(productList, 1);

      thisCart.update();
    }

    add(menuProduct) {
      const thisCart = this;

      // generate HTML based on temple 
     
      const generatedHTML = templates.cartProduct(menuProduct);
      
      //create element using utils.createElementFromHtml 

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      // add element to menu 

      thisCart.dom.productList.appendChild(generatedDOM);

      //console.log('adding product', menuProduct);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      //console.log('thisCart.products', thisCart.products);
      thisCart.update()
    }

    update() {
      const thisCart = this;

      let deliveryFee = settings.cart.defaultDeliveryFee;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;
      thisCart.totalPrice = 0;

      //start LOOP in thisCart.products
      for (let product of thisCart.products) {
        //product.amount = parseInt(product.amount);
        //product.price = parseInt(product.price);
        thisCart.totalNumber += product.amount;
        thisCart.subtotalPrice += product.price;
      }

      //if cart contains order add delivery fee
      if (thisCart.subtotalPrice !== 0) {
        thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0
      }
      if (thisCart.subtotalPrice == 0) {
        deliveryFee = 0
      }
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;

      for (let item of thisCart.dom.totalPrice) {
        item.innerHTML = thisCart.totalPrice;
      }
    }

    sendOrder() {
      const thisCart = this;

      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
          address: thisCart.dom.address.value,
          phone: thisCart.dom.phone.value,
          totalPrice: thisCart.totalPrice,
          subtotalPrice: thisCart.subtotalPrice,
          totalNumber: thisCart.totalNumber,
          deliveryFee: thisCart.dom.deliveryFee.value,
          products: []
        };
      
      for(let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      
      fetch(url, options);

  }
  

}

export default Cart;
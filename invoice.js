class Invoice {

    constructor() {

    }

}

class Company {
    #fields = ['ID','Company','Contact','Address','Address2','City','State','Zip','Phone','Email','Notes'];

    constructor(obj) {

    }
}

class LineItem {
    #fields = ['ID','Date','Service','Hours','Rate','Desc','Subtotal'];
    #elements = {};
    
    #id;
    #date;
    #hours;
    #desc;
    #service;
    #rate;
    #html;

    cleanDate(date) {
        if (typeof(date) === "number") date = new Date(date);
        let mo = date.getMonth();
        mo++;
        if (mo < 10) mo = '0' + mo;
        let day = date.getDate();
        if (day < 10) day = '0' + day;
        let yr = date.getFullYear()

        return `${mo}/${day}/${yr}`;
    }

    set Date(val) {
        if (typeof(val) === "number") {
            this.Timestamp = val;
            this.DateObj = new Date(val);
        } else if (val) {
            this.DateObj = new Date(val);
            if (this.DateObj == "Invalid Date") {
                this.DateObj = new Date();
            }
        } else {
            this.DateObj = new Date();
        }
        this.Timestamp = this.DateObj.getTime();
        this.#date = val;
        this.showDate = this.cleanDate(this.DateObj);

        this.update();
    }
    get Date() {
        return this.cleanDate(new Date(this.Timestamp));
    }
    set ID(val) {
        this.#id = val;
        this.update();
    }
    get ID() {
        if (!this.#id) this.#id = app.data.lineitems.length + 1;
        return this.#id;
    }
    get Subtotal() {
        return this.#rate * this.#hours;
    }
    set Subtotal(val) {
        this.Hours = val / this.Rate;
    }
    set Service(val) {
        //console.log(`Setting Service to ${val}`);
        this.#service = val;
        this.update();
    }
    get Service() {
        return this.#service;
    }
    set Hours(val) {
        //console.log(`Setting Hours to ${val} (was ${this.#hours})`);
        this.#hours = val;
        //console.log(`Hours are now ${this.Hours} or #${this.#hours}`);
        this.update();
    }
    get Hours() {
        return this.#hours;
    }
    set Rate(val) {
        this.#rate = val;
        this.update();
    }
    get Rate() {
        return this.#rate;
    }
    get ShowRate() {
        return '$' + this.#rate + '/hr';
    }
    set Desc(val) {
        this.#desc= val;
        this.update('Desc');
    }
    get Desc() {
        return this.#desc;
    }
    currency(amt, cents=false) {
        if (amt == 0) {
            return (cents) ? '$0.00' : '$0';
        }
        if (cents && amt.toString().match(/\./)) {
            amt = parseFloat(amt);
            if (amt && !isNaN(amt)) {
                let cents = (amt * 100) % 100;
                let dollars = Math.floor(amt);
                return '$' + dollars + '.' + cents;
            } else {
                return '$' + amt;
            }
        } else {
            return '$' + amt;
        }
    }
    update(field) {
        if (!field) {
            this.#fields.forEach(field=>{
                if (this.#elements[field] && !this.#elements[field].matches(":focus")) {
                    this.#elements[field].innerHTML = this[field];
                    if (field === "ID") {
                        this.#elements[field].innerHTML += '. ';
                    }
                }
            });
        } else {
            if (this.#elements[field] && !this.#elements[field].matches(":focus")) {
                this.#elements[field].innerHTML = this[field];
            }
         
        }
        this.#elements.Subtotal.innerHTML = '$' + (this.#hours * this.#rate);
    }
    render() {
        let self = this;
        this.el = document.createElement("tr");
        this.el.className = "lineitem";
        this.el.id = "lineitem_"+this.ID;
        this.#fields.forEach(field=>{
            let td = document.createElement("td");

            if (field!=='Subtotal') {
                td.setAttribute("tabindex", app.state.tabindex);
                app.state.tabindex++;
            } else { 
                td.setAttribute("tabindex", -1);
            }
            if (field === "Date") {
                let del = document.createElement("input");
                del.type = "date";
                del.value = this[field];
                del.addEventListener("input", function(e) {
                    console.log(`changing date to ${e.target.value}`);
                    self.Date = e.target.value;
                });
                td.append(del);
            } else {
                td.innerHTML = this[field];
                if (field === "ID") td.innerHTML += '. ';
            }
            td.dataset.name = field;
            td.dataset.field = field;
            td.dataset.value = this[field];
            td.setAttribute("contenteditable", "true");
            td.addEventListener("input", function(e) {
                console.log(`changing ${field} to ${td.innerHTML}`);
                self[field] = td.innerText;
                app.updateTotals(app.data.lineitems);
            });
            
            td.addEventListener("focus", function(e) {
                
                let s = window.getSelection();
                let r = document.createRange();
                r.setStart(td, 0);
                if (td.innerHTML) r.setEnd(td, 1);
                s.removeAllRanges();
                s.addRange(r);
            });
            //td.oninput = this.change;
            td.className = field;
            this.el.append(td);
            this.#elements[field] = td;
        });
        let delbtn = document.createElement('td');
        delbtn.innerHTML = `<a href="#delete" onclick="app.deleteItem(event, '${self.id}');return false;"><i class="fa-solid fa-xmark"></i></a>`;
        this.el.append(delbtn);
        return this.el;
    }
    change(e) {
        console.log("in change");
        console.dir(e);
        let tgt = e.target;
        console.log(`field: #${tgt.dataset.field.toLowerCase()} val: ${tgt.innerText} current: ${this['#'+tgt.dataset.field.toLowerCase()]}`);
        if (tgt && tgt.dataset.field) {
            this['#'+tgt.dataset.field.toLowerCase()] = tgt.innerText;
        }
        app.updateTotals();
    }
    toString() {
        return JSON.stringify(this);
    }
    toJSON() {
        let out = {};
        this.#fields.forEach(key=>{
            out[key] = this[key];
        });
        return out;
    }
    constructor(obj) {
        this.#html = this.render();
        this.#fields.forEach((key) => {
            this[key] = (obj[key]) ? obj[key] : "";
        });
        // Cheap hack to populate class with user-defined properties, TODO: should be well-defined
        let keys = Object.keys(obj);
        keys.forEach(key=>this[key] = (obj[key]) ? obj[key] : "");

        if (!this.Timestamp) this.Timestamp = new Date().getTime();
        this.Date = this.cleanDate(this.Timestamp);
        if (!this.#id) {
            this.#id = app.data.lineitems.length + 1;
        }
        $("#lastrow").parentElement.insertBefore(this.#html, $("#lastrow"));
    }
}

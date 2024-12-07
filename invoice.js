// Export these first so they're available to the classes
export const utils = {
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date(date));
    },

    generateId(prefix = 'INV') {
        const now = new Date();
        return `${prefix}-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
    }
};

export class Invoice {
    #fields = ['id', 'date', 'company', 'address', 'citystate', 'attn', 'phone', 'email', 'total', 'subtotal', 'tax', 'paid', 'due', 'lineitems'];
    #data = {};

    constructor(obj = {}) {
        // Initialize with default values
        this.#data = {
            id: obj.id || this.generateId(),
            date: obj.date || new Date().toISOString().split('T')[0],
            company: obj.company || '',
            address: obj.address || '',
            citystate: obj.citystate || '',
            attn: obj.attn || '',
            phone: obj.phone || '',
            email: obj.email || '',
            total: obj.total || 0,
            subtotal: obj.subtotal || 0,
            tax: obj.tax || 0,
            paid: obj.paid || 0,
            due: obj.due || 0,
            lineitems: []
        };

        // Convert line items to LineItem instances
        if (obj.lineitems) {
            this.#data.lineitems = obj.lineitems.map(item => {
                return item instanceof LineItem ? item : new LineItem(item);
            });
        }
    }

    // Getter/setter for each field
    get id() { return this.#data.id; }
    set id(val) { this.#data.id = val; }

    get date() { return this.#data.date; }
    set date(val) { this.#data.date = val; }

    get company() { return this.#data.company; }
    set company(val) { this.#data.company = val; }

    get address() { return this.#data.address; }
    set address(val) { this.#data.address = val; }

    get citystate() { return this.#data.citystate; }
    set citystate(val) { this.#data.citystate = val; }

    get attn() { return this.#data.attn; }
    set attn(val) { this.#data.attn = val; }

    get phone() { return this.#data.phone; }
    set phone(val) { this.#data.phone = val; }

    get email() { return this.#data.email; }
    set email(val) { this.#data.email = val; }

    get lineitems() { return this.#data.lineitems; }

    // Calculated fields
    get subtotal() {
        return this.#data.lineitems.reduce((sum, item) => sum + item.Subtotal, 0);
    }

    get tax() { return this.#data.tax; }
    set tax(val) { this.#data.tax = parseFloat(val) || 0; }

    get total() {
        return this.subtotal + this.tax;
    }

    get paid() { return this.#data.paid; }
    set paid(val) { this.#data.paid = parseFloat(val) || 0; }

    get due() {
        return this.total - this.paid;
    }

    // Methods
    addLineItem(item) {
        const lineItem = item instanceof LineItem ? item : new LineItem(item);
        this.#data.lineitems.push(lineItem);
        return lineItem;
    }

    removeLineItem(index) {
        if (index >= 0 && index < this.#data.lineitems.length) {
            return this.#data.lineitems.splice(index, 1)[0];
        }
        return null;
    }

    generateId() {
        const now = new Date();
        return `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase();
    }

    toJSON() {
        const json = {};
        this.#fields.forEach(field => {
            json[field] = this.#data[field];
        });
        return json;
    }

    fromJSON(json) {
        this.#fields.forEach(field => {
            if (json[field] !== undefined) {
                if (field === 'lineitems') {
                    this.#data[field] = json[field].map(item => new LineItem(item));
                } else {
                    this.#data[field] = json[field];
                }
            }
        });
    }
}

export class Company {
    #data = {};
    #fields = ['id', 'company', 'contact', 'address', 'address2', 'city', 'state', 'zip', 'phone', 'email', 'notes'];

    constructor(obj = {}) {
        this.#data = {
            id: obj.id || '',
            company: obj.company || '',
            contact: obj.contact || '',
            address: obj.address || '',
            address2: obj.address2 || '',
            city: obj.city || '',
            state: obj.state || '',
            zip: obj.zip || '',
            phone: obj.phone || '',
            email: obj.email || '',
            notes: obj.notes || ''
        };
    }

    // Getter/setter for each field
    get id() { return this.#data.id; }
    set id(val) { this.#data.id = val; }

    get company() { return this.#data.company; }
    set company(val) { this.#data.company = val; }

    get contact() { return this.#data.contact; }
    set contact(val) { this.#data.contact = val; }

    get address() { return this.#data.address; }
    set address(val) { this.#data.address = val; }

    get address2() { return this.#data.address2; }
    set address2(val) { this.#data.address2 = val; }

    get city() { return this.#data.city; }
    set city(val) { this.#data.city = val; }

    get state() { return this.#data.state; }
    set state(val) { this.#data.state = val; }

    get zip() { return this.#data.zip; }
    set zip(val) { this.#data.zip = val; }

    get phone() { return this.#data.phone; }
    set phone(val) { this.#data.phone = val; }

    get email() { return this.#data.email; }
    set email(val) { this.#data.email = val; }

    get notes() { return this.#data.notes; }
    set notes(val) { this.#data.notes = val; }

    // Computed properties
    get fullAddress() {
        const parts = [this.address];
        if (this.address2) parts.push(this.address2);
        parts.push(`${this.city}, ${this.state} ${this.zip}`);
        return parts.join('\n');
    }

    // Validation
    validate() {
        const errors = [];
        if (!this.company) errors.push('Company name is required');
        if (!this.contact) errors.push('Contact name is required');
        if (!this.address) errors.push('Address is required');
        if (!this.city) errors.push('City is required');
        if (!this.state) errors.push('State is required');
        if (!this.zip) errors.push('ZIP code is required');
        if (!this.phone) errors.push('Phone number is required');
        if (!this.email) errors.push('Email is required');
        
        // Basic email validation
        if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
            errors.push('Invalid email format');
        }
        
        // Basic phone validation (assumes US format)
        if (this.phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(this.phone)) {
            errors.push('Invalid phone number format');
        }
        
        return errors;
    }

    toJSON() {
        const json = {};
        this.#fields.forEach(field => {
            json[field] = this.#data[field];
        });
        return json;
    }

    fromJSON(json) {
        this.#fields.forEach(field => {
            if (json[field] !== undefined) {
                this.#data[field] = json[field];
            }
        });
    }
}

export class LineItem {
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
        document.querySelector("#lastrow").parentElement.insertBefore(this.#html, document.querySelector("#lastrow"));
    }
}

export const CONSTANTS = {
    DEFAULT_TAX_RATE: 0,
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_LOCALE: 'en-US',
    INVOICE_STATUS: {
        DRAFT: 'draft',
        SENT: 'sent',
        PAID: 'paid',
        OVERDUE: 'overdue',
        CANCELLED: 'cancelled'
    }
};

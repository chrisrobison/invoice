const $ = str => document.querySelector(str);
const $$ = str => document.querySelectorAll(str);

(function() {
    const app = {
        data: {
            id: 0,
            lineitems: [
                { 
                    date: "7/15/2023",
                    service: "Software Development",
                    qty: 4,
                    rate: 75,
                    desc: "Performed work on invoicing system",
                    total: 300
                },
                { 
                    date: "7/20/2023",
                    service: "System Administration",
                    qty: 2,
                    rate: 75,
                    desc: "Security updates",
                    total: 150
                },
                { 
                    date: "7/25/2023",
                    service: "System Development",
                    qty: 8,
                    rate: 75,
                    desc: "Customer portal, request &amp; invoicing",
                    total: 600
                }

            ]
        },
        state: {
            loaded: false,
            rowedit: 0,
            debug: 0
        },
        init: function() {
            // app.getData(app.buildInvoice);
            app.loadData();
            $("#invoices").addEventListener("change", app.loadInvoice);
            document.addEventListener("keydown", app.doKey);
            app.state.loaded = true;
        },
        doKey: function(e) {
            console.log("Key pressed");
            console.dir(e);
            
            if ((app.state.rowedit) && (e.keyCode == 27)) {
                $("#newrow").parentNode.removeChild($("#newrow"));
                app.state.rowedit = 0;
            }
        },
        loadInvoice: function(e) {
            if (app.state.debug) {
                console.log("loadInvoice");
                console.dir(e);
            }
            app.resetInvoice();
            app.data.id = $("#invoices").options[$("#invoices").selectedIndex].value;

            app.data.current = app.data.invoices[app.data.id];
            app.buildInvoice();

        },
        getData: function(callback) {
            fetch("invoices.json").then(r=>r.json()).then(data=>{
                app.data.invoices = data;
                app.data.current = app.data.invoices[0];
                if (app.state.debug) {
                    console.log("getData");
                    console.dir(data);
                }

                app.makeInvoiceList();
                callback();
            });
        },
        makeInvoiceList: function() {
            data = app.data.invoices;
            $("#invoices").innerHTML = "";
            data.forEach((item,idx)=>{
                let opt = document.createElement('option');
                opt.value = idx;
                opt.text = item.date + ' - ' + item.company + ' - $' + item.due;

                if (app.data.id == idx) {
                    opt.setAttribute('SELECTED', 'true');
                }
                $("#invoices").appendChild(opt);
            });
        },
        printInvoice: function() {
            $("body").classList.add("print");
            let el = $("main");
            html2pdf(el, { filename: app.data.current.id + '.pdf' });
        },
        deleteItem: function(e) {
            if (app.state.debug) {
                console.log("deleteItem");
                console.dir(e);
            }
            let id = parseInt(e.target.id.replace(/\D/g, ""));
            if (confirm("Delete row?")) {
                e.target.parentNode.removeChild(e.target);
                app.data.current.lineitems.splice(id, 1);
            }
        },
        buildInvoice: function() {
            let tbl = $(".lineitems tbody");
            app.data.current.lineitems.forEach((item,idx)=>{
                let row = document.createElement("tr");
                row.id = `idx_${idx}`;
                row.className = "lineitem";
                row.addEventListener("click", app.deleteItem);

                let html = `<td>${item.date}</td><td>${item.service}</td><td>${item.qty}</td><td>$${item.rate}/hr</td><td>${item.desc}</td><td style='text-align:right;'>$${item.total}</td><td><div class='rowEditWrap'><button class='smBtn editBtn'></button><button class='smBtn rmBtn'></button></div></td>`;
                row.innerHTML = html;
                tbl.insertBefore(row, $("#lastrow"));
            });
            //$("#to").innerHTML = `<label>${app.data.current.company}</label><br>${app.data.current.address}<br>${app.data.current.citystate}<p>${app.data.current.phone} | ${app.data.current.email}</p>`;
            $("#company").value = app.data.current.company;
            $("#email").value = app.data.current.email;
            $("#phone").value = app.data.current.phone;
            $("#address").value = app.data.current.address;
            $("#citystate").value = app.data.current.citystate;
            $("#date").value = app.data.current.date;
            $("#invoice_id").innerHTML = app.data.current.id;

            app.updateTotals();
        },
        resetInvoice: function() {
            if (app.state.debug) {
                console.log("reseting invoice");
            }
            $$(".lineitem").forEach(item=>{ 
                if (app.state.debug) {
                    console.dir(item); 
                }
                item.parentNode.removeChild(item) 
            });

        },
        updateTotals: function() {
            let subtot = 0;
            app.data.current.lineitems.forEach(item=>{
                subtot += item.total;
            });
            
            $("#subtotal").innerHTML = '$' + subtot.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,') + '.00';
            let tax = $("#tax").innerHTML.replace(/\D/g, '') || 0;
            $("#tax").innerHTML = "$0.00";
            let tot = parseInt(subtot) + parseInt(tax);
            $("#totaldue").innerHTML = '$' + tot.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,') + '.00';
            app.data.current.total = tot;
            
            if (!app.data.current.paid) {
                app.data.current.paid = 0;
            }
            app.data.current.total = tot;
            app.data.current.due = tot - app.data.current.paid;

            app.makeInvoiceList();
        },
        saveRow: function() {
            app.state.rowedit = 0;
            let lineitem = {};
            let date = $("#item-date").value;
            let parts = date.split(/\-/);
            let yr = parts[0];
            let mo = parts[1].replace(/^0/, '');
            let day = parts[2].replace(/^0/, '');
            
            lineitem.date = mo + '/' + day + '/' + yr;

            let fields = ['service', 'qty', 'rate', 'desc'];
            for (let i=0; i<fields.length; i++) {
                let field = fields[i];
                lineitem[field] = $(`#item-${field}`).value;
            }
            lineitem["total"] = lineitem.qty * lineitem.rate;

            if (app.state.debug) {
                console.dir(lineitem);
            }
            app.data.current.lineitems.push(lineitem);
            
            $("#newrow").parentNode.removeChild($("#newrow"));
            
            let row = document.createElement("tr");
            row.className = "lineitem";
            let html = `<td>${lineitem.date}</td><td>${lineitem.service}</td><td>${lineitem.qty}</td><td>$${lineitem.rate}/hr</td><td>${lineitem.desc}</td><td style="text-align:right;">$${lineitem.total}</td><td></td><td><button class='smBtn editBtn'></button><button class='smBtn rmBtn'></button></td>`;
            row.innerHTML = html;
            
            $(".lineitems tbody").insertBefore(row, $("#lastrow"));
            app.updateTotals();

            //$(".lineitems tbody").appendChild(row);
        },
        addRow: function() {
            let newrow = document.createElement("tr");
            newrow.id = "newrow";
            newrow.className = "lineitem";
            newrow.innerHTML = `<td><input type="date" id="item-date" name="item-date" style="width:7rem;"></td><td><input type='text' id='item-service' placeholder='Service Rendered'></td><td><input type='text' id='item-qty' placeholder='8' size='2' style='text-align:center;'></td><td style='white-space:nowrap;'>$<input type='text' id='item-rate' placeholder='75' size='3' style='text-align:center;'>/hr</td><td><input type='text' id='item-desc' placeholder='Service description' size='25'></td><td id='item-subtotal'></td><td><button onclick="app.saveRow()">save</button></td>`;
            $(".lineitems tbody").insertBefore(newrow, $("#lastrow"));
            app.state.rowedit = 1;
        },
        fetch: function(url, callback) {
            fetch(url).then(response=>response.json()).then(data=>{
                app.data = data;
                app.state.loaded = true;
                if (callback && typeof(callback) === "function") {
                    callback(data);
                }
            });
        },
        storeData: function() {
            let json = JSON.stringify(app.data.invoices);
            localStorage.setItem('invoices', json);
        },
        loadData: function() {
            let json = localStorage.getItem('invoices');
            
            if (json) {
                let data = JSON.parse(json);
                app.data.invoices = data;
                app.data.current = app.data.invoices[0];
                app.makeInvoiceList();
                app.buildInvoice();
            } else {
                app.getData(app.populateData);
            }
        },
        populateData: function() {
            app.storeData('invoices', JSON.stringify(app.data.invoices));
            app.data.current = app.data.invoices[0];
            app.buildInvoice();
        },
        display: function(data, tgt) {
            let out = "<table><thead><tr>";
            const keys = Object.keys(data[0]);
            if (keys) {
                keys.forEach(key => {
                    out += `<th>${key}</th>`;
                });
            }
            out += "</tr></thead><tbody>";
            data.forEach(item=>{
                out += `<tr>`;
                keys.forEach(key => {
                    out += `<td>${item[i]}</td>`;
                });
                out += `</tr>`;
            });
            out += "</tbody></table>";

            if (tgt) {
                tgt.innerHTML = out;
            }
            return out;
        },
        makeSerial:  function() {
            let serial = "";
            let now = new Date();

            let yr = now.getFullYear();
            let mo = now.getMonth() + 1;
            let day = now.getDay();
            let hr = now.getHours();

            if (mo < 10) mo = '0' + mo;
            if (day < 10) day = '0' + day;
            if (hr < 10) hr = '0' + hr;

            serial = yr + '' + mo + '' + day + '' + app.data.invoices.length ;
            return serial;
        },
        makeDate: function() {
            let now = new Date();
            return now.toJSON().substring(0, 10);
        },
        newInvoice: function() {
            $$(".lineitem").forEach(item=>item.parentNode.removeChild(item));

            let id = app.makeSerial();
            let newobj = {
                "id": id,
                "date": app.makeDate(),
                "company": "ABC Corp",
                "address": "123 Address Ln",
                "citystate": "City, ST Zip",
                "attn": "Attn To:",
                "phone": "(xxx) xxx-xxxx",
                "email": "email@example.com",
                "total": 0,
                "due": 0,
                "lineitems": [
                ]
            };
            app.data.invoices.push(newobj);
            app.data.current = newobj;
            app.makeInvoiceList();
            app.buildInvoice();
        }, 
        saveInvoice: function() {
           app.updateTotals();
            app.storeData(); 
        },
        removeInvoice: function() {
            if (confirm(`Are you sure you want to permenantly \ndelete Invoice ${app.data.current.id} [${app.data.id}]?`)) {
                app.data.invoices.splice(app.data.id, 1);
                app.data.id = 0;
                app.data.current = app.data.invoices[0];
                app.buildInvoice();
                app.makeInvoiceList();
            }
        },
        importData: function() {
            $("#importDialog").showModal();
        },
        exportData: function() {
            let data = JSON.stringify(app.data.invoices);
            let el = document.createElement('a');
            let now = app.makeSerial();
            el.setAttribute('href', 'data:application/json;charset=utf-8,'+encodeURIComponent(data));
            el.setAttribute("download", `invoices-${now}.json`);
            el.style.display = "none";

            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);

        },
        showDialog: str => $(`#${str}Dialog`)?.showModal(),
        showHelp: () => {
            $("#helpDialog").showModal(); 
        },
        closeDialog: (who) => $(`#${who}Dialog`)?.close(),
    }
    window.app = app;
    app.init();
})();


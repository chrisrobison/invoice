const $ = str => document.querySelector(str);
const $$ = str => document.querySelectorAll(str);

(function() {
    const app = {
        data: {
            id: 0,
            lineitems: []
        },
        state: {
            loaded: false,
            rowedit: "",
            debug: 1,
            tabindex: 1
        },
        init() {
            // app.getData(app.buildInvoice);
            app.loadData();
            $("#invoices").addEventListener("change", app.loadInvoice);
            document.addEventListener("keydown", app.doKey);
            app.state.loaded = true;
        },
        doKey(e) {
            if (app.state.rowedit) {
                if (e.keyCode == 27) {
                    if ((app.state.rowedit === "editrow") && (app.state.editOriginal)) {
                        let row = document.createElement("tr");
                        row.id = app.state.editIdx;
                        row.className = "lineitem";
                        row.innerHTML = app.state.editOriginal;
                        $("#editrow").replaceWith(row);

                        app.state.editOriginal = '';
                        app.state.editIdx = '';
                        app.state.rowedit = '';
                    } else if (app.state.rowedit == "newrow") {
                        $(`#newrow`).parentNode.removeChild($("#newrow"));
                        app.state.rowedit = '';
                    }
                } else if (e.keyCode == 13) {
                    app.saveRow(e);             
                }
            }

            if (e.keyCode == 13) {
                if ($(":focus")) {
                    $(":focus").blur();
                }
                app.updateTotals(app.data.lineitems);
            }
            if (e.keyCode == 27) {
                if ($(":focus")) {
                    $(":focus").blur();
                }
                app.updateTotals(app.data.lineitems);
            }
        },
        loadInvoice(e) {
            if (app.state.debug) {
                console.log("loadInvoice");
                console.dir(e);
            }
            app.resetInvoice();
            app.data.id = $("#invoices").options[$("#invoices").selectedIndex].value;
            
            app.data.current = app.data.invoices[app.data.id];
            app.data.lineitems =  [];

            //app.data.invoices[app.data.id].lineitems.forEach((item, idx) => {
            //    app.data.lineitems[idx] = new LineItem({Date: item.date, Service: item.service, Rate: item.rate, Hours: item.qty, Desc: item.desc});
            //});
            app.buildInvoice();

        },
        // Retrieves url and passes results to callback
        getData(url="invoices.json", callback) {
            fetch(url).then(r => r.json()).then(data => {
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
        makeInvoiceList() {
            data = app.data.invoices;
            $("#invoices").innerHTML = "";
            data.forEach((item, idx) => {
                let opt = document.createElement('option');
                opt.value = idx;
                opt.text = item.date + ' - ' + item.company + ' - $' + item.due;

                if (app.data.id == idx) {
                    opt.setAttribute('SELECTED', 'true');
                }
                $("#invoices").appendChild(opt);
            });
        },
        makePDF() {
            $("body").classList.add("print");
            let el = $("main");
            html2pdf(el, {
                filename: app.data.current.id + '.pdf'
            });

        },
        printInvoice() {
            $("body").classList.add("print");
            let el = $("main");
            html2pdf(el, {
                filename: app.data.current.id + '.pdf'
            });
        },
        deleteItem(e) {
            if (app.state.debug) {
                console.log("deleteItem");
                console.dir(e);
            }
            let id = parseInt(e.target.closest('tr').id.replace(/\D/g, ""));
            if (id && confirm("Delete row?")) {
                e.target.closest("tr").parentNode.removeChild(e.target.closest("tr"));
                app.data.current.lineitems.splice(id - 1, 1);
                app.data.lineitems.splice(id - 1, 1);
            }
        },
        makeRow(item, idx) {
            let row = document.createElement("tr");
            row.dataset.record = JSON.stringify(item);
            row.dataset.row_id = idx;
            row.id = `lineitem_${idx}`;

            if (item) {
                row.className = "lineitem";
                let html = `
                        <td class="date" oninput="app.updateCell(${idx}, 'date')" contenteditable="true">${item.date}</td>
                        <td class="service" oninput="app.updateCell(${idx}, 'service')" contenteditable="true">${item.service}</td>
                        <td class="qty" oninput="app.updateCell(${idx}, 'qty')" contenteditable="true">${item.qty}</td>
                        <td class="rate" oninput="app.updateCell(${idx}, 'rate')" contenteditable="true">$${item.rate}/hr</td>
                        <td class="desc" oninput="app.updateCell(${idx}, 'desc')" contenteditable="true">${item.desc}</td>
                        <td class="total" oninput="app.updateCell(${idx}, 'total')" style='text-align:right;' contenteditable="true">$${item.total}</td>
                        <td><button class='smBtn rmBtn'></button></div></td>`;
                row.innerHTML = html;
            }
            row.addEventListener("click", app.editRow2);
            return row;
        },
        updateCell(idx, key) {
            
        },
        buildInvoice() {
            let tbl = $(".lineitems tbody");
            app.data.lineitems = [];
            app.data.current.lineitems.forEach((item, idx) => {
                app.data.lineitems.push(new LineItem({Date: item.Date || item.date, Service: item.Service || item.service, Rate: item.Rate || item.rate, Hours: item.Hours || item.qty, Desc: item.Desc || item.desc }));
            });

            $("#company").value = app.data.current.company;
            $("#attn").value = app.data.current.attn;
            $("#email").value = app.data.current.email;
            $("#phone").value = app.data.current.phone;
            $("#address").value = app.data.current.address;
            $("#citystate").value = app.data.current.citystate;
            $("#date").value = app.data.current.date;
            $("#invoice_id").innerHTML = app.data.current.id;

            app.updateTotals(app.data.lineitems);
        },
        resetInvoice() {
            if (app.state.debug) {
                console.log("reseting invoice");
            }
            $$(".lineitem").forEach(item => {
                if (app.state.debug) {
                    console.dir(item);
                }
                item.parentNode.removeChild(item)
            });

        },
        updateTotals(lineitems) {
            let subtot = 0;
            lineitems.forEach(item => {
                console.dir(item);
                subtot += item.Subtotal;
            });

            $("#subtotal").innerHTML = '$' + subtot.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,') + '.00';
            let tax = $("#tax").innerHTML.replace(/\D/g, '') || 0;
            $("#tax").innerHTML = "$0.00";
            let tot = parseInt(subtot) + parseInt(tax);
            $("#totaldue").innerHTML = '$' + tot.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1,') + '.00';
            
            app.data.current.subtotal = subtot;
            app.data.current.tax = tax;
            app.data.current.total = tot;

            if (!app.data.current.paid) {
                app.data.current.paid = 0;
            }
            app.data.current.total = tot;
            app.data.current.due = tot - app.data.current.paid;

            app.makeInvoiceList();
        },
        saveRow(evt) {
            if (evt) {
                evt.stopPropagation();
                evt.preventDefault();
            }
            let lineitem = {};
            let mytime = $("#item-date").valueAsNumber;
            let date = new Date(mytime);

            let yr = date.getFullYear();
            let mo = date.getMonth() + 1;
            let day = date.getDate();

            if (day < 10) day = '0' + day;
            if (mo < 10) mo = '0' + mo;

            lineitem.date = mo + '/' + day + '/' + yr;

            let fields = ['service', 'qty', 'rate', 'desc'];
            for (let i = 0; i < fields.length; i++) {
                lineitem[fields[i]] = $(`#item-${fields[i]}`).value;
            }
            lineitem["total"] = lineitem.qty * lineitem.rate;

            if (app.state.debug) {
                console.dir(lineitem);
            }
            app.data.current.lineitems.push(lineitem);

            let row = app.makeRow(lineitem);
            if (app.state.rowedit === "newrow") row.id = `idx_${app.data.current.lineitems.length}`;

            $(`#${app.state.rowedit}`).replaceWith(row);

            app.state.rowedit = '';
            app.updateTotals(app.data.lineitems);
        },
        cancelEdit() {
            if (app.state.editOriginal) {
                let el = document.createElement("tr");
                el.id = "idx_" + app.state.editIndex;
                el.className = "lineitem";
                el.innerHTML = app.state.editOriginal;

                $("#editrow").replaceWith(el);
                app.state.rowedit = '';
            }
        },
        editRow2(e) {
            console.log("editRow2");
            console.dir(e);
            let tgtrow = e.target.closest("tr"), rec;
            if (tgtrow) {
                rec = JSON.parse(tgtrow.dataset.record);
            }

            console.dir(rec);
        },
        editRow(e) {
            console.log("editRow");
            console.dir(e);
            console.dir(app.data);
            let el = e.target.closest("tr");
            
            const idx = parseInt(el.id.replace(/\D/g, ''));
            const row = app.data.lineitems[idx];
            app.state.editIndex = idx;
            console.dir(row);
            let date, dparts;
            if (row.date) {
                dparts = row.date.split(/\//);
            } else {
                const now = new Date();
                dparts = [now.getMonth() + 1, now.getDate(), now.getYear() ]
            } 
            if (parseInt(dparts[0]) < 10) dparts[0] = '0' + parseInt(dparts[0]);
            if (parseInt(dparts[1]) < 10) dparts[1] = '0' + parseInt(dparts[1]);
            date = dparts[2] + '-' + dparts[0] + '-' + dparts[1];


            let newrow = document.createElement("tr");
            newrow.id = "editrow";
            newrow.className = "lineitem";
            newrow.innerHTML = `
                <td><input type="date" id="item-date" name="item-date" value="${date}" style="width:7rem;"></td>
				<td><input type='text' id='item-service' value="${row.service}" placeholder='Service Rendered'></td>
				<td><input type='text' id='item-qty' value="${row.qty}" placeholder='8' size='2' style='text-align:center;'></td>
				<td style='white-space:nowrap;'>$<input type='text' value="${row.rate}" id='item-rate' placeholder='75' size='3' style='text-align:center;'>/hr</td>
				<td><input type='text' id='item-desc' placeholder='Service description' value="${row.desc}" size='25'></td>
				<td style='text-align:right;' id='item-subtotal'>$${row.total}</td>
				<td style='white-space: nowrap;'><button onclick="return app.saveRow(event)"><i class="fa-solid fa-floppy-disk"></i></button><button onclick="app.cancelEdit(event)"><i class="fa-solid fa-ban"></i></button></td>`;
            app.state.editOriginal = el.innerHTML;
            app.state.editIdx = el.id;

            el.replaceWith(newrow);
            app.state.rowedit = "editrow";
        },
        addRow(obj={ Date: new Date().getTime(), Service: "IT Services", Rate: 75, Hours: 4, Desc: "Server Maintenence and Security Updates"}) {
            let li = new LineItem(obj);
            app.data.lineitems.push(li);
            app.data.current.lineitems.push(li);
            return li;
        },
        fetch(url, callback) {
            fetch(url).then(response => response.json()).then(data => {
                app.data = data;
                app.state.loaded = true;
                if (callback && typeof(callback) === "function") {
                    callback(data);
                }
            });
        },
        storeData() {
            let json = JSON.stringify(app.data.invoices);
            localStorage.setItem('invoices', json);
        },
        loadData() {
            let json = localStorage.getItem('invoices');

            if (json) {
                let data = JSON.parse(json);
                app.data.invoices = data;
                app.data.current = app.data.invoices[0];
                app.makeInvoiceList();
                app.buildInvoice();
            } else {
                app.getData("invoices.json", app.populateData);  
            }
        },
        async saveToServer() {
            const rawResponse = await fetch(`api.php?x=put&id=${app.data.id}`, {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(app.data.current)
            });
            const response = await rawResponse.json();
            
            if (response) {
                console.log("saveToServer Response:");
                console.dir(response);
                
                let modtime = new Date(response.modified * 1000);
                let mo = modtime.getMonth() + 1;
                if (mo < 10) mo = '0' + mo;
                let day = modtime.getDate();
                if (day < 10) day = '0' + day;
                let yr = modtime.getFullYear();
                
                let notice = `Invoice saved successfully.
Filename: ${response.filename}
Modified: ${mo}/${day}/${yr} ${modtime.getHours()}:${modtime.getMinutes()}:${modtime.getSeconds()}
Size: ${response.filesize}`;
                alert(notice);
            }
        },
        populateData() {
            app.storeData('invoices', JSON.stringify(app.data.invoices));
            app.data.current = app.data.invoices[0];
            app.buildInvoice();
        },
        display(data, tgt) {
            let out = "<table><thead><tr>";
            const keys = Object.keys(data[0]);
            if (keys) {
                keys.forEach(key => {
                    out += `<th>${key}</th>`;
                });
            }
            out += "</tr></thead><tbody>";
            data.forEach(item => {
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
        makeSerial() {
            let serial = "";
            let now = new Date();

            let yr = now.getFullYear();
            let mo = now.getMonth() + 1;
            let day = now.getDay();
            let hr = now.getHours();

            if (mo < 10) mo = '0' + mo;
            if (day < 10) day = '0' + day;
            if (hr < 10) hr = '0' + hr;

            serial = yr + '' + mo + '' + day + '' + app.data.invoices.length;
            return serial;
        },
        makeDate() {
            let now = new Date();
            return now.toJSON().substring(0, 10);
        },
        newInvoice() {
            $$(".lineitem").forEach(item => item.parentNode.removeChild(item));

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
                "lineitems": []
            };
            app.data.invoices.push(newobj);
            app.data.current = newobj;
            app.makeInvoiceList();
            app.buildInvoice();
        },
        saveInvoice() {
            app.data.current.lineitems = app.data.lineitems;
            app.updateTotals(app.data.lineitems);
            app.storeData();
            app.saveToServer();
        },
        removeInvoice() {
            if (confirm(`Are you sure you want to permenantly \ndelete Invoice ${app.data.current.id} [${app.data.id}]?`)) {
                app.data.invoices.splice(app.data.id, 1);
                app.data.id = 0;
                app.data.current = app.data.invoices[0];
                app.buildInvoice();
                app.makeInvoiceList();
            }
        },
        importData() {
            $("#importDialog").showModal();
        },
        exportData() {
            let data = JSON.stringify(app.data.invoices);
            let el = document.createElement('a');
            let now = app.makeSerial();
            el.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(data));
            el.setAttribute("download", `invoices-${now}.json`);
            el.style.display = "none";

            document.body.appendChild(el);
            el.click();
            document.body.removeChild(el);

        },
        showDialog: str => $(`#${str}Dialog`)?.showModal(),
        showHelp: () => {
            $("#helpDialog").style.scale = 1;
        },
        closeDialog(who) { 
            let del = $(`#${who}Dialog`);
            if (del) {
                del.style.scale = 1; 
            }
        },
        changeHelpTab(evt) {
            let matches;
            if (matches = evt.target.id.match(/helpTab\-(\w+)/)) {
                $(".active").classList.remove("active");
                $(".viewing").classList.remove("viewing");
                $(`#helpBody-${matches[1]}`).classList.add("viewing");
                evt.target.classList.add("active");
            }
        }
    }
    window.app = app;
    app.init();
})();

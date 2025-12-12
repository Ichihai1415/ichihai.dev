import * as ichihai from "/js/ichihai.js";

ichihai.getRawData("numbers_to-ku.csv").then((rawData) => {
    const rows = rawData.split("\n");
    let data = rows.map((row) => row.replace("\r", "").split(","));
    data.shift();
    data = data.filter((row) => row.length > 1);
    //console.log(data);
    const groups = {};

    for (const row of data) {
        const key = row[0];
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(row);
    }
    const result = Object.values(groups);
    //console.log(result);
    const table = document.getElementById("table");
    result.forEach((nums) => {
        //console.log(nums);
        let c = 0;
        nums.forEach((row) => {
            //console.log(row);
            const tr = document.createElement("tr");
            if (c == 0) {
                //console.log("c=0");
                const td_num = document.createElement("td");
                td_num.textContent = row[0];
                td_num.rowSpan = nums.length;
                tr.append(td_num);
            }
            const td_d = document.createElement("td");
            td_d.textContent = row[2];
            tr.append(td_d);

            const td_t = document.createElement("td");
            td_t.textContent = row[3];
            tr.append(td_t);

            const td_l = document.createElement("td");
            td_l.textContent = row[4];
            tr.append(td_l);

            const td_ln = document.createElement("td");
            td_ln.textContent = row[1];
            tr.append(td_ln);

            if (c == 0) {
                const td_p = document.createElement("td");
                td_p.textContent = row[5];
                td_p.rowSpan = nums.length;
                tr.append(td_p);

                const td_s = document.createElement("td");
                td_s.textContent = "";
                td_s.rowSpan = nums.length;
                tr.append(td_s);
            }
            const td_c = document.createElement("td");
            td_c.textContent = row[7];
            tr.append(td_c);

            table.append(tr);
            c++;
        });
    });
});

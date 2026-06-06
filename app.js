window.onload = () => {

    const tempValue = document.getElementById("tempValue");
    const humidValue = document.getElementById("humidValue");
    const dustValue = document.getElementById("dustValue");
    const tableBody = document.getElementById("historyTableBody");

    // ================= CHART INIT =================

    const tempChart = new Chart(
        document.getElementById("tempChart"),
        {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: "Temperature",
                    data: [],
                    borderColor: "orange",
                    tension: 0.4
                }]
            }
        }
    );

    const humidChart = new Chart(
        document.getElementById("humidChart"),
        {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: "Humidity",
                    data: [],
                    borderColor: "skyblue",
                    tension: 0.4
                }]
            }
        }
    );

    const dustChart = new Chart(
        document.getElementById("dustChart"),
        {
            type: "line",
            data: {
                labels: [],
                datasets: [{
                    label: "Dust",
                    data: [],
                    borderColor: "lightgreen",
                    tension: 0.4
                }]
            }
        }
    );

    // ================= FIREBASE =================

    database.ref("/IoT_Based_Environmental/history")
        .on("value", (snapshot) => {

            const dataList = [];

            snapshot.forEach((child) => {
                dataList.push(child.val());
            });

            if (dataList.length === 0) return;

            // ================= LATEST DATA =================

            const latest = dataList[dataList.length - 1];

            tempValue.innerText = latest.nhiet_do + "°C";
            humidValue.innerText = latest.do_am + "%";
            dustValue.innerText = latest.bui_min;

            // ================= VALUE COLOR =================

            tempValue.style.color =
                latest.nhiet_do >= 40 ? "red" :
                latest.nhiet_do >= 35 ? "orange" : "green";

            humidValue.style.color =
                latest.do_am >= 80 ? "red" :
                latest.do_am >= 60 ? "orange" : "green";

            dustValue.style.color =
                latest.bui_min >= 70 ? "red" :
                latest.bui_min >= 50 ? "orange" : "green";

            // ================= CHART (10 latest points) =================

            const chartData = dataList.slice(-10);

            const labels = [];
            const temps = [];
            const humids = [];
            const dusts = [];

            chartData.forEach(item => {
                labels.push(item.timestamp || "");
                temps.push(Number(item.nhiet_do));
                humids.push(Number(item.do_am));
                dusts.push(Number(item.bui_min));
            });

            tempChart.data.labels = labels;
            tempChart.data.datasets[0].data = temps;
            tempChart.update();

            humidChart.data.labels = labels;
            humidChart.data.datasets[0].data = humids;
            humidChart.update();

            dustChart.data.labels = labels;
            dustChart.data.datasets[0].data = dusts;
            dustChart.update();

            // ================= HISTORY TABLE (30 latest) =================

            tableBody.innerHTML = "";

            dataList
                .slice()
                .reverse()
                .slice(0, 30)
                .forEach(item => {

                    let status = "Safe";
                    let note = "Normal";

                    let rowClass = "";
                    let statusClass = "";

                    const temp = Number(item.nhiet_do);
                    const dust = Number(item.bui_min);

                    if (temp >= 40 || dust >= 70) {
                        status = "Danger";
                        note = "Unsafe Environment";
                        rowClass = "row-danger";
                        statusClass = "status-danger";
                    }
                    else if (temp >= 35 || dust >= 50) {
                        status = "Warning";
                        note = "High Temperature / Dust";
                        rowClass = "row-warning";
                        statusClass = "status-warning";
                    }
                    else {
                        status = "Safe";
                        note = "Normal";
                        rowClass = "row-safe";
                        statusClass = "status-safe";
                    }

                    tableBody.innerHTML += `
                        <tr class="${rowClass}">
                            <td>${item.timestamp || ""}</td>
                            <td>${item.nhiet_do}°C</td>
                            <td>${item.do_am}%</td>
                            <td>${item.bui_min}</td>
                            <td class="${statusClass}">${status}</td>
                            <td>${note}</td>
                        </tr>
                    `;
                });

            console.log("Loaded:", dataList.length, "records");
        });
};
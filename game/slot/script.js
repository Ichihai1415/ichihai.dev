import * as ichihai from "/js/ichihai.js";

let playing1 = false;
let playing2 = false;
let playing3 = false;

let money = 500;
let bet = 10;

let updtMs = 30;

function start() {
    playing1 = true;
    playing2 = true;
    playing3 = true;
    document.getElementById("start").disabled = true;
    document.getElementById("stop-1").disabled = false;
    document.getElementById("stop-2").disabled = false;
    document.getElementById("stop-3").disabled = false;
    document.getElementById("stop-all").disabled = false;
    money -= bet;
    updateGameValue();
}

function stop1() {
    playing1 = false;
    document.getElementById("stop-1").disabled = true;
    const num1 = Math.floor(Math.random() * 10);
    document.getElementById("slot-num1").innerHTML = num1;
    checkResult();
}

function stop2() {
    playing2 = false;
    document.getElementById("stop-2").disabled = true;
    const num2 = Math.floor(Math.random() * 10);
    document.getElementById("slot-num2").innerHTML = num2;
    checkResult();
}

function stop3() {
    playing3 = false;
    document.getElementById("stop-3").disabled = true;
    const num3 = Math.floor(Math.random() * 10);
    document.getElementById("slot-num3").innerHTML = num3;
    checkResult();
}

function stop_all() {
    stop1();
    stop2();
    stop3();
}

let isAuto = false;

function playFast() {
    if (isAuto) {
        document.getElementById("fastPlay").style.backgroundColor =
            "buttonface";
    } else {
        document.getElementById("fastPlay").style.backgroundColor = "#DDD";
    }
    isAuto = !isAuto;
}

function checkResult() {
    if (!playing1 && !playing2 && !playing3) {
        document.getElementById("start").disabled = false;
        document.getElementById("stop-1").disabled = true;
        document.getElementById("stop-2").disabled = true;
        document.getElementById("stop-3").disabled = true;
        document.getElementById("stop-all").disabled = true;
        const value = parseInt(
            document.getElementById("slot-num1").innerText +
                document.getElementById("slot-num2").innerText +
                document.getElementById("slot-num3").innerText
        );

        switch (value) {
            case 0:
            case 111:
            case 222:
            case 333:
            case 444:
            case 555:
            case 666:
            case 888:
            case 999:
                money += bet * 20;
                document.getElementById("t_x20").innerHTML++;
                break;
            case 777:
                money += bet * 777;
                document.getElementById("t_x777").innerHTML++;
                break;
            case 12:
            case 123:
            case 234:
            case 345:
            case 456:
            case 567:
            case 678:
            case 789:
                money += bet * 5;
                document.getElementById("t_x5").innerHTML++;
                break;
            case 314:
                money += Math.round(bet * 3.14);
                document.getElementById("t_x3-14").innerHTML++;
            default:
                document.getElementById("t_x0").innerHTML++;
                break;
        } //(9*20+1*777+8*5+1*3.14)/1000=1.00014
        updateGameValue();
    }
}

function updateGameValue() {
    document.getElementById("money").innerHTML = money;
    moneyColorCheck();
}

function betChange() {
    bet = document.getElementById("bet").value;
    if (bet < 0) document.getElementById("bet").value = 0;
}

function updtMsChange() {
    updtMs = document.getElementById("updtMs").value;
    if (updtMs < 1) document.getElementById("updtMs").value = 1;
}

function saveGame() {
    ichihai.setCookie("money=" + money);
    ichihai.setCookie("bet=" + bet);
    alert("game saved.");
}

function deleteSave() {
    money = 500;
    bet = 10;
    ichihai.setCookie("money=" + money);
    ichihai.setCookie("bet=" + bet);
    updateGameValue();
    document.getElementById("bet").value = bet;
    alert("save deleted.");
}

function moneyColorCheck() {
    if (money < 0) {
        document.getElementById("money").style.color = "red";
    } else {
        document.getElementById("money").style.color = "black";
    }
}

function showAlert(message, style) {} //なんか表示する用作りたければ

function updateSlots() {
    if (playing1) {
        const num1 = Math.floor(Math.random() * 10);
        document.getElementById("slot-num1").innerHTML = num1;
    }
    if (playing2) {
        const num2 = Math.floor(Math.random() * 10);
        document.getElementById("slot-num2").innerHTML = num2;
    }
    if (playing3) {
        const num3 = Math.floor(Math.random() * 10);
        document.getElementById("slot-num3").innerHTML = num3;
    }
    if (isAuto) {
        start();
        stop_all();
    }
    setTimeout(updateSlots, updtMs);
}

document.getElementById("bet").onchange = betChange;
document.getElementById("saveGame").onclick = saveGame;
document.getElementById("updtMs").onclick = updtMsChange;
document.getElementById("deleteSave").onclick = deleteSave;
document.getElementById("stop-1").onclick = stop1;
document.getElementById("stop-2").onclick = stop2;
document.getElementById("stop-3").onclick = stop3;
document.getElementById("start").onclick = start;
document.getElementById("stop-all").onclick = stop_all;
document.getElementById("fastPlay").onclick = playFast;

let cookies = ichihai.getCookies();
console.log(cookies);
if (cookies["money"] != undefined) money = cookies["money"];
if (cookies["bet"] != undefined) {
    bet = cookies["bet"];
    document.getElementById("bet").value = bet;
}

updateGameValue();

updateSlots();
